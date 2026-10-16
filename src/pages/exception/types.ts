export interface StatusConfig {
  readonly label: string;
  readonly color: string;
  readonly bgColor: string;
  readonly borderColor: string;
}

export interface PriorityConfig {
  readonly label: string;
  readonly color: string;
  readonly bgColor: string;
}

export interface SourceConfig {
  readonly label: string;
  readonly color: string;
  readonly bgColor: string;
}

export interface TypeConfig {
  readonly title: string;
}

export const EXCEPTION_STATUS_CONFIG: Record<ExceptionAPI.HandlingStatus, StatusConfig> = {
  PENDING: { label: '🟡 待处理', color: '#FAAD14', bgColor: '#FFFBE6', borderColor: '#FF4D4F' },
  PROCESSING: { label: '🔵 处理中', color: '#1677FF', bgColor: '#E6F4FF', borderColor: '#FAAD14' },
  RESOLVED: { label: '🟢 已解决', color: '#52C41A', bgColor: '#F6FFED', borderColor: '#52C41A' },
};

export const EXCEPTION_PRIORITY_CONFIG: Record<ExceptionAPI.Severity, PriorityConfig> = {
  HIGH: { label: '🔴 高', color: '#FF4D4F', bgColor: '#FFF1F0' },
  MEDIUM: { label: '🟡 中', color: '#D48806', bgColor: '#FFF7E6' },
  LOW: { label: '🟢 低', color: '#52C41A', bgColor: '#F6FFED' },
};

export const EXCEPTION_SOURCE_CONFIG: Record<ExceptionAPI.SourceType, SourceConfig> = {
  MANUAL: { label: '🟠 人工', color: '#D48806', bgColor: '#FFF7E6' },
  ERP: { label: '🟦 ERP', color: '#13C2C2', bgColor: '#E6FFFB' },
  SYSTEM: { label: '🔷 系统', color: '#722ED1', bgColor: '#F9F0FF' },
};

export const EXCEPTION_TYPE_CONFIG: Record<ExceptionAPI.TaskType, TypeConfig> = {
  INBOUND: { title: '📤 入库' },
  OUTBOUND: { title: '📥 出库' },
  MOVE: { title: '🔄 移库' },
};
