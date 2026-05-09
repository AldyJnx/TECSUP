import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { authApi } from '@/features/auth/api';
import { cn } from '@/shared/lib/utils';

const schema = z.object({
  fullName: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Correo inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/[0-9]/, 'Debe contener un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener un carácter especial'),
});

type Form = z.infer<typeof schema>;

function passwordStrength(pwd: string): { score: number; label: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte', 'Excelente'];
  return { score, label: labels[score] ?? 'Muy débil' };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const password = watch('password');
  const strength = passwordStrength(password);

  const onSubmit = async (values: Form) => {
    setSubmitting(true);
    try {
      await authApi.register(values);
      toast.success('Cuenta creada — inicia sesión');
      navigate('/login');
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'No se pudo registrar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="size-5" />
            <CardTitle>Crear cuenta</CardTitle>
          </div>
          <CardDescription>Recibirás el rol EMPLOYEE por defecto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" autoComplete="name" {...register('fullName')} />
              {errors.fullName && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              <div className="flex h-1.5 gap-1" aria-hidden>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'flex-1 rounded',
                      i <= strength.score
                        ? strength.score >= 4
                          ? 'bg-emerald-500'
                          : strength.score >= 2
                            ? 'bg-amber-500'
                            : 'bg-destructive'
                        : 'bg-muted',
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Fortaleza: {strength.label}
              </p>
              {errors.password && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Crear cuenta
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
