import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { auditApi } from './api';
import { formatDate } from '@/shared/lib/utils';

export function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [resource, setResource] = useState('');

  const audit = useQuery({
    queryKey: ['audit', { page, resource }],
    queryFn: () =>
      auditApi.list({ page, limit: 25, resource: resource || undefined }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ScrollText className="size-5" />
        <h1 className="text-2xl font-bold">Auditoría</h1>
      </div>

      <Card className="p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Filtrar por recurso (product, user, role…)"
            value={resource}
            onChange={(e) => {
              setResource(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audit.isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : audit.data?.data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>{log.user?.email ?? '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{log.action}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.resource}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <Badge variant="success">OK</Badge>
                      ) : (
                        <Badge variant="destructive">FAIL</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.ipAddress ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Card>

      {audit.data && audit.data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {audit.data.total} eventos · página {audit.data.page} de{' '}
            {audit.data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={page >= audit.data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
