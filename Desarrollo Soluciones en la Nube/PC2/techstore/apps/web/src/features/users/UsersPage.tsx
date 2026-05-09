import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { usersApi } from './api';
import { storesApi } from '@/features/stores/api';
import { rolesApi } from '@/features/roles/api';
import { usePermission } from '@/shared/hooks/usePermission';

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
  storeId: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export function UsersPage() {
  const queryClient = useQueryClient();
  const { has } = usePermission();
  const isAdmin = has('ADMIN');

  const users = useQuery({ queryKey: ['users'], queryFn: usersApi.list });
  const stores = useQuery({ queryKey: ['stores'], queryFn: storesApi.list });
  const roles = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list });

  const [createOpen, setCreateOpen] = useState(false);
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', fullName: '', password: '', storeId: undefined },
  });

  const createMut = useMutation({
    mutationFn: (values: Form) =>
      usersApi.create({
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        storeId: values.storeId || undefined,
      }),
    onSuccess: () => {
      toast.success('Usuario creado');
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreateOpen(false);
      form.reset();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Error');
    },
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      toast.success('Usuario desactivado');
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const assignMut = useMutation({
    mutationFn: () =>
      rolesApi.assign({ userId: assignFor!, roleId: selectedRoleId }),
    onSuccess: () => {
      toast.success('Rol asignado');
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      setAssignFor(null);
      setSelectedRoleId('');
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
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Gestión completa.' : 'Solo lectura para AUDITOR.'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Nuevo
          </Button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-32 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : users.data?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="flex items-center gap-2">
                      <UserCircle className="size-4 text-muted-foreground" />
                      {u.fullName}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.store?.name ?? '—'}</TableCell>
                    <TableCell className="flex flex-wrap gap-1">
                      {u.userRoles?.map((ur) => (
                        <Badge key={ur.role.id} variant="secondary">
                          {ur.role.name}
                        </Badge>
                      )) ?? '—'}
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="destructive">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAssignFor(u.id)}
                          >
                            Asignar rol
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`¿Desactivar a ${u.fullName}?`)) removeMut.mutate(u.id);
                            }}
                            aria-label={`Desactivar ${u.fullName}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Card>

      {/* Crear */}
      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              La contraseña debe tener mayúscula, número y carácter especial.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((v) => createMut.mutate(v))}
            className="space-y-3"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" {...form.register('fullName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...form.register('password')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeId">Tienda (opcional)</Label>
              <Select
                value={form.watch('storeId') ?? ''}
                onValueChange={(v) => form.setValue('storeId', v || undefined)}
              >
                <SelectTrigger id="storeId">
                  <SelectValue placeholder="Sin tienda" />
                </SelectTrigger>
                <SelectContent>
                  {stores.data?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCreateOpen(false)} type="button">
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

      {/* Asignar rol */}
      <Dialog open={Boolean(assignFor)} onOpenChange={(o) => !o && setAssignFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar rol</DialogTitle>
            <DialogDescription>
              El registro queda en audit-log con quien asignó.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              {roles.data?.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name} — {r.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignFor(null)}>
              Cancelar
            </Button>
            <Button
              disabled={!selectedRoleId || assignMut.isPending}
              onClick={() => assignMut.mutate()}
            >
              {assignMut.isPending && <Loader2 className="size-4 animate-spin" />}
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
