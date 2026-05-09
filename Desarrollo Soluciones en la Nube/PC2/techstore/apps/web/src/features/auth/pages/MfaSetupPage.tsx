import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Skeleton } from '@/shared/ui/skeleton';
import { authApi } from '@/features/auth/api';

const schema = z.object({ code: z.string().regex(/^\d{6}$/, '6 dígitos') });
type Form = z.infer<typeof schema>;

export function MfaSetupPage() {
  const navigate = useNavigate();
  const [setup, setSetup] = useState<{ qrDataUrl: string; secret: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    let cancelled = false;
    authApi
      .enableMfa()
      .then((data) => {
        if (!cancelled) setSetup({ qrDataUrl: data.qrDataUrl, secret: data.secret });
      })
      .catch(() => toast.error('No se pudo iniciar el setup MFA'));
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async ({ code }: Form) => {
    setSubmitting(true);
    try {
      await authApi.verifyMfaSetup(code);
      toast.success('MFA activado correctamente');
      navigate('/dashboard');
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Código inválido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            <CardTitle>Configurar MFA</CardTitle>
          </div>
          <CardDescription>
            Escanea el QR con Google Authenticator, Authy, 1Password u otra app TOTP. Luego ingresa el primer código.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {setup ? (
              <img
                src={setup.qrDataUrl}
                alt="QR para configurar MFA"
                className="size-48 rounded border"
              />
            ) : (
              <Skeleton className="size-48" />
            )}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Si no puedes escanear, ingresa este secreto manualmente:
              </p>
              <code className="block rounded bg-muted px-3 py-2 text-sm font-mono">
                {setup?.secret ?? '...'}
              </code>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="code">Código de verificación</Label>
              <Input
                id="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                aria-invalid={Boolean(errors.code)}
                {...register('code')}
                className="max-w-[200px] text-center text-xl tracking-[0.4em]"
              />
              {errors.code && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.code.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={submitting || !setup}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Activar MFA
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
