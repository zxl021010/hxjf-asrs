import { UserToken } from '@/store/modules/user';

const TOKEN_KEY = 'Authorization';

export const setToken = (token: UserToken): void => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
};

export const getToken = (): UserToken | null => {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserToken;
  } catch {
    console.warn('[storage] Failed to parse token, clearing invalid value.');
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};
