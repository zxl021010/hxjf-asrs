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

  // Count executing locations (deduplicated by location with active tasks)
  // API placeholder: taskId or hasActiveTask field not yet available
  const executingLocationIds = new Set<number>();

  locations.forEach((location) => {
    if (location.status in statusCounts) {
      statusCounts[location.status] += 1;
    }
    // Placeholder: When API provides task info, check for active tasks
    // For now, treat LOCKED as potential executing state
    if (location.status === 'LOCKED') {
      executingLocationIds.add(location.id);
    }
  });

  return [
    { key: 'all', label: '全部' },
    {
      key: 'OCCUPIED',
      label: STATUS_CONFIG.OCCUPIED.label,
      color: STATUS_CONFIG.OCCUPIED.color,
      count: statusCounts.OCCUPIED,
    },
    { key: 'IDLE', label: STATUS_CONFIG.IDLE.label, color: STATUS_CONFIG.IDLE.color, count: statusCounts.IDLE },
    { key: 'LOCKED', label: STATUS_CONFIG.LOCKED.label, color: STATUS_CONFIG.LOCKED.color, count: statusCounts.LOCKED },
    {
      key: 'OFFLINE',
      label: STATUS_CONFIG.OFFLINE.label,
      // 不在货架的卡片背景透明，圆点使用独立颜色。
      color: '#404040',
      count: statusCounts.OFFLINE,
    },
    { key: 'FAULT', label: STATUS_CONFIG.FAULT.label, color: STATUS_CONFIG.FAULT.color, count: statusCounts.FAULT },
    { key: 'executing', label: '执行中', color: '#FA8C16', count: executingLocationIds.size },
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
          {tag.color && (
            <span
              aria-hidden="true"
              className="inline-block h-[16px] w-[16px] shrink-0 rounded-full border border-black/80"
              style={{ backgroundColor: tag.color }}
            />
          )}
          <span>{tag.label}</span>
          {!isAll && <span>({tag.count})</span>}
        </Tag>
      );
    })}
  </div>
);

export { buildFilterTags };
export default FilterTags;
