"use client";

import { useState } from "react";
import {
  CheckCircle2Icon,
  ClockIcon,
  FolderKanbanIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { useDashboard } from "@/lib/store";
import { cn } from "@/lib/utils";
import { taskStatusClass } from "@/lib/badge-styles";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function OverviewTab() {
  const { metrics, tasks, projects, memberName, projectTitle } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Simula una peticion al backend para refrescar metricas
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
    setLastSync(new Date().toLocaleTimeString("es-PE"));
  };

  const stats = [
    {
      title: "Total Proyectos",
      value: metrics.totalProjects,
      hint: `Progreso promedio ${metrics.averageProgress}%`,
      icon: FolderKanbanIcon,
    },
    {
      title: "Tareas Completadas",
      value: metrics.completedTasks,
      hint: `${metrics.inProgressTasks} en progreso`,
      icon: CheckCircle2Icon,
    },
    {
      title: "Tareas Pendientes",
      value: metrics.pendingTasks,
      hint: `${tasks.length} tareas en total`,
      icon: ClockIcon,
    },
    {
      title: "Miembros Activos",
      value: metrics.activeMembers,
      hint: `${metrics.totalMembers} miembros en total`,
      icon: UsersIcon,
    },
  ];

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Metricas calculadas en tiempo real desde los datos en memoria.
        </p>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-xs text-muted-foreground">
              Sincronizado: {lastSync}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Spinner />
            ) : (
              <RefreshCwIcon className="size-4" />
            )}
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stat Cards (TAREA: metricas dinamicas) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {refreshing ? (
                  <Spinner className="size-5" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Actividad reciente */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Ultimas tareas registradas en tus proyectos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay tareas registradas.
              </p>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {initials(memberName(task.userId))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none">
                        {memberName(task.userId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {task.description}{" "}
                        <span className="font-medium">
                          ({projectTitle(task.projectId)})
                        </span>
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "border-transparent",
                        taskStatusClass(task.status)
                      )}
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de progreso por proyecto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="size-4 text-primary" />
              Progreso por Proyecto
            </CardTitle>
            <CardDescription>Avance general de cada proyecto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay proyectos.
              </p>
            ) : (
              projects.slice(0, 6).map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="truncate pr-2">{p.title}</span>
                    <span className="text-muted-foreground">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
