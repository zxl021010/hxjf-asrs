import { Tag } from 'antd';
import React from 'react';
import type { FilterKey, FilterTagItem } from '../types';
import { STATUS_CONFIG } from './location-card';

const buildFilterTags = (locations: readonly LocationAPI.LocationVO[]): readonly FilterTagItem[] => {
  const statusCounts: Record<LocationAPI.Status, number> = {
    IDLE: 0,
    OCCUPIED: 0,
    LOCKED: 0,
    FAULT: 0,
    OFFLINE: 0,
  };

  locations.forEach((location) => {
    if (location.status in statusCounts) {
      statusCounts[location.status] += 1;
    }
  });

  return [
    { key: 'all', label: '全部' },
    { key: 'IDLE', label: `🟢 ${STATUS_CONFIG.IDLE.label}`, count: statusCounts.IDLE },
    {
      key: 'OCCUPIED',
      label: `🔵 ${STATUS_CONFIG.OCCUPIED.label}`,
      count: statusCounts.OCCUPIED,
    },
    { key: 'LOCKED', label: `🟠 ${STATUS_CONFIG.LOCKED.label}`, count: statusCounts.LOCKED },
    { key: 'FAULT', label: `🔴 ${STATUS_CONFIG.FAULT.label}`, count: statusCounts.FAULT },
    {
      key: 'OFFLINE',
      label: `⚫ ${STATUS_CONFIG.OFFLINE.label}`,
      count: statusCounts.OFFLINE,
    },
  ];
};

interface FilterTagsProps {
  readonly tags: readonly FilterTagItem[];
  readonly activeKey: FilterKey;
  readonly onChange: (key: FilterKey) => void;
}

const FilterTags: React.FC<FilterTagsProps> = ({ tags, activeKey, onChange }) => (
  <div className="flex flex-wrap gap-[8px] py-[8px]">
    {tags.map((tag) => {
      const isActive = tag.key === activeKey;
      const isAll = tag.key === 'all';

      return (
        <Tag
          key={tag.key}
          onClick={() => onChange(tag.key)}
          className="m-0 cursor-pointer px-[14px] py-[6px] rounded-[16px] text-[13px] flex items-center gap-2 border transition-all"
          style={{
            backgroundColor: isActive ? '#E6F4FF' : '#FFFFFF',
            borderColor: isActive ? '#1677FF' : '#E8E8E8',
            color: isActive ? '#1677FF' : '#8C8C8C',
          }}
        >
          <span>{tag.label}</span>
          {!isAll && <span>({tag.count})</span>}
        </Tag>
      );
    })}
  </div>
);

export { buildFilterTags };
export default FilterTags;
