import { http } from '../../../shared/lib/http';
import { extractAccessToken, extractAuthUser, extractRefreshToken } from './auth-tokens';
import type { AuthUser } from '../types/auth.types';

type RefreshResponse = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: AuthUser;
  };
};

export type RefreshResult = {
  token: string;
  refreshToken: string | null;
  user?: AuthUser;
  raw: unknown;
};

export async function refresh(refreshToken: string): Promise<RefreshResult> {
  const raw = await http.post<RefreshResponse>('/v1/auth/refresh', { refreshToken });
  const token = extractAccessToken(raw);

  if (!token) {
    throw new Error('Refresh response did not include an access token.');
  }

  return {
    token,
    refreshToken: extractRefreshToken(raw),
    user: extractAuthUser(raw),
    raw,
  };
}
