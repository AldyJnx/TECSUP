import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';

const schema = z.object({
  code: z.string().regex(/^\d{6}$/, '6 dígitos'),
});

type Form = z.infer<typeof schema>;

const MFA_TTL_SECONDS = 5 * 60;

export function MfaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const state = location.state as { mfaToken?: string; email?: string } | null;
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MFA_TTL_SECONDS);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    inputRef.current?.focus();
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!state?.mfaToken) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async ({ code }: Form) => {
    setSubmitting(true);
    try {
      const res = await authApi.verifyMfa({ mfaToken: state.mfaToken!, code });
      if (res.tokens && res.user) {
        setAuth({ user: res.user, accessToken: res.tokens.accessToken });
        toast.success('Verificación exitosa');
        navigate('/dashboard');
      }
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Código inválido');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      setValue('code', text, { shouldValidate: true });
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            <CardTitle>Verificación de dos factores</CardTitle>
          </div>
          <CardDescription>
            {state.email ? `Para ${state.email}.` : ''} Ingresa el código de 6 dígitos de tu app autenticadora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="code">Código MFA</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                aria-invalid={Boolean(errors.code)}
                {...register('code', {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  },
                })}
                ref={(el) => {
                  inputRef.current = el;
                  register('code').ref(el);
                }}
                onPaste={handlePaste}
                className="text-center text-2xl tracking-[0.5em]"
              />
              {errors.code && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.code.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {secondsLeft > 0
                  ? `Token expira en ${minutes}:${seconds.toString().padStart(2, '0')}`
                  : 'Token expirado, regresa al login'}
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={submitting || secondsLeft === 0}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Verificar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Cancelar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
