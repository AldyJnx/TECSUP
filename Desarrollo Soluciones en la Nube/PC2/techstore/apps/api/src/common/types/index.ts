import { RoleEnum } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: RoleEnum[];
  storeId: string | null;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
  correlationId?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  storeId: string | null;
  roles: RoleEnum[];
  mfaEnabled: boolean;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
  correlationId?: string;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
