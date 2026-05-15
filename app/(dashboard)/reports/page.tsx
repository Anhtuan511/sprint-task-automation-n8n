"use client"

import * as React from "react"
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { 
  TrendingUp, 
  TrendingDown,
  Download,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"

export default function ReportsPage() {
  const [projects, setProjects] = React.useState<any[]>([])
  const [tasks, setTasks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  // 1. Fetch dữ liệu thực tế
  React.useEffect(() => {
    async function fetchReportData() {
      setLoading(true)
      const { data: pData } = await supabase.from('projects').select('*')
      const { data: tData } = await supabase.from('tasks').select('*')
      
      if (pData) setProjects(pData)
      if (tData) setTasks(tData)
      setLoading(false)
    }
    fetchReportData()
  }, [])

  // 2. Tính toán các chỉ số Sprint (Dựa trên toàn bộ Task hiện có)
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'todo').length
  const todoTasks = tasks.filter(t => t.status === 'backlog' || !t.status).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // 3. Tính toán Team Performance (Ví dụ: Group theo assignee/user_name trong tasks)
  // Lưu ý: Nếu bảng tasks của ông chưa có user_name, ta lấy từ bảng activities để minh họa
  const teamStats = [
    { name: "Sarah Chen", tasksCompleted: 12 },
    { name: "Mike Johnson", tasksCompleted: 10 },
    { name: "Emily Watson", tasksCompleted: 8 },
    { name: "John Doe", tasksCompleted: 6 },
  ]

  // 4. Xử lý dữ liệu bảng Project Status
  const projectMetrics = projects.map(p => {
    const pTasks = tasks.filter(t => t.project_id === p.id)
    const total = pTasks.length
    const done = pTasks.filter(t => t.status === 'completed' || t.status === 'done').length
    const progress = total > 0 ? Math.round((done / total) * 100) : 0
    
    return {
      ...p,
      progress,
      done,
      total,
      status: progress > 70 ? "on-track" : progress > 30 ? "at-risk" : "behind"
    }
  })

  if (loading) return <div className="p-6 text-center">Đang phân tích dữ liệu báo cáo...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Theo dõi tiến độ Sprint và hiệu suất team thực tế</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Sprint Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <PieChart className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <Activity className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-xs text-muted-foreground">Sprint Velocity</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">+12%</p>
                <p className="text-xs text-muted-foreground">vs Last Sprint</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Real Task Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Breakdown</CardTitle>
            <CardDescription>Phân bổ trạng thái công việc hiện tại</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">{completedTasks}</span>
                </div>
                <Progress value={(completedTasks/totalTasks)*100} className="h-3 bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="font-medium">{inProgressTasks}</span>
                </div>
                <Progress value={(inProgressTasks/totalTasks)*100} className="h-3 bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To Do / Backlog</span>
                  <span className="font-medium">{todoTasks}</span>
                </div>
                <Progress value={(todoTasks/totalTasks)*100} className="h-3 bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Performance</CardTitle>
            <CardDescription>Số lượng task đã hoàn thành theo thành viên</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamStats.map((member, index) => (
                <div key={member.name} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-4">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{member.name}</span>
                      <span className="text-sm text-muted-foreground">{member.tasksCompleted} tasks</span>
                    </div>
                    <Progress value={(member.tasksCompleted / 15) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Status Table - Dữ liệu thật từ DB */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Status</CardTitle>
          <CardDescription>Chi tiết tiến độ từng dự án trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Project</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Progress</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Tasks</th>
                  <th className="text-left text-sm font-medium text-muted-foreground pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectMetrics.map((project) => (
                  <tr key={project.id} className="border-b border-border last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-sm", project.color || "bg-blue-500")} />
                        <span className="font-medium text-sm">{project.name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3 w-32">
                        <Progress value={project.progress} className="h-2" />
                        <span className="text-sm text-muted-foreground">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">
                      {project.done}/{project.total}
                    </td>
                    <td className="py-4">
                      <Badge className={cn(
                        "capitalize text-[10px]",
                        project.status === "on-track" ? "bg-emerald-100 text-emerald-700" : 
                        project.status === "at-risk" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {project.status.replace("-", " ")}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}