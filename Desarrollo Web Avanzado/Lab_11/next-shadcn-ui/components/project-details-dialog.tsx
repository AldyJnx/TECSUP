"use client";

import { type ReactNode } from "react";

import { useDashboard } from "@/lib/store";
import type { Project } from "@/lib/types";
import { priorityClass, projectStatusClass, taskStatusClass } from "@/lib/badge-styles";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProjectDetailsDialogProps {
  project: Project;
  trigger: ReactNode;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProjectDetailsDialog({
  project,
  trigger,
}: ProjectDetailsDialogProps) {
  const { members, tasks } = useDashboard();

  const projectMembers = members.filter((m) =>
    project.memberIds.includes(m.userId)
  );
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  return (
    <Dialog>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {project.title}
            <Badge
              variant="secondary"
              className={cn("border-transparent", projectStatusClass(project.status))}
            >
              {project.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>{project.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Categoria</p>
              <p className="font-medium">{project.category}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Prioridad</p>
              <Badge
                variant="secondary"
                className={cn("border-transparent", priorityClass(project.priority))}
              >
                {project.priority}
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              Miembros del equipo ({projectMembers.length})
            </p>
            {projectMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin miembros asignados.
              </p>
            ) : (
              <div className="space-y-2">
                {projectMembers.map((m) => (
                  <div key={m.userId} className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback>{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium leading-none">{m.name}</p>
                      <p className="text-muted-foreground">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              Tareas del proyecto ({projectTasks.length})
            </p>
            {projectTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin tareas registradas.
              </p>
            ) : (
              <ul className="space-y-2">
                {projectTasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <span>{t.description}</span>
                    <Badge
                      variant="secondary"
                      className={cn("border-transparent", taskStatusClass(t.status))}
                    >
                      {t.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
