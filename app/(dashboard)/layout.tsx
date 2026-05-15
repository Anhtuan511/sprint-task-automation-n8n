"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
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
import { supabase } from "@/lib/supabase" // Đảm bảo ông đã tạo file này

export type Project = {
  id: string
  name: string
  color: string
  tasksCount: number
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Inbox, label: "Inbox", href: "/inbox", badge: 3 },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Users, label: "Team", href: "/team" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [projectsOpen, setProjectsOpen] = React.useState(true)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [isAddProjectOpen, setIsAddProjectOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  // 1. Lấy dữ liệu Projects và Tasks Count từ Supabase
  const fetchProjects = async () => {
    setLoading(true)
    try {
      // Lấy danh sách project kèm theo số lượng task liên kết (nếu có foreign key)
      // Nếu db của ông chưa set foreign key, mình lấy projects và tasks riêng rồi map
      const { data: projectsData } = await supabase.from('projects').select('*')
      const { data: tasksData } = await supabase.from('tasks').select('project_id')

      if (projectsData) {
        const formattedProjects = projectsData.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          color: p.color || "bg-blue-500",
          tasksCount: tasksData ? tasksData.filter(t => t.project_id === p.id).length : 0
        }))
        setProjects(formattedProjects)
      }
    } catch (error) {
      console.error("Lỗi Sidebar:", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchProjects()
  }, [])

  // 2. Xử lý thêm Project mới lên Supabase
  const handleAddProject = async (name: string, color: string) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, color }])
      .select()

    if (!error && data) {
      // Sau khi thêm thành công, load lại danh sách
      fetchProjects()
      console.log("Dự án mới đã lưu vào DB:", data[0])
    }
  }

  return (
    <div className="flex h-screen bg-background">
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
            <div className="px-3 mb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="h-8 pl-8 bg-sidebar-accent/50 border-0 text-sm"
                />
              </div>
            </div>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton 
                        asChild
                        isActive={pathname === item.href}
                        className="text-sidebar-foreground/80"
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
                <div className="flex items-center justify-between pr-2">
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:text-sidebar-foreground">
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
                    className="h-6 w-6"
                    onClick={() => setIsAddProjectOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {loading ? (
                        <p className="text-[10px] px-6 py-2 text-muted-foreground">Loading...</p>
                      ) : (
                        projects.map((project) => (
                          <SidebarMenuItem key={project.id}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === `/project/${project.id}`}
                              className="text-sidebar-foreground/80"
                            >
                              <Link href={`/project/${project.id}`}>
                                <div className={cn("h-2.5 w-2.5 rounded-sm", project.color)} />
                                <span className="truncate">{project.name}</span>
                                <span className="ml-auto text-[10px] text-sidebar-foreground/50">
                                  {project.tasksCount}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">john@company.com</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b px-6 bg-background/95 shrink-0">
            <SidebarTrigger className="-ml-2" />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>

        <AddProjectModal
          open={isAddProjectOpen}
          onOpenChange={setIsAddProjectOpen}
          onAddProject={handleAddProject}
        />
      </SidebarProvider>
    </div>
  )
}