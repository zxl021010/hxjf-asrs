import { Button, Drawer, Tag } from 'antd';
import React, { useState } from 'react';
import { ORDER_SOURCE_LABEL } from '../constants';
import type { StatusDrawerConfig } from '../types';
import ConfirmActionModal from './confirm-action-modal';
import InboundAllocateModal from './inbound-allocate-modal';

interface LocationDetailDrawerProps {
  readonly open: boolean;
  readonly location: LocationAPI.LocationVO | null;
  readonly onClose: () => void;
  readonly onOutboundConfirm: () => void;
  readonly onInboundSubmit: (values: OrderAPI.OrderInboundReqVO) => Promise<boolean>;
  readonly onUnlockConfirm?: () => void;
  readonly onReInbound?: () => void;
  readonly onMarkFault?: () => void;
}

type ActionType = 'inbound' | 'unlock' | 'reInbound' | 'markFault' | null;

const STATUS_CONFIG: Record<LocationAPI.Status, StatusDrawerConfig> = {
  IDLE: {
    label: '空闲',
    bgColor: '#F6FFED',
    color: '#52C41A',
    actionText: '📤 出库操作',
    variant: 'solid',
    btnColor: 'blue',
  },
  OCCUPIED: {
    label: '占用',
    bgColor: '#E6F4FF',
    color: '#1677FF',
    actionText: '📤 出库操作',
    variant: 'solid',
    btnColor: 'blue',
  },
  LOCKED: {
    label: '锁定',
    bgColor: '#FFF7E6',
    color: '#D48806',
    actionText: '🔓 解除锁定',
    variant: 'filled',
    btnColor: 'default',
  },
  FAULT: {
    label: '故障',
    bgColor: '#FFF1F0',
    color: '#FF4D4F',
    actionText: '📥 重新入库',
    variant: 'solid',
    btnColor: 'danger',
  },
  OFFLINE: {
    label: '不在货架',
    bgColor: '#F5F5F5',
    color: '#8C8C8C',
    actionText: '📥 入库分配',
    variant: 'filled',
    btnColor: 'default',
  },
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-[12px] border-b border-[#E8E8E8] last:border-b-0">
    <div className="text-[14px] leading-[20px] text-[#8C8C8C]">{label}</div>
    <div className="text-[14px] leading-[20px] text-[#262626]">{value}</div>
  </div>
);

const RelatedInfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center text-[13px] leading-[19px] py-[10px] border-b border-[#E8E8E8] last:border-b-0">
    <div className="w-[89px] px-[12px] text-[#8C8C8C]">{label}</div>
    <div className="flex-1 px-[12px] text-[#262626] text-left">{value}</div>
  </div>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-[16px] p-[24px] mb-[16px] shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]">
    <div className="flex items-center gap-2 mb-[16px] text-[15px] leading-[21px] font-semibold text-[#262626]">
      {title}
    </div>
    {children}
  </div>
);

const StatusTag: React.FC<{ config: StatusDrawerConfig }> = ({ config }) => (
  <Tag
    className="m-0 px-[12px] py-[3px] rounded-[6px] text-[12px] leading-[17px] font-medium border-0"
    style={{ backgroundColor: config.bgColor, color: config.color }}
  >
    {config.label}
  </Tag>
);

const EmptyRelatedInfo: React.FC<{ text: string }> = ({ text }) => (
  <div className="p-[40px] text-center text-[14px] leading-[20px] text-[#8C8C8C]">{text}</div>
);

const renderOrderSourceTag = (orderSource: string): React.ReactNode => (
  <Tag
    className={`m-0 px-[12px] py-[3px] rounded-[6px] text-[12px] font-medium border-0 ${
      orderSource === 'MANUAL' ? 'bg-[#FFF7E6] text-[#D48806]' : 'bg-[#E6FFFB] text-[#13C2C2]'
    }`}
  >
    {ORDER_SOURCE_LABEL[orderSource]}
    {' · '}
    {orderSource === 'MANUAL' ? '人工操作' : '系统'}
  </Tag>
);

const renderOccupiedOrLockedInfo = (location: LocationAPI.LocationVO): React.ReactNode => {
  if (!location.itemName) {
    return <EmptyRelatedInfo text="暂无关联物品信息" />;
  }
  return (
    <>
      <RelatedInfoRow label="入库订单号" value={location.orderNo || '--'} />
      {location.orderSource && <RelatedInfoRow label="订单来源" value={renderOrderSourceTag(location.orderSource)} />}
      <RelatedInfoRow label="物品名称" value={location.itemName} />
      <RelatedInfoRow label="物品重量" value={location.itemWeight ? `${location.itemWeight}克` : '--'} />
      <RelatedInfoRow label="操作人" value={location.statusOperatorName || '--'} />
    </>
  );
};

const LocationDetailDrawer: React.FC<LocationDetailDrawerProps> = ({
  open,
  location,
  onClose,
  onOutboundConfirm,
  onInboundSubmit,
  onUnlockConfirm,
  onReInbound,
  onMarkFault,
}) => {
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  if (!location) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[location.status];

  const renderLastOperation = (): React.ReactNode => {
    return (
      <div className="flex items-center gap-[8px]">
        <span>{location.lastOperation ?? '-'}</span>
        {location.orderSource && (
          <Tag
            className={`m-0 px-[12px] py-[3px] rounded-[4px] text-[11px] font-medium border-0 ${
              location.orderSource === 'MANUAL' ? 'bg-[#FFF7E6] text-[#D48806]' : 'bg-[#E6FFFB] text-[#13C2C2]'
            }`}
          >
            {ORDER_SOURCE_LABEL[location.orderSource] || location.orderSource}
          </Tag>
        )}
      </div>
    );
  };

  const renderExtraStatusRow = (): React.ReactNode => {
    if (location.status === 'LOCKED') {
      return (
        <InfoRow
          label="锁定原因"
          value={
            <Tag
              className="m-0 px-2 py-[2px] rounded-[4px] text-[12px] border-0 flex items-center gap-1"
              style={{ backgroundColor: '#FFF7E6', color: '#D48806' }}
            >
              <span>{location.statusReason || '--'}</span>
            </Tag>
          }
        />
      );
    }
    if (location.status === 'OFFLINE') {
      return (
        <InfoRow
          label="货架状态"
          value={
            <Tag
              className="m-0 px-2 py-[2px] rounded-[4px] text-[12px] border-0"
              style={{ backgroundColor: '#F5F5F5', color: '#8C8C8C' }}
            >
              📦 该货仓未安装在货架中
            </Tag>
          }
        />
      );
    }
    return null;
  };

  const renderRelatedInfo = () => {
    const renderContent = (): React.ReactNode => {
      switch (location.status) {
        case 'IDLE':
          return <EmptyRelatedInfo text="该货位为空闲状态，暂无关联物品信息" />;
        case 'OCCUPIED':
          return renderOccupiedOrLockedInfo(location);
        case 'LOCKED':
          return renderOccupiedOrLockedInfo(location);
        case 'FAULT':
          return <EmptyRelatedInfo text="该货位故障中，无法查看关联信息" />;
        case 'OFFLINE':
          return <EmptyRelatedInfo text="⚠️ 该货位当前不在货架中，无法查看关联信息" />;
        default:
          return null;
      }
    };

    let title = '📦 关联信息';
    if (location.status === 'LOCKED') {
      title = '🔒 锁定信息';
    }

    return <SectionCard title={title}>{renderContent()}</SectionCard>;
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        maskClosable={false}
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
            <span className="text-[18px] font-bold text-white flex-1">货位 #{location.locationNo}</span>
            <StatusTag config={statusConfig} />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hidden p-[24px]">
            <SectionCard title="📋 基本信息">
              <InfoRow label="货位编号" value={<span style={{ color: '#1677FF' }}>#{location.locationNo}</span>} />
              <InfoRow label="当前状态" value={<StatusTag config={statusConfig} />} />
              {renderExtraStatusRow()}
              <InfoRow label="所属区域" value={`第${location.rowNo}行 · 第${location.columnNo}列`} />
              <InfoRow label="最后操作" value={renderLastOperation()} />
            </SectionCard>

            {renderRelatedInfo()}

            <SectionCard title="⚡操作">
              {location.status === 'FAULT' ? (
                <Button
                  color="danger"
                  variant="solid"
                  size="large"
                  className="h-[49px]"
                  block
                  onClick={() => setActiveAction('reInbound')}
                >
                  {statusConfig.actionText}
                </Button>
              ) : (
                <div className="flex flex-col gap-[12px]">
                  {location.status !== 'LOCKED' && (
                    <Button
                      color={statusConfig.btnColor}
                      variant={statusConfig.variant}
                      size="large"
                      className="h-[49px]"
                      block
                      onClick={() => {
                        switch (location.status) {
                          case 'IDLE':
                            // setActiveAction('inbound');
                            onOutboundConfirm?.();
                            return;
                          case 'OCCUPIED':
                            onOutboundConfirm?.();
                            return;
                          // case 'LOCKED':
                          //   setActiveAction('unlock');
                          //   return;
                          case 'OFFLINE':
                            setActiveAction('inbound');
                            return;
                          default:
                            return;
                        }
                      }}
                    >
                      {statusConfig.actionText}
                    </Button>
                  )}
                  {['IDLE', 'OCCUPIED'].includes(location.status) && (
                    <Button
                      color="danger"
                      variant="solid"
                      size="large"
                      className="h-[49px]"
                      block
                      onClick={() => setActiveAction('markFault')}
                    >
                      ⚠️ 标记为故障
                    </Button>
                  )}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </Drawer>

      <InboundAllocateModal
        open={activeAction === 'inbound'}
        onCancel={() => setActiveAction(null)}
        onSuccess={async (values) => {
          const success = await onInboundSubmit(values);
          if (success) {
            setActiveAction(null);
          }
          return success;
        }}
      />

      <ConfirmActionModal
        open={activeAction === 'unlock'}
        title="解除锁定"
        locationNo={location.locationNo}
        description="确定解除该货位的锁定状态吗？"
        onCancel={() => setActiveAction(null)}
        onConfirm={() => {
          onUnlockConfirm?.();
          setActiveAction(null);
        }}
      />

      <ConfirmActionModal
        open={activeAction === 'reInbound'}
        title="重新入库"
        locationNo={location.locationNo}
        description="确认将该货位重新入库吗？"
        onCancel={() => setActiveAction(null)}
        onConfirm={() => {
          onReInbound?.();
          setActiveAction(null);
        }}
      />

      <ConfirmActionModal
        open={activeAction === 'markFault'}
        title="标记为故障"
        locationNo={location.locationNo}
        description="确认将该货位标记为故障状态吗？"
        onCancel={() => setActiveAction(null)}
        onConfirm={() => {
          onMarkFault?.();
          setActiveAction(null);
        }}
      />
    </>
  );
};

export default LocationDetailDrawer;
