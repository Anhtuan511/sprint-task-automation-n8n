"use client"

import * as React from "react"
import {
  Folder,
  ChevronDown,
  Settings,
  Plus,
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Inbox,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { AddProjectModal } from "@/components/add-project-modal"

export type Project = {
  id: string
  name: string
  color: string
  tasksCount: number
}

interface ProjectSidebarProps {
  projects: Project[]
  activeProjectId: string
  onProjectSelect: (projectId: string) => void
  onAddProject: (name: string, color: string) => void
  children: React.ReactNode
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "#" },
  { icon: Inbox, label: "Inbox", href: "#", badge: 3 },
  { icon: Calendar, label: "Calendar", href: "#" },
  { icon: Users, label: "Team", href: "#" },
  { icon: BarChart3, label: "Reports", href: "#" },
]

export function ProjectSidebar({ projects, activeProjectId, onProjectSelect, onAddProject, children }: ProjectSidebarProps) {
  const [projectsOpen, setProjectsOpen] = React.useState(true)
  const [isAddProjectOpen, setIsAddProjectOpen] = React.useState(false)

  const handleAddProject = (name: string, color: string) => {
    onAddProject(name, color)
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              SM
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm text-sidebar-foreground truncate">Sprint Manager</h2>
              <p className="text-xs text-sidebar-foreground/60">Pro Plan</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Search */}
          <div className="px-3 mb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="h-8 pl-8 bg-sidebar-accent/50 border-0 focus-visible:ring-1 focus-visible:ring-sidebar-ring text-sm"
              />
            </div>
          </div>

          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Projects */}
          <SidebarGroup>
            <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
              <div className="flex items-center justify-between pr-2">
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer hover:text-sidebar-foreground transition-colors">
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200 mr-1",
                      !projectsOpen && "-rotate-90"
                    )} />
                    Projects
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  onClick={() => setIsAddProjectOpen(true)}
                  title="Add new project"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {projects.map((project) => (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton
                          onClick={() => onProjectSelect(project.id)}
                          isActive={project.id === activeProjectId}
                          className="text-sidebar-foreground/80 hover:text-sidebar-foreground"
                        >
                          <div className={cn("h-2.5 w-2.5 rounded-sm", project.color)} />
                          <span className="truncate">{project.name}</span>
                          <span className="ml-auto text-[10px] text-sidebar-foreground/50 font-medium">
                            {project.tasksCount}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/user.jpg" alt="User" />
              <AvatarFallback className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">john@company.com</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-2" />
          {children}
        </header>
      </SidebarInset>

      <AddProjectModal 
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
        onAddProject={handleAddProject}
      />
    </SidebarProvider>
  )
}
