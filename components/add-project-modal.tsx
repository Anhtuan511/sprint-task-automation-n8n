"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddProject: (name: string, color: string) => void
}

const projectColors = [
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Pink", value: "bg-pink-500" },
  { name: "Cyan", value: "bg-cyan-500" },
  { name: "Slate", value: "bg-slate-500" },
]

export function AddProjectModal({ open, onOpenChange, onAddProject }: AddProjectModalProps) {
  const [projectName, setProjectName] = React.useState("")
  const [selectedColor, setSelectedColor] = React.useState("bg-blue-500")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectName.trim()) {
      alert("Please enter a project name")
      return
    }

    setIsSubmitting(true)
    
    try {
      // --- ĐOẠN CODE GỌI N8N CỦA ÔNG Ở ĐÂY ---
      // Lưu ý: localhost:5678 chỉ chạy được khi Web và n8n cùng trên 1 máy
      fetch('http://localhost:5678/webhook-test/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_name: projectName,
          project_id: Math.floor(Math.random() * 1000) // Tạo ID tạm thời nếu chưa lưu DB
        }),
      }).catch(err => console.log("Lỗi gửi n8n (có thể do chưa bật n8n):", err));
      // ---------------------------------------

      // Giữ nguyên logic cũ của ông
      await new Promise(resolve => setTimeout(resolve, 300))
      onAddProject(projectName, selectedColor)
      
      // Reset form
      setProjectName("")
      setSelectedColor("bg-blue-500")
      setIsSubmitting(false)
      onOpenChange(false)

    } catch (error) {
      console.error("Lỗi:", error);
      setIsSubmitting(false);
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen === false) {
      setProjectName("")
      setSelectedColor("bg-blue-500")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to your workspace. Choose a name and color to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Name</label>
            <Input
              placeholder="Enter project name (e.g., Website Redesign)"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Color</label>
            <Select value={selectedColor} onValueChange={setSelectedColor} disabled={isSubmitting}>
              <SelectTrigger className="h-9">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-sm ${selectedColor}`} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {projectColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-sm ${color.value}`} />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !projectName.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}