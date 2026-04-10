"use client"

import { useState } from "react"
import { Search, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const recentSessions = [
  {
    id: "1",
    subject: "Quantum Physics",
    description: "Explored wave functions and probability distributions",
    duration: "1h 24m",
    timeAgo: "2 hours ago",
  },
  {
    id: "2",
    subject: "Advanced Calculus",
    description: "Completed integration by parts exercises",
    duration: "52m",
    timeAgo: "Yesterday",
  },
  {
    id: "3",
    subject: "Modern History",
    description: "Researched Cold War diplomatic relations",
    duration: "1h 08m",
    timeAgo: "2 days ago",
  },
  {
    id: "4",
    subject: "Organic Chemistry",
    description: "Studied reaction mechanisms and catalysis",
    duration: "45m",
    timeAgo: "3 days ago",
  },
  {
    id: "5",
    subject: "Linear Algebra",
    description: "Practiced eigenvalue decomposition problems",
    duration: "1h 15m",
    timeAgo: "4 days ago",
  },
]

export function RecentSessionsCard() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSessions = recentSessions.filter(
    (session) =>
      session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card className="flex min-h-0 flex-col">
      <CardHeader className="shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Sessions</CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/session-history">
              View all
              <ArrowRight className="ml-1 size-3" />
            </Link>
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
        <div className="space-y-1">
          {filteredSessions.length > 0 ? (
            filteredSessions.slice(0, 5).map((session) => (
              <Link
                key={session.id}
                href={`/session-history?id=${session.id}`}
                className="flex items-start justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50 -mx-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.description}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {session.duration}
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    {session.timeAgo}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sessions found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
