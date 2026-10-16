declare namespace ExceptionAPI {
  /** 任务类型 */
  type TaskType = 'INBOUND' | 'OUTBOUND' | 'MOVE';

  /** 来源类型 */
  type SourceType = 'MANUAL' | 'ERP' | 'SYSTEM';

  /** 处理状态 */
  type HandlingStatus = 'PENDING' | 'PROCESSING' | 'RESOLVED';

  /** 严重程度 */
  type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

  /** 推荐处理方式 */
  type RecommendedAction = 'CONTINUE' | 'RETRY';

  /** 分页查询异常请求参数 */
  interface ExceptionPageParams {
    /** 页码，从1开始 */
    page: number;
    /** 每页条数 */
    size: number;
    /** 处理状态：PENDING待处理/PROCESSING处理中/RESOLVED已解决 */
    handlingStatus?: HandlingStatus;
    /** 严重程度：HIGH高/MEDIUM中/LOW低 */
    severity?: Severity;
    /** 关键词（货位号/异常编码） */
    keyword?: string;
  }

  /** 保存备注请求参数 */
  interface ExceptionRemarkParams {
    /** 异常ID */
    id: number;
    /** 备注 */
    remark: string;
  }

  /** 解决异常请求参数 */
  interface ExceptionResolveParams {
    /** 异常ID */
    id: number;
    /** 备注 */
    remark?: string;
  }

  /** 异常 */
  interface ExceptionVO {
    /** 异常ID */
    id: number;
    /** 异常编码 */
    exceptionCode: string;
    /** 任务编号 */
    taskNo: string;
    /** 订单编号 */
    orderNo: string;
    /** 任务类型：INBOUND入库/OUTBOUND出库/MOVE移库 */
    taskType: TaskType;
    /** 来源类型：MANUAL人工/ERP外部系统/SYSTEM系统 */
    sourceType: SourceType;
    /** 严重程度：HIGH高/MEDIUM中/LOW低 */
    severity: Severity;
    /** 处理状态：PENDING待处理/PROCESSING处理中/RESOLVED已解决 */
    handlingStatus: HandlingStatus;
    /** 推荐处理方式：OVERRIDE覆盖/IGNORE忽略/RETRY重试/RESET复位 */
    recommendedAction: RecommendedAction;
    /** 异常消息 */
    message: string;
    /** 货位号 */
    locationNo: string;
    /** 原因 */
    reason: string;
    /** 处理人姓名 */
    assigneeName: string;
    /** 认领时间 */
    claimTime: string;
    /** 创建时间 */
    createTime: string;
  }

  /** 异常详情 */
  interface ExceptionDetailVO {
    /** 异常ID */
    id: number;
    /** 异常编码 */
    exceptionCode: string;
    /** 任务编号 */
    taskNo: string;
    /** 订单编号 */
    orderNo: string;
    /** 任务类型：INBOUND入库/OUTBOUND出库/MOVE移库 */
    taskType: TaskType;
    /** 来源类型：MANUAL人工/ERP外部系统/SYSTEM系统 */
    sourceType: SourceType;
    /** 严重程度：HIGH高/MEDIUM中/LOW低 */
    severity: Severity;
    /** 处理状态：PENDING待处理/PROCESSING处理中/RESOLVED已解决 */
    handlingStatus: HandlingStatus;
    /** 推荐处理方式：OVERRIDE覆盖/IGNORE忽略/RETRY重试/RESET复位 */
    recommendedAction: RecommendedAction;
    /** 异常消息 */
    message: string;
    /** 货位号 */
    locationNo: string;
    /** 原因 */
    reason: string;
    /** 处理人姓名 */
    assigneeName: string;
    /** 认领时间 */
    claimTime: string;
    /** 创建时间 */
    createTime: string;
    /** 任务ID */
    taskId: number;
    /** 订单ID */
    orderId: number;
    /** 异常库编码 */
    exceptionCodeLib: string;
    /** 错误码 */
    errorCode: string;
    /** 处理人ID */
    assigneeId: number;
    /** 备注 */
    remark: string;
    /** 处理时间 */
    handledTime: string;
  }
}
