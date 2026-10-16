import { request } from '@umijs/max';
import { ApiResponse, RequestOptions } from '../api-response';

/** 货位概览 */
export async function getWarehouseSummary(
  options?: RequestOptions,
): Promise<ApiResponse<DashboardAPI.LocationSummaryVO>> {
  return request<ApiResponse<DashboardAPI.LocationSummaryVO>>('/dashboard/warehouse-summary', {
    method: 'GET',
    ...(options || {}),
  });
}
