declare namespace LogAPI {
  /**
   * 事件类型
   */
  export type EventType = 'INBOUND' | 'OUTBOUND' | 'MOVE' | 'EXCEPTION' | 'SYSTEM' | 'EXCEPTION_ACTION' | 'UNKNOWN';
  /**
   * 事件来源：MANUAL/ERP/SYSTEM
   */
  export type Source = 'MANUAL' | 'ERP' | 'SYSTEM';
  /**
   * 事件分类：OPERATION业务操作/EXCEPTION异常流程/SYSTEM系统事件/UNKNOWN未知
   */
  export type EventCategory = 'OPERATION' | 'EXCEPTION' | 'SYSTEM' | 'UNKNOWN';

  /** 分页查询日志请求参数 */
  interface LogPageParams {
    /** 页码，从1开始 */
    page: number;
    /** 每页条数 */
    size: number;
    /** 事件类型 */
    eventType?: EventType;
    /** 开始时间 */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
    /** 关键词（事件标识/消息） */
    keyword?: string;
  }

  /** 业务事件日志 */
  interface BusinessEventLogVO {
    /** 日志ID */
    id: number;
    /** 事件标识 */
    eventKey: string;
    /** 事件类型 */
    eventType: EventType;
    /** 事件分类：OPERATION业务操作/EXCEPTION异常流程/SYSTEM系统事件/UNKNOWN未知 */
    eventCategory?: EventCategory;
    /** 日志消息 */
    message: string;
    /** 操作人姓名 */
    actorName: string;
    /** 事件来源：MANUAL/ERP/SYSTEM */
    source: Source;
    /** 货位号 */
    locationNo: string;
    /** 订单号 */
    orderNo: string;
    /** 发生时间 */
    occurredTime: string;
  }

  /** 业务事件日志详情 */
  interface BusinessEventLogDetailVO {
    /** 日志ID */
    id: number;
    /** 事件标识 */
    eventKey: string;
    /** 事件类型 */
    eventType: EventType;
    /** 事件分类：OPERATION业务操作/EXCEPTION异常流程/SYSTEM系统事件/UNKNOWN未知 */
    eventCategory?: EventCategory;
    /** 日志消息 */
    message: string;
    /** 操作人姓名 */
    actorName: string;
    /** 事件来源：MANUAL/ERP/SYSTEM */
    source: Source;
    /** 货位号 */
    locationNo: string;
    /** 订单号 */
    orderNo: string;
    /** 发生时间 */
    occurredTime: string;
    /** 任务ID */
    taskId: number;
    /** 订单ID */
    orderId: number;
    /** 操作人引用 */
    actorRef: string;
    /** 原状态 */
    fromStatus: number;
    /** 目标状态 */
    toStatus: number;
    /** 请求载荷 */
    requestPayload: Record<string, unknown>;
    /** 响应载荷 */
    responsePayload: Record<string, unknown>;
  }
}
