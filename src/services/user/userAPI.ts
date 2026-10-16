import { request } from '@umijs/max';
import { ApiResponse, RequestOptions } from '../api-response';

/** 账号密码登录 */
export async function login(data: UserAPI.LoginReqVO, options?: RequestOptions): Promise<ApiResponse<UserAPI.LoginVO>> {
  return request<ApiResponse<UserAPI.LoginVO>>('/wms/auth/login', {
    method: 'POST',
    data,
    ...(options || {}),
  });
}

/** 退出登录 */
export async function logout(): Promise<ApiResponse<boolean>> {
  return request<ApiResponse<boolean>>('/wms/auth/logout', {
    method: 'POST',
  });
}

/** 获取账号信息 */
export async function getUserInfo(): Promise<ApiResponse<UserAPI.LoginVO>> {
  return request<ApiResponse<UserAPI.LoginVO>>('/wms/auth/info', {
    method: 'GET',
  });
}

/** qrcode登录/获取二维码票据 */
export async function getLoginQrCode(clientId: string) {
  return request('/v1/connect/qrcode/session', {
    method: 'POST',
    baseURL: process.env.AUTH_BASE_URL,
    data: {
      clientId,
    },
  });
}

/** qrcode登录/查询登录状态 */
export async function getLoginStatus(qrcodeId: string) {
  return request(`/v1/connect/qrcode/status/${qrcodeId}`, {
    method: 'GET',
    baseURL: process.env.AUTH_BASE_URL,
  });
}

/** qrcode登录/扫码成功跳转 */
export async function QrcodeLogin(data: { clientId: string; grantType: string; code?: string; refreshToken?: string }) {
  return request(`/v1/auth/token`, {
    method: 'POST',
    baseURL: process.env.AUTH_BASE_URL,
    data,
  });
}
