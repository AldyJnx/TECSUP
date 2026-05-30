"use client";

import { EyeIcon, PencilIcon, Trash2Icon, UsersIcon } from "lucide-react";

import { useDashboard } from "@/lib/store";
import { cn } from "@/lib/utils";
import { priorityClass, projectStatusClass } from "@/lib/badge-styles";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/project-form";
import { ProjectDetailsDialog } from "@/components/project-details-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function ProjectsTab() {
  const { projects, deleteProject } = useDashboard();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Proyectos</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} proyecto(s) registrado(s)
          </p>
        </div>
        <ProjectForm />
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay proyectos. Crea el primero con el boton &quot;Nuevo
            Proyecto&quot;.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border-transparent shrink-0",
                      projectStatusClass(project.status)
                    )}
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "border-transparent",
                        priorityClass(project.priority)
                      )}
                    >
                      {project.priority}
                    </Badge>
                    <Badge variant="outline">{project.category}</Badge>
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

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UsersIcon className="size-4" />
                    {project.memberIds.length} miembro(s)
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <ProjectDetailsDialog
                    project={project}
                    trigger={
                      <Button size="sm" variant="ghost">
                        <EyeIcon className="size-4" />
                        Ver detalles
                      </Button>
                    }
                  />
                  <ProjectForm
                    project={project}
                    trigger={
                      <Button size="sm" variant="outline">
                        <PencilIcon className="size-4" />
                        Editar
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    title="Eliminar proyecto"
                    description={`Se eliminara "${project.title}" y sus tareas asociadas. Esta accion no se puede deshacer.`}
                    onConfirm={() => deleteProject(project.id)}
                    trigger={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
