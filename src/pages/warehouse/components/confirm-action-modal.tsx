import { Button, Modal } from 'antd';
import React from 'react';

interface ConfirmActionModalProps {
  readonly open: boolean;
  readonly title: string;
  readonly locationNo: string;
  readonly description: React.ReactNode;
  readonly loading?: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  open,
  title,
  locationNo,
  description,
  loading = false,
  onCancel,
  onConfirm,
}) => (
  <Modal
    title={null}
    open={open}
    onCancel={onCancel}
    confirmLoading={loading}
    centered
    width={420}
    closable={false}
    maskClosable={false}
    classNames={{
      content: '!p-[32px] !rounded-[18px]',
    }}
    footer={
      <div className="flex gap-[12px] w-full mt-[24px]">
        <Button
          color="default"
          variant="filled"
          className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium"
          onClick={onCancel}
        >
          取消
        </Button>
        <Button
          block
          type="primary"
          className="flex-1 h-[45px] rounded-[10px] text-[15px] font-medium"
          onClick={onConfirm}
        >
          确认
        </Button>
      </div>
    }
  >
    <div className="text-[18px] font-semibold text-[#262626] mb-[12px]">{title}</div>
    <div className="bg-[#F5F5F5] rounded-[10px] p-[14px_16px] my-[12px] leading-[1.8]">
      <div className="text-[13px] text-[#8C8C8C]">
        目标货位：
        <span className="font-medium text-[14px] text-[#262626]">货位 #{locationNo}</span>
      </div>
    </div>
    <div className="text-[16px] leading-normal">
      <div>{description}</div>
    </div>
  </Modal>
);

export default ConfirmActionModal;
