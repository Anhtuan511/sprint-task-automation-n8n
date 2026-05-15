"use client"

import * as React from "react"
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Plus, Loader2, AlertCircle } from "lucide-react"

type CalendarEvent = {
  id: string
  title: string
  time: string
  project: string
  projectColor: string
  type: "task" | "meeting" | "deadline"
  event_date: string
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 3, 1)) 
  const [selectedDate, setSelectedDate] = React.useState<number | null>(12)
  const [eventsData, setEventsData] = React.useState<Record<number, CalendarEvent[]>>({})
  const [loading, setLoading] = React.useState(true)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const fetchEvents = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      // SỬA LỖI Ở ĐÂY: Tính toán ngày cuối cùng của tháng một cách tự động
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
      const firstDayStr = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const lastDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          projects (name, color)
        `)
        .gte('event_date', firstDayStr)
        .lte('event_date', lastDayStr)

      if (error) {
        setErrorMsg(error.message)
        return
      }

      if (data) {
        const grouped: Record<number, CalendarEvent[]> = {}
        data.forEach((item: any) => {
          const day = parseInt(item.event_date.split('-')[2], 10)
          if (!grouped[day]) grouped[day] = []
          grouped[day].push({
            id: item.id,
            title: item.title,
            time: item.time,
            type: item.type,
            project: item.projects?.name || "No Project",
            projectColor: item.projects?.color || "#64748b",
            event_date: item.event_date
          })
        })
        setEventsData(grouped)
      }
    } catch (err: any) {
      setErrorMsg("Connection failed")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const firstDayIdx = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: firstDayIdx }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  )

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const selectedEvents = selectedDate ? eventsData[selectedDate] || [] : []

  const typeColors: any = {
    task: "bg-blue-50 text-blue-700 border-blue-100",
    meeting: "bg-violet-50 text-violet-700 border-violet-100",
    deadline: "bg-rose-50 text-rose-700 border-rose-100",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button onClick={fetchEvents} variant="outline" size="sm">Refresh</Button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" /> {errorMsg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{monthNames[month]} {year}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft /></Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground mb-2">
              {daysOfWeek.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => (
                <button
                  key={i}
                  onClick={() => day && setSelectedDate(day)}
                  className={cn(
                    "h-14 rounded-lg border flex flex-col items-center justify-center transition-all",
                    !day && "invisible",
                    day === selectedDate ? "bg-primary text-white border-primary" : "hover:bg-muted"
                  )}
                >
                  <span className="text-sm">{day}</span>
                  <div className="flex gap-0.5 mt-1">
                    {day && eventsData[day]?.slice(0, 3).map((e, idx) => (
                      <div key={idx} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.projectColor }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Events for {selectedDate} {monthNames[month]}</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin mx-auto" /> : (
              selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map(e => (
                    <div key={e.id} className={cn("p-3 rounded-lg border", typeColors[e.type])}>
                      <div className="flex justify-between font-bold text-sm">
                        {e.title} <Badge variant="outline">{e.type}</Badge>
                      </div>
                      <div className="text-xs opacity-70 mt-1">{e.time}</div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-black/5">
                         <div className="h-2 w-2 rounded-full" style={{ backgroundColor: e.projectColor }} />
                         <span className="text-[10px] font-bold">{e.project}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-muted-foreground py-10">No events</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}