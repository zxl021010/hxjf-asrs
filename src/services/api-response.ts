import type { AxiosRequestConfig } from '@umijs/max';

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
  requestID: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export type RequestOptions = Partial<AxiosRequestConfig>;
