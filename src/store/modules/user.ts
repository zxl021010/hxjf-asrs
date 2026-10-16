import { getUserInfo, login, logout, QrcodeLogin } from '@/services/user/userAPI';
import { getToken, removeToken, setToken } from '@/utils/storage';

export interface UserToken {
  tokenType: string;
  expiresIn?: number;
  accessToken: string;
  refreshToken?: string;
}

class UserInfo {
  private _token: UserToken | null;

  private _username = '';
  private _userId = -1;

  constructor() {
    this._token = getToken();
  }

  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  get userId(): number {
    return this._userId;
  }

  set userId(value: number) {
    this._userId = value;
  }

  get token(): UserToken | null {
    return this._token;
  }

  set token(value: UserToken | null) {
    this._token = value;
  }

  public async RefreshToken() {
    if (this.token === null) {
      throw Error('refresh: token is undefined!');
    }
    if (!this.token.refreshToken) {
      throw Error('refresh: refreshToken is not available (password login does not provide one)');
    }
    const res = await QrcodeLogin({
      clientId: 'trace',
      grantType: 'refresh_token',
      refreshToken: this.token.refreshToken,
    });
    if (res?.code === '200' && res.data) {
      const tokenModel: UserToken = {
        accessToken: res.data.accessToken,
        tokenType: res.data.tokenType,
        expiresIn: res.data.expiresIn,
        refreshToken: res.data.refreshToken,
      };
      setToken(tokenModel);
      this.token = tokenModel;
    }
    return res;
  }

  public async Login(userInfo: { username: string; password: string }) {
    let { username, password } = userInfo;
    username = username.trim();
    const res = await login({ username, password });
    if (res?.code === 200 && res.data) {
      this.userId = res.data.userId;
      this.username = res.data.username;

      const tokenModel: UserToken = {
        accessToken: res.data.token,
        tokenType: 'Bearer',
      };
      setToken(tokenModel);
      this.token = tokenModel;
    }
    return res;
  }
  public async QRCodeLogin(requestData: { clientId: string; grantType: string; code: string }) {
    const res = await QrcodeLogin(requestData);
    if (res?.code === '200' && res.data) {
      const tokenModel: UserToken = {
        accessToken: res.data.accessToken,
        tokenType: res.data.tokenType,
        expiresIn: res.data.expiresIn,
        refreshToken: res.data.refreshToken,
      };
      setToken(tokenModel);
      this.token = tokenModel;
    }
    return res;
  }

  public async QRCodeToken(token: UserToken) {
    setToken(token);
    this.token = token;
  }

  public async GetUserInfo() {
    if (!this.token) {
      throw Error('GetUserInfo: token is undefined!');
    }

    const res = await getUserInfo();
    if (res.code === 200 && res.data) {
      this.userId = res.data.userId;
      this.username = res.data.username;
      return this;
    }
  }

  public async resetToken() {
    removeToken();
    this.token = null;
  }

  public async LogOut() {
    await logout();
    await this.resetToken();
  }
}

export const UserModule = new UserInfo();
