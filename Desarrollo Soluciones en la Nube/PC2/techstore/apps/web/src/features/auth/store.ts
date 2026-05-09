import { create } from 'zustand';
import type { AuthenticatedUser } from '@techstore/shared-types';

interface AuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: { user: AuthenticatedUser; accessToken: string }) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: ({ user, accessToken }) =>
    set({ user, accessToken, isAuthenticated: true }),
  setAccessToken: (accessToken) =>
    set((state) => ({
      accessToken,
      isAuthenticated: state.user !== null,
    })),
  clear: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
