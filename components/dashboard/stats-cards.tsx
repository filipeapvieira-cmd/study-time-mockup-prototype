"use client"

import { Clock, Flame, TrendingUp } from "lucide-react"
import { format, parseISO, subDays } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TEMP_STUDY_SESSIONS } from "@/lib/session-dummy-data"
import { cn } from "@/lib/utils"

function formatDurationHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

function buildTodayDescription(todaySeconds: number, yesterdaySeconds: number): string {
  if (todaySeconds === 0 && yesterdaySeconds === 0) {
    return "No study activity yet"
  }

  if (yesterdaySeconds === 0) {
    return "First study day in this dataset"
  }

  const deltaPercentage = Math.round(
    ((todaySeconds - yesterdaySeconds) / yesterdaySeconds) * 100
  )

  if (deltaPercentage === 0) {
    return "Same as yesterday"
  }

  if (deltaPercentage > 0) {
    return `${deltaPercentage}% more than yesterday`
  }

  return `${Math.abs(deltaPercentage)}% less than yesterday`
}

function getStatsSnapshot() {
  if (TEMP_STUDY_SESSIONS.length === 0) {
    return {
      todayValue: "0m",
      todayDescription: "No study activity yet",
      weeklyStreakValue: "0 Days",
      weeklyStreakDescription: "No study activity this week",
    }
  }

  const totalsByDate = new Map<string, number>()

  for (const session of TEMP_STUDY_SESSIONS) {
    totalsByDate.set(
      session.date,
      (totalsByDate.get(session.date) ?? 0) + session.effectiveTime
    )
  }

  const sortedDates = Array.from(totalsByDate.keys()).sort((a, b) =>
    a.localeCompare(b)
  )
  const latestDateKey = sortedDates[sortedDates.length - 1]
  const latestDate = parseISO(latestDateKey)

  const todaySeconds = totalsByDate.get(latestDateKey) ?? 0
  const yesterdayKey = format(subDays(latestDate, 1), "yyyy-MM-dd")
  const yesterdaySeconds = totalsByDate.get(yesterdayKey) ?? 0

  let weeklyStreakDays = 0
  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const dateKey = format(subDays(latestDate, dayOffset), "yyyy-MM-dd")
    if (!totalsByDate.has(dateKey)) {
      break
    }
    weeklyStreakDays += 1
  }

  return {
    todayValue: formatDurationHuman(todaySeconds),
    todayDescription: buildTodayDescription(todaySeconds, yesterdaySeconds),
    weeklyStreakValue: `${weeklyStreakDays} Days`,
    weeklyStreakDescription:
      weeklyStreakDays > 0
        ? `${weeklyStreakDays} consecutive day${weeklyStreakDays === 1 ? "" : "s"}`
        : "No study activity this week",
  }
}

const statsSnapshot = getStatsSnapshot()

const stats = [
  {
    title: "Time Studied Today",
    value: statsSnapshot.todayValue,
    description: statsSnapshot.todayDescription,
    icon: Clock,
  },
  {
    title: "Weekly Streak",
    value: statsSnapshot.weeklyStreakValue,
    description: statsSnapshot.weeklyStreakDescription,
    icon: Flame,
  },
]

export function StatsCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-1", className)}>
      {stats.map((stat) => (
        <Card key={stat.title} className="h-full gap-3 py-5">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3" />
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
