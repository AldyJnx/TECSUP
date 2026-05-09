import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, Product, RoleEnum } from '@prisma/client';
import { AuthenticatedUser } from '../../../common/types';
import { ProductAction } from './product-action.enum';

/**
 * Matriz ABAC para Productos
 * | Acción | ADMIN          | MANAGER                          | EMPLOYEE                       | AUDITOR        |
 * |--------|----------------|----------------------------------|--------------------------------|----------------|
 * | SELECT | Todos          | Solo su tienda                   | Solo su tienda                 | Todos (RO)     |
 * | INSERT | Cualquiera     | Solo su tienda                   | Solo su tienda + NO premium    | ❌             |
 * | UPDATE | Todos campos   | Su tienda, excepto categoría     | Solo `stock` en su tienda      | ❌             |
 * | DELETE | Cualquiera     | Su tienda + NO premium           | ❌                             | ❌             |
 */
@Injectable()
export class ProductPolicy {
  /**
   * Determina si el usuario puede ejecutar `action` sobre el recurso (si aplica).
   * Lanza ForbiddenException con mensaje claro cuando se deniega.
   */
  authorize(
    user: AuthenticatedUser,
    action: ProductAction,
    resource?: Pick<Product, 'storeId' | 'isPremium'>,
  ): void {
    const has = (r: RoleEnum) => user.roles.includes(r);

    switch (action) {
      case ProductAction.LIST:
      case ProductAction.READ:
        if (has(RoleEnum.ADMIN) || has(RoleEnum.AUDITOR)) return;
        if (has(RoleEnum.MANAGER) || has(RoleEnum.EMPLOYEE)) {
          if (!resource) return; // listing — la query se filtra después
          if (resource.storeId === user.storeId) return;
          throw new ForbiddenException('Cannot view products from other stores');
        }
        throw new ForbiddenException('No permission to read products');

      case ProductAction.CREATE:
        if (has(RoleEnum.ADMIN)) return;
        if (has(RoleEnum.MANAGER)) {
          if (resource?.storeId === user.storeId) return;
          throw new ForbiddenException('Manager can only create products in their store');
        }
        if (has(RoleEnum.EMPLOYEE)) {
          if (resource?.storeId !== user.storeId) {
            throw new ForbiddenException('Employee can only create in their store');
          }
          if (resource?.isPremium) {
            throw new ForbiddenException('Employee cannot create premium products');
          }
          return;
        }
        throw new ForbiddenException('No permission to create products');

      case ProductAction.UPDATE:
        if (has(RoleEnum.ADMIN)) return;
        if (has(RoleEnum.MANAGER)) {
          if (resource && resource.storeId !== user.storeId) {
            throw new ForbiddenException('Manager can only update products in their store');
          }
          return;
        }
        if (has(RoleEnum.EMPLOYEE)) {
          if (resource && resource.storeId !== user.storeId) {
            throw new ForbiddenException('Employee can only update products in their store');
          }
          return;
        }
        throw new ForbiddenException('No permission to update products');

      case ProductAction.DELETE:
        if (has(RoleEnum.ADMIN)) return;
        if (has(RoleEnum.MANAGER)) {
          if (!resource) throw new ForbiddenException('Resource required for delete');
          if (resource.storeId !== user.storeId) {
            throw new ForbiddenException('Manager can only delete products in their store');
          }
          if (resource.isPremium) {
            throw new ForbiddenException('Manager cannot delete premium products');
          }
          return;
        }
        throw new ForbiddenException('No permission to delete products');
    }
  }

  /**
   * Devuelve un filtro Prisma `where` para LIST/READ según el rol.
   * ADMIN y AUDITOR ven todo. MANAGER y EMPLOYEE solo su tienda.
   */
  buildReadFilter(user: AuthenticatedUser): Prisma.ProductWhereInput {
    const base: Prisma.ProductWhereInput = { deletedAt: null };
    if (user.roles.includes(RoleEnum.ADMIN) || user.roles.includes(RoleEnum.AUDITOR)) {
      return base;
    }
    if (user.roles.includes(RoleEnum.MANAGER) || user.roles.includes(RoleEnum.EMPLOYEE)) {
      if (!user.storeId) {
        return { ...base, id: '__no_store__' };
      }
      return { ...base, storeId: user.storeId };
    }
    return { ...base, id: '__no_access__' };
  }

  /**
   * Whitelist de campos editables por rol. Si el usuario intenta modificar un campo
   * fuera de su lista, se lanza ForbiddenException citando el campo concreto.
   */
  filterUpdatePayload<T extends Record<string, unknown>>(
    user: AuthenticatedUser,
    payload: T,
  ): Partial<T> {
    const all = ['name', 'description', 'price', 'stock', 'category', 'isPremium', 'storeId'] as const;
    let allowed: readonly string[];

    if (user.roles.includes(RoleEnum.ADMIN)) {
      allowed = all;
    } else if (user.roles.includes(RoleEnum.MANAGER)) {
      allowed = all.filter((f) => f !== 'category' && f !== 'storeId');
    } else if (user.roles.includes(RoleEnum.EMPLOYEE)) {
      allowed = ['stock'];
    } else {
      throw new ForbiddenException('No permission to update products');
    }

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(payload)) {
      if (payload[key] === undefined) continue;
      if (!allowed.includes(key)) {
        throw new ForbiddenException(
          `Field "${key}" cannot be modified by your role`,
        );
      }
      result[key] = payload[key];
    }
    return result as Partial<T>;
  }
}
