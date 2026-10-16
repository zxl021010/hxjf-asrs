import { request } from '@umijs/max';
import { ApiResponse, PageResult, RequestOptions } from '../api-response';

/** 任务统计 */
export async function getTaskStatistics(options?: RequestOptions): Promise<ApiResponse<TaskAPI.TaskStatisticsVO>> {
  return request<ApiResponse<TaskAPI.TaskStatisticsVO>>('/wms/tasks/statistics', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 分页查询任务 */
export async function getTaskPage(
  params: TaskAPI.TaskPageParams,
  options?: RequestOptions,
): Promise<ApiResponse<PageResult<TaskAPI.TaskVO>>> {
  return request<ApiResponse<PageResult<TaskAPI.TaskVO>>>('/wms/tasks/page', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 任务详情 */
export async function getTaskDetail(id: number, options?: RequestOptions): Promise<ApiResponse<TaskAPI.TaskVO>> {
  return request<ApiResponse<TaskAPI.TaskVO>>(`/wms/tasks/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 标记异常 */
export async function markTaskException(
  params: TaskAPI.TaskExceptionParams,
  options?: RequestOptions,
): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/wms/tasks/${params.id}/exception`, {
    method: 'POST',
    params: { reason: params.reason },
    ...(options || {}),
  });
}

/** 重试任务 */
export async function retryTask(id: number, options?: RequestOptions): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/wms/tasks/${id}/retry`, {
    method: 'POST',
    ...(options || {}),
  });
}

/** 取消任务 */
export async function cancelTask(
  params: TaskAPI.TaskCancelParams,
  options?: RequestOptions,
): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/wms/tasks/${params.id}/cancel`, {
    method: 'POST',
    params: { reason: params.reason },
    ...(options || {}),
  });
}

/** 强制将执行中任务标记为异常 */
export async function forceExceptionTask(
  params: TaskAPI.ForceExceptionParams,
  options?: RequestOptions,
): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/wms/tasks/${params.id}/force-exception`, {
    method: 'POST',
    params: params.reason ? { reason: params.reason } : undefined,
    ...(options || {}),
  });
}

/** 调整任务优先级 */
export async function updateTaskPriority(
  params: TaskAPI.TaskPriorityParams,
  options?: RequestOptions,
): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/wms/tasks/${params.id}/priority`, {
    method: 'POST',
    params: { priority: params.priority },
    ...(options || {}),
  });
}

/** 拖拽任务排序 */
export async function reorderTask(
  id: number,
  params: TaskAPI.TaskReorderParams,
  options?: RequestOptions,
): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>(`/wms/tasks/${id}/reorder`, {
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}

/** 查询任务自动下发开关状态 */
export async function getAutoDispatchStatus(options?: RequestOptions): Promise<ApiResponse<Record<string, unknown>>> {
  return request<ApiResponse<Record<string, unknown>>>('/wms/tasks/scheduler/auto-dispatch', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 设置任务自动下发开关 */
export async function setAutoDispatch(
  params: TaskAPI.AutoDispatchParams,
  options?: RequestOptions,
): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>('/wms/tasks/scheduler/auto-dispatch', {
    method: 'POST',
    params: { enabled: params.enabled },
    ...(options || {}),
  });
}
