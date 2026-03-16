import { http } from '../../../shared/lib/http';
import type { AuthUser } from '../types/auth.types';

type MeResponse = {
  data?: AuthUser;
};

export async function me(): Promise<AuthUser | null> {
  const raw = await http.get<MeResponse>('/api/v1/auth/me');
  return raw?.data ?? null;
}
