import React from 'react';
import type { FilterType } from '../types';
import { FILTER_TABS } from '../types';

interface FilterTabsProps {
  readonly activeKey: FilterType;
  readonly onChange: (key: FilterType) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ activeKey, onChange }) => (
  <div className="flex items-center gap-[4px] py-[8px] border-b border-[#E8E8E8]">
    {FILTER_TABS.map((tab) => {
      const isActive = tab.value === activeKey;
      return (
        <div key={tab.value} className="relative">
          <div
            onClick={() => onChange(tab.value)}
            className="flex items-center px-[20px] py-[8px] rounded-[10px] text-[14px] leading-[20px] cursor-pointer transition-all"
            style={{
              backgroundColor: isActive ? '#FFFFFF' : 'transparent',
              color: isActive ? '#1677FF' : '#8C8C8C',
              fontWeight: isActive ? 600 : 500,
              boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <span>{tab.label}</span>
          </div>
          {isActive && (
            <div
              className="absolute bottom-[-9px] left-[20%] right-[20%]"
              style={{
                height: 1,
                backgroundColor: '#1677FF',
                borderRadius: 1,
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

export default FilterTabs;
