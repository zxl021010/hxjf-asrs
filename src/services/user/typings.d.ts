declare namespace UserAPI {
  /** 登录请求 */
  interface LoginReqVO {
    /** 用户名 */
    username: string;
    /** 密码 */
    password: string;
  }

  /** 登录响应数据 */
  interface LoginVO {
    /** 访问令牌 */
    token: string;
    /** 用户ID */
    userId: number;
    /** 用户名 */
    username: string;
  }

  /** 当前用户信息 */
  interface AdminSelfInfoDTO {
    /** 用户ID */
    id: number;
    /** 系统编码 */
    systemCode: string;
    /** 姓名 */
    name: string;
    /** 手机号 */
    phone: string;
    /** 权限列表 */
    authority: string[];
  }
}
