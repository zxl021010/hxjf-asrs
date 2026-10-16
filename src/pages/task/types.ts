import React from 'react';

export type FilterType = 'all' | TaskAPI.TaskType | 'EXCEPTION';

export const TASK_TYPE_CONFIG: Record<
  TaskAPI.TaskType,
  { readonly label: string; readonly icon: React.ReactNode; readonly color: string; readonly iconBgColor: string }
> = {
  INBOUND: { label: '入库任务', icon: '📥', color: '#52C41A', iconBgColor: '#F6FFED' },
  OUTBOUND: { label: '出库任务', icon: '📤', color: '#1677FF', iconBgColor: '#E6F4FF' },
  MOVE: { label: '移库任务', icon: '🔄', color: '#FA8C16', iconBgColor: '#FFFBE6' },
};

export const TASK_SOURCE_LABEL: Record<TaskAPI.Source, string> = {
  ERP: '🟦 ERP',
  MANUAL: '🟠 人工',
  SYSTEM: '🟦 SYSTEM',
};

export const PRIORITY_CONFIG: Record<
  TaskAPI.Priority,
  { readonly label: string; readonly color: string; readonly bgColor: string }
> = {
  HIGH: { label: '🔴 高', color: '#FF4D4F', bgColor: '#FFF1F0' },
  NORMAL: { label: '🟡 中', color: '#D48806', bgColor: '#FFFBE6' },
  LOW: { label: '🟢 低', color: '#52C41A', bgColor: '#F6FFED' },
};

export const STATUS_CONFIG: Record<
  TaskAPI.Status,
  { readonly label: string; readonly color: string; readonly borderColor: string; readonly bgColor: string }
> = {
  EXECUTING: { label: '执行中', color: '#1677FF', borderColor: '#52C41A', bgColor: '#E6F4FF' },
  PENDING: { label: '待处理', color: '#D48806', borderColor: '#FAAD14', bgColor: '#FFFBF0' },
  COMPLETED: { label: '已完成', color: '#52C41A', borderColor: '#52C41A', bgColor: '#F6FFED' },
  EXCEPTION: { label: '异常', color: '#FF4D4F', borderColor: '#FF4D4F', bgColor: '#FFF2F0' },
  CANCELLED: { label: '已取消', color: '#8C8C8C', borderColor: '#8C8C8C', bgColor: '#F5F5F5' },
};

export const FILTER_SUBTITLE: Record<FilterType, string> = {
  all: '全部任务',
  INBOUND: '入库任务',
  OUTBOUND: '出库任务',
  MOVE: '移库任务',
  EXCEPTION: '异常任务',
};

export const FILTER_TABS: readonly { readonly value: FilterType; readonly label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'INBOUND', label: '📥 入库' },
  { value: 'OUTBOUND', label: '📤 出库' },
  { value: 'MOVE', label: '🔄 移库' },
  { value: 'EXCEPTION', label: '⚠️ 异常' },
];

export interface TaskStats {
  readonly total: number;
  readonly erpCount: number;
  readonly manualCount: number;
  readonly executingCount: number;
  readonly exceptionCount: number;
}

export const mapTaskStatistics = (apiStats: TaskAPI.TaskStatisticsVO): TaskStats => ({
  total: apiStats.total,
  erpCount: apiStats.sourceCounts['ERP'] ?? 0,
  manualCount: apiStats.sourceCounts['MANUAL'] ?? 0,
  executingCount: apiStats.statusCounts['EXECUTING'] ?? 0,
  exceptionCount: apiStats.statusCounts['EXCEPTION'] ?? 0,
});

export const STAT_ITEMS: readonly {
  readonly label: string;
  readonly badgeColor?: string;
  readonly textColor: string;
  readonly getValue: (s: TaskStats) => string;
}[] = [
  { label: '', textColor: '#8C8C8C', getValue: (s) => `共 ${s.total} 条任务` },
  { label: 'ERP', badgeColor: '#13C2C2', textColor: '#000000', getValue: (s) => String(s.erpCount) },
  { label: '人工', badgeColor: '#FAAD14', textColor: '#000000', getValue: (s) => String(s.manualCount) },
  { label: '执行中', badgeColor: '#1677FF', textColor: '#1677FF', getValue: (s) => String(s.executingCount) },
  { label: '异常', badgeColor: '#FF4D4F', textColor: '#000000', getValue: (s) => String(s.exceptionCount) },
];

export const filterTasks = (
  tasks: readonly TaskAPI.TaskVO[],
  filterKey: FilterType,
  keyword: string,
): readonly TaskAPI.TaskVO[] => {
  const lowerKeyword = keyword.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesFilter =
      filterKey === 'all' || (filterKey === 'EXCEPTION' ? task.status === 'EXCEPTION' : task.taskType === filterKey);

    const matchesKeyword =
      !lowerKeyword ||
      task.orderNo.toLowerCase().includes(lowerKeyword) ||
      task.sourceLocationNo.toLowerCase().includes(lowerKeyword) ||
      task.operatorName.toLowerCase().includes(lowerKeyword) ||
      task.itemName.toLowerCase().includes(lowerKeyword);

    return matchesFilter && matchesKeyword;
  });
};
