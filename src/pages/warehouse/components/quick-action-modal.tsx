import BarcodeScanner from '@/components/barcode-scanner';
import { getErpOrderInfo } from '@/services/erp/erpAPI';
import { boundQuickPreview } from '@/services/outbound/outboundAPI';
import { normalizeCode } from '@/utils/normalize-code';
import { useMutation } from '@umijs/max';
import type { InputRef } from 'antd';
import { Button, Form, Input, Modal } from 'antd';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import type { FetchOrderDetailResult, LocationLookupResult, QuickActionType } from '../types';
import InboundAllocateModal from './inbound-allocate-modal';

interface QuickActionConfig {
  readonly title: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly placeholder: string;
  readonly submitText: string;
  readonly submitType: 'primary' | 'default';
  readonly danger: boolean;
  readonly confirmTitle: string;
}

const TYPE_CONFIG: Record<QuickActionType, QuickActionConfig> = {
  inbound: {
    title: '快捷入库',
    subtitle: '请扫码或手动输入货仓编号',
    icon: '📥',
    placeholder: '输入货仓编号',
    submitText: '确认入库',
    submitType: 'primary',
    danger: false,
    confirmTitle: '确认入库',
  },
  outbound: {
    title: '快捷出库',
    subtitle: '请扫码或手动输入订单号/货仓编号',
    icon: '📤',
    placeholder: '输入订单号或货仓编号',
    submitText: '确认出库',
    submitType: 'primary',
    danger: true,
    confirmTitle: '确认出库',
  },
};

interface QuickActionModalProps {
  readonly type: QuickActionType;
  readonly trigger: React.ReactNode;
  readonly onLookup: (locationNo: string) => LocationLookupResult | null;
  readonly onFinish: (values: OrderAPI.OrderInboundReqVO) => Promise<boolean>;
}

export interface QuickActionModalHandle {
  openWithCode: (locationNo: string) => Promise<void>;
}

type Step = 'input' | 'confirm' | 'order-input';

const QuickActionModal = forwardRef<QuickActionModalHandle, QuickActionModalProps>(
  ({ type, trigger, onLookup, onFinish }, ref) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [step, setStep] = useState<Step>('input');
    const [currentCode, setCurrentCode] = useState<string>('');
    const [lookupResult, setLookupResult] = useState<LocationLookupResult | null>(null);
    const [previewData, setPreviewData] = useState<OutboundAPI.OutboundPreviewVO | null>(null);

    const [inboundAllocateOpen, setInboundAllocateOpen] = useState<boolean>(false);
    const [manualOrderNo, setManualOrderNo] = useState<string>('');
    const [fetchedOrderDetail, setFetchedOrderDetail] = useState<FetchOrderDetailResult | null>(null);

    const [inputForm] = Form.useForm();
    const inputRef = useRef<InputRef>(null);
    const [orderForm] = Form.useForm();
    const orderInputRef = useRef<InputRef>(null);

    const config = TYPE_CONFIG[type];
    const isInbound = type === 'inbound';

    const previewMutation = useMutation({
      mutationFn: (keyword: string) => boundQuickPreview({ keyword }),
      onSuccess: (res) => {
        setPreviewData(res.code === 200 && res.data ? res.data : null);
      },
      onError: () => {
        setPreviewData(null);
      },
    });

    const orderDetailMutation = useMutation({
      mutationFn: (orderNo: string) => getErpOrderInfo(orderNo),
    });

    const handleScan = useCallback(
      (value: string) => {
        if (step === 'order-input') {
          orderForm.setFieldsValue({ orderNo: value });
        } else {
          inputForm.setFieldsValue({ locationNo: value });
        }
      },
      [step, inputForm, orderForm],
    );

    const handleOpen = useCallback(() => {
      setStep('input');
      setCurrentCode('');
      setLookupResult(null);
      setPreviewData(null);
      setInboundAllocateOpen(false);
      setManualOrderNo('');
      setFetchedOrderDetail(null);
      setModalOpen(true);
      window.setTimeout(() => {
        inputForm.resetFields();
        orderForm.resetFields();
        inputRef.current?.focus();
      }, 100);
    }, [inputForm, orderForm]);

    const handleClose = useCallback(() => {
      setModalOpen(false);
      inputForm.resetFields();
      orderForm.resetFields();
    }, [inputForm, orderForm]);

    const fetchOutboundPreview = useCallback(
      async (keyword: string): Promise<boolean> => {
        try {
          const res = await previewMutation.mutateAsync(keyword);
          return res.code === 200 && !!res.data;
        } catch {
          return false;
        }
      },
      [previewMutation],
    );

    const handleInputSubmit = useCallback(async () => {
      try {
        const values: { locationNo: string } = await inputForm.validateFields();
        const locationNo = values.locationNo.trim();

        const result = onLookup(locationNo);
        if (!result) {
          inputForm.setFields([{ name: 'locationNo', errors: ['未找到匹配货仓，请检查！'] }]);
          return;
        }

        if (result.errorMessage) {
          inputForm.setFields([{ name: 'locationNo', errors: [result.errorMessage] }]);
          return;
        }

        setLookupResult(result);

        if (isInbound) {
          setStep('order-input');
          window.setTimeout(() => {
            orderInputRef.current?.focus();
          }, 100);
        } else {
          if (result.status === 'OCCUPIED') {
            const success = await fetchOutboundPreview(result.locationNo);
            if (!success) {
              return;
            }
          }
          setCurrentCode(normalizeCode(locationNo));
          setStep('confirm');
        }
      } catch {}
    }, [inputForm, onLookup, isInbound, fetchOutboundPreview]);

    const handleConfirmOk = useCallback(async () => {
      const success = await onFinish({ locationNo: currentCode });
      if (success) {
        handleClose();
      }
    }, [currentCode, onFinish, handleClose]);

    const handleOrderSubmit = useCallback(async () => {
      try {
        const values: { orderNo?: string } = await orderForm.validateFields();
        const orderNo = values.orderNo?.trim() ?? '';

        if (!orderNo) {
          setManualOrderNo('');
          setFetchedOrderDetail(null);
          setInboundAllocateOpen(true);
          return;
        }

        try {
          const res = await orderDetailMutation.mutateAsync(orderNo);
          if (res.code === 200 && res.data) {
            setFetchedOrderDetail({
              itemName: res.data.material_name,
              itemWeight: res.data.weight,
            });
          } else {
            setFetchedOrderDetail(null);
          }
        } catch {
          setFetchedOrderDetail(null);
        }
        setManualOrderNo(orderNo);
        setInboundAllocateOpen(true);
      } catch {}
    }, [orderForm, orderDetailMutation]);

    const handleInboundAllocateSuccess = useCallback(
      async (values: OrderAPI.OrderInboundReqVO) => {
        const success = await onFinish(values);
        if (success) {
          handleClose();
        }
        return success;
      },
      [handleClose, onFinish],
    );

    const openWithCode = useCallback(
      async (locationNo: string) => {
        if (!locationNo) return;

        setStep('input');
        setLookupResult(null);
        setPreviewData(null);
        setCurrentCode(normalizeCode(locationNo));

        const result = onLookup(locationNo);
        if (!result) {
          inputForm.setFields([{ name: 'locationNo', errors: ['未找到对应货位，请检查编号'] }]);
          window.setTimeout(() => {
            inputForm.setFieldsValue({ locationNo });
          }, 50);
          return;
        }

        if (result.errorMessage) {
          inputForm.setFields([{ name: 'locationNo', errors: [result.errorMessage] }]);
          window.setTimeout(() => {
            inputForm.setFieldsValue({ locationNo });
          }, 50);
          return;
        }

        setLookupResult(result);

        if (isInbound) {
          setStep('order-input');
          window.setTimeout(() => {
            orderInputRef.current?.focus();
          }, 100);
        } else {
          if (result.status === 'OCCUPIED') {
            const success = await fetchOutboundPreview(result.locationNo);
            if (!success) {
              return;
            }
          }
          setCurrentCode(normalizeCode(locationNo));
          setStep('confirm');
          window.setTimeout(() => {
            inputForm.setFieldsValue({ locationNo });
          }, 100);
        }
        setModalOpen(true);
      },
      [inputForm, onLookup, isInbound, fetchOutboundPreview],
    );

    useImperativeHandle(ref, () => ({ openWithCode }), [openWithCode]);

    const triggerElement = React.cloneElement(trigger as React.ReactElement, {
      onClick: (e: React.MouseEvent) => {
        (trigger as React.ReactElement)?.props?.onClick?.(e);
        handleOpen();
      },
    });

    return (
      <>
        {triggerElement}

        <Modal
          title={null}
          open={modalOpen}
          onCancel={handleClose}
          centered
          width={420}
          closable={false}
          maskClosable={false}
          classNames={{
            content: '!p-[32px] !rounded-[18px]',
          }}
          footer={
            step === 'input' ? (
              <div className="flex gap-[12px] w-full mt-[24px]">
                <Button
                  color="default"
                  variant="filled"
                  className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium"
                  onClick={handleClose}
                >
                  取消
                </Button>
                <Button
                  block
                  type={config.submitType}
                  danger={config.danger}
                  className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium"
                  onClick={handleInputSubmit}
                >
                  {config.submitText}
                </Button>
              </div>
            ) : step === 'order-input' ? (
              <div className="flex gap-[12px] w-full mt-[24px]">
                <Button
                  color="default"
                  variant="filled"
                  className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium"
                  onClick={handleClose}
                >
                  取消
                </Button>
                <Button
                  block
                  type={config.submitType}
                  loading={orderDetailMutation.isPending}
                  className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium"
                  onClick={handleOrderSubmit}
                >
                  确认
                </Button>
              </div>
            ) : (
              <div className="flex gap-[12px] w-full mt-[24px]">
                <Button
                  color="default"
                  variant="filled"
                  className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium"
                  onClick={handleClose}
                >
                  取消
                </Button>
                <Button
                  block
                  type="primary"
                  className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium"
                  onClick={handleConfirmOk}
                >
                  确认
                </Button>
              </div>
            )
          }
        >
          <div style={{ display: step === 'order-input' ? undefined : 'none' }}>
            <div className="flex flex-col items-center text-center gap-2 mb-3">
              <div className="text-[64px]">{config.icon}</div>
              <div className="text-[18px] font-semibold text-[#262626]">{config.title}</div>
              <div className="text-[13px] text-[#8C8C8C]">{'请扫码或手动输入关联的订单编号'}</div>
            </div>
            {lookupResult && (
              <div className="bg-[#F5F5F5] rounded-[10px] p-[10px_14px] mb-4 text-[13px] text-[#8C8C8C]">
                目标货位：
                <span className="font-medium text-[14px] text-[#262626]">货位 #{lookupResult.locationNo}</span>
              </div>
            )}
            <Form form={orderForm} layout="vertical">
              <Form.Item name="orderNo">
                <Input
                  ref={orderInputRef}
                  size="large"
                  placeholder="输入订单编号（选填）"
                  onPressEnter={handleOrderSubmit}
                  suffix={<BarcodeScanner onScan={handleScan} barcodeFormat="barcode" />}
                />
              </Form.Item>
            </Form>
          </div>
          <div style={{ display: step === 'input' ? undefined : 'none' }}>
            <div className="flex flex-col items-center text-center gap-2 mb-6">
              <div className="text-[64px]">{config.icon}</div>
              <div className="text-[18px] font-semibold text-[#262626]">{config.title}</div>
              <div className="text-[13px] text-[#8C8C8C]">{config.subtitle}</div>
            </div>
            <Form form={inputForm} layout="vertical">
              <Form.Item name="locationNo" rules={[{ required: true, message: '不能为空！' }]}>
                <Input
                  ref={inputRef}
                  size="large"
                  placeholder={config.placeholder}
                  onPressEnter={handleInputSubmit}
                  suffix={<BarcodeScanner onScan={handleScan} barcodeFormat={isInbound ? 'qr' : undefined} />}
                />
              </Form.Item>
            </Form>
          </div>
          {step === 'confirm' && (
            <>
              <div className="text-[18px] font-semibold text-[#262626] mb-[12px]">{config.confirmTitle}</div>
              <div className="bg-[#F5F5F5] rounded-[10px] p-[14px_16px] my-[12px] leading-[1.8]">
                <div className="text-[13px] text-[#8C8C8C]">
                  目标货位：
                  <span className="font-medium text-[14px] text-[#262626]">货位 #{lookupResult?.locationNo}</span>
                </div>
              </div>
              {previewMutation.isPending ? (
                <div className="text-center py-4 text-[#8C8C8C] text-[14px]">正在获取出库数据...</div>
              ) : (
                <div className="text-[16px] leading-normal">
                  {previewData?.orderNo && (
                    <div>
                      <div>订单号：{previewData.orderNo}</div>
                      <br />
                    </div>
                  )}
                  {previewData?.itemName && (
                    <div className="text-[14px] text-[#595959] mb-3">
                      物品：
                      <span className="font-medium text-[#262626]">
                        {previewData.itemName} {previewData.itemWeight ? ` ${previewData.itemWeight}g` : ''}
                      </span>
                    </div>
                  )}
                  <div>{'确定执行出库操作吗？出库后货位将进入出库流程。'}</div>
                </div>
              )}
            </>
          )}
        </Modal>

        {isInbound && lookupResult?.locationNo && (
          <InboundAllocateModal
            open={inboundAllocateOpen}
            locationNo={lookupResult?.locationNo}
            isManual={!fetchedOrderDetail}
            orderNo={manualOrderNo}
            orderDetail={fetchedOrderDetail}
            onCancel={() => {
              setInboundAllocateOpen(false);
              setFetchedOrderDetail(null);
            }}
            onSuccess={handleInboundAllocateSuccess}
          />
        )}
      </>
    );
  },
);

QuickActionModal.displayName = 'QuickActionModal';

export default QuickActionModal;
