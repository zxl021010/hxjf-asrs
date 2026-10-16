import { request } from '@umijs/max';
import { ApiResponse, RequestOptions } from '../api-response';

/** 普通出库前校验 - 预览数据 */
export async function boundPreview(
  data: OutboundAPI.OutboundNormalPreviewReqVO,
  options?: RequestOptions,
): Promise<ApiResponse<OutboundAPI.OutboundPreviewVO>> {
  return request<ApiResponse<OutboundAPI.OutboundPreviewVO>>('/bound/preview', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/** 快捷出库前校验 - 预览数据 */
export async function boundQuickPreview(
  data: OutboundAPI.OutboundQuickPreviewReqVO,
  options?: RequestOptions,
): Promise<ApiResponse<OutboundAPI.OutboundPreviewVO>> {
  return request<ApiResponse<OutboundAPI.OutboundPreviewVO>>('/bound/quick-preview', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/** 确认出库 */
export async function boundOut(
  data: OutboundAPI.OutboundQuickReqVO,
  options?: RequestOptions,
): Promise<ApiResponse<TaskAPI.TaskVO>> {
  return request<ApiResponse<TaskAPI.TaskVO>>('/bound/out', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}
