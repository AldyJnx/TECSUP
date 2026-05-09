import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Store as StoreIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { storesApi } from './api';
import { usePermission } from '@/shared/hooks/usePermission';

const schema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
});

type Form = z.infer<typeof schema>;

export function StoresPage() {
  const { has } = usePermission();
  const isAdmin = has('ADMIN');
  const queryClient = useQueryClient();
  const stores = useQuery({ queryKey: ['stores'], queryFn: storesApi.list });
  const [open, setOpen] = useState(false);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', address: '' },
  });

  const createMut = useMutation({
    mutationFn: (v: Form) => storesApi.create(v),
    onSuccess: () => {
      toast.success('Tienda creada');
      void queryClient.invalidateQueries({ queryKey: ['stores'] });
      setOpen(false);
      form.reset();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Error');
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tiendas</h1>
          <p className="text-sm text-muted-foreground">Sucursales de TechStore.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Nueva
          </Button>
        )}
      </div>

      {stores.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {stores.data?.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <StoreIcon className="size-4" /> {s.name}
                </CardTitle>
                {s.isActive ? (
                  <Badge variant="success">Activa</Badge>
                ) : (
                  <Badge variant="destructive">Inactiva</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{s.address}</p>
                <p className="text-xs">
                  ID: <code className="font-mono">{s.id}</code>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva tienda</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((v) => createMut.mutate(v))}
            className="space-y-3"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...form.register('name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" {...form.register('address')} />
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMut.isPending}>
                {createMut.isPending && <Loader2 className="size-4 animate-spin" />}
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
