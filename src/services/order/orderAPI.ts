import { request } from '@umijs/max';
import { ApiResponse, RequestOptions } from '../api-response';

/** 入库（人工/ERP 通用）：source=MANUAL 且填写物品信息则生成订单并占用；source=ERP 需传 orderNo；否则为纯货位上架 */
export async function inboundOrder(
  data: OrderAPI.OrderInboundReqVO,
  options?: RequestOptions,
): Promise<ApiResponse<OrderAPI.InboundResultVO>> {
  return request<ApiResponse<OrderAPI.InboundResultVO>>('/wms/orders/inbound', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}
