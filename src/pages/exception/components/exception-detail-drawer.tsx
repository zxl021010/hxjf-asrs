import { Button, Drawer, Input, Spin } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EXCEPTION_PRIORITY_CONFIG,
  EXCEPTION_SOURCE_CONFIG,
  EXCEPTION_STATUS_CONFIG,
  EXCEPTION_TYPE_CONFIG,
} from '../types';

type ExceptionDetailVO = ExceptionAPI.ExceptionDetailVO;

interface ExceptionDetailDrawerProps {
  readonly exception: ExceptionDetailVO | null;
  readonly open: boolean;
  readonly loading: boolean;
  readonly onClose: () => void;
  readonly onSaveRemark?: (remark: string) => void;
}

const SOURCE_SUFFIX: Record<string, string> = {
  MANUAL: '手动操作',
  ERP: '外部系统',
  SYSTEM: '系统',
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-[12px] border-b border-[#E8E8E8] last:border-b-0">
    <span className="text-[14px] leading-[20px] text-[#8C8C8C]">{label}</span>
    <span className="text-[14px] leading-[20px] text-[#262626] text-right">{value}</span>
  </div>
);

const SectionCard: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-[14px] p-[20px] mb-[16px] shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]">
    {title && <div className="mb-[12px] text-[15px] leading-[21px] font-semibold">{title}</div>}
    {children}
  </div>
);

const ExceptionDetailDrawer: React.FC<ExceptionDetailDrawerProps> = ({
  exception,
  open,
  loading,
  onClose,
  onSaveRemark,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [remark, setRemark] = useState('');

  // Sync remark with the current exception when it changes (e.g. opening another detail)
  useEffect(() => {
    setRemark(exception?.remark ?? '');
  }, [exception]);

  const drawerWidth = useMemo(() => (isFullscreen ? '100%' : '66%'), [isFullscreen]);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleSaveRemark = useCallback(() => {
    onSaveRemark?.(remark);
  }, [onSaveRemark, remark]);

  const title = exception ? EXCEPTION_TYPE_CONFIG[exception.taskType].title : '异常详情';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={drawerWidth}
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
          <span className="text-[18px] font-bold text-white flex-1">{title}</span>
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="px-[14px] h-[31px] rounded-[8px] border-none bg-[rgba(255,255,255,0.2)] text-white text-[13px] cursor-pointer"
          >
            {isFullscreen ? '还原' : '全屏'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-[24px] font-medium text-[#262626]">
          {loading || !exception ? (
            <div className="flex items-center justify-center h-full">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <SectionCard>
                <InfoRow label="异常编号" value={exception.exceptionCode} />
                <InfoRow label="优先级" value={EXCEPTION_PRIORITY_CONFIG[exception.severity].label} />
                <InfoRow
                  label="来源"
                  value={`${EXCEPTION_SOURCE_CONFIG[exception.sourceType].label} · ${
                    SOURCE_SUFFIX[exception.sourceType]
                  }`}
                />
                <InfoRow label="状态" value={EXCEPTION_STATUS_CONFIG[exception.handlingStatus].label} />
                <InfoRow label="时间" value={exception.createTime} />
              </SectionCard>

              <SectionCard>
                <InfoRow label="货仓" value={exception.locationNo} />
                <InfoRow label="原因" value={exception.reason} />
                <InfoRow label="操作人" value={exception.assigneeName} />
              </SectionCard>

              <SectionCard title="处理备注">
                <Input.TextArea
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  placeholder="填写处理说明···"
                  rows={3}
                  maxLength={255}
                  className="!rounded-[10px] border-[1.5px_solid_#E8E8E8] !p-[12px] !text-[14px] !leading-[20px]"
                />
              </SectionCard>
              <div className="flex items-center gap-[12px]">
                <Button
                  className="flex-1 h-[49px] rounded-[12px] text-[15px] font-medium border-none bg-[#f0f0f0] shadow-none"
                  onClick={handleSaveRemark}
                >
                  💾 保存备注
                </Button>
                <Button
                  className="flex-1 h-[49px] rounded-[12px] text-[15px] font-medium border-none bg-[#f0f0f0] shadow-none"
                  onClick={onClose}
                >
                  关闭
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ExceptionDetailDrawer;
