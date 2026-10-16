declare namespace LocationAPI {
  /**
   * 货位状态：IDLE空闲/OCCUPIED占用/LOCKED锁定/FAULT故障/OFFLINE不在货架
   */
  export type Status = 'IDLE' | 'OCCUPIED' | 'LOCKED' | 'FAULT' | 'OFFLINE';

  /**
   * 订单来源：MANUAL人工/ERP/OMS/SYSTEM系统
   */
  export type OrderSource = 'MANUAL' | 'ERP';

  /** 分页查询货位请求参数 */
  interface LocationPageParams {
    /** 页码，从1开始 */
    page: number;
    /** 每页条数 */
    size: number;
    /** 关键词（货位号） */
    keyword?: string;
    /** 状态列表：0-AVAILABLE/1-LOCKED/2-FAULT */
    statuses?: Status[];
  }

  /** 货位 */
  interface LocationVO {
    /** 货位ID */
    id: number;
    /** 货位号 */
    locationNo: string;
    /** 行号 */
    rowNo: number;
    /** 列号 */
    columnNo: number;
    /** 货位状态：IDLE空闲/OCCUPIED占用/LOCKED锁定/FAULT故障/OFFLINE不在货架 */
    status: Status;
    /** 状态原因 */
    statusReason: string;
    /** 状态操作人姓名 */
    statusOperatorName: string;
    /** 状态变更时间 */
    statusChangeTime: string;
    /** 最后操作 */
    lastOperation: string;
    /** 盒子编码 */
    boxCode: string;
    /** 物品名称 */
    itemName: string;
    /** 物品重量(g) */
    itemWeight: number;
    /** 订单号 */
    orderNo: string;
    /** 订单来源：MANUAL人工/ERP/OMS/SYSTEM系统 */
    orderSource?: OrderSource;
  }

  /** 货位重新入库请求 */
  interface BoxReInboundReqVO {
    /** 备注 */
    remark?: string;
  }

  /** 入库结果 */
  interface InboundResultVO {
    /** 任务ID */
    taskId: number;
    /** 任务编号 */
    taskNo: string;
    /** 关联订单信息 */
    order?: OrderVO | null;
  }

  /** 关联订单 */
  interface OrderVO {
    /** 订单ID */
    id: number;
    /** 订单号 */
    orderNo: string;
    /** 订单来源：MANUAL人工/ERP外部系统 */
    source: 'MANUAL' | 'ERP';
    /** 订单类型：INBOUND入库/OUTBOUND出库 */
    orderType: 'INBOUND' | 'OUTBOUND';
    /** 订单状态 */
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'EXCEPTION';
    /** 物品名称 */
    itemName: string;
    /** 物品重量(g) */
    itemWeight: number;
    /** 物品数量 */
    itemQuantity: number;
    /** 操作人姓名 */
    operatorName: string;
    /** 操作人手机号 */
    operatorPhone: string;
    /** 备注 */
    remark: string;
    /** 创建时间 */
    createTime: string;
  }

  /** 标记货位故障请求参数 */
  interface MarkFaultParams {
    /** 货位号 */
    locationNo: string;
    /** 故障原因 */
    reason?: string;
  }

  /** 重新入库请求参数 */
  interface ReInboundParams {
    /** 货位号 */
    locationNo: string;
    /** 请求体 */
    data: BoxReInboundReqVO;
  }
}
