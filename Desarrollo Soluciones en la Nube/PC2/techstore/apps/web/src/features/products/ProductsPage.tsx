import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { productsApi, type ListProductsParams } from './api';
import { storesApi } from '@/features/stores/api';
import { ProductFormDialog } from './ProductFormDialog';
import { usePermission } from '@/shared/hooks/usePermission';
import { formatPrice } from '@/shared/lib/utils';
import type { Product } from '@techstore/shared-types';

const PAGE_SIZE = 10;

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [storeId, setStoreId] = useState<string>('all');
  const [premium, setPremium] = useState<string>('all');
  const [lowStock, setLowStock] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();
  const [creating, setCreating] = useState(false);

  const params: ListProductsParams = {
    page,
    limit: PAGE_SIZE,
    storeId: storeId === 'all' ? undefined : storeId,
    isPremium: premium === 'all' ? undefined : premium === 'yes',
  };

  const products = useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
  });

  const stores = useQuery({ queryKey: ['stores'], queryFn: storesApi.list });

  const remove = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      toast.success('Producto eliminado');
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      // El interceptor ya muestra el toast 403; otros errores genéricos:
    },
  });

  const filtered = useMemo(() => {
    const list = products.data?.data ?? [];
    return list
      .filter((p) =>
        search ? p.name.toLowerCase().includes(search.toLowerCase()) : true,
      )
      .filter((p) => (lowStock ? p.stock <= 5 : true));
  }, [products.data, search, lowStock]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Permisos por rol aplicados automáticamente.
          </p>
        </div>
        {can('create', 'product') && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Nuevo
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={storeId} onValueChange={setStoreId}>
            <SelectTrigger>
              <SelectValue placeholder="Tienda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las tiendas</SelectItem>
              {stores.data?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={premium} onValueChange={setPremium}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="yes">Premium</SelectItem>
              <SelectItem value="no">No premium</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={lowStock ? 'default' : 'outline'}
            onClick={() => setLowStock((v) => !v)}
            className="justify-start"
          >
            <AlertTriangle className="size-4" /> Stock bajo (≤5)
          </Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.store?.name ?? '—'}</TableCell>
                  <TableCell className="text-right">{formatPrice(p.price)}</TableCell>
                  <TableCell className="text-right">
                    {p.stock <= 5 ? (
                      <Badge variant="warning">{p.stock}</Badge>
                    ) : (
                      p.stock
                    )}
                  </TableCell>
                  <TableCell>
                    {p.isPremium ? (
                      <Badge>Premium</Badge>
                    ) : (
                      <Badge variant="secondary">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {can('update', 'product', p) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(p)}
                        aria-label={`Editar ${p.name}`}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                    )}
                    {can('delete', 'product', p) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`¿Eliminar "${p.name}"?`)) remove.mutate(p.id);
                        }}
                        aria-label={`Eliminar ${p.name}`}
                      >
                        {remove.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {products.data && products.data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {products.data.total} productos · página {products.data.page} de{' '}
            {products.data.totalPages}
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
              disabled={page >= products.data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <ProductFormDialog
        open={creating || Boolean(editing)}
        onClose={() => {
          setCreating(false);
          setEditing(undefined);
        }}
        product={editing}
      />
    </div>
  );
}
