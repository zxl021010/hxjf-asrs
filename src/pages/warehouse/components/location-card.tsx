import { Card } from 'antd';
import React, { useCallback } from 'react';
import { ORDER_SOURCE_LABEL } from '../constants';
import type { StatusCardConfig } from '../types';

const STATUS_CONFIG: Record<LocationAPI.Status, StatusCardConfig> = {
  IDLE: { label: '空闲', color: '#52C41A', textColor: '#FFFFFF' },
  OCCUPIED: { label: '占用', color: '#1677FF', textColor: '#FFFFFF' },
  LOCKED: { label: '锁定', color: '#FAAD14', textColor: '#874D00' },
  FAULT: { label: '故障', color: '#FF4D4F', textColor: '#FFFFFF' },
  OFFLINE: { label: '不在货架', color: 'transparent', textColor: '#000000' },
};

export { STATUS_CONFIG };

interface LocationCardProps {
  readonly location: LocationAPI.LocationVO;
  readonly isSelected: boolean;
  readonly selectionMode: boolean;
  readonly onClick: (location: LocationAPI.LocationVO) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, isSelected, selectionMode, onClick }) => {
  const config = STATUS_CONFIG[location.status];

  const handleClick = useCallback(() => {
    onClick(location);
  }, [location, onClick]);

  return (
    <Card
      variant="borderless"
      styles={{ body: { padding: 0, width: '90%' } }}
      onClick={handleClick}
      className={`select-none hover:opacity-90 hover:scale-105 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center aspect-square relative ${
        selectionMode && location.status !== 'OCCUPIED' && location.status !== 'IDLE'
          ? 'cursor-not-allowed opacity-70'
          : 'cursor-pointer'
      }`}
      style={{
        backgroundColor: config.color,
        borderRadius: 10,
        ...(location.status === 'FAULT' ? { animation: 'pulse-fault 2s ease-in-out infinite' } : {}),
        border: isSelected ? '3px solid #FFFFFF' : undefined,
        boxShadow: isSelected ? '0 0 0 2px #1677FF, 0 4px 12px rgba(22,119,255,0.3)' : undefined,
      }}
    >
      <div
        className="flex flex-col items-center text-center gap-[2px] overflow-hidden"
        style={{ color: config.textColor }}
      >
        <div className="text-[20px] font-bold leading-[20px]">{location.locationNo}</div>
        <div className="text-[9px] leading-[13px] opacity-90 font-medium">{config.label}</div>
        {location.status === 'OCCUPIED' && location.orderSource && (
          <div
            className={`mt-1 text-[10px] leading-[14px] px-[6px] py-[1px] rounded-[4px] flex items-center ${
              location.orderSource === 'MANUAL' ? 'bg-[#FFF7E6] text-[#D48806]' : 'bg-[#E6FFFB] text-[#13C2C2]'
            }`}
          >
            <span>{ORDER_SOURCE_LABEL[location.orderSource]}</span>
          </div>
        )}
        {location.itemName && (
          <div className="text-[8px] leading-[11px] opacity-80 flex items-center justify-center gap-[2px] w-full">
            <span className="truncate">{location.itemName}</span>
            {location.itemWeight && <span className="shrink-0">{location.itemWeight}克</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default LocationCard;
