import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuthStore } from '@/features/auth/store';
import { usePermission } from './usePermission';

describe('usePermission (espejo cliente del ABAC)', () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
  });

  function setUser(roles: string[], storeId: string | null = null) {
    useAuthStore.getState().setAuth({
      user: {
        id: 'u',
        email: 'x@x.com',
        fullName: 'X',
        storeId,
        mfaEnabled: false,
        roles: roles as never,
      },
      accessToken: 't',
    });
  }

  it('EMPLOYEE solo puede editar stock', () => {
    setUser(['EMPLOYEE'], 's1');
    const { result } = renderHook(() => usePermission());
    expect(Array.from(result.current.editableProductFields())).toEqual(['stock']);
  });

  it('MANAGER no incluye category ni storeId en editables', () => {
    setUser(['MANAGER'], 's1');
    const { result } = renderHook(() => usePermission());
    const fields = result.current.editableProductFields();
    expect(fields.has('category')).toBe(false);
    expect(fields.has('storeId')).toBe(false);
    expect(fields.has('price')).toBe(true);
  });

  it('ADMIN puede crear premium', () => {
    setUser(['ADMIN']);
    const { result } = renderHook(() => usePermission());
    expect(
      result.current.can('create', 'product', { storeId: 'any', isPremium: true }),
    ).toBe(true);
  });

  it('EMPLOYEE no puede crear premium aunque sea su tienda', () => {
    setUser(['EMPLOYEE'], 's1');
    const { result } = renderHook(() => usePermission());
    expect(
      result.current.can('create', 'product', { storeId: 's1', isPremium: true }),
    ).toBe(false);
  });

  it('MANAGER no puede borrar premium', () => {
    setUser(['MANAGER'], 's1');
    const { result } = renderHook(() => usePermission());
    expect(
      result.current.can('delete', 'product', { storeId: 's1', isPremium: true }),
    ).toBe(false);
  });

  it('AUDITOR ve audit-logs', () => {
    setUser(['AUDITOR']);
    const { result } = renderHook(() => usePermission());
    expect(result.current.can('list', 'audit-log')).toBe(true);
  });
});
