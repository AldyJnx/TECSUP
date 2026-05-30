"use client";

import {
  LayoutDashboardIcon,
  FolderKanbanIcon,
  UsersIcon,
  ListTodoIcon,
  SettingsIcon,
} from "lucide-react";

import { DashboardProvider } from "@/lib/store";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { ProjectForm } from "@/components/project-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { OverviewTab } from "@/components/tabs/overview-tab";
import { ProjectsTab } from "@/components/tabs/projects-tab";
import { TeamTab } from "@/components/tabs/team-tab";
import { TasksTab } from "@/components/tabs/tasks-tab";
import { SettingsTab } from "@/components/tabs/settings-tab";

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/40 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Dashboard de Proyectos
              </h1>
              <p className="text-muted-foreground">
                Gestiona tus proyectos, equipo y tareas con shadcn/ui
              </p>
              <div className="pt-4">
                <ProjectForm />
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="overview">
                <LayoutDashboardIcon className="size-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="projects">
                <FolderKanbanIcon className="size-4" />
                Proyectos
              </TabsTrigger>
              <TabsTrigger value="team">
                <UsersIcon className="size-4" />
                Equipo
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <ListTodoIcon className="size-4" />
                Tareas
              </TabsTrigger>
              <TabsTrigger value="settings">
                <SettingsIcon className="size-4" />
                Configuracion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <ProjectsTab />
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <TeamTab />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <TasksTab />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardProvider>
  );
}
