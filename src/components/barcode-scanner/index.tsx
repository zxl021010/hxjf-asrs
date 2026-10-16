import { ScanOutlined } from '@ant-design/icons';
import type { QuaggaJSResultObject } from '@ericblade/quagga2';
import Quagga from '@ericblade/quagga2';
import { Modal, Radio, Space } from 'antd';
import type { Html5QrcodeCameraScanConfig, Html5QrcodeFullConfig } from 'html5-qrcode';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Supported barcode formats.
 * - `undefined` (default): scan both QR codes and CODE_128 barcodes.
 * - `'qr'`: only scan QR codes via html5-qrcode.
 * - `'barcode'`: only scan CODE_128 barcodes via quagga2.
 */
type BarcodeFormat = 'qr' | 'barcode';

interface BarcodeScannerProps {
  readonly onScan: (code: string) => void;
  readonly onError?: (error: Error) => void;
  readonly barcodeFormat?: BarcodeFormat;
}

interface CameraDevice {
  readonly deviceId: string;
  readonly label: string;
}

const SCAN_MODAL_WIDTH = 420;
const SCANNER_HEIGHT = 372;
const LOAD_DELAY_MS = 300;
const CAMERA_SWITCH_DELAY_MS = 200;
const SCAN_DEDUP_INTERVAL_MS = 1500;
const SCAN_FPS = 12;

const QR_FORMATS: readonly Html5QrcodeSupportedFormats[] = [Html5QrcodeSupportedFormats.QR_CODE];

function parseCamera2Id(label: string): number | null {
  const match = label.match(/camera\s*\d*\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function scoreRearCamera(label: string): number {
  const lower = label.toLowerCase();
  if (lower.includes('main') || lower.includes('wide') || lower.includes('广角')) return 100;
  if (
    lower.includes('tele') ||
    lower.includes('长焦') ||
    lower.includes('ultra') ||
    lower.includes('超广角') ||
    lower.includes('macro') ||
    lower.includes('微距') ||
    lower.includes('depth') ||
    lower.includes('景深') ||
    lower.includes('tof')
  )
    return 10;
  const camId = parseCamera2Id(label);
  if (camId === 0) return 90;
  if (camId !== null && camId < 10) return 50 + (10 - camId);
  return 50;
}

function formatCameraLabel(label: string, index: number): string {
  const lower = label.toLowerCase();
  if (lower.includes('telephoto') || lower.includes('tele') || lower.includes('长焦')) return '长焦';
  if (lower.includes('ultrawide') || lower.includes('ultra wide') || lower.includes('超广角')) return '超广角';
  if (lower.includes('wide') || lower.includes('广角')) return '广角';
  if (lower.includes('macro') || lower.includes('微距')) return '微距';
  if (lower.includes('depth') || lower.includes('tof') || lower.includes('景深')) return '景深';
  const camId = parseCamera2Id(label);
  if (camId === 0) return '主摄';
  return `后置${index + 1}`;
}

function filterAndSortRearCameras(devices: readonly { id: string; label: string }[]): CameraDevice[] {
  const rear: CameraDevice[] = [];
  for (const device of devices) {
    const lower = device.label.toLowerCase();
    if (lower.includes('front') || lower.includes('前置')) continue;
    rear.push({ deviceId: device.id, label: device.label || `摄像头 ${rear.length + 1}` });
  }
  if (rear.length > 0) {
    rear.sort((a, b) => scoreRearCamera(b.label) - scoreRearCamera(a.label));
    return rear;
  }
  return devices.map((d, i) => ({ deviceId: d.id, label: d.label || `摄像头 ${i + 1}` }));
}

function clearLoadTimer(ref: React.MutableRefObject<number | null>): void {
  if (ref.current !== null) {
    clearTimeout(ref.current);
    ref.current = null;
  }
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onError, barcodeFormat }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [cameras, setCameras] = useState<readonly CameraDevice[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>('');
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const quaggaActiveRef = useRef<boolean>(false);
  const quaggaTimerRef = useRef<number>(0);
  const quaggaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const quaggaCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const onScanRef = useRef<BarcodeScannerProps['onScan']>(onScan);
  const onErrorRef = useRef<BarcodeScannerProps['onError']>(onError);
  const lastScannedRef = useRef<{ code: string; time: number } | null>(null);
  const stopPromiseRef = useRef<Promise<void> | null>(null);
  const generationRef = useRef<number>(0);
  const loadTimerRef = useRef<number | null>(null);
  const activeCameraIdRef = useRef<string>('');

  const scannerElementIdRef = useRef<string>(`barcode-scanner-viewport-${Math.random().toString(36).slice(2, 10)}`);
  const scannerElementId: string = scannerElementIdRef.current;

  onScanRef.current = onScan;
  onErrorRef.current = onError;
  activeCameraIdRef.current = activeCameraId;

  const stopScanner = useCallback(async (): Promise<void> => {
    if (stopPromiseRef.current) return stopPromiseRef.current;

    // Stop quagga frame loop first — it reads from the video.
    if (quaggaActiveRef.current) {
      quaggaActiveRef.current = false;
      cancelAnimationFrame(quaggaTimerRef.current);
      quaggaTimerRef.current = 0;
    }

    const scanner = scannerInstanceRef.current;
    if (!scanner) {
      setScanning(false);
      return;
    }

    const promise = (async () => {
      try {
        await scanner.stop();
      } catch {}
      scannerInstanceRef.current = null;
      stopPromiseRef.current = null;
      setScanning(false);
    })();
    stopPromiseRef.current = promise;
    return promise;
  }, []);

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      const prev = lastScannedRef.current;
      if (prev && prev.code === decodedText && Date.now() - prev.time < SCAN_DEDUP_INTERVAL_MS) {
        return;
      }
      lastScannedRef.current = { code: decodedText, time: Date.now() };
      onScanRef.current(decodedText);
      await stopScanner();
      setOpen(false);
    },
    [stopScanner],
  );

  /**
   * Start a quagga frame-scanning loop that reads from the given video element.
   * Uses requestAnimationFrame + decodeSingle for maximum reliability.
   */
  const startQuaggaLoop = useCallback(
    (video: HTMLVideoElement) => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(video.videoWidth || 640, 640);
      canvas.height = Math.min(video.videoHeight || 480, 480);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      quaggaCanvasRef.current = canvas;
      quaggaCtxRef.current = ctx;
      quaggaActiveRef.current = true;

      const SCAN_INTERVAL_MS = 100; // ~10 fps

      const tick = () => {
        if (!quaggaActiveRef.current) return;

        const now = performance.now();
        tick.lastScanTs ??= 0;

        if (now - tick.lastScanTs >= SCAN_INTERVAL_MS) {
          tick.lastScanTs = now;

          if (video.readyState >= 2 && video.videoWidth > 0) {
            const w = canvas.width;
            const h = canvas.height;
            ctx.drawImage(video, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

            Quagga.decodeSingle(
              {
                src: dataUrl,
                numOfWorkers: 0,
                decoder: { readers: ['code_128_reader'] },
                locate: true,
                locator: { halfSample: true, patchSize: 'medium' },
              },
              (result?: QuaggaJSResultObject) => {
                if (result?.codeResult?.code) {
                  handleScanSuccess(result.codeResult.code);
                }
              },
            );
          }
        }

        quaggaTimerRef.current = requestAnimationFrame(tick);
      };
      tick.lastScanTs = 0;
      quaggaTimerRef.current = requestAnimationFrame(tick);
    },
    [handleScanSuccess],
  );

  const startScanner = useCallback(
    async (deviceId?: string) => {
      const container = document.getElementById(scannerElementId);
      if (!container) return;
      await stopScanner();
      const gen = generationRef.current;
      let scanner: Html5Qrcode | null = null;
      try {
        const fullConfig: Html5QrcodeFullConfig = {
          formatsToSupport: [...QR_FORMATS],
          useBarCodeDetectorIfSupported: false,
          verbose: false,
        };
        scanner = new Html5Qrcode(scannerElementId, fullConfig);
        const cameraConfig: MediaTrackConstraints = deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'environment' };

        const scanConfig: Html5QrcodeCameraScanConfig = {
          fps: SCAN_FPS,
        };

        const qrEnabled = barcodeFormat !== 'barcode';
        const barcodeEnabled = barcodeFormat !== 'qr';

        await scanner.start(
          cameraConfig,
          scanConfig,
          qrEnabled ? (text) => handleScanSuccess(text) : () => {},
          () => {},
        );

        if (gen !== generationRef.current) {
          await scanner.stop();
          return;
        }

        scannerInstanceRef.current = scanner;
        setScanning(true);

        // Start quagga for CODE_128 using the same video element.
        if (barcodeEnabled) {
          const video = container.querySelector('video') as HTMLVideoElement | null;
          if (video) {
            video.setAttribute('playsinline', '');
            startQuaggaLoop(video);
          }
        }
      } catch (err) {
        try {
          scanner?.clear();
        } catch {}
        setErrorMsg('摄像头初始化失败，请检查权限或设备');
        onErrorRef.current?.(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [stopScanner, handleScanSuccess, scannerElementId],
  );

  const loadCameras = useCallback(async () => {
    const gen = generationRef.current;
    try {
      const devices = await Html5Qrcode.getCameras();
      if (gen !== generationRef.current) return;
      const allCameras = filterAndSortRearCameras(devices);
      setCameras(allCameras);
      if (allCameras.length > 0) {
        const defaultId = allCameras[0].deviceId;
        setActiveCameraId(defaultId);
        startScanner(defaultId);
      } else {
        startScanner();
      }
    } catch {
      if (gen !== generationRef.current) return;
      startScanner();
    }
  }, [startScanner]);

  const handleCameraSwitch = useCallback(
    async (deviceId: string) => {
      if (deviceId === activeCameraIdRef.current) return;
      setActiveCameraId(deviceId);
      await stopScanner();
      setTimeout(() => startScanner(deviceId), CAMERA_SWITCH_DELAY_MS);
    },
    [stopScanner, startScanner],
  );

  const handleOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    clearLoadTimer(loadTimerRef);
    generationRef.current += 1;
    setErrorMsg('');
    lastScannedRef.current = null;
    setCameras([]);
    setActiveCameraId('');
    setOpen(true);
  }, []);

  const handleClose = useCallback(async () => {
    clearLoadTimer(loadTimerRef);
    generationRef.current += 1;
    await stopScanner();
    setOpen(false);
    setCameras([]);
  }, [stopScanner]);

  useEffect(() => {
    if (!open) return;
    const gen = generationRef.current;
    const timer = window.setTimeout(() => {
      loadTimerRef.current = null;
      if (gen !== generationRef.current) return;
      loadCameras();
    }, LOAD_DELAY_MS);
    loadTimerRef.current = timer;
    return () => {
      clearTimeout(timer);
      if (loadTimerRef.current === timer) loadTimerRef.current = null;
    };
  }, [open, loadCameras]);

  useEffect(() => {
    if (!open) stopScanner();
  }, [open, stopScanner]);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      stopScanner();
    };
  }, [stopScanner]);

  const multipleCameras = cameras.length > 1;

  return (
    <>
      <ScanOutlined onClick={handleOpen} aria-label="扫描条码" />
      <Modal
        title={
          <Space>
            <span>扫描条码</span>
            {multipleCameras && (
              <span className="text-[12px] font-normal text-[#8C8C8C]">
                检测到 {cameras.length} 个后置摄像头，可切换尝试
              </span>
            )}
          </Space>
        }
        open={open}
        onCancel={handleClose}
        maskClosable={false}
        centered
        width={SCAN_MODAL_WIDTH}
        footer={null}
        classNames={{ body: '!p-0' }}
      >
        <div className="relative overflow-hidden rounded-[8px]" style={{ height: SCANNER_HEIGHT }}>
          <div id={scannerElementId} className="w-full h-full" style={{ position: 'relative' }}>
            {scanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%]">
                  <div className="absolute top-0 left-0 w-[24px] h-[24px] border-t-[3px] border-l-[3px] border-[#1677FF] rounded-tl-[4px]" />
                  <div className="absolute top-0 right-0 w-[24px] h-[24px] border-t-[3px] border-r-[3px] border-[#1677FF] rounded-tr-[4px]" />
                  <div className="absolute bottom-0 left-0 w-[24px] h-[24px] border-b-[3px] border-l-[3px] border-[#1677FF] rounded-bl-[4px]" />
                  <div className="absolute bottom-0 right-0 w-[24px] h-[24px] border-b-[3px] border-r-[3px] border-[#1677FF] rounded-br-[4px]" />
                  <div
                    className="absolute left-[calc(0%+2px)] w-[calc(100%-4px)] h-[2px] bg-[#1677FF] rounded-[2px]"
                    style={{ animation: 'scan-line 3s ease-in-out infinite' }}
                  />
                </div>
              </div>
            )}
          </div>
          {errorMsg && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-[15px] px-[24px] text-center">
              {errorMsg}
            </div>
          )}
          {!scanning && !errorMsg && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5] text-[#8C8C8C] text-[14px]">
              正在启动摄像头...
            </div>
          )}
        </div>
        {multipleCameras && (
          <div className="px-[16px] py-[12px] border-t border-[#F0F0F0]">
            <Radio.Group
              value={activeCameraId}
              onChange={(e) => handleCameraSwitch(e.target.value)}
              size="small"
              className="w-full"
            >
              <Space wrap className="w-full justify-center">
                {cameras.map((cam, index) => (
                  <Radio key={cam.deviceId} value={cam.deviceId}>
                    {formatCameraLabel(cam.label, index)}
                    {index === 0 ? '(默认)' : ''}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
        )}
      </Modal>
    </>
  );
};

BarcodeScanner.displayName = 'BarcodeScanner';

export default BarcodeScanner;
