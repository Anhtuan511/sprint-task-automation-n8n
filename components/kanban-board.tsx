"use client"

import * as React from "react"
import { MoreHorizontal, Plus, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type Task = {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  assignee?: { name: string; avatar?: string }
  tags?: string[]
}

export type Column = {
  id: string
  title: string
  tasks: Task[]
  color: string
}

interface KanbanBoardProps {
  columns: Column[]
  onTaskDrop?: (taskId: string, targetColumnId: string) => void
}

const priorityColors = {
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-rose-500/10 text-rose-600 border-rose-500/20",
}

function TaskCard({ task, columnId, onDragStart }: { 
  task: Task
  columnId: string
  onDragStart: (e: React.DragEvent, taskId: string, columnId: string) => void
}) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, task.id, columnId)}
      className="group cursor-grab bg-card hover:bg-accent/50 transition-all duration-200 border border-border shadow-sm active:cursor-grabbing"
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          <h4 className="flex-1 font-medium text-sm leading-tight text-foreground">{task.title}</h4>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {task.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-medium", priorityColors[task.priority])}>
            {task.priority}
          </Badge>
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[8px]">{task.assignee.name[0]}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function KanbanBoard({ columns: initialColumns, onTaskDrop }: KanbanBoardProps) {
  const [columns, setColumns] = React.useState<Column[]>(initialColumns)
  const [draggedTask, setDraggedTask] = React.useState<{ taskId: string; sourceColumnId: string } | null>(null)
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null)

  React.useEffect(() => { setColumns(initialColumns) }, [initialColumns])

  const handleDragStart = (e: React.DragEvent, taskId: string, columnId: string) => {
    setDraggedTask({ taskId, sourceColumnId: columnId })
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    if (!draggedTask || draggedTask.sourceColumnId === targetColumnId) {
      setDragOverColumn(null)
      return
    }

    // 1. Cập nhật UI ngay lập tức (Optimistic UI)
    const newColumns = columns.map((col) => {
      if (col.id === draggedTask.sourceColumnId) {
        return { ...col, tasks: col.tasks.filter((t) => t.id !== draggedTask.taskId) }
      }
      if (col.id === targetColumnId) {
        const task = columns.find(c => c.id === draggedTask.sourceColumnId)?.tasks.find(t => t.id === draggedTask.taskId)
        return task ? { ...col, tasks: [...col.tasks, task] } : col
      }
      return col
    })
    setColumns(newColumns)

    // 2. Gọi hàm callback để lưu vào Supabase
    onTaskDrop?.(draggedTask.taskId, targetColumnId)
    
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  return (
    <div className="flex flex-row gap-6 h-full overflow-x-auto pb-4 px-1 scrollbar-hide">
      {columns.map((column) => (
        <div 
          key={column.id}
          className="flex flex-col min-w-[300px] max-w-[320px] flex-shrink-0"
          onDragOver={(e) => { e.preventDefault(); setDragOverColumn(column.id) }}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <div className={cn("w-2.5 h-2.5 rounded-full", column.color)} />
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{column.tasks.length}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className={cn("flex flex-col gap-3 p-2 rounded-lg bg-muted/30 min-h-[500px] transition-colors", dragOverColumn === column.id && "bg-muted/60")}>
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} columnId={column.id} onDragStart={handleDragStart} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}