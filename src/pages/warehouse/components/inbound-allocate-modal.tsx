import { ModalForm, ProFormDigit, ProFormInstance, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import React, { useCallback, useEffect, useRef } from 'react';
import type { FetchOrderDetailResult } from '../types';

const REMARK_MAX_LENGTH = 255;

interface InboundAllocateModalProps {
  readonly open: boolean;
  readonly locationNo: string;
  readonly isManual: boolean;
  readonly orderNo?: string;
  /** 预查询的 ERP 订单信息，传入后跳过组件内查询。仅 isManual=false 且 orderNo 存在时生效。 */
  readonly orderDetail?: FetchOrderDetailResult | null;
  readonly onCancel: () => void;
  readonly onSuccess: (values: OrderAPI.OrderInboundReqVO) => Promise<boolean>;
}

const InboundAllocateModal: React.FC<InboundAllocateModalProps> = ({
  open,
  locationNo,
  isManual,
  orderNo,
  orderDetail,
  onCancel,
  onSuccess,
}) => {
  const formRef = useRef<ProFormInstance>(null);

  /** Non-manual mode with order number: use parent's pre-fetched ERP order detail. */
  const effectiveDetail: FetchOrderDetailResult | null = !isManual && orderNo ? orderDetail ?? null : null;

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      formRef.current?.setFieldsValue({
        locationNo,
        orderNo,
        itemName: effectiveDetail?.itemName ?? undefined,
        itemWeight: effectiveDetail?.itemWeight ?? undefined,
        source: isManual ? 'MANUAL' : 'ERP',
        remark: '',
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [open, locationNo, orderNo, isManual, effectiveDetail]);

  const handleSubmit = useCallback(
    async (values: OrderAPI.OrderInboundReqVO) => {
      const success = await onSuccess?.(values);
      return success;
    },
    [locationNo, isManual, orderNo, onSuccess],
  );

  return (
    <ModalForm<OrderAPI.OrderInboundReqVO>
      formRef={formRef}
      title={null}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) onCancel();
      }}
      onFinish={handleSubmit}
      width={420}
      layout="horizontal"
      labelAlign="left"
      submitter={{
        searchConfig: {
          submitText: '确认入库',
          resetText: '取消',
        },
        submitButtonProps: { block: true, size: 'large', className: 'h-[45px]' },
        resetButtonProps: {
          onClick: onCancel,
          block: true,
          size: 'large',
          color: 'default',
          variant: 'filled',
          className: 'h-[45px]',
        },
        render: (_, dom) => (
          <div className="flex gap-[12px] w-full mt-[24px]">
            <div className="flex-1">{dom[0]}</div>
            <div className="flex-1">{dom[1]}</div>
          </div>
        ),
      }}
      modalProps={{
        classNames: { content: '!p-[32px] !rounded-[18px]' },
        centered: true,
        closable: false,
        maskClosable: false,
      }}
    >
      <div className="text-[18px] font-semibold text-[#262626] mb-[12px]">{`确认入库 · 货位 #${locationNo}`}</div>

      <div className="bg-[#F5F5F5] rounded-[10px] p-[14px_16px] my-[12px] text-[13px] text-[#8C8C8C] leading-[1.8]">
        目标货位：
        <span className="text-[14px] text-[#262626] font-semibold">#{locationNo}</span>
      </div>

      <div className="flex flex-col gap-[8px]">
        <ProFormText name="source" hidden />
        <ProFormText name="locationNo" hidden />
        {orderNo && (
          <div className="bg-[#F9FAFB] rounded-[8px] p-[8px_12px] flex justify-between items-center">
            <span className="text-[13px] text-[#8C8C8C]">入库订单号</span>
            <ProFormText name="orderNo" placeholder="请输入入库订单号" noStyle width="sm" readonly />
          </div>
        )}

        <div className="bg-[#F9FAFB] rounded-[8px] p-[8px_12px] flex justify-between items-center">
          <span className="text-[13px] text-[#8C8C8C]">类型</span>
          <span className="text-[14px] text-[#262626] font-medium">{isManual ? '人工' : 'ERP'}</span>
        </div>

        <div className="bg-[#F9FAFB] rounded-[8px] p-[8px_12px] flex justify-between items-center">
          <span className="text-[13px] text-[#8C8C8C]">物品名称</span>
          <ProFormText
            name="itemName"
            placeholder={isManual ? '请输入物品名称（选填）' : ''}
            noStyle
            width="sm"
            readonly={!isManual}
          />
        </div>

        <div className="bg-[#F9FAFB] rounded-[8px] p-[8px_12px] flex justify-between items-center">
          <span className="text-[13px] text-[#8C8C8C]">物品重量(g)</span>
          <ProFormDigit
            name="itemWeight"
            placeholder={isManual ? '请输入物品重量（选填）' : ''}
            noStyle
            width="sm"
            readonly={!isManual}
          />
        </div>

        <div className="bg-[#F9FAFB] rounded-[8px] p-[8px_12px] flex justify-between items-center">
          <span className="text-[13px] text-[#8C8C8C]">备注</span>
          <ProFormTextArea
            name="remark"
            fieldProps={{ maxLength: REMARK_MAX_LENGTH }}
            placeholder={isManual ? '请输入备注（选填）' : ''}
            noStyle
            width="sm"
          />
        </div>
      </div>
    </ModalForm>
  );
};

export default InboundAllocateModal;
