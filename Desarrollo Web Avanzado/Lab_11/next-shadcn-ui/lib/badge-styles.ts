import type { Priority, ProjectStatus, TaskStatus } from "./types";

// Clases de color para badges de estado y prioridad (soportan modo oscuro)

export function projectStatusClass(status: ProjectStatus): string {
  switch (status) {
    case "Planificado":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    case "En progreso":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    case "En revision":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
    case "Completado":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function taskStatusClass(status: TaskStatus): string {
  switch (status) {
    case "Pendiente":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    case "En progreso":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    case "Completado":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function priorityClass(priority: Priority): string {
  switch (priority) {
    case "Baja":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    case "Media":
      return "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300";
    case "Alta":
      return "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300";
    case "Urgente":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
