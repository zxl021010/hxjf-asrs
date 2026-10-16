import { request } from '@umijs/max';
import { ApiResponse, PageResult, RequestOptions } from '../api-response';

/** 分页查询日志 */
export async function getLogPage(
  params: LogAPI.LogPageParams,
  options?: RequestOptions,
): Promise<ApiResponse<PageResult<LogAPI.BusinessEventLogVO>>> {
  return request<ApiResponse<PageResult<LogAPI.BusinessEventLogVO>>>('/logs/page', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 日志详情 */
export async function getLogDetail(
  id: number,
  options?: RequestOptions,
): Promise<ApiResponse<LogAPI.BusinessEventLogDetailVO>> {
  return request<ApiResponse<LogAPI.BusinessEventLogDetailVO>>(`/logs/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
