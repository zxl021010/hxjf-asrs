import { useExceptionPolling } from '@/hooks/use-exception-polling';
import { history } from '@umijs/max';
import { Descriptions, Modal, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback } from 'react';

const SEVERITY_COLOR: Record<string, string> = {
  HIGH: 'red',
  MEDIUM: 'orange',
  LOW: 'blue',
};

const SEVERITY_LABEL: Record<string, string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

interface ExceptionNotificationProps {
  pollInterval?: number;
  autoCloseDelay?: number;
  enabled?: boolean;
}

export const ExceptionNotification: React.FC<ExceptionNotificationProps> = (props) => {
  const { current, open, dismiss } = useExceptionPolling(props);

  const handleAction = useCallback(() => {
    if (!current) return;
    dismiss();
    history.push('/exception');
  }, [current, dismiss]);

  if (!current) {
    return null;
  }

  const items = [
    { label: '异常编码', children: current.exceptionCode },
    { label: '任务编号', children: current.taskNo || '-' },
    { label: '订单号', children: current.orderNo || '-' },
    { label: '货位号', children: current.locationNo || '-' },
    {
      label: '严重程度',
      children: (
        <Tag color={SEVERITY_COLOR[current.severity] || 'default'}>
          {SEVERITY_LABEL[current.severity] || current.severity}
        </Tag>
      ),
    },
    ...(current.createTime
      ? [{ label: '创建时间', children: dayjs(current.createTime).format('YYYY-MM-DD HH:mm') }]
      : []),
    { label: '异常原因', children: <Tag color="error">{current.reason || current.message || '未知异常'}</Tag> },
  ];

  return (
    <Modal
      open={open}
      title={
        <span>
          <Tag color="error" style={{ marginRight: 8 }}>
            待处理
          </Tag>
          异常通知
        </span>
      }
      onOk={handleAction}
      centered
      maskClosable
      closable={false}
      okText="查看"
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <Descriptions
        column={1}
        size="small"
        colon={false}
        items={items}
        styles={{
          label: { color: '#666', fontWeight: 500, whiteSpace: 'nowrap' },
          content: { color: '#333' },
        }}
      />
    </Modal>
  );
};

export default ExceptionNotification;
