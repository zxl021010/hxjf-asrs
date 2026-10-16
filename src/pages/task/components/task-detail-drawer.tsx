import { Button, Drawer } from 'antd';
import React from 'react';

import { PRIORITY_CONFIG, STATUS_CONFIG, TASK_TYPE_CONFIG } from '../types';

const InfoRow: React.FC<{
  readonly label: string;
  readonly value: React.ReactNode;
}> = ({ label, value }) => (
  <div className="flex items-center justify-between py-[10px]">
    <span className="text-[14px] leading-[20px] text-[#8C8C8C]">{label}</span>
    <span className="text-[14px] leading-[20px] font-medium text-[#262626]">{value ?? '-'}</span>
  </div>
);

interface TaskDetailDrawerProps {
  readonly task: TaskAPI.TaskVO | null;
  readonly open: boolean;
  readonly onClose: () => void;
}

const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ task, open, onClose }) => {
  if (!task) return null;

  const typeConfig = TASK_TYPE_CONFIG[task.taskType];
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const statusConfig = STATUS_CONFIG[task.status];

  const sourceLabel = task.source === 'ERP' ? '🏦 ERP · 系统订单' : '🏠 人工 · 手动创建订单';
  const sourceColor = task.source === 'ERP' ? '#13C2C2' : '#FA8C16';
  const sourceBg = task.source === 'ERP' ? '#E6FFFB' : '#FFF7E6';

  return (
    <Drawer
      placement="right"
      width={500}
      open={open}
      onClose={onClose}
      closable={false}
      title={
        <div className="flex items-center gap-[12px] text-[#262626] text-[17px] font-medium">
          <button
            type="button"
            onClick={onClose}
            className="text-[#8C8C8C] text-[20px] leading-[23px] w-[36px] rounded-[8px] p-[4px_8px]"
          >
            ←
          </button>
          <div>
            {typeConfig.icon} {typeConfig.label} · {statusConfig.label}
          </div>
        </div>
      }
      styles={{
        header: { padding: '20px 24px' },
        body: { padding: '20px 24px' },
        footer: { padding: '16px 24px', borderTop: '1px solid #E8E8E8' },
      }}
      classNames={{
        body: 'overflow-y-auto scrollbar-hidden',
      }}
      footer={
        <div className="flex gap-[12px]">
          <Button className="flex-1 h-[40px]" onClick={onClose}>
            关闭
          </Button>
        </div>
      }
    >
      <div className=" bg-[#FAFAFA] rounded-[12px] p-[16px] mb-[14px]">
        <div className="text-[12px] leading-[17px] uppercase font-semibold text-[#8C8C8C] tracking-[1px] mb-[12px]">
          基本信息
        </div>
        <div className="divide-y divide-[#F0F0F0]">
          <InfoRow label="任务编号" value={task.taskNo} />
          <InfoRow label="任务类型" value={typeConfig.icon + typeConfig.label} />
          <InfoRow
            label="订单来源"
            value={
              <span
                className="text-[11px] font-semibold p-[2px_8px] rounded-[6px]"
                style={{ color: sourceColor, backgroundColor: sourceBg }}
              >
                {sourceLabel}
              </span>
            }
          />
          <InfoRow label="目标货位" value={task.targetLocationNo} />
          <InfoRow
            label="当前状态"
            value={
              <span
                className="text-[12px] font-semibold p-[4px_12px] rounded-[6px]"
                style={{ color: statusConfig.color, backgroundColor: statusConfig.bgColor }}
              >
                {statusConfig.label}
              </span>
            }
          />
          <InfoRow label="优先级" value={<span>{priorityConfig.label}优先级</span>} />
          <InfoRow label="创建时间" value={task.createTime} />
        </div>
      </div>

      <div className=" bg-[#FAFAFA] rounded-[12px] p-[16px] mb-[14px]">
        <div className="text-[12px] leading-[17px] uppercase font-semibold text-[#8C8C8C] tracking-[1px] mb-[12px]">
          关联信息
        </div>
        <div className="divide-y divide-[#F0F0F0]">
          <InfoRow label="物品名称" value={task.itemName} />
          <InfoRow label="物品重量" value={task.itemWeight ? `${task.itemWeight}g` : undefined} />
          <InfoRow label="操作人" value={task.operatorName} />
        </div>
      </div>

      {task.status === 'EXCEPTION' && task.reason && (
        <div>
          <div className="mb-[14px] p-[14px_16px] rounded-[10px] bg-[#FFF1F0]">
            <div className="flex items-center gap-[8px] text-[13px] leading-[1.6] font-medium text-[#FF4D4F]">
              ⚠️
              <span>
                <strong>异常原因：</strong>
                {task.reason}
              </span>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default TaskDetailDrawer;
