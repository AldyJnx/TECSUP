import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { config } from '@/shared/config';
import { useAuthStore } from '@/features/auth/store';

export const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((requestConfig: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && requestConfig.headers) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  try {
    const res = await axios.post<{
      data: { accessToken: string; expiresIn: number };
    }>(
      `${config.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true, timeout: 10000 },
    );
    const newToken = res.data?.data?.accessToken;
    if (newToken) {
      useAuthStore.getState().setAccessToken(newToken);
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = originalConfig?.url ?? '';

    // Si /auth/refresh falla, no entrar en loop infinito
    if (
      status === 401 &&
      originalConfig &&
      !originalConfig._retry &&
      !url.includes('/auth/refresh') &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/mfa/verify')
    ) {
      originalConfig._retry = true;
      refreshPromise = refreshPromise ?? tryRefresh();
      const newToken = await refreshPromise;
      refreshPromise = null;
      if (newToken && originalConfig.headers) {
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return api.request(originalConfig);
      }
      useAuthStore.getState().clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      const data = error.response?.data as { message?: string } | undefined;
      toast.error(data?.message ?? 'No tienes permisos para esta acción');
    }

    return Promise.reject(error);
  },
);
