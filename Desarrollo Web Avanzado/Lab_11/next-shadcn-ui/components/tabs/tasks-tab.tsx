"use client";

import { useMemo, useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { useDashboard } from "@/lib/store";
import { cn } from "@/lib/utils";
import { priorityClass, taskStatusClass } from "@/lib/badge-styles";
import { TASK_STATUSES, type TaskStatus } from "@/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskForm } from "@/components/task-form";
import { ConfirmDialog } from "@/components/confirm-dialog";

const PAGE_SIZE = 5;

export function TasksTab() {
  const { tasks, deleteTask, memberName, projectTitle } = useDashboard();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? tasks
        : tasks.filter((t) => t.status === statusFilter),
    [tasks, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Gestion de Tareas</CardTitle>
            <CardDescription>
              Administra todas las tareas de tus proyectos
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as "all" | TaskStatus);
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TaskForm />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableCaption className="pb-3">
              {filtered.length} tarea(s) - pagina {currentPage} de {totalPages}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Fecha limite</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No hay tareas para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      {task.description}
                    </TableCell>
                    <TableCell>{projectTitle(task.projectId)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "border-transparent",
                          taskStatusClass(task.status)
                        )}
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "border-transparent",
                          priorityClass(task.priority)
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{memberName(task.userId)}</TableCell>
                    <TableCell>{task.dateline}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <TaskForm
                          task={task}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <PencilIcon className="size-4" />
                            </Button>
                          }
                        />
                        <ConfirmDialog
                          title="Eliminar tarea"
                          description={`Se eliminara la tarea "${task.description}".`}
                          onConfirm={() => deleteTask(task.id)}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginacion (TAREA) */}
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text="Anterior"
                aria-disabled={currentPage === 1}
                className={cn(
                  currentPage === 1 && "pointer-events-none opacity-50"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(currentPage - 1);
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                text="Siguiente"
                aria-disabled={currentPage === totalPages}
                className={cn(
                  currentPage === totalPages &&
                    "pointer-events-none opacity-50"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}
