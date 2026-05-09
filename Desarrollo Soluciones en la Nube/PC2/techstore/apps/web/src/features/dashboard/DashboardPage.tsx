import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Package, ShieldCheck, Store as StoreIcon, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { useAuthStore } from '@/features/auth/store';
import { productsApi } from '@/features/products/api';
import { storesApi } from '@/features/stores/api';
import { usersApi } from '@/features/users/api';
import { auditApi } from '@/features/audit-log/api';
import { usePermission } from '@/shared/hooks/usePermission';
import { formatPrice } from '@/shared/lib/utils';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { has } = usePermission();

  const products = useQuery({
    queryKey: ['products', { limit: 100 }],
    queryFn: () => productsApi.list({ page: 1, limit: 100 }),
  });

  const stores = useQuery({ queryKey: ['stores'], queryFn: storesApi.list });

  const users = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    enabled: has('ADMIN') || has('AUDITOR'),
  });

  const audit = useQuery({
    queryKey: ['audit', { limit: 5 }],
    queryFn: () => auditApi.list({ page: 1, limit: 5 }),
    enabled: has('ADMIN') || has('AUDITOR'),
  });

  const totalProducts = products.data?.total ?? 0;
  const lowStock = (products.data?.data ?? []).filter((p) => p.stock <= 5);
  const inventoryValue =
    (products.data?.data ?? []).reduce(
      (sum, p) => sum + Number(p.price) * p.stock,
      0,
    ) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hola, {user?.fullName} 👋</h1>
        <p className="text-sm text-muted-foreground">
          Roles activos:{' '}
          {user?.roles.map((r) => (
            <Badge key={r} variant="secondary" className="ml-1">
              {r}
            </Badge>
          ))}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={Package}
          label="Productos visibles"
          value={products.isLoading ? null : String(totalProducts)}
        />
        <Kpi
          icon={AlertTriangle}
          label="Stock bajo (≤5)"
          value={products.isLoading ? null : String(lowStock.length)}
          tone={lowStock.length > 0 ? 'warning' : 'default'}
        />
        <Kpi
          icon={StoreIcon}
          label="Tiendas activas"
          value={stores.isLoading ? null : String(stores.data?.filter((s) => s.isActive).length ?? 0)}
        />
        <Kpi
          icon={ShieldCheck}
          label="Valor inventario"
          value={products.isLoading ? null : formatPrice(inventoryValue)}
        />
      </div>

      {(has('ADMIN') || has('AUDITOR')) && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Usuarios del sistema</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {users.isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <p className="text-3xl font-bold">{users.data?.length ?? 0}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Últimos eventos auditados</CardTitle>
            </CardHeader>
            <CardContent>
              {audit.isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : audit.data?.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {audit.data?.data.map((log) => (
                    <li key={log.id} className="flex items-center justify-between">
                      <span className="truncate">{log.action}</span>
                      <Badge variant={log.success ? 'success' : 'destructive'}>
                        {log.success ? 'OK' : 'FAIL'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {lowStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" /> Productos con stock bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {lowStock.slice(0, 6).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <span className="truncate">{p.name}</span>
                  <Badge variant="warning">{p.stock}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  tone?: 'default' | 'warning';
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={
            tone === 'warning'
              ? 'rounded-md bg-amber-100 p-3 text-amber-700 dark:bg-amber-900 dark:text-amber-200'
              : 'rounded-md bg-primary/10 p-3 text-primary'
          }
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {value === null ? (
            <Skeleton className="mt-1 h-7 w-20" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
