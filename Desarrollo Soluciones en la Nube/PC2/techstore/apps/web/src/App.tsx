import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Skeleton } from '@/shared/ui/skeleton';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { MainLayout } from '@/app/layouts/MainLayout';
import { ForbiddenPage, NotFoundPage } from '@/app/layouts/ErrorPages';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MfaPage } from '@/features/auth/pages/MfaPage';
import { MfaSetupPage } from '@/features/auth/pages/MfaSetupPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { UsersPage } from '@/features/users/UsersPage';
import { RolesPage } from '@/features/roles/RolesPage';
import { StoresPage } from '@/features/stores/StoresPage';
import { AuditLogPage } from '@/features/audit-log/AuditLogPage';

const PageFallback = (
  <div className="space-y-3 p-6">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-32 w-full" />
  </div>
);

export function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Suspense fallback={PageFallback}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/mfa" element={<MfaPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/mfa/setup" element={<MfaSetupPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['ADMIN', 'AUDITOR']} />}>
            <Route element={<MainLayout />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/audit" element={<AuditLogPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route element={<MainLayout />}>
              <Route path="/roles" element={<RolesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
