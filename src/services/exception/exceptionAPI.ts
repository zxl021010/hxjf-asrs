import { request } from '@umijs/max';
import { ApiResponse, PageResult, RequestOptions } from '../api-response';

/** 分页查询异常 */
export async function getExceptionPage(
  params: ExceptionAPI.ExceptionPageParams,
  options?: RequestOptions,
): Promise<ApiResponse<PageResult<ExceptionAPI.ExceptionVO>>> {
  return request<ApiResponse<PageResult<ExceptionAPI.ExceptionVO>>>('/exceptions/page', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 异常详情 */
export async function getExceptionDetail(
  id: number,
  options?: RequestOptions,
): Promise<ApiResponse<ExceptionAPI.ExceptionDetailVO>> {
  return request<ApiResponse<ExceptionAPI.ExceptionDetailVO>>(`/exceptions/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 认领异常 */
export async function claimException(id: number, options?: RequestOptions): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/exceptions/${id}/claim`, {
    method: 'POST',
    ...(options || {}),
  });
}

/** 保存备注 */
export async function remarkException(
  params: ExceptionAPI.ExceptionRemarkParams,
  options?: RequestOptions,
): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/exceptions/${params.id}/remark`, {
    method: 'POST',
    params: { remark: params.remark },
    ...(options || {}),
  });
}

/** 解决异常 */
export async function resolveException(
  params: ExceptionAPI.ExceptionResolveParams,
  options?: RequestOptions,
): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/exceptions/${params.id}/resolve`, {
    method: 'POST',
    params: params.remark !== null ? { remark: params.remark } : undefined,
    ...(options || {}),
  });
}

/** 重试异常关联任务 */
export async function retryException(id: number, options?: RequestOptions): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/exceptions/${id}/retry`, {
    method: 'POST',
    ...(options || {}),
  });
}

/** 确认继续执行 */
export async function continueException(id: number, options?: RequestOptions): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/exceptions/${id}/continue`, {
    method: 'POST',
    ...(options || {}),
  });
}
