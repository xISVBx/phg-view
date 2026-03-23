import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { ProblemDetails } from '../types/problem-details';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
};

type AuthBridge = {
  getAccessToken?: () => string | null;
  refreshAccessToken?: () => Promise<string | null>;
  onUnauthorized?: () => void;
};

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let authBridge: AuthBridge = {};
let refreshInFlight: Promise<string | null> | null = null;

export class HttpError extends Error {
  status: number;
  payload: unknown;
  code?: string;
  problem?: ProblemDetails;

  constructor(status: number, payload: unknown, message?: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.payload = payload;
    this.problem = asProblemDetails(payload);
    this.code = this.problem?.code;
    this.message = message ?? buildErrorMessage(status, payload);
  }
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, application/problem+json',
  },
});

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return url.includes('/v1/auth/login') || url.includes('/v1/auth/refresh');
}

function asProblemDetails(payload: unknown): ProblemDetails | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const candidate = payload as Record<string, unknown>;

  const hasProblemShape =
    typeof candidate.status === 'number' ||
    typeof candidate.detail === 'string' ||
    typeof candidate.title === 'string' ||
    typeof candidate.code === 'string';

  if (!hasProblemShape) return undefined;

  return {
    type: typeof candidate.type === 'string' ? candidate.type : undefined,
    title: typeof candidate.title === 'string' ? candidate.title : undefined,
    status: typeof candidate.status === 'number' ? candidate.status : undefined,
    detail: typeof candidate.detail === 'string' ? candidate.detail : undefined,
    instance: typeof candidate.instance === 'string' ? candidate.instance : undefined,
    code: typeof candidate.code === 'string' ? candidate.code : undefined,
    errors: Array.isArray(candidate.errors)
      ? candidate.errors.filter((item): item is string => typeof item === 'string')
      : undefined,
  };
}

function buildErrorMessage(status: number, payload: unknown): string {
  const problem = asProblemDetails(payload);
  if (!problem) return `HTTP ${status}`;

  const parts: string[] = [];
  if (problem.detail) parts.push(problem.detail);
  if (problem.errors?.length) parts.push(problem.errors.join(' | '));

  return parts.length > 0 ? parts.join(' ') : problem.title ?? `HTTP ${status}`;
}

client.interceptors.request.use((config) => {
  const existingAuthHeader = config.headers?.Authorization;
  if (existingAuthHeader) {
    return config;
  }

  const token = authBridge.getAccessToken?.();
  if (!token) {
    return config;
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const originalRequest = error.config as RetriableConfig | undefined;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url) ||
      !authBridge.refreshAccessToken
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshInFlight) {
        refreshInFlight = authBridge.refreshAccessToken().finally(() => {
          refreshInFlight = null;
        });
      }

      const refreshedToken = await refreshInFlight;

      if (!refreshedToken) {
        authBridge.onUnauthorized?.();
        return Promise.reject(error);
      }

      if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
        originalRequest.headers.set('Authorization', `Bearer ${refreshedToken}`);
      } else {
        originalRequest.headers = AxiosHeaders.from({
          ...(originalRequest.headers as Record<string, unknown> | undefined),
          Authorization: `Bearer ${refreshedToken}`,
        });
      }

      return client.request(originalRequest);
    } catch (refreshError) {
      authBridge.onUnauthorized?.();
      return Promise.reject(refreshError);
    }
  },
);

export function setupHttpAuth(bridge: AuthBridge) {
  authBridge = bridge;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers } = options;

  try {
    const response = await client.request<T>({
      url: path,
      method,
      data: body,
      headers,
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status ?? 0;
      const payload = error.response?.data ?? null;
      throw new HttpError(status, payload, error.message);
    }

    if (error instanceof Error) {
      throw new HttpError(0, null, error.message);
    }

    throw new HttpError(0, null, 'Network error');
  }
}

export const http = {
  get: <T>(path: string, headers?: Record<string, string>) => request<T>(path, { method: 'GET', headers }),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) => request<T>(path, { method: 'POST', body, headers }),
  put: <T>(path: string, body?: unknown, headers?: Record<string, string>) => request<T>(path, { method: 'PUT', body, headers }),
  patch: <T>(path: string, body?: unknown, headers?: Record<string, string>) => request<T>(path, { method: 'PATCH', body, headers }),
  delete: <T>(path: string, headers?: Record<string, string>) => request<T>(path, { method: 'DELETE', headers }),
};

export function getErrorMessage(error: unknown, fallback = 'Unexpected error.'): string {
  if (error instanceof HttpError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
