import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { RoleEnum } from '@techstore/shared-types';
import { useAuthStore } from '@/features/auth/store';
import { authApi } from '@/features/auth/api';
import { Skeleton } from '@/shared/ui/skeleton';

interface Props {
  roles?: RoleEnum[];
}

export function ProtectedRoute({ roles }: Props) {
  const location = useLocation();
  const { user, accessToken, isAuthenticated, setAuth, clear } = useAuthStore();
  const [bootstrapping, setBootstrapping] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;
    (async () => {
      // Intenta refrescar la sesión silenciosamente con la cookie httpOnly
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('refresh failed');
        const json = await res.json();
        const token = json?.data?.accessToken;
        if (!token) throw new Error('no token');
        useAuthStore.getState().setAccessToken(token);
        const me = await authApi.me();
        if (!cancelled) setAuth({ user: me, accessToken: token });
      } catch {
        clear();
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setAuth, clear]);

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-60" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    );
  }

  if (!user || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.some((r) => user.roles.includes(r))) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
