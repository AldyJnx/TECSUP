"use client";

import { useState, type ReactNode } from "react";
import { CircleAlertIcon, PlusIcon } from "lucide-react";

import { useDashboard } from "@/lib/store";
import {
  PRIORITIES,
  TASK_STATUSES,
  type Priority,
  type Task,
  type TaskStatus,
} from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface TaskFormProps {
  task?: Task;
  trigger?: ReactNode;
}

export function TaskForm({ task, trigger }: TaskFormProps) {
  const { projects, members, settings, addTask, updateTask } = useDashboard();
  const isEdit = Boolean(task);

  const emptyForm = {
    description: "",
    projectId: "",
    status: "Pendiente" as TaskStatus,
    priority: settings.defaultPriority,
    userId: "",
    dateline: "",
  };

  const initFrom = (t?: Task) =>
    t
      ? {
          description: t.description,
          projectId: t.projectId,
          status: t.status,
          priority: t.priority,
          userId: t.userId,
          dateline: t.dateline,
        }
      : emptyForm;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [form, setForm] = useState(initFrom(task));

  const validate = () => {
    const e: string[] = [];
    if (!form.description.trim())
      e.push("La descripcion de la tarea es obligatoria.");
    if (!form.projectId) e.push("Debes seleccionar un proyecto.");
    if (!form.userId) e.push("Debes asignar un responsable.");
    if (!form.dateline) e.push("Debes indicar una fecha limite.");
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
    if (isEdit && task) {
      await updateTask(task.id, form);
    } else {
      await addTask(form);
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
          setForm(initFrom(task));
          setErrors([]);
        }
      }}
    >
      <DialogTrigger
        render={
          (trigger as React.ReactElement) ?? (
            <Button>
              <PlusIcon className="size-4" />
              Nueva Tarea
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Editar Tarea" : "Crear Nueva Tarea"}
            </DialogTitle>
            <DialogDescription>
              Define la tarea, su responsable y la fecha limite.
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
              <Label htmlFor="t-description">
                Descripcion <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="t-description"
                placeholder="Que hay que hacer?"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>
                  Proyecto <span className="text-destructive">*</span>
                </Label>
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
                <Label>
                  Responsable <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.userId === "" ? null : form.userId}
                  onValueChange={(v) =>
                    setForm({ ...form, userId: (v as string) ?? "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.name}
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
                    setForm({ ...form, status: v as TaskStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="t-dateline">
                Fecha limite <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                id="t-dateline"
                value={form.dateline}
                onChange={(v) => setForm({ ...form, dateline: v })}
                placeholder="Selecciona la fecha limite"
              />
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
              {isEdit ? "Guardar Cambios" : "Crear Tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
