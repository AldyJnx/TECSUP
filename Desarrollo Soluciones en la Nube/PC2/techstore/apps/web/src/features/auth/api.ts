import { api } from '@/shared/api/axios';
import type { AuthenticatedUser, LoginResponse } from '@techstore/shared-types';

interface Envelope<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  storeId?: string;
}

export interface MfaVerifyPayload {
  mfaToken: string;
  code: string;
}

export interface MfaSetupResult {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<Envelope<LoginResponse>>('/auth/login', payload);
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<{ id: string; email: string }> {
    const { data } = await api.post<Envelope<{ id: string; email: string }>>(
      '/auth/register',
      payload,
    );
    return data.data;
  },

  async verifyMfa(payload: MfaVerifyPayload): Promise<LoginResponse> {
    const { data } = await api.post<Envelope<LoginResponse>>('/auth/mfa/verify', payload);
    return data.data;
  },

  async enableMfa(): Promise<MfaSetupResult> {
    const { data } = await api.post<Envelope<MfaSetupResult>>('/auth/mfa/enable');
    return data.data;
  },

  async verifyMfaSetup(code: string): Promise<{ enabled: true }> {
    const { data } = await api.post<Envelope<{ enabled: true }>>(
      '/auth/mfa/verify-setup',
      { code },
    );
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async me(): Promise<AuthenticatedUser> {
    const { data } = await api.get<Envelope<AuthenticatedUser>>('/auth/me');
    return data.data;
  },
};
