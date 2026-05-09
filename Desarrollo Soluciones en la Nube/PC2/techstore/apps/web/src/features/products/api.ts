import { api } from '@/shared/api/axios';
import type { PaginatedResponse, Product } from '@techstore/shared-types';

interface Envelope<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  storeId?: string;
  isPremium?: boolean;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  storeId: string;
  isPremium?: boolean;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  isPremium?: boolean;
  storeId?: string;
}

export const productsApi = {
  async list(params: ListProductsParams = {}): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get<Envelope<PaginatedResponse<Product>>>('/products', {
      params,
    });
    return data.data;
  },
  async create(payload: CreateProductPayload): Promise<Product> {
    const { data } = await api.post<Envelope<Product>>('/products', payload);
    return data.data;
  },
  async update(id: string, payload: UpdateProductPayload): Promise<Product> {
    const { data } = await api.patch<Envelope<Product>>(`/products/${id}`, payload);
    return data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
