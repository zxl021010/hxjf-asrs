import { request } from '@umijs/max';
import { ApiResponse, PageResult, RequestOptions } from '../api-response';

/** 分页查询货位 */
export async function getLocationPage(
  params: LocationAPI.LocationPageParams,
  options?: RequestOptions,
): Promise<ApiResponse<PageResult<LocationAPI.LocationVO>>> {
  return request<ApiResponse<PageResult<LocationAPI.LocationVO>>>('/locations/page', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 货位各个状态盒子数量统计 */
export async function getLocationSummary(
  options?: RequestOptions,
): Promise<ApiResponse<DashboardAPI.LocationSummaryVO>> {
  return request<ApiResponse<DashboardAPI.LocationSummaryVO>>('/locations/summary', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 查看货位详情 */
export async function getLocationDetail(
  id: number,
  options?: RequestOptions,
): Promise<ApiResponse<LocationAPI.LocationVO>> {
  return request<ApiResponse<LocationAPI.LocationVO>>(`/locations/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 标记货位故障 */
export async function markLocationFault(
  locationNo: string,
  reason?: string,
  options?: RequestOptions,
): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/locations/${locationNo}/mark-fault`, {
    method: 'POST',
    params: reason ? { reason } : undefined,
    ...(options || {}),
  });
}

/** 故障货位重新入库 */
export async function reInboundLocation(
  locationNo: string,
  data: LocationAPI.BoxReInboundReqVO,
  options?: RequestOptions,
): Promise<ApiResponse<LocationAPI.InboundResultVO>> {
  return request<ApiResponse<LocationAPI.InboundResultVO>>(`/locations/${locationNo}/re-inbound`, {
    method: 'POST',
    data,
    params: { locationNo },
    ...(options || {}),
  });
}
