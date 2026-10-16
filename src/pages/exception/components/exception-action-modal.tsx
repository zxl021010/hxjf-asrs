import { Button, Modal } from 'antd';
import React from 'react';
import { EXCEPTION_SOURCE_CONFIG, EXCEPTION_TYPE_CONFIG } from '../types';

export type ExceptionActionType = 'continue' | 'retry' | 'resolve';

const ACTION_LABEL: Record<string, string> = {
  CONTINUE: '继续',
  RETRY: '重试',
};

const ACTION_BUTTON_TEXT: Record<string, string> = {
  CONTINUE: '▶️ 继续',
  RETRY: '🔄 重试',
};

interface ExceptionActionModalProps {
  readonly open: boolean;
  readonly exception: ExceptionAPI.ExceptionVO | null;
  readonly onContinueOrRetry: () => void;
  readonly onResolve: () => void;
  readonly onCancel: () => void;
  readonly loading?: boolean;
}

const ExceptionActionModal: React.FC<ExceptionActionModalProps> = ({
  open,
  exception,
  onContinueOrRetry,
  onResolve,
  onCancel,
  loading,
}) => {
  if (!exception) return null;

  const sourceConfig = EXCEPTION_SOURCE_CONFIG[exception.sourceType];
  const typeConfig = EXCEPTION_TYPE_CONFIG[exception.taskType];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      width={400}
      closable={false}
      footer={null}
      classNames={{
        content: '!p-[24px_24px_16px] !rounded-[16px]',
      }}
    >
      <div className="text-[16px] leading-[24px] font-semibold text-[#262626] mb-[16px]">异常处理</div>

      <div className="bg-[#F8F8F8] rounded-[10px] p-[14px_16px] mb-[8px] text-[14px] leading-[25px] text-[#262626]">
        <div>
          <span className="text-[#8C8C8C]">异常编码：</span>
          <span className="font-semibold text-[#262626]">{exception.exceptionCode}</span>
        </div>
        <div>
          <span className="text-[#8C8C8C]">任务类型：</span>
          <span className="font-semibold text-[#262626]">{typeConfig.title}</span>
        </div>
        <div>
          <span className="text-[#8C8C8C]">货位：</span>
          <span className="font-semibold text-[#262626]">{exception.locationNo}</span>
        </div>
        <div>
          <span className="text-[#8C8C8C]">来源：</span>
          <span className="font-semibold text-[#262626]">{sourceConfig.label}</span>
        </div>
        <div>
          <span className="text-[#8C8C8C]">信息：</span>
          <span className="font-semibold text-[#262626]">{exception.message}</span>
        </div>
        <div>
          <span className="text-[#8C8C8C]">推荐操作：</span>
          <span className="font-semibold text-[#262626]">{ACTION_LABEL[exception.recommendedAction]}</span>
        </div>
      </div>

      <div className="flex gap-[12px] mt-[20px]">
        {exception.recommendedAction && (
          <Button
            type={'primary'}
            className="flex-1 h-[42px] rounded-[10px] text-[14px]"
            loading={loading}
            onClick={onContinueOrRetry}
          >
            {ACTION_BUTTON_TEXT[exception.recommendedAction]}
          </Button>
        )}
        <Button
          type="primary"
          className="flex-1 h-[42px] rounded-[10px] text-[14px]"
          style={{ backgroundColor: '#52C41A', borderColor: '#52C41A' }}
          loading={loading}
          onClick={onResolve}
        >
          ✅ 任务完成
        </Button>
      </div>
    </Modal>
  );
};

export default ExceptionActionModal;
