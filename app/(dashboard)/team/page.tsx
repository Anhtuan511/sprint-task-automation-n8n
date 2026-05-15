"use client"

import * as React from "react"
import { supabase } from '@/lib/supabase' // Đảm bảo đường dẫn đúng
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, MoreHorizontal, CheckCircle2, Clock } from "lucide-react"

export default function TeamPage() {
  const [members, setMembers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Fetch dữ liệu từ Supabase
  React.useEffect(() => {
    async function fetchTeam() {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
      
      if (!error && data) {
        setMembers(data)
      }
      setLoading(false)
    }
    fetchTeam()
  }, [])

  // Lọc thành viên theo thanh tìm kiếm
  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="p-8 text-center text-muted-foreground">Đang tải danh sách đội ngũ...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground">{members.length} team members</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-1.5" />
          Invite Member
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search team members..." 
          className="pl-8 bg-sidebar-accent/50 border-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Team Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden border-sidebar-border hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>{member.full_name.split(' ').map((n: any) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">{member.full_name}</h3>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {member.done_tasks_count} done
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {member.active_tasks_count} active
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {member.projects?.map((proj: string) => (
                  <Badge key={proj} variant="secondary" className="text-[10px] py-0 px-2 font-normal">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5" />
                    {proj}
                  </Badge>
                ))}
              </div>

              <Button variant="outline" className="w-full text-xs h-9" asChild>
                <a href={`mailto:${member.email}`}>
                  <Mail className="h-3.5 w-3.5 mr-2" />
                  {member.email}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}