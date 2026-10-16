import { request } from '@umijs/max';
import { ApiResponse, RequestOptions } from '../api-response';

/**
 * 查询 PLC 连接状态
 * @param options 请求配置
 * @returns PLC 状态键值对
 */
export async function getPlcStatus(options?: RequestOptions): Promise<ApiResponse<PlcAPI.PlcStatusVO>> {
  return request<ApiResponse<PlcAPI.PlcStatusVO>>('/wms/plc/status', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 读取 PLC 关键寄存器
 * @param options 请求配置
 * @returns 寄存器键值对
 */
export async function getPlcRegisters(options?: RequestOptions): Promise<ApiResponse<PlcAPI.PlcRegistersVO>> {
  return request<ApiResponse<PlcAPI.PlcRegistersVO>>('/wms/plc/registers', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 清空 PLC 操作队列，将 D0/D474/D948 操作 ID 全部置 0
 * @param options 请求配置
 * @returns 操作结果消息
 */
export async function clearPlcQueue(options?: RequestOptions): Promise<ApiResponse<string>> {
  return request<ApiResponse<string>>('/wms/plc/clear-queue', {
    method: 'POST',
    ...(options || {}),
  });
}
