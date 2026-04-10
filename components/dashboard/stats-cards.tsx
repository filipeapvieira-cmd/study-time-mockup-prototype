"use client"

import { Clock, Flame, Target, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  {
    title: "Time Studied Today",
    value: "4h 12m",
    description: "12% more than yesterday",
    trend: "up",
    icon: Clock,
  },
  {
    title: "Weekly Streak",
    value: "14 Days",
    description: "Keep it up!",
    trend: "up",
    icon: Flame,
  },
  {
    title: "Sessions This Week",
    value: "23",
    description: "+5 from last week",
    trend: "up",
    icon: Target,
  },
  {
    title: "Focus Score",
    value: "87%",
    description: "Above average",
    trend: "up",
    icon: TrendingUp,
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="size-3" />
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
