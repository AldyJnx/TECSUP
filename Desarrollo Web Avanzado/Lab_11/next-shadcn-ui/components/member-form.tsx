"use client";

import { useState, type ReactNode } from "react";
import { CircleAlertIcon, UserPlusIcon } from "lucide-react";

import { useDashboard } from "@/lib/store";
import type { Member } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatePicker } from "@/components/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MemberFormProps {
  member?: Member;
  trigger?: ReactNode;
}

const emptyForm = {
  name: "",
  email: "",
  role: "",
  position: "",
  birthdate: "",
  phone: "",
  projectId: "",
  isActive: true,
};

function initFrom(member?: Member) {
  return member
    ? {
        name: member.name,
        email: member.email,
        role: member.role,
        position: member.position,
        birthdate: member.birthdate,
        phone: member.phone,
        projectId: member.projectId,
        isActive: member.isActive,
      }
    : emptyForm;
}

export function MemberForm({ member, trigger }: MemberFormProps) {
  const { projects, addMember, updateMember } = useDashboard();
  const isEdit = Boolean(member);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState(initFrom(member));

  const validate = () => {
    const e: string[] = [];
    if (!form.name.trim()) e.push("El nombre es obligatorio.");
    if (!form.email.trim()) {
      e.push("El email es obligatorio.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.push("El email no tiene un formato valido.");
    }
    if (!form.role.trim()) e.push("El rol es obligatorio.");
    return e;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const e = validate();
    if (e.length) {
      setErrors(e);
      return;
    }
    setErrors([]);
    setLoading(true);
    if (isEdit && member) {
      await updateMember(member.userId, form);
    } else {
      await addMember(form);
    }
    setLoading(false);
    setOpen(false);
    if (!isEdit) setForm(emptyForm);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setForm(initFrom(member));
          setErrors([]);
        }
      }}
    >
      <DialogTrigger
        render={
          (trigger as React.ReactElement) ?? (
            <Button>
              <UserPlusIcon className="size-4" />
              Nuevo Miembro
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Editar Miembro" : "Nuevo Miembro del Equipo"}
            </DialogTitle>
            <DialogDescription>
              Registra los datos del miembro del equipo.
            </DialogDescription>
          </DialogHeader>

          {errors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <CircleAlertIcon />
              <AlertTitle>Revisa los siguientes campos</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="m-name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="m-name"
                placeholder="Nombre y apellido"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="m-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="m-email"
                type="email"
                placeholder="correo@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="m-role">
                Rol <span className="text-destructive">*</span>
              </Label>
              <Input
                id="m-role"
                placeholder="Frontend Developer"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="m-position">Posicion</Label>
              <Input
                id="m-position"
                placeholder="Senior / Semi Senior / Junior"
                value={form.position}
                onChange={(e) =>
                  setForm({ ...form, position: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="m-birthdate">Fecha de nacimiento</Label>
              <DatePicker
                id="m-birthdate"
                value={form.birthdate}
                onChange={(v) => setForm({ ...form, birthdate: v })}
                placeholder="Selecciona la fecha"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="m-phone">Telefono</Label>
              <Input
                id="m-phone"
                placeholder="987654321"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Proyecto principal</Label>
              <Select
                value={form.projectId === "" ? null : form.projectId}
                onValueChange={(v) =>
                  setForm({ ...form, projectId: (v as string) ?? "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="m-active">Estado</Label>
              <div className="flex h-9 items-center gap-2">
                <Switch
                  id="m-active"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isActive: checked })
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {form.isActive ? "Activo" : "Ausente"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner />}
              {isEdit ? "Guardar Cambios" : "Crear Miembro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
