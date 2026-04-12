"use client"

import { useMemo, useState } from "react"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Search, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TEMP_STUDY_SESSIONS } from "@/lib/session-dummy-data"
import Link from "next/link"

type RecentSessionTopic = {
  id: string
  sessionId: string
  subjectLabel: string
  durationSeconds: number
  createdAt: string
}

function formatDurationHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

export function RecentSessionsCard() {
  const [searchQuery, setSearchQuery] = useState("")

  const topicSessions = useMemo<RecentSessionTopic[]>(
    () =>
      TEMP_STUDY_SESSIONS.flatMap((session) =>
        session.topics.map((topic) => ({
          id: `${session.id}-${topic.id}`,
          sessionId: session.id,
          subjectLabel: topic.subjectLabel,
          durationSeconds: topic.duration,
          createdAt: session.createdAt,
        }))
      ).sort(
        (a, b) =>
          parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
      ),
    []
  )

  const filteredSessions = useMemo(
    () =>
      topicSessions
        .filter((session) =>
          session.subjectLabel
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase())
        )
        .slice(0, 5),
    [searchQuery, topicSessions]
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
            filteredSessions.map((session) => (
              <Link
                key={session.id}
                href={`/session-history?id=${session.sessionId}`}
                className="flex items-start justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50 -mx-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.subjectLabel}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {formatDurationHuman(session.durationSeconds)}
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    {formatDistanceToNow(parseISO(session.createdAt), {
                      addSuffix: true,
                    })}
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
