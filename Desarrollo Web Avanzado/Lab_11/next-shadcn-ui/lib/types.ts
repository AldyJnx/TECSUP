// Modelo de datos del Dashboard (todo en memoria)

export type ProjectStatus =
  | "Planificado"
  | "En progreso"
  | "En revision"
  | "Completado";

export type TaskStatus = "Pendiente" | "En progreso" | "Completado";

export type Priority = "Baja" | "Media" | "Alta" | "Urgente";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0 - 100
  category: string;
  priority: Priority;
  memberIds: string[]; // miembros del equipo asignados al proyecto
}

export interface Member {
  userId: string;
  name: string;
  email: string;
  role: string;
  position: string;
  birthdate: string; // ISO yyyy-mm-dd
  phone: string;
  projectId: string; // proyecto principal
  isActive: boolean;
}

export interface Task {
  id: string;
  description: string;
  projectId: string;
  status: TaskStatus;
  priority: Priority;
  userId: string; // responsable asignado
  dateline: string; // fecha limite ISO yyyy-mm-dd
}

export interface Settings {
  organizationName: string;
  language: "es" | "en";
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  defaultPriority: Priority;
}

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Planificado",
  "En progreso",
  "En revision",
  "Completado",
];

export const TASK_STATUSES: TaskStatus[] = [
  "Pendiente",
  "En progreso",
  "Completado",
];

export const PRIORITIES: Priority[] = ["Baja", "Media", "Alta", "Urgente"];

export const CATEGORIES = [
  "Desarrollo Web",
  "Desarrollo Mobile",
  "Diseno",
  "Marketing",
  "Otro",
];
