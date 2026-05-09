import { Link } from 'react-router-dom';
import { ShieldAlert, FileQuestion } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <ShieldAlert className="size-12 text-destructive" />
      <h1 className="text-2xl font-bold">Acceso denegado</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Tu rol no permite acceder a esta página. Si crees que es un error, contacta al administrador.
      </p>
      <Button asChild>
        <Link to="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <FileQuestion className="size-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        La ruta que buscas no existe o fue movida.
      </p>
      <Button asChild>
        <Link to="/dashboard">Ir al dashboard</Link>
      </Button>
    </div>
  );
}
