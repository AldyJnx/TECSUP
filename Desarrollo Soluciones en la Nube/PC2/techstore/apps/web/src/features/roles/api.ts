import { api } from '@/shared/api/axios';
import type { Role } from '@techstore/shared-types';

interface Envelope<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export const rolesApi = {
  async list(): Promise<Role[]> {
    const { data } = await api.get<Envelope<Role[]>>('/roles');
    return data.data;
  },
  async assign(payload: { userId: string; roleId: string }) {
    const { data } = await api.post<Envelope<unknown>>('/roles/assign', payload);
    return data.data;
  },
  async revoke(userId: string, roleId: string) {
    await api.delete(`/roles/assign/${userId}/${roleId}`);
  },
};
