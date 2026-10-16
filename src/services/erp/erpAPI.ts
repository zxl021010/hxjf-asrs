import { request } from '@umijs/max';
import { ApiResponse, RequestOptions } from '../api-response';

/** 查询 ERP 订单信息（根据订单号从 ERP 获取商品名称和克重） */
export async function getErpOrderInfo(
  orderNo: string,
  options?: RequestOptions,
): Promise<ApiResponse<ErpAPI.ErpOrderInfoVO>> {
  return request<ApiResponse<ErpAPI.ErpOrderInfoVO>>(`/erp/orders/${orderNo}`, {
    method: 'GET',
    ...(options || {}),
  });
}
