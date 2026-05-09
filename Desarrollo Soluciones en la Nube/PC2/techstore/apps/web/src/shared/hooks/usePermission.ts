import type { RoleEnum } from '@techstore/shared-types';
import { useAuthStore } from '@/features/auth/store';

export type Action = 'read' | 'list' | 'create' | 'update' | 'delete';
export type Resource = 'product' | 'user' | 'role' | 'store' | 'audit-log';

interface ProductLike {
  storeId?: string;
  isPremium?: boolean;
}

/**
 * Espejo cliente de la matriz ABAC del backend.
 * SOLO controla la UI (mostrar/ocultar/disabled). El backend
 * sigue siendo la fuente de verdad y rechazará cualquier intento.
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const has = (role: RoleEnum) => user?.roles.includes(role) ?? false;

  function can(action: Action, resource: Resource, target?: ProductLike): boolean {
    if (!user) return false;

    if (resource === 'audit-log') {
      return action === 'list' && (has('ADMIN') || has('AUDITOR'));
    }

    if (resource === 'role' || resource === 'user' || resource === 'store') {
      if (action === 'list' || action === 'read') return true;
      return has('ADMIN');
    }

    if (resource === 'product') {
      switch (action) {
        case 'list':
        case 'read':
          return true;
        case 'create':
          if (has('ADMIN')) return true;
          if (has('MANAGER') || has('EMPLOYEE')) {
            const sameStore = !target?.storeId || target.storeId === user.storeId;
            const premiumOk = !(has('EMPLOYEE') && target?.isPremium);
            return sameStore && premiumOk;
          }
          return false;
        case 'update':
          if (has('ADMIN')) return true;
          if (has('MANAGER') || has('EMPLOYEE')) {
            return !target?.storeId || target.storeId === user.storeId;
          }
          return false;
        case 'delete':
          if (has('ADMIN')) return true;
          if (has('MANAGER')) {
            const sameStore = !target?.storeId || target.storeId === user.storeId;
            return sameStore && !target?.isPremium;
          }
          return false;
      }
    }

    return false;
  }

  /**
   * Whitelist de campos del formulario de producto editables por el rol actual.
   */
  function editableProductFields(): Set<string> {
    if (has('ADMIN')) {
      return new Set(['name', 'description', 'price', 'stock', 'category', 'isPremium', 'storeId']);
    }
    if (has('MANAGER')) {
      return new Set(['name', 'description', 'price', 'stock', 'isPremium']);
    }
    if (has('EMPLOYEE')) {
      return new Set(['stock']);
    }
    return new Set();
  }

  return { user, can, has, editableProductFields };
}
