"use client"

import { Clock, Flame, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const stats = [
  {
    title: "Time Studied Today",
    value: "4h 12m",
    description: "12% more than yesterday",
    icon: Clock,
  },
  {
    title: "Weekly Streak",
    value: "14 Days",
    description: "Keep it up!",
    icon: Flame,
  },
  {
    title: "Focus Score",
    value: "87%",
    description: "Above average",
    icon: TrendingUp,
  },
]

export function StatsCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-1", className)}>
      {stats.map((stat) => (
        <Card key={stat.title} className="gap-3 py-5">
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
