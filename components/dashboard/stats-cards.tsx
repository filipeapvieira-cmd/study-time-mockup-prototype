"use client"

import { Clock, Flame, Timer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DASHBOARD_METRICS_SNAPSHOT } from "@/lib/session-dummy-data"
import { cn } from "@/lib/utils"

function formatDurationHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

const stats = [
  {
    title: "Total hours logged",
    value: formatDurationHuman(DASHBOARD_METRICS_SNAPSHOT.totalHoursLogged),
    description: "Total effective study time",
    icon: Clock,
  },
  {
    title: "Average session length",
    value: formatDurationHuman(DASHBOARD_METRICS_SNAPSHOT.averageSessionLength),
    description: "Mean effective session duration",
    icon: Timer,
  },
  {
    title: "Streak tracking",
    value: `${DASHBOARD_METRICS_SNAPSHOT.currentStreakDays} day${
      DASHBOARD_METRICS_SNAPSHOT.currentStreakDays === 1 ? "" : "s"
    }`,
    description: "Current consecutive-day streak",
    icon: Flame,
  },
]

export function StatsCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-1", className)}>
      {stats.map((stat) => (
        <Card key={stat.title} className="h-full gap-3 py-5">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-base font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
