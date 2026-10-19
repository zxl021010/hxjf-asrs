import BarcodeScanner from '@/components/barcode-scanner';
import { boundQuickPreview } from '@/services/outbound/outboundAPI';
import { useMutation } from '@umijs/max';
import type { InputRef } from 'antd';
import { Button, Form, Input, Modal } from 'antd';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import type { LocationLookupResult, QuickActionType } from '../types';
import InboundAllocateModal from './inbound-allocate-modal';

interface QuickActionConfig {
  readonly title: string;
  readonly icon: string;
  readonly placeholder: string;
  readonly submitText: string;
}

const TYPE_CONFIG: Record<QuickActionType, QuickActionConfig> = {
  inbound: {
    title: '快捷入库',
    icon: '📥',
    placeholder: '输入货仓编号',
    submitText: '确认入库',
  },
  outbound: {
    title: '出库',
    icon: '📤',
    placeholder: '请输入编码',
    submitText: '出库',
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

const QuickActionModal = forwardRef<QuickActionModalHandle, QuickActionModalProps>(
  ({ type, trigger, onLookup, onFinish }, ref) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [inboundAllocateOpen, setInboundAllocateOpen] = useState<boolean>(false);
    const [isBusy, setIsBusy] = useState<boolean>(false);

    const [inputForm] = Form.useForm();
    const inputRef = useRef<InputRef>(null);

    const config = TYPE_CONFIG[type];
    const isInbound = type === 'inbound';

    const previewMutation = useMutation({
      mutationFn: (keyword: string) => boundQuickPreview({ keyword }),
    });

    const handleScan = useCallback(
      (value: string) => {
        inputForm.setFieldsValue({ locationNo: value });
      },
      [inputForm],
    );

    const handleOpen = useCallback(() => {
      if (isInbound) {
        // 快捷入库直接打开操作弹窗
        setInboundAllocateOpen(true);
      } else {
        setModalOpen(true);
        inputForm.resetFields();
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }, [inputForm, isInbound]);

    const handleClose = useCallback(() => {
      if (isBusy) return;
      setModalOpen(false);
      inputForm.resetFields();
    }, [inputForm, isBusy]);

    const handleOutboundSubmit = useCallback(async () => {
      // 防止重复提交
      if (isBusy) return;

      try {
        const values: { locationNo: string } = await inputForm.validateFields();
        const inputValue = values.locationNo.trim();

        if (!inputValue) {
          inputForm.setFields([{ name: 'locationNo', errors: ['不能为空！'] }]);
          return;
        }

        setIsBusy(true);

        // 查找目标
        const result = onLookup(inputValue);
        if (!result) {
          inputForm.setFields([{ name: 'locationNo', errors: ['未找到匹配货仓,请检查！'] }]);
          setIsBusy(false);
          return;
        }

        if (result.errorMessage) {
          inputForm.setFields([{ name: 'locationNo', errors: [result.errorMessage] }]);
          setIsBusy(false);
          return;
        }

        // 检查状态
        if (result.status !== 'OCCUPIED' && result.status !== 'IDLE') {
          inputForm.setFields([{ name: 'locationNo', errors: ['该货位状态不允许出库'] }]);
          setIsBusy(false);
          return;
        }

        // 有货目标需要预览校验
        if (result.status === 'OCCUPIED') {
          try {
            const res = await previewMutation.mutateAsync(result.locationNo);
            if (res.code !== 200 || !res.data) {
              inputForm.setFields([{ name: 'locationNo', errors: ['出库预览校验失败'] }]);
              setIsBusy(false);
              return;
            }
          } catch {
            inputForm.setFields([{ name: 'locationNo', errors: ['出库预览校验失败'] }]);
            setIsBusy(false);
            return;
          }
        }

        // 提交真实的locationNo，不是用户原始输入
        const success = await onFinish({ locationNo: result.locationNo });
        setIsBusy(false);

        if (success) {
          handleClose();
        }
      } catch {
        setIsBusy(false);
      }
    }, [inputForm, onLookup, previewMutation, onFinish, handleClose, isBusy]);

    const openWithCode = useCallback(
      async (locationNo: string) => {
        if (!locationNo) return;

        setModalOpen(true);
        inputForm.resetFields();

        setTimeout(() => {
          inputForm.setFieldsValue({ locationNo });
          inputRef.current?.focus();
        }, 100);

        // 查找目标并显示可能的错误
        const result = onLookup(locationNo);
        if (!result) {
          inputForm.setFields([{ name: 'locationNo', errors: ['未找到对应货位,请检查编号'] }]);
        } else if (result.errorMessage) {
          inputForm.setFields([{ name: 'locationNo', errors: [result.errorMessage] }]);
        }
      },
      [inputForm, onLookup],
    );

    const handleInboundAllocateSuccess = useCallback(
      async (values: OrderAPI.OrderInboundReqVO) => {
        const success = await onFinish(values);
        if (success) {
          setInboundAllocateOpen(false);
        }
        return success;
      },
      [onFinish],
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
          title={
            <div className="flex items-center gap-2">
              <span className="text-[20px]">{config.icon}</span>
              <span className="text-[18px] font-semibold text-[#262626]">{config.title}</span>
            </div>
          }
          open={modalOpen}
          onCancel={handleClose}
          centered
          width={520}
          closable={!isBusy}
          maskClosable={false}
          classNames={{
            content: '!p-[32px] !rounded-[18px]',
          }}
          footer={null}
        >
          <div className="bg-[#F5F5F5] rounded-[10px] p-[14px_16px] mt-[16px]">
            <div className="text-[13px] text-[#8C8C8C] mb-[8px]">货盘编码 / 货位编号 / 订单号</div>
            <Form form={inputForm} layout="vertical">
              <Form.Item name="locationNo" rules={[{ required: true, message: '不能为空！' }]} className="mb-0">
                <div className="flex gap-[12px] items-center">
                  <Input
                    ref={inputRef}
                    size="large"
                    placeholder={config.placeholder}
                    onPressEnter={handleOutboundSubmit}
                    disabled={isBusy}
                    className="flex-1 min-w-0"
                    suffix={<BarcodeScanner onScan={handleScan} />}
                  />
                  <Button
                    type="primary"
                    className="h-[45px] rounded-[10px] text-[15px] font-medium px-[24px]"
                    onClick={handleOutboundSubmit}
                    loading={isBusy}
                    disabled={isBusy}
                  >
                    {config.submitText}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Modal>

        {isInbound && (
          <InboundAllocateModal
            open={inboundAllocateOpen}
            onCancel={() => {
              setInboundAllocateOpen(false);
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
