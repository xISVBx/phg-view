import type { AuthUser } from '../types/auth.types';

type AnyObject = Record<string, unknown>;

type AuthPayload = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    user?: AuthUser;
  };
};

export function extractAccessToken(payload: unknown): string | null {
  const source = payload as AnyObject;
  const data = source?.data as AnyObject | undefined;

  const candidates = [
    data?.accessToken,
    data?.access_token,
    source?.accessToken,
    source?.access_token,
    source?.token,
    source?.jwt,
  ];

  const token = candidates.find((value): value is string => typeof value === 'string' && value.length > 0);
  return token ?? null;
}

export function extractRefreshToken(payload: unknown): string | null {
  const source = payload as AnyObject;
  const data = source?.data as AnyObject | undefined;

  const candidates = [
    data?.refreshToken,
    data?.refresh_token,
    source?.refreshToken,
    source?.refresh_token,
  ];

  const refreshToken = candidates.find((value): value is string => typeof value === 'string' && value.length > 0);
  return refreshToken ?? null;
}

export function extractAuthUser(payload: unknown): AuthUser | undefined {
  const source = payload as AuthPayload;
  return source?.data?.user;
}
