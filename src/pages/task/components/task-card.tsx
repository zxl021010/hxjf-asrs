import { MenuOutlined } from '@ant-design/icons';
import { Card, Progress, Tag } from 'antd';
import React from 'react';
import { PRIORITY_CONFIG, STATUS_CONFIG, TASK_SOURCE_LABEL, TASK_TYPE_CONFIG } from '../types';

interface TaskCardProps {
  readonly task: TaskAPI.TaskVO;
  readonly onClick: (task: TaskAPI.TaskVO) => void;
  readonly index: number;
  readonly dragSourceIndex: number | null;
  readonly dragTargetIndex: number | null;
  readonly onDragStart: (e: React.MouseEvent | React.TouchEvent, index: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, index, dragSourceIndex, dragTargetIndex, onDragStart }) => {
  const typeConfig = TASK_TYPE_CONFIG[task.taskType];
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const statusConfig = STATUS_CONFIG[task.status];
  const isDragging = dragSourceIndex === index;
  const isDropTarget = dragTargetIndex === index;

  const dropPosition: 'BEFORE' | 'AFTER' | null =
    isDropTarget && !isDragging && dragSourceIndex !== null
      ? dragSourceIndex < dragTargetIndex!
        ? 'AFTER'
        : 'BEFORE'
      : null;

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md relative overflow-hidden"
      styles={{ body: { padding: 0 } }}
      onClick={() => onClick(task)}
      data-task-drag="true"
      data-task-status={task.status}
      style={{
        borderRadius: 14,
        ...(task.status === 'EXCEPTION' || task.status === 'EXECUTING'
          ? { backgroundColor: statusConfig.bgColor }
          : {}),
        marginBottom: 12,
        opacity: isDragging ? 0.4 : 1,
        animation: isDragging
          ? 'none'
          : `fadeSlideUp 0.35s ease-out both${task.status === 'EXECUTING' ? ', pulse-blue 2s infinite 0.3s' : ''}`,
      }}
    >
      <div
        className="flex items-center gap-[14px] p-[20px_24px]"
        style={{
          borderLeftWidth: 4,
          borderLeftColor: task.status === 'EXCEPTION' ? statusConfig.borderColor : typeConfig.color,
          borderTop: dropPosition === 'BEFORE' ? '3px solid #1677FF' : undefined,
          borderBottom: dropPosition === 'AFTER' ? '3px solid #1677FF' : undefined,
        }}
      >
        {task.status === 'PENDING' && (
          <MenuOutlined
            className="text-gray-400 text-[24px] w-[24px] cursor-grab select-none"
            style={{ touchAction: 'none' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart(e, index);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              onDragStart(e, index);
            }}
          />
        )}

        <div
          className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center text-white text-[22px] flex-shrink-0 mt-[2px]"
          style={{ backgroundColor: typeConfig.iconBgColor }}
        >
          {typeConfig.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[8px] flex-wrap leading-[21px]">
            <span className="font-semibold text-[15px]">{typeConfig.label}</span>
            <span className="text-[#8C8C8C] text-[12px] font-normal font-[monospace]">{task.taskNo}</span>
            <div
              style={{
                backgroundColor: task.source === 'ERP' ? '#E6FFFB' : '#FFF7E6',
                color: task.source === 'ERP' ? '#13C2C2' : '#FA8C16',
              }}
              className="text-[11px] leading-[16px] font-semibold rounded-[6px] px-[6px] py-[2px]"
            >
              {TASK_SOURCE_LABEL[task.source]}
            </div>
            <div
              className="text-[11px] leading-[16px] font-semibold rounded-[4px] px-[6px] py-[1px]"
              style={{ color: priorityConfig.color, backgroundColor: priorityConfig.bgColor }}
            >
              {priorityConfig.label}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[12px] text-gray-500 mt-1 flex-wrap">
            <span>
              📍 {task.sourceLocationNo && `#${task.sourceLocationNo}`}
              {task.targetLocationNo && task.sourceLocationNo && ` → `}
              {task.targetLocationNo && `#${task.targetLocationNo}`}
            </span>{' '}
            {(task.itemName || task.itemWeight) && (
              <span>
                📦 {task.itemName && `${task.itemName}`}
                {task.itemName && task.itemWeight && ` · `}
                {task.itemWeight && `${task.itemWeight}g`}
              </span>
            )}
            <span>👤 {task.operatorName}</span>
            <span>🕓 {task.createTime}</span>
          </div>
        </div>
        {task.status === 'EXECUTING' && task.progressPercent !== undefined && (
          <Progress type="circle" percent={task.progressPercent} size={36} strokeColor={typeConfig.color} />
        )}
        <div className="flex items-center gap-[12px] pt-[10px] mt-[10px]">
          <Tag color={statusConfig.bgColor} className="m-0" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </Tag>
        </div>
      </div>

      {task.status === 'EXCEPTION' && task.reason && (
        <span className="absolute top-[10px] right-[12px] text-[11px] font-semibold text-[#FF4D4F] p-[3px_10px]">
          ⚠️ {task.reason}
        </span>
      )}
    </Card>
  );
};

export default TaskCard;
