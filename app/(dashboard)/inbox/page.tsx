"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { 
  MessageSquare, 
  AtSign, 
  CheckCircle2, 
  AlertCircle,
  Archive,
  Trash2,
  MoreHorizontal,
  Star,
} from "lucide-react"

type Notification = {
  id: string
  type: "mention" | "comment" | "assigned" | "completed" | "overdue"
  title: string
  description: string
  project: string
  projectColor: string
  from: string
  time: string
  read: boolean
  starred: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "mention",
    title: "Mentioned you in a comment",
    description: "\"@john can you review this design before EOD?\"",
    project: "Website Redesign",
    projectColor: "bg-blue-500",
    from: "Sarah Chen",
    time: "5 min ago",
    read: false,
    starred: true,
  },
  {
    id: "2",
    type: "assigned",
    title: "Assigned you a new task",
    description: "Implement user profile settings page",
    project: "Mobile App",
    projectColor: "bg-emerald-500",
    from: "Emily Watson",
    time: "1 hour ago",
    read: false,
    starred: false,
  },
  {
    id: "3",
    type: "comment",
    title: "Commented on your task",
    description: "\"Great progress! Just a few minor tweaks needed on the header component.\"",
    project: "Website Redesign",
    projectColor: "bg-blue-500",
    from: "Mike Johnson",
    time: "2 hours ago",
    read: false,
    starred: false,
  },
  {
    id: "4",
    type: "completed",
    title: "Task marked as complete",
    description: "Database schema migration",
    project: "API Integration",
    projectColor: "bg-amber-500",
    from: "Alex Rivera",
    time: "3 hours ago",
    read: true,
    starred: false,
  },
  {
    id: "5",
    type: "overdue",
    title: "Task is now overdue",
    description: "Write API documentation - was due yesterday",
    project: "API Integration",
    projectColor: "bg-amber-500",
    from: "System",
    time: "1 day ago",
    read: true,
    starred: true,
  },
]

const typeIcons = {
  mention: AtSign,
  comment: MessageSquare,
  assigned: AlertCircle,
  completed: CheckCircle2,
  overdue: AlertCircle,
}

const typeColors = {
  mention: "text-blue-600 bg-blue-100",
  comment: "text-violet-600 bg-violet-100",
  assigned: "text-amber-600 bg-amber-100",
  completed: "text-emerald-600 bg-emerald-100",
  overdue: "text-rose-600 bg-rose-100",
}

export default function InboxPage() {
  const [notifications, setNotifications] = React.useState(initialNotifications)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [filter, setFilter] = React.useState<"all" | "unread" | "starred">("all")

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read
    if (filter === "starred") return n.starred
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleStar = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n))
    )
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const archiveSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.id)))
    setSelectedIds([])
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
          <p className="text-muted-foreground">
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={archiveSelected}>
                <Archive className="h-4 w-4 mr-1.5" />
                Archive
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(["all", "unread", "starred"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter(f)}
            className={cn(
              "capitalize",
              filter === f && "bg-background shadow-sm"
            )}
          >
            {f}
            {f === "unread" && unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No notifications to show
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = typeIcons[notification.type]
            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors cursor-pointer hover:bg-muted/50",
                  !notification.read && "bg-muted/30 border-l-2 border-l-primary"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedIds.includes(notification.id)}
                      onCheckedChange={() => toggleSelect(notification.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className={cn("p-2 rounded-lg", typeColors[notification.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn(
                            "text-sm",
                            !notification.read && "font-semibold"
                          )}>
                            {notification.from} {notification.title.toLowerCase()}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                            {notification.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStar(notification.id)
                            }}
                          >
                            <Star className={cn(
                              "h-4 w-4",
                              notification.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                            )} />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={cn("h-2 w-2 rounded-sm", notification.projectColor)} />
                        <span className="text-xs text-muted-foreground">{notification.project}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
