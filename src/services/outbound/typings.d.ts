declare namespace OutboundAPI {
  /** 货仓状态：IDLE空闲/OCCUPIED占用/LOCKED锁定/FAULT故障/OFFLINE不在货架 */
  type WarehouseStatus = 'IDLE' | 'OCCUPIED' | 'LOCKED' | 'FAULT' | 'OFFLINE';

  /** 料箱物理状态：IN_RACK在货架/OUT_OF_RACK不在货架/MOVING移动中/UNKNOWN未知 */
  type BoxPhysicalStatus = 'IN_RACK' | 'OUT_OF_RACK' | 'MOVING' | 'UNKNOWN';

  /** 订单来源：MANUAL人工/ERP系统 */
  type OrderSource = 'MANUAL' | 'ERP';

  /** 订单状态：PENDING待处理/PROCESSING处理中/COMPLETED已完成/CANCELLED已取消/EXCEPTION异常 */
  type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'EXCEPTION';

  /** 普通出库前校验请求 */
  interface OutboundNormalPreviewReqVO {
    /** 货仓编号 */
    warehouseNo: string;
    /** 订单号 */
    orderNo: string;
  }

  /** 快捷出库前校验请求 */
  interface OutboundQuickPreviewReqVO {
    /** 订单号与货仓编号二选一 */
    keyword?: string;
  }

  /** 人工出库请求 */
  interface OutboundQuickReqVO {
    /** 货位编号 */
    locationNo: string;
  }

  /** 出库预览 */
  interface OutboundPreviewVO {
    /** 货仓编号 */
    warehouseNo: string;
    /** 料箱编码 */
    boxCode: string;
    /** 货仓状态 */
    warehouseStatus: WarehouseStatus;
    /** 料箱物理状态 */
    boxPhysicalStatus: BoxPhysicalStatus;
    /** 订单ID */
    orderId: number;
    /** 订单号 */
    orderNo: string;
    /** 订单来源 */
    orderSource: OrderSource;
    /** 订单状态 */
    orderStatus: OrderStatus;
    /** 物品名称 */
    itemName: string;
    /** 物品重量(g) */
    itemWeight: number;
    /** 物品数量 */
    itemQuantity: number;
    /** 操作人姓名 */
    operatorName: string;
    /** 当前在库记录对应的入库任务编号 */
    inboundTaskNo: string;
  }
}
