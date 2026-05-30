"use client";

import { useState, type ReactNode } from "react";
import { PlusIcon } from "lucide-react";

import { useDashboard } from "@/lib/store";
import {
  CATEGORIES,
  PRIORITIES,
  PROJECT_STATUSES,
  type Priority,
  type Project,
  type ProjectStatus,
} from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlertIcon } from "lucide-react";
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

interface ProjectFormProps {
  project?: Project;
  trigger?: ReactNode;
}

const emptyForm = {
  title: "",
  description: "",
  status: "Planificado" as ProjectStatus,
  priority: "Media" as Priority,
  category: "Desarrollo Web",
  progress: 0,
  memberIds: [] as string[],
};

export function ProjectForm({ project, trigger }: ProjectFormProps) {
  const { members, addProject, updateProject } = useDashboard();
  const isEdit = Boolean(project);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState(
    project
      ? {
          title: project.title,
          description: project.description,
          status: project.status,
          priority: project.priority,
          category: project.category,
          progress: project.progress,
          memberIds: project.memberIds,
        }
      : emptyForm
  );

  const reset = () => {
    setForm(
      project
        ? {
            title: project.title,
            description: project.description,
            status: project.status,
            priority: project.priority,
            category: project.category,
            progress: project.progress,
            memberIds: project.memberIds,
          }
        : emptyForm
    );
    setErrors([]);
  };

  const validate = () => {
    const e: string[] = [];
    if (!form.title.trim()) e.push("El nombre del proyecto es obligatorio.");
    if (!form.description.trim()) e.push("La descripcion es obligatoria.");
    if (form.progress < 0 || form.progress > 100)
      e.push("El progreso debe estar entre 0 y 100.");
    return e;
  };

  const toggleMember = (id: string) => {
    setForm((f) => ({
      ...f,
      memberIds: f.memberIds.includes(id)
        ? f.memberIds.filter((m) => m !== id)
        : [...f.memberIds, id],
    }));
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
    const payload = { ...form, progress: Number(form.progress) };
    if (isEdit && project) {
      await updateProject(project.id, payload);
    } else {
      await addProject(payload);
    }
    setLoading(false);
    setOpen(false);
    if (!isEdit) reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) reset();
      }}
    >
      <DialogTrigger
        render={
          (trigger as React.ReactElement) ?? (
            <Button>
              <PlusIcon className="size-4" />
              Nuevo Proyecto
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
            </DialogTitle>
            <DialogDescription>
              Completa la informacion del proyecto. Click en guardar cuando
              termines.
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

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Nombre del Proyecto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Mi Proyecto Increible"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Descripcion <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Breve descripcion del proyecto..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as string })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Prioridad</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm({ ...form, priority: v as Priority })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la prioridad" />
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

              <div className="grid gap-2">
                <Label>Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as ProjectStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="progress">Progreso (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) =>
                    setForm({ ...form, progress: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Campo para miembros del equipo (TAREA) */}
            <div className="grid gap-2">
              <Label>Miembros del equipo</Label>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay miembros registrados todavia.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2 rounded-md border p-3 max-h-40 overflow-y-auto">
                  {members.map((m) => (
                    <label
                      key={m.userId}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={form.memberIds.includes(m.userId)}
                        onCheckedChange={() => toggleMember(m.userId)}
                      />
                      <span>{m.name}</span>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {form.memberIds.length} miembro(s) asignado(s)
              </p>
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
              {isEdit ? "Guardar Cambios" : "Crear Proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
