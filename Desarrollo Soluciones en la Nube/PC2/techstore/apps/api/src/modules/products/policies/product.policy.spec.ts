import { ForbiddenException } from '@nestjs/common';
import { RoleEnum } from '@prisma/client';
import { ProductPolicy } from './product.policy';
import { ProductAction } from './product-action.enum';
import { AuthenticatedUser } from '../../../common/types';

const buildUser = (
  roles: RoleEnum[],
  storeId: string | null = null,
): AuthenticatedUser => ({
  id: 'u1',
  email: 'u@test.com',
  fullName: 'U',
  storeId,
  mfaEnabled: false,
  roles,
});

describe('ProductPolicy', () => {
  let policy: ProductPolicy;

  beforeEach(() => {
    policy = new ProductPolicy();
  });

  describe('READ/LIST', () => {
    it('ADMIN reads any store', () => {
      const u = buildUser([RoleEnum.ADMIN]);
      expect(() =>
        policy.authorize(u, ProductAction.READ, { storeId: 's2', isPremium: true }),
      ).not.toThrow();
    });

    it('AUDITOR reads any store', () => {
      const u = buildUser([RoleEnum.AUDITOR]);
      expect(() =>
        policy.authorize(u, ProductAction.READ, { storeId: 's2', isPremium: true }),
      ).not.toThrow();
    });

    it('MANAGER cannot read products of another store', () => {
      const u = buildUser([RoleEnum.MANAGER], 's1');
      expect(() =>
        policy.authorize(u, ProductAction.READ, { storeId: 's2', isPremium: false }),
      ).toThrow(ForbiddenException);
    });

    it('EMPLOYEE reads only own store', () => {
      const u = buildUser([RoleEnum.EMPLOYEE], 's1');
      expect(() =>
        policy.authorize(u, ProductAction.READ, { storeId: 's1', isPremium: false }),
      ).not.toThrow();
    });
  });

  describe('CREATE', () => {
    it('EMPLOYEE cannot create premium products', () => {
      const u = buildUser([RoleEnum.EMPLOYEE], 's1');
      expect(() =>
        policy.authorize(u, ProductAction.CREATE, { storeId: 's1', isPremium: true }),
      ).toThrow(/premium/i);
    });

    it('EMPLOYEE cannot create in another store', () => {
      const u = buildUser([RoleEnum.EMPLOYEE], 's1');
      expect(() =>
        policy.authorize(u, ProductAction.CREATE, { storeId: 's2', isPremium: false }),
      ).toThrow(ForbiddenException);
    });

    it('MANAGER creates only in its own store', () => {
      const u = buildUser([RoleEnum.MANAGER], 's1');
      expect(() =>
        policy.authorize(u, ProductAction.CREATE, { storeId: 's2', isPremium: true }),
      ).toThrow(ForbiddenException);
      expect(() =>
        policy.authorize(u, ProductAction.CREATE, { storeId: 's1', isPremium: true }),
      ).not.toThrow();
    });

    it('AUDITOR cannot create', () => {
      const u = buildUser([RoleEnum.AUDITOR]);
      expect(() =>
        policy.authorize(u, ProductAction.CREATE, { storeId: 's1', isPremium: false }),
      ).toThrow(ForbiddenException);
    });
  });

  describe('UPDATE — whitelist por rol', () => {
    it('EMPLOYEE solo puede modificar stock', () => {
      const u = buildUser([RoleEnum.EMPLOYEE], 's1');
      expect(policy.filterUpdatePayload(u, { stock: 5 })).toEqual({ stock: 5 });
      expect(() => policy.filterUpdatePayload(u, { price: 100 })).toThrow(/price/);
    });

    it('MANAGER no puede cambiar categoría ni storeId', () => {
      const u = buildUser([RoleEnum.MANAGER], 's1');
      expect(() => policy.filterUpdatePayload(u, { category: 'X' })).toThrow(/category/);
      expect(() => policy.filterUpdatePayload(u, { storeId: 's2' })).toThrow(/storeId/);
      expect(policy.filterUpdatePayload(u, { price: 99, name: 'New' })).toEqual({
        price: 99,
        name: 'New',
      });
    });

    it('ADMIN puede modificar todos los campos', () => {
      const u = buildUser([RoleEnum.ADMIN]);
      const payload = { name: 'X', price: 10, category: 'C', storeId: 's2', isPremium: true };
      expect(policy.filterUpdatePayload(u, payload)).toEqual(payload);
    });
  });

  describe('DELETE', () => {
    it('EMPLOYEE no puede eliminar', () => {
      const u = buildUser([RoleEnum.EMPLOYEE], 's1');
      expect(() =>
        policy.authorize(u, ProductAction.DELETE, { storeId: 's1', isPremium: false }),
      ).toThrow(ForbiddenException);
    });

    it('MANAGER no puede eliminar productos premium', () => {
      const u = buildUser([RoleEnum.MANAGER], 's1');
      expect(() =>
        policy.authorize(u, ProductAction.DELETE, { storeId: 's1', isPremium: true }),
      ).toThrow(/premium/i);
    });

    it('MANAGER puede eliminar no-premium en su tienda', () => {
      const u = buildUser([RoleEnum.MANAGER], 's1');
      expect(() =>
        policy.authorize(u, ProductAction.DELETE, { storeId: 's1', isPremium: false }),
      ).not.toThrow();
    });

    it('ADMIN puede eliminar cualquiera', () => {
      const u = buildUser([RoleEnum.ADMIN]);
      expect(() =>
        policy.authorize(u, ProductAction.DELETE, { storeId: 's2', isPremium: true }),
      ).not.toThrow();
    });
  });

  describe('buildReadFilter', () => {
    it('ADMIN no aplica filtro de tienda', () => {
      const u = buildUser([RoleEnum.ADMIN]);
      expect(policy.buildReadFilter(u)).toEqual({ deletedAt: null });
    });

    it('MANAGER restringe a su storeId', () => {
      const u = buildUser([RoleEnum.MANAGER], 's1');
      expect(policy.buildReadFilter(u)).toEqual({ deletedAt: null, storeId: 's1' });
    });

    it('MANAGER sin storeId no ve nada', () => {
      const u = buildUser([RoleEnum.MANAGER], null);
      expect(policy.buildReadFilter(u)).toMatchObject({ id: '__no_store__' });
    });
  });
});
