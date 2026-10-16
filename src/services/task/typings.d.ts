declare namespace TaskAPI {
  /**
   * 优先级：HIGH高/NORMAL普通/LOW低
   */
  export type Priority = 'HIGH' | 'NORMAL' | 'LOW';
  /**
   * 任务来源：MANUAL人工/ERP/SYSTEM系统
   */
  export type Source = 'MANUAL' | 'ERP' | 'SYSTEM';
  /**
   * 任务状态：PENDING待执行/EXECUTING执行中/EXCEPTION异常/COMPLETED已完成/CANCELLED已取消
   */
  export type Status = 'PENDING' | 'EXECUTING' | 'EXCEPTION' | 'COMPLETED' | 'CANCELLED';

  /**
   * 任务类型：INBOUND入库/OUTBOUND出库/MOVE移库
   */
  export type TaskType = 'INBOUND' | 'OUTBOUND' | 'MOVE';
  /**
   * 推荐处理方式：CONTINUE继续/RETRY重试
   */
  export type RecommendedAction = 'CONTINUE' | 'RETRY';

  /** 分页查询任务请求参数 */
  interface TaskPageParams {
    /** 页码，从1开始 */
    page: number;
    /** 每页条数 */
    size: number;
    /** 关键词（任务号/订单号/货位号） */
    keyword?: string;
    /** 任务类型：INBOUND入库/OUTBOUND出库/MOVE移库 */
    taskType?: TaskType;
    /** 任务状态：PENDING待执行/EXECUTING执行中/EXCEPTION异常/COMPLETED已完成/CANCELLED已取消 */
    status?: Status;
    /** 任务来源：MANUAL人工/ERP/SYSTEM系统 */
    source?: Source;
    /** 优先级：HIGH高/NORMAL普通/LOW低 */
    priority?: Priority;
  }

  /** 标记异常请求参数 */
  interface TaskExceptionParams {
    /** 任务ID */
    id: number;
    /** 异常原因 */
    reason: string;
  }

  /** 取消任务请求参数 */
  interface TaskCancelParams {
    /** 任务ID */
    id: number;
    /** 取消原因 */
    reason: string;
  }

  /** 强制标记异常请求参数 */
  interface ForceExceptionParams {
    /** 任务ID */
    id: number;
    /** 异常原因（可选） */
    reason?: string;
  }

  /** 调整任务优先级请求参数 */
  interface TaskPriorityParams {
    /** 任务ID */
    id: number;
    /** 优先级：HIGH高/NORMAL普通/LOW低 */
    priority: Priority;
  }

  /** 拖拽位置 */
  type ReorderPosition = 'BEFORE' | 'AFTER';

  /** 拖拽任务排序请求参数 */
  interface TaskReorderParams {
    /** 目标任务ID */
    targetTaskId: number;
    /** 拖拽位置：BEFORE目标之前/AFTER目标之后 */
    position: ReorderPosition;
  }

  /** 设置任务自动下发开关请求参数 */
  interface AutoDispatchParams {
    /** 是否启用 */
    enabled: boolean;
  }

  /** 任务统计 */
  interface TaskStatisticsVO {
    /** 任务总数 */
    total: number;
    /** 各来源任务数量统计，key为来源枚举：MANUAL/ERP/SYSTEM */
    sourceCounts: Record<string, number>;
    /** 各状态任务数量统计，key为状态枚举：PENDING/EXECUTING/EXCEPTION/COMPLETED/CANCELLED */
    statusCounts: Record<string, number>;
    /** 各类型任务数量统计，key为类型枚举：INBOUND/OUTBOUND/MOVE */
    typeCounts: Record<string, number>;
  }

  /** 任务 */
  interface TaskVO {
    /** 任务ID */
    id: number;
    /** 任务编号 */
    taskNo: string;
    /** 订单ID */
    orderId: number;
    /** 订单号 */
    orderNo: string;
    /** 任务类型：INBOUND入库/OUTBOUND出库/MOVE移库 */
    taskType: TaskType;
    /** 任务来源：MANUAL人工/ERP/SYSTEM系统 */
    source: Source;
    /** 任务状态：PENDING待执行/EXECUTING执行中/EXCEPTION异常/COMPLETED已完成/CANCELLED已取消 */
    status: Status;
    /** 优先级：HIGH高/NORMAL普通/LOW低 */
    priority: Priority;
    /** 排序号，越小越靠前，用于同优先级内拖拽排序 */
    sortNo: number;
    /** 来源货位号 */
    sourceLocationNo: string;
    /** 目标货位号 */
    targetLocationNo: string;
    /** 物品名称 */
    itemName: string;
    /** 物品重量(g) */
    itemWeight: number;
    /** 操作人姓名 */
    operatorName: string;
    /** 进度百分比(0-100) */
    progressPercent: number;
    /** 原因 */
    reason: string;
    /** 当前活跃异常ID，仅在任务状态为EXCEPTION时返回 */
    exceptionId: number;
    /** 推荐处理方式：CONTINUE继续/RETRY重试，仅在任务状态为EXCEPTION时返回 */
    recommendedAction: RecommendedAction;
    /** 开始时间 */
    startTime: string;
    /** 完成时间 */
    finishTime: string;
    /** 创建时间 */
    createTime: string;
  }
}
