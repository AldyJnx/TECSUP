"use client";

import { MailIcon, PencilIcon, PhoneIcon, Trash2Icon } from "lucide-react";

import { useDashboard } from "@/lib/store";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MemberForm } from "@/components/member-form";
import { ConfirmDialog } from "@/components/confirm-dialog";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamTab() {
  const { members, deleteMember, projectTitle } = useDashboard();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Miembros del Equipo</CardTitle>
            <CardDescription>
              Gestiona los miembros de tu equipo y sus roles
            </CardDescription>
          </div>
          <MemberForm />
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay miembros registrados.
          </p>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {member.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {member.position}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MailIcon className="size-3" />
                        {member.email}
                      </span>
                      {member.phone && (
                        <span className="flex items-center gap-1">
                          <PhoneIcon className="size-3" />
                          {member.phone}
                        </span>
                      )}
                      <span>Proyecto: {projectTitle(member.projectId)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border-transparent",
                      member.isActive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    {member.isActive ? "Activo" : "Ausente"}
                  </Badge>
                  <MemberForm
                    member={member}
                    trigger={
                      <Button size="sm" variant="outline">
                        <PencilIcon className="size-4" />
                        Editar
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    title="Eliminar miembro"
                    description={`Se eliminara a "${member.name}" del equipo.`}
                    onConfirm={() => deleteMember(member.userId)}
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
