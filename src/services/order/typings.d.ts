declare namespace OrderAPI {
  /** 订单来源 */
  type OrderSource = 'MANUAL' | 'ERP';

  /** 订单类型 */
  type OrderType = 'INBOUND' | 'OUTBOUND';

  /** 订单状态 */
  type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'EXCEPTION';

  /** 入库请求 */
  interface OrderInboundReqVO {
    /** 货位号（唯一必填项） */
    locationNo: string;
    /** 来源：MANUAL人工/ERP，默认MANUAL */
    source?: OrderSource;
    /** ERP 订单号（source=ERP 时必填） */
    orderNo?: string;
    /** 物品名称（source=MANUAL 且有货时填写） */
    itemName?: string;
    /** 物品重量(g)（source=MANUAL 且有货时填写） */
    itemWeight?: number;
    /** 备注 */
    remark?: string;
  }

  /** 订单 */
  interface OrderVO {
    /** 订单ID */
    id: number;
    /** 订单号 */
    orderNo: string;
    /** 订单来源：MANUAL人工/ERP系统 */
    source: OrderSource;
    /** 订单类型：INBOUND入库/OUTBOUND出库 */
    orderType: OrderType;
    /** 订单状态：PENDING待处理/PROCESSING处理中/COMPLETED已完成/CANCELLED已取消/EXCEPTION异常 */
    status: OrderStatus;
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

  /** 入库结果 */
  interface InboundResultVO {
    /** 任务ID */
    taskId: number;
    /** 任务编号 */
    taskNo: string;
    /** 关联订单信息（纯货位上架无订单数据时为 null） */
    order: OrderVO | null;
  }
}
