"use client";

import { useState } from "react";
import { CheckCircle2Icon } from "lucide-react";

import { useDashboard } from "@/lib/store";
import { PRIORITIES, type Priority, type Settings } from "@/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEZONES = [
  "America/Lima",
  "America/Bogota",
  "America/Mexico_City",
  "America/Buenos_Aires",
  "America/Santiago",
  "Europe/Madrid",
];

export function SettingsTab() {
  const { settings, updateSettings } = useDashboard();
  const [form, setForm] = useState<Settings>(settings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await updateSettings(form);
    setLoading(false);
    setSaved(true);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Configuracion</CardTitle>
          <CardDescription>
            Administra las preferencias de tu cuenta y del espacio de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {saved && (
            <Alert>
              <CheckCircle2Icon className="text-emerald-600" />
              <AlertTitle>Configuracion guardada</AlertTitle>
              <AlertDescription>
                Tus preferencias se actualizaron correctamente.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="org">Nombre de la organizacion</Label>
              <Input
                id="org"
                value={form.organizationName}
                onChange={(e) => set("organizationName", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Idioma</Label>
              <Select
                value={form.language}
                onValueChange={(v) => set("language", v as Settings["language"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Espanol</SelectItem>
                  <SelectItem value="en">Ingles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Zona horaria</Label>
              <Select
                value={form.timezone}
                onValueChange={(v) => set("timezone", v as string)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Prioridad por defecto (nuevas tareas)</Label>
              <Select
                value={form.defaultPriority}
                onValueChange={(v) => set("defaultPriority", v as Priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Notificaciones</p>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Notificaciones por email</p>
                <p className="text-xs text-muted-foreground">
                  Recibe avisos de tareas y proyectos en tu correo.
                </p>
              </div>
              <Switch
                checked={form.emailNotifications}
                onCheckedChange={(c) => set("emailNotifications", c)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Notificaciones push</p>
                <p className="text-xs text-muted-foreground">
                  Alertas en el navegador en tiempo real.
                </p>
              </div>
              <Switch
                checked={form.pushNotifications}
                onCheckedChange={(c) => set("pushNotifications", c)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Resumen semanal</p>
                <p className="text-xs text-muted-foreground">
                  Un correo cada lunes con el avance del equipo.
                </p>
              </div>
              <Switch
                checked={form.weeklyDigest}
                onCheckedChange={(c) => set("weeklyDigest", c)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(settings);
              setSaved(false);
            }}
            disabled={loading}
          >
            Restablecer
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner />}
            Guardar configuracion
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
