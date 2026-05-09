import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { productsApi } from './api';
import { storesApi } from '@/features/stores/api';
import { usePermission } from '@/shared/hooks/usePermission';
import type { Product } from '@techstore/shared-types';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  price: z.coerce.number().positive('Debe ser positivo'),
  stock: z.coerce.number().int().min(0, 'No negativo'),
  category: z.string().min(2).max(100),
  storeId: z.string().min(1, 'Tienda requerida'),
  isPremium: z.boolean().default(false),
});

type Form = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  product?: Product;
}

export function ProductFormDialog({ open, onClose, product }: Props) {
  const isEdit = Boolean(product);
  const queryClient = useQueryClient();
  const { editableProductFields, has } = usePermission();
  const editable = editableProductFields();

  const stores = useQuery({ queryKey: ['stores'], queryFn: storesApi.list });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      storeId: '',
      isPremium: false,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description ?? '',
        price: Number(product.price),
        stock: product.stock,
        category: product.category,
        storeId: product.storeId,
        isPremium: product.isPremium,
      });
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        storeId: '',
        isPremium: false,
      });
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: async (values: Form) => {
      if (isEdit && product) {
        // Filtrar solo campos editables (UI-side; backend re-valida)
        const payload: Record<string, unknown> = {};
        for (const key of Object.keys(values) as (keyof Form)[]) {
          if (editable.has(key as string)) payload[key] = values[key];
        }
        return productsApi.update(product.id, payload);
      }
      return productsApi.create(values);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado');
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Error al guardar');
    },
  });

  const isPremium = watch('isPremium');

  const isFieldDisabled = (field: string): boolean => {
    if (!isEdit) {
      // En crear, EMPLOYEE no puede crear premium
      if (field === 'isPremium' && has('EMPLOYEE')) return true;
      return false;
    }
    return !editable.has(field);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription>
            Los campos deshabilitados están restringidos para tu rol.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" disabled={isFieldDisabled('name')} {...register('name')} />
              {errors.name && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                disabled={isFieldDisabled('description')}
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio (S/)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                disabled={isFieldDisabled('price')}
                {...register('price')}
              />
              {errors.price && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                disabled={isFieldDisabled('stock')}
                {...register('stock')}
              />
              {errors.stock && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.stock.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                disabled={isFieldDisabled('category')}
                {...register('category')}
              />
              {errors.category && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeId">Tienda</Label>
              <Select
                value={watch('storeId')}
                onValueChange={(v) => setValue('storeId', v, { shouldValidate: true })}
                disabled={isFieldDisabled('storeId')}
              >
                <SelectTrigger id="storeId">
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  {stores.data?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.storeId && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.storeId.message}
                </p>
              )}
            </div>

            <div className="col-span-2 flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="isPremium" className="text-sm">
                  Producto premium
                </Label>
                <p className="text-xs text-muted-foreground">
                  Los empleados no pueden crear ni eliminar premium.
                </p>
              </div>
              <Switch
                id="isPremium"
                checked={isPremium}
                disabled={isFieldDisabled('isPremium')}
                onCheckedChange={(v) => setValue('isPremium', v, { shouldValidate: true })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? 'Guardar cambios' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
