import { api } from '@/shared/api/axios';
import type { User } from '@techstore/shared-types';

interface Envelope<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export const usersApi = {
  async list(): Promise<User[]> {
    const { data } = await api.get<Envelope<User[]>>('/users');
    return data.data;
  },
  async create(payload: {
    email: string;
    password: string;
    fullName: string;
    storeId?: string;
  }): Promise<User> {
    const { data } = await api.post<Envelope<User>>('/users', payload);
    return data.data;
  },
  async update(
    id: string,
    payload: { fullName?: string; storeId?: string; isActive?: boolean },
  ): Promise<User> {
    const { data } = await api.patch<Envelope<User>>(`/users/${id}`, payload);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
