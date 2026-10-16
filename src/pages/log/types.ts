export interface SourceTag {
  readonly type: LogAPI.Source;
  readonly label: string;
  readonly color: string;
  readonly bgColor: string;
}

export interface CategoryStyle {
  readonly label: string;
  readonly color: string;
  readonly bgColor: string;
}

export const CATEGORY_STYLE: Record<LogAPI.EventType, CategoryStyle> = {
  INBOUND: { label: '📥 入库', color: '#52C41A', bgColor: '#F6FFED' },
  OUTBOUND: { label: '📤 出库', color: '#1677FF', bgColor: '#E6F4FF' },
  MOVE: { label: '🔄 移库', color: '#1677FF', bgColor: '#E6F4FF' },
  EXCEPTION: { label: '⚠️ 异常', color: '#FF4D4F', bgColor: '#FFF1F0' },
  SYSTEM: { label: '🔧 系统', color: '#8C8C8C', bgColor: '#F5F5F5' },
  EXCEPTION_ACTION: { label: '⚠️ 异常', color: '#FF4D4F', bgColor: '#FFF1F0' },
  UNKNOWN: { label: '⚠️ 未知', color: '#FF4D4F', bgColor: '#FFF1F0' },
};

export const SOURCE_STYLE: Record<LogAPI.Source, SourceTag> = {
  ERP: { type: 'ERP', label: '🟦 ERP', color: '#13C2C2', bgColor: '#E6FFFB' },
  MANUAL: { type: 'MANUAL', label: '🟠 人工', color: '#D48806', bgColor: '#FFF7E6' },
  SYSTEM: { type: 'SYSTEM', label: '🟩 系统', color: '#8C8C8C', bgColor: '#F5F5F5' },
};
