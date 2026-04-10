"use client"

import React from "react"
import { Zap, Target, Flame, CalendarIcon, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell, Area, AreaChart } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const weeklyBarData = [
  { day: "Mon", hours: 3 },
  { day: "Tue", hours: 2 },
  { day: "Wed", hours: 5 },
  { day: "Thu", hours: 6 },
  { day: "Fri", hours: 8 },
  { day: "Sat", hours: 7 },
  { day: "Sun", hours: 6 },
]

const barChartConfig = {
  hours: {
    label: "Hours",
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig

const subjectData = [
  { name: "Theoretical Physics", value: 45, fill: "var(--color-physics)", color: "hsl(var(--foreground))" },
  { name: "Mathematics", value: 25, fill: "var(--color-math)", color: "hsl(var(--chart-2))" },
  { name: "Computer Science", value: 15, fill: "var(--color-cs)", color: "hsl(var(--chart-3))" },
  { name: "Other", value: 15, fill: "var(--color-other)", color: "hsl(var(--muted-foreground))" },
]

const pieChartConfig = {
  physics: {
    label: "Theoretical Physics",
    color: "hsl(var(--foreground))",
  },
  math: {
    label: "Mathematics",
    color: "hsl(var(--chart-2))",
  },
  cs: {
    label: "Computer Science",
    color: "hsl(var(--chart-3))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig

const flowData = [
  { time: "8 AM", energy: 20 },
  { time: "9 AM", energy: 35 },
  { time: "10 AM", energy: 55 },
  { time: "11 AM", energy: 70 },
  { time: "12 PM", energy: 65 },
  { time: "1 PM", energy: 45 },
  { time: "2 PM", energy: 50 },
  { time: "3 PM", energy: 75 },
  { time: "4 PM", energy: 85 },
  { time: "5 PM", energy: 60 },
  { time: "6 PM", energy: 40 },
]

const flowChartConfig = {
  energy: {
    label: "Focus Energy",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig

// Streak data - which days had activity
const streakDays = [true, true, true, true, true, true, true, false, false, false, false, false, false, false]

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState("month")
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(2026, 2, 1),
    to: new Date(2026, 2, 31),
  })

  // Mock data
  const weeklyGoalCurrent = 18
  const weeklyGoalTarget = 25
  const weeklyGoalPercent = Math.round((weeklyGoalCurrent / weeklyGoalTarget) * 100)
  const weeklyGoalRemaining = weeklyGoalTarget - weeklyGoalCurrent
  const focusStreak = 14
  const totalHours = 33

  return (
    <div className="flex min-h-full flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into your academic focus cycles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(value) => value && setPeriod(value)}
            variant="outline"
          >
            <ToggleGroupItem value="week" className="px-3">
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="px-3">
              Month
            </ToggleGroupItem>
            <ToggleGroupItem value="year" className="px-3">
              Year
            </ToggleGroupItem>
          </ToggleGroup>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="size-4" />
                <span className="hidden sm:inline">
                  {dateRange.from && dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd")} -{" "}
                      {format(dateRange.to, "MMM dd")}
                    </>
                  ) : (
                    "Select dates"
                  )}
                </span>
                <span className="sm:hidden">Dates</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={(range) =>
                  setDateRange({ from: range?.from, to: range?.to })
                }
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Top Row - Weekly Goal & Focus Streak */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Study Goal */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-muted-foreground" />
                <span className="font-semibold">Weekly Study Goal</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold">{weeklyGoalCurrent}h</span>
                <span className="text-muted-foreground"> / {weeklyGoalTarget}h</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              You are on track to crush your goal this week.
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{weeklyGoalPercent}% Completed</span>
                <span className="text-muted-foreground">{weeklyGoalRemaining}h remaining</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground transition-all"
                  style={{ width: `${weeklyGoalPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Focus Streak */}
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted/40">
              <Zap className="size-7 text-muted-foreground" />
            </div>
            <div className="mt-3 text-center">
              <span className="text-4xl font-bold">{focusStreak} Days</span>
              <p className="mt-1 text-sm text-muted-foreground">Active Focus Streak</p>
            </div>
            <div className="mt-4 flex items-center gap-1">
              {streakDays.slice(0, 7).map((active, i) => (
                <div
                  key={i}
                  className={`flex size-8 items-center justify-center rounded-full ${
                    active ? "bg-accent/20" : "bg-muted"
                  }`}
                >
                  <Flame
                    className={`size-4 ${active ? "text-accent" : "text-muted-foreground/30"}`}
                  />
                </div>
              ))}
              <span className="ml-2 text-xs text-muted-foreground">s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row - Time Distribution & Subject Mastery */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Time Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Time Distribution</CardTitle>
            <CardDescription>Daily deep work hours vs brief reviews</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[220px] w-full">
              <ChartContainer config={barChartConfig} className="h-full w-full">
                <BarChart data={weeklyBarData} accessibilityLayer>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}h`}
                  fontSize={12}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
                <Bar
                  dataKey="hours"
                  fill="hsl(var(--foreground))"
                  radius={[4, 4, 0, 0]}
                />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject Mastery */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Subject Mastery</CardTitle>
            <CardDescription>Time allocated per discipline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative h-[160px] w-[160px] shrink-0">
                <ChartContainer config={pieChartConfig} className="!aspect-square">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      cornerRadius={4}
                      stroke="none"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ChartContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{totalHours}h</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {subjectData.slice(0, 3).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Peak Flow State */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Peak Flow State</CardTitle>
            <CardDescription>Your focus energy levels throughout the day</CardDescription>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <TrendingUp className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[180px] w-full">
            <ChartContainer config={flowChartConfig} className="h-full w-full">
              <AreaChart data={flowData} accessibilityLayer>
              <defs>
                <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                interval={1}
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
              <Area
                type="monotone"
                dataKey="energy"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                fill="url(#flowGradient)"
              />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
