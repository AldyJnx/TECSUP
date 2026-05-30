"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Member, Project, Settings, Task } from "./types";
import { seedMembers, seedProjects, seedSettings, seedTasks } from "./seed";

// Simula una peticion al backend (para mostrar el Spinner)
const LATENCY = 800;
function withLatency<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

export interface Metrics {
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  activeMembers: number;
  totalMembers: number;
  averageProgress: number;
}

interface DashboardContextValue {
  projects: Project[];
  members: Member[];
  tasks: Task[];
  settings: Settings;
  metrics: Metrics;
  // Proyectos
  addProject: (data: Omit<Project, "id">) => Promise<Project>;
  updateProject: (id: string, data: Omit<Project, "id">) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  // Equipo
  addMember: (data: Omit<Member, "userId">) => Promise<Member>;
  updateMember: (id: string, data: Omit<Member, "userId">) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  // Tareas
  addTask: (data: Omit<Task, "id">) => Promise<Task>;
  updateTask: (id: string, data: Omit<Task, "id">) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  // Configuracion
  updateSettings: (data: Settings) => Promise<void>;
  // Helpers
  memberName: (userId: string) => string;
  projectTitle: (projectId: string) => string;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [members, setMembers] = useState<Member[]>(seedMembers);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [settings, setSettings] = useState<Settings>(seedSettings);

  // ---- Proyectos ----
  const addProject = useCallback(async (data: Omit<Project, "id">) => {
    const project: Project = { ...data, id: makeId("p") };
    await withLatency(null);
    setProjects((prev) => [project, ...prev]);
    return project;
  }, []);

  const updateProject = useCallback(
    async (id: string, data: Omit<Project, "id">) => {
      await withLatency(null);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...data, id } : p))
      );
    },
    []
  );

  const deleteProject = useCallback(async (id: string) => {
    await withLatency(null);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // limpiar referencias en tareas y miembros
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    setMembers((prev) =>
      prev.map((m) => (m.projectId === id ? { ...m, projectId: "" } : m))
    );
  }, []);

  // ---- Equipo ----
  const addMember = useCallback(async (data: Omit<Member, "userId">) => {
    const member: Member = { ...data, userId: makeId("u") };
    await withLatency(null);
    setMembers((prev) => [member, ...prev]);
    return member;
  }, []);

  const updateMember = useCallback(
    async (id: string, data: Omit<Member, "userId">) => {
      await withLatency(null);
      setMembers((prev) =>
        prev.map((m) => (m.userId === id ? { ...data, userId: id } : m))
      );
    },
    []
  );

  const deleteMember = useCallback(async (id: string) => {
    await withLatency(null);
    setMembers((prev) => prev.filter((m) => m.userId !== id));
    // quitar de proyectos y tareas
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        memberIds: p.memberIds.filter((mid) => mid !== id),
      }))
    );
    setTasks((prev) =>
      prev.map((t) => (t.userId === id ? { ...t, userId: "" } : t))
    );
  }, []);

  // ---- Tareas ----
  const addTask = useCallback(async (data: Omit<Task, "id">) => {
    const task: Task = { ...data, id: makeId("t") };
    await withLatency(null);
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback(
    async (id: string, data: Omit<Task, "id">) => {
      await withLatency(null);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...data, id } : t)));
    },
    []
  );

  const deleteTask = useCallback(async (id: string) => {
    await withLatency(null);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---- Configuracion ----
  const updateSettings = useCallback(async (data: Settings) => {
    await withLatency(null);
    setSettings(data);
  }, []);

  // ---- Helpers ----
  const memberName = useCallback(
    (userId: string) =>
      members.find((m) => m.userId === userId)?.name ?? "Sin asignar",
    [members]
  );

  const projectTitle = useCallback(
    (projectId: string) =>
      projects.find((p) => p.id === projectId)?.title ?? "Sin proyecto",
    [projects]
  );

  // ---- Metricas derivadas de los datos en memoria ----
  const metrics = useMemo<Metrics>(() => {
    const completedTasks = tasks.filter((t) => t.status === "Completado").length;
    const pendingTasks = tasks.filter((t) => t.status === "Pendiente").length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === "En progreso"
    ).length;
    const activeMembers = members.filter((m) => m.isActive).length;
    const averageProgress =
      projects.length === 0
        ? 0
        : Math.round(
            projects.reduce((acc, p) => acc + p.progress, 0) / projects.length
          );
    return {
      totalProjects: projects.length,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      activeMembers,
      totalMembers: members.length,
      averageProgress,
    };
  }, [projects, members, tasks]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      projects,
      members,
      tasks,
      settings,
      metrics,
      addProject,
      updateProject,
      deleteProject,
      addMember,
      updateMember,
      deleteMember,
      addTask,
      updateTask,
      deleteTask,
      updateSettings,
      memberName,
      projectTitle,
    }),
    [
      projects,
      members,
      tasks,
      settings,
      metrics,
      addProject,
      updateProject,
      deleteProject,
      addMember,
      updateMember,
      deleteMember,
      addTask,
      updateTask,
      deleteTask,
      updateSettings,
      memberName,
      projectTitle,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard debe usarse dentro de <DashboardProvider>");
  }
  return ctx;
}
