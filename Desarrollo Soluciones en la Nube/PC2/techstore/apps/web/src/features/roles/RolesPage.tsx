import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { rolesApi } from './api';

export function RolesPage() {
  const roles = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Roles</h1>
        <p className="text-sm text-muted-foreground">
          La asignación se hace desde la vista de Usuarios.
        </p>
      </div>

      {roles.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {roles.data?.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="size-4" /> {r.name}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                </div>
                <Badge variant="secondary">{r._count?.userRoles ?? 0} usuarios</Badge>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                ID: <code className="font-mono">{r.id}</code>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
