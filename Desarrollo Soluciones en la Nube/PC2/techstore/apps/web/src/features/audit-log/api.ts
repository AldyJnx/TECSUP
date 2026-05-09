import { api } from '@/shared/api/axios';
import type { AuditLogEntry, PaginatedResponse } from '@techstore/shared-types';

interface Envelope<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ListAuditParams {
  page?: number;
  limit?: number;
  resource?: string;
  userId?: string;
}

export const auditApi = {
  async list(params: ListAuditParams = {}): Promise<PaginatedResponse<AuditLogEntry>> {
    const { data } = await api.get<Envelope<PaginatedResponse<AuditLogEntry>>>(
      '/audit-logs',
      { params },
    );
    return data.data;
  },
};
