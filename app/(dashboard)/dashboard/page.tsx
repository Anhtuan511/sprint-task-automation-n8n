"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react"

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Lấy toàn bộ dữ liệu từ Supabase trong 1 lần gọi
  useEffect(() => {
    async function fetchAllData() {
      setLoading(true)
      try {
        const [resProjects, resTasks, resActivities] = await Promise.all([
          supabase.from('projects').select('*'),
          supabase.from('tasks').select('*'),
          supabase.from('activities').select('*').order('id', { ascending: false }).limit(5)
        ])

        if (resProjects.data) setProjects(resProjects.data)
        if (resTasks.data) setTasks(resTasks.data)
        if (resActivities.data) setActivities(resActivities.data)
      } catch (error) {
        console.error("Lỗi fetch dữ liệu:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [])

  // 2. Logic tính toán Stats tổng quát
  const totalTasks = tasks.length
  const completedTasksCount = tasks.filter(t => t.status === 'completed' || t.status === 'done').length
  const inProgressTasksCount = tasks.filter(t => t.status === 'in_progress' || t.status === 'todo').length
  const overdueTasksCount = tasks.filter(t => t.status === 'overdue').length

  const stats = [
    { title: "Total Tasks", value: totalTasks, icon: CheckCircle2, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "In Progress", value: inProgressTasksCount, icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100" },
    { title: "Completed", value: completedTasksCount, icon: TrendingUp, color: "text-emerald-600", bgColor: "bg-emerald-100" },
    { title: "Overdue", value: overdueTasksCount, icon: AlertCircle, color: "text-rose-600", bgColor: "bg-rose-100" },
  ]

  // 3. Logic tính toán Progress cho từng Project (Ý tưởng của ông)
  const projectProgressList = projects.map(project => {
    const projectTasks = tasks.filter(t => t.project_id === project.id)
    const total = projectTasks.length
    const completed = projectTasks.filter(t => t.status === 'completed' || t.status === 'done').length
    const percent = total > 0 ? (completed / total) * 100 : 0
    
    return {
      ...project,
      total,
      completed,
      percent
    }
  })

  if (loading) return <div className="p-6 text-center">Đang tải dữ liệu từ hệ thống...</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Chào mừng trở lại. Đây là tổng quan tiến độ Sprint của ông.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  +0% <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project Progress - Tự động tính toán số task */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Progress</CardTitle>
            <CardDescription>Tiến độ thực tế dựa trên số lượng task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {projectProgressList.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-sm ${project.color || 'bg-blue-500'}`} />
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <span className="text-muted-foreground">{project.completed}/{project.total} tasks</span>
                </div>
                <Progress value={project.percent} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity - Đổ từ bảng activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Hoạt động mới nhất từ Database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-muted text-blue-600 font-bold">
                      {activity.user_name?.split(" ").map((n:any) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user_name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium truncate">{activity.target_name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : "Vừa xong"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}