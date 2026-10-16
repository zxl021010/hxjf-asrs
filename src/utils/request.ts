import { UserModule } from '@/store/modules/user';
import type { AxiosRequestConfig, AxiosResponse } from '@umijs/max';
import { request as service } from '@umijs/max';
import { message } from 'antd';
import type { RequestConfig } from 'umi';

const excludeTokenRegex = /^\/?(public|expose)\/?(.*)/;

interface ApiResponseData {
  code?: number;
  msg?: string;
  [key: string]: unknown;
}

interface ExtendedError extends Error {
  response?: { status: number; data?: unknown; config?: AxiosRequestConfig };
  config?: AxiosRequestConfig;
  code?: string | number;
  alreadyHandler?: boolean;
}

export const request: RequestConfig = {
  baseURL: process.env.API_BASE_URL,
  timeout: 60000,
  errorConfig: {},
  requestInterceptors: [
    [
      (config: AxiosRequestConfig): AxiosRequestConfig => {
        if (config.url && config.url?.match(excludeTokenRegex)) {
          return config;
        }
        if (config.headers && UserModule.token) {
          config.headers.Authorization = `${UserModule?.token?.tokenType} ${UserModule?.token?.accessToken}`;
        }
        return config;
      },
      (error: unknown) => Promise.reject(error),
    ],
  ],
  responseInterceptors: [
    [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (response: any) => {
        const res = response as AxiosResponse<ApiResponseData>;
        if (
          res.status === 200 &&
          (res.config.baseURL || '').indexOf('auth') === -1 &&
          res?.data?.code &&
          res?.data?.code !== 200
        ) {
          message.open({ content: res.data.msg, type: 'error' });
        }
        return response;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (error: any) => {
        const err = error as ExtendedError;
        if (err?.response) {
          const response = err.response;
          if (response.status === 401) {
            if (UserModule.token && localStorage.getItem('accessToken')) {
              try {
                const res = await UserModule.RefreshToken();
                if (res.code === '200') {
                  const url = err.config?.url;
                  if (!url) {
                    throw new Error('retry: original request url is missing');
                  }
                  const retryRequest = await service(url, {
                    baseURL: err.config?.baseURL,
                    headers: err.config?.headers,
                    method: err.config?.method,
                    data: err.config?.data,
                    params: err.config?.params,
                    getResponse: true,
                  });
                  return { message: '重试请求', name: 'retryRequest', ...retryRequest };
                } else {
                  throw new Error('refresh: token is undefined!');
                }
              } catch (retryErr: unknown) {
                try {
                  if (!(retryErr as ExtendedError)?.alreadyHandler) {
                    await message.loading('登录失效，需要重新登录, 即将跳转登录页面', 3);
                    await UserModule.resetToken();
                    location.reload();
                  }
                } catch (e) {
                  return Promise.reject(e);
                }
              }
            } else {
              await UserModule.resetToken();
              location.reload();
            }
          } else if (response.status === 403) {
            await message.loading('未登录, 即将跳转登录页面', 3);
            location.reload();
          } else if (response.status === 500) {
            message.open({ content: '服务器异常', type: 'error' });
            err.alreadyHandler = true;
            return Promise.reject(response.data);
          }
          message.open({ content: `${response.status}:${err.code}`, type: 'error' });
          return Promise.reject(error);
        }
        if (err.toString().includes('Network Error')) {
          message.open({ content: '网络异常', type: 'error' });
          err.alreadyHandler = true;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      },
    ],
  ],
};

export default request;
