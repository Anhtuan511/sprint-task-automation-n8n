"use client"

import * as React from "react"
import { use } from "react"
import { supabase } from '@/lib/supabase'
import { KanbanBoard, type Column, type Task } from "@/components/kanban-board"
import { AIGenerateButton } from "@/components/ai-generate-button"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarDays, Loader2 } from "lucide-react"

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params)
  const [projectInfo, setProjectInfo] = React.useState<any>(null)
  const [columns, setColumns] = React.useState<Column[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isGenerating, setIsGenerating] = React.useState(false)

  // 1. Cập nhật hàm lấy dữ liệu để Join với bảng profiles
  const fetchData = async () => {
    try {
      const { data: projData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      
      setProjectInfo(projData)

      // THAY ĐỔI: Thêm select profiles để lấy tên và avatar
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles:assignee_id (
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)

      if (error) throw error

      const cols: Column[] = [
        { id: "todo", title: "To Do", color: "bg-slate-400", tasks: [] },
        { id: "in-progress", title: "In Progress", color: "bg-blue-500", tasks: [] },
        { id: "review", title: "In Review", color: "bg-amber-500", tasks: [] },
        { id: "done", title: "Done", color: "bg-emerald-500", tasks: [] },
      ]

      tasksData?.forEach((task: any) => {
        const col = cols.find(c => c.id === task.status)
        if (col) {
          col.tasks.push({
            id: task.id.toString(),
            title: task.title,
            description: task.description, // Đã lấy description từ DB
            priority: task.priority || "medium",
            tags: task.tags || [],
            // Lấy thông tin người gán từ profiles vừa join
            assignee: task.profiles ? {
              name: task.profiles.full_name,
              avatar: task.profiles.avatar_url
            } : undefined
          })
        }
      })

      setColumns(cols)
    } catch (err) {
      console.error("Error fetching project data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error
    } catch (err) {
      console.error("Failed to update task status in DB:", err)
    }
  }

  React.useEffect(() => {
    fetchData()

    const channel = supabase
      .channel(`project-changes-${projectId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` }, 
        () => fetchData()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId])

  const handleAIGenerate = async () => {
    setIsGenerating(true)
    try {
      await fetch('URL_WEBHOOK_N8N_CUA_ONG', {
        method: 'POST',
        body: JSON.stringify({ projectId, projectName: projectInfo?.name })
      })
    } catch (err) {
      console.error("AI Generation failed:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>

  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0)
  const completedTasks = columns.find((col) => col.id === "done")?.tasks.length || 0

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: projectInfo?.color || '#ccc' }} />
            <h1 className="text-lg font-semibold text-foreground">{projectInfo?.name}</h1>
          </div>
          <Badge variant="secondary" className="text-xs font-normal">
            {completedTasks}/{totalTasks} tasks
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Select defaultValue="sprint-2">
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sprint-1">Sprint 1</SelectItem>
              <SelectItem value="sprint-2">Sprint 2</SelectItem>
            </SelectContent>
          </Select>
          <AIGenerateButton onClick={handleAIGenerate} isLoading={isGenerating} />
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <KanbanBoard 
          columns={columns} 
          onTaskDrop={handleTaskStatusChange} 
        />
      </div>
    </div>
  )
}