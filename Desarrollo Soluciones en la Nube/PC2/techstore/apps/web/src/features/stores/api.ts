import { api } from '@/shared/api/axios';
import type { Store } from '@techstore/shared-types';

interface Envelope<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export const storesApi = {
  async list(): Promise<Store[]> {
    const { data } = await api.get<Envelope<Store[]>>('/stores');
    return data.data;
  },
  async create(payload: { name: string; address: string }): Promise<Store> {
    const { data } = await api.post<Envelope<Store>>('/stores', payload);
    return data.data;
  },
};
