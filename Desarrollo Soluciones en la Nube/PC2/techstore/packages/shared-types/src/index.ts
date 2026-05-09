export type RoleEnum = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'AUDITOR';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  storeId: string | null;
  mfaEnabled: boolean;
  roles: RoleEnum[];
}

export interface LoginResponse {
  mfaRequired?: boolean;
  mfaToken?: string;
  tokens?: {
    accessToken: string;
    expiresIn: number;
  };
  user?: AuthenticatedUser;
}

export interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  correlationId?: string;
  timestamp: string;
  path?: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: RoleEnum;
  description: string;
  _count?: { userRoles: number };
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: string;
  storeId: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  store?: Pick<Store, 'id' | 'name'>;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  storeId: string | null;
  isActive: boolean;
  mfaEnabled: boolean;
  store?: Pick<Store, 'id' | 'name'>;
  userRoles?: { role: Role; assignedAt: string }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  timestamp: string;
  user?: { id: string; email: string };
}
