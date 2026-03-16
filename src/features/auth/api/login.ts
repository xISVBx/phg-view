import { http } from '../../../shared/lib/http';
import type { LoginInput } from '../schemas/login.schema';
import type { LoginResult } from '../types/auth.types';
import { extractAccessToken, extractAuthUser, extractRefreshToken } from './auth-tokens';

type LoginResponse = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

export async function login(payload: LoginInput): Promise<LoginResult> {
  const raw = await http.post<LoginResponse>('/api/v1/auth/login', payload);
  const token = extractAccessToken(raw);

  if (!token) {
    throw new Error('Login response did not include an authentication token.');
  }

  return {
    token,
    refreshToken: extractRefreshToken(raw),
    user: extractAuthUser(raw),
    raw,
  };
}
