import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getErrorMessage, setupHttpAuth } from '../../../shared/lib/http';
import { login as loginApi } from '../api/login';
import { me } from '../api/me';
import { refresh as refreshApi } from '../api/refresh';
import type { LoginInput } from '../schemas/login.schema';
import type { AuthUser } from '../types/auth.types';

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isHydrating: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hydrateUser: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      isHydrating: false,
      error: null,
      login: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const { token, refreshToken, user } = await loginApi(input);
          set({ token, refreshToken, user: user ?? null, isLoading: false });

          if (!user) {
            await get().hydrateUser();
          }
        } catch (error) {
          const message = getErrorMessage(error, 'Login failed.');
          set({ isLoading: false, error: message, token: null, refreshToken: null, user: null });
          throw error;
        }
      },
      logout: () => set({ token: null, refreshToken: null, user: null, error: null }),
      clearError: () => set({ error: null }),
      hydrateUser: async () => {
        const token = get().token;
        if (!token) {
          set({ user: null });
          return;
        }

        set({ isHydrating: true });
        try {
          const user = await me();
          set({ user, isHydrating: false });
        } catch {
          set({ token: null, refreshToken: null, user: null, isHydrating: false });
        }
      },
      refreshSession: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) {
          return null;
        }

        try {
          const refreshed = await refreshApi(currentRefreshToken);
          set({
            token: refreshed.token,
            refreshToken: refreshed.refreshToken ?? currentRefreshToken,
            user: refreshed.user ?? get().user,
          });
          return refreshed.token;
        } catch {
          set({ token: null, refreshToken: null, user: null, error: null });
          return null;
        }
      },
    }),
    {
      name: 'auth-session',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);

setupHttpAuth({
  getAccessToken: () => useAuthStore.getState().token,
  refreshAccessToken: () => useAuthStore.getState().refreshSession(),
  onUnauthorized: () => useAuthStore.getState().logout(),
});
