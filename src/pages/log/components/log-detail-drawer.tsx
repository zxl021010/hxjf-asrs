import { history } from '@umijs/max';
import { Button, Drawer } from 'antd';
import React from 'react';
import { CATEGORY_STYLE, SOURCE_STYLE } from '../types';

interface LogDetailDrawerProps {
  readonly log: LogAPI.BusinessEventLogDetailVO | null;
  readonly open: boolean;
  readonly onClose: () => void;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-[12px] border-b border-[#E8E8E8] last:border-b-0">
    <span className="text-[14px] leading-[20px] text-[#8C8C8C]">{label}</span>
    <span className="text-[14px] leading-[20px] text-[#262626] text-right">{value}</span>
  </div>
);

const LinkValue: React.FC<{ value: string; onClick: () => void }> = ({ value, onClick }) => (
  <span className="text-[#1677FF] underline cursor-pointer" onClick={onClick}>
    {value}
  </span>
);

const SectionCard: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-[14px] p-[20px] mb-[16px] shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]">
    {title && <div className="mb-[12px] text-[15px] leading-[21px] font-semibold">{title}</div>}
    {children}
  </div>
);

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
  <pre className="m-0 p-[12px] rounded-[10px] bg-[#F5F5F5] text-[12px] leading-[1.6] text-[#262626] font-[monospace] overflow-auto whitespace-pre-wrap break-all">
    {code}
  </pre>
);

const LogDetailDrawer: React.FC<LogDetailDrawerProps> = ({ log, open, onClose }) => {
  if (!log) {
    return null;
  }

  const style = CATEGORY_STYLE[log.eventType];
  const sourceStyle = SOURCE_STYLE[log.source];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width="100%"
      closable={false}
      styles={{
        body: { padding: 0, backgroundColor: '#F0F2F5' },
        header: { padding: 0, border: 'none' },
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-[16px] px-[24px] h-[64px] bg-[#1677FF]">
          <button
            type="button"
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-[10px] border-none bg-[rgba(255,255,255,0.2)] text-white text-[18px] leading-none"
          >
            ←
          </button>
          <span className="text-[18px] font-bold text-white flex-1">{style.label}</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-[24px] font-medium text-[#262626]">
          <SectionCard>
            <InfoRow label="日志类型" value={<div>{style.label}</div>} />
            <InfoRow
              label="来源"
              value={
                <div>
                  {log.source === 'ERP' && <span>{sourceStyle.label} · 外部系统</span>}
                  {log.source === 'MANUAL' && <span>{sourceStyle.label} · 手动操作</span>}
                </div>
              }
            />
            <InfoRow label="操作时间" value={log.occurredTime} />
            <InfoRow label="操作人" value={log.actorName ?? '-'} />
          </SectionCard>

          <SectionCard>
            <InfoRow
              label="订单号"
              value={
                <LinkValue
                  value={log.orderNo ?? '-'}
                  onClick={() => log.orderNo && history.push(`/task?keyword=${log.orderNo}`)}
                />
              }
            />
            <InfoRow
              label="货仓编号"
              value={
                <LinkValue
                  value={log.locationNo ?? '-'}
                  onClick={() => log.locationNo && history.push(`/warehouse?keyword=${log.locationNo}`)}
                />
              }
            />
          </SectionCard>

          <SectionCard title="请求数据">
            <CodeBlock code={log.requestPayload ? JSON.stringify(log.requestPayload, null, 2) : '-'} />
          </SectionCard>

          <SectionCard title="响应数据">
            <CodeBlock code={log.responsePayload ? JSON.stringify(log.responsePayload, null, 2) : '-'} />
          </SectionCard>
          <Button onClick={onClose} block className="border-[1.5px] border-[#E8E8E8] h-[46px]">
            关闭
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default LogDetailDrawer;
