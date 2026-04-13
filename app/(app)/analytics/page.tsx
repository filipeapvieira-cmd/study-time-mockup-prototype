"use client"

import React from "react"
import { CalendarIcon, TrendingUp, X } from "lucide-react"
import {
  endOfMonth,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns"
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
import { TEMP_STUDY_SESSIONS } from "@/lib/session-dummy-data"

type AnalyticsPeriod = "week" | "month" | "year"
type AnalyticsDateRange = {
  from: Date | undefined
  to: Date | undefined
}
type SubjectSharePoint = {
  name: string
  value: number
  fill: string
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

const barChartConfig = {
  hours: {
    label: "Hours",
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig

const pieChartConfig = {} satisfies ChartConfig

const startHourChartConfig = {
  hours: {
    label: "Hours",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig

function secondsToHours(seconds: number): number {
  return seconds / 3600
}

function roundToSingleDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1)
}

function formatStartHourLabel(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12} ${suffix}`
}

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState<AnalyticsPeriod>("month")
  const [dateRange, setDateRange] = React.useState<AnalyticsDateRange>({
    from: undefined,
    to: undefined,
  })

  const latestSessionDate = React.useMemo(() => {
    if (TEMP_STUDY_SESSIONS.length === 0) {
      return undefined
    }

    const latestDate = TEMP_STUDY_SESSIONS.reduce(
      (latest, session) => (session.date > latest ? session.date : latest),
      TEMP_STUDY_SESSIONS[0].date
    )

    return parseISO(latestDate)
  }, [])

  const periodRange = React.useMemo<AnalyticsDateRange>(() => {
    const anchorDate = latestSessionDate ?? new Date()

    if (period === "week") {
      return {
        from: subDays(anchorDate, 6),
        to: anchorDate,
      }
    }

    if (period === "month") {
      return {
        from: startOfMonth(anchorDate),
        to: endOfMonth(anchorDate),
      }
    }

    return {
      from: startOfYear(anchorDate),
      to: endOfYear(anchorDate),
    }
  }, [latestSessionDate, period])

  const isDateFilterActive = Boolean(dateRange.from || dateRange.to)

  const activeRange = React.useMemo<AnalyticsDateRange>(() => {
    if (isDateFilterActive) {
      return {
        from: dateRange.from ?? dateRange.to,
        to: dateRange.to ?? dateRange.from,
      }
    }

    return periodRange
  }, [dateRange.from, dateRange.to, isDateFilterActive, periodRange])

  const filteredSessions = React.useMemo(() => {
    const normalizedFrom = activeRange.from
      ? format(activeRange.from, "yyyy-MM-dd")
      : null
    const normalizedTo = activeRange.to ? format(activeRange.to, "yyyy-MM-dd") : null

    return TEMP_STUDY_SESSIONS.filter((session) => {
      if (normalizedFrom && session.date < normalizedFrom) {
        return false
      }

      if (normalizedTo && session.date > normalizedTo) {
        return false
      }

      return true
    })
  }, [activeRange.from, activeRange.to])

  const timeDistributionData = React.useMemo(() => {
    const totalsByDay = new Map<string, number>(
      WEEKDAY_LABELS.map((day) => [day, 0])
    )

    for (const session of filteredSessions) {
      const dayLabel = format(parseISO(session.date), "EEE")
      if (!totalsByDay.has(dayLabel)) {
        continue
      }

      totalsByDay.set(
        dayLabel,
        (totalsByDay.get(dayLabel) ?? 0) + secondsToHours(session.effectiveTime)
      )
    }

    return WEEKDAY_LABELS.map((day) => ({
      day,
      hours: roundToSingleDecimal(totalsByDay.get(day) ?? 0),
    }))
  }, [filteredSessions])

  const { subjectData, totalTopicHours } = React.useMemo(() => {
    const totalsBySubject = new Map<string, { totalSeconds: number; color: string }>()

    for (const session of filteredSessions) {
      for (const topic of session.topics) {
        const current = totalsBySubject.get(topic.subjectLabel)
        if (!current) {
          totalsBySubject.set(topic.subjectLabel, {
            totalSeconds: topic.duration,
            color: topic.subjectColor,
          })
          continue
        }

        totalsBySubject.set(topic.subjectLabel, {
          ...current,
          totalSeconds: current.totalSeconds + topic.duration,
        })
      }
    }

    const totalSeconds = Array.from(totalsBySubject.values()).reduce(
      (sum, item) => sum + item.totalSeconds,
      0
    )

    const shares = Array.from(totalsBySubject.entries())
      .map<SubjectSharePoint>(([name, item]) => ({
        name,
        value:
          totalSeconds > 0
            ? Math.round((item.totalSeconds / totalSeconds) * 100)
            : 0,
        fill: item.color,
      }))
      .sort((a, b) => b.value - a.value)

    return {
      subjectData: shares,
      totalTopicHours: roundToSingleDecimal(secondsToHours(totalSeconds)),
    }
  }, [filteredSessions])

  const startHourData = React.useMemo(() => {
    const totalsByHour = new Map<number, number>()

    for (const session of filteredSessions) {
      const hourString = session.startTime.split(":")[0]
      const parsedHour = Number.parseInt(hourString, 10)
      if (Number.isNaN(parsedHour)) {
        continue
      }

      totalsByHour.set(
        parsedHour,
        (totalsByHour.get(parsedHour) ?? 0) + secondsToHours(session.effectiveTime)
      )
    }

    return Array.from(totalsByHour.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([hour, hours]) => ({
        time: formatStartHourLabel(hour),
        hours: roundToSingleDecimal(hours),
      }))
  }, [filteredSessions])

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
            onValueChange={(value) => {
              if (value === "week" || value === "month" || value === "year") {
                setPeriod(value)
              }
            }}
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
          <div className="flex items-center gap-2">
            {isDateFilterActive ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
                aria-label="Clear date filter"
              >
                <X className="size-4" />
              </Button>
            ) : null}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="size-4" />
                  <span className="hidden sm:inline">
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                          {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Select date range"
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
      </div>

      {/* Middle Row - Time Distribution & Subject Mastery */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Time Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Time Distribution</CardTitle>
            <CardDescription>Total effective hours by weekday</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[220px] w-full">
              <ChartContainer config={barChartConfig} className="h-full w-full">
                <BarChart data={timeDistributionData} accessibilityLayer>
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
            <CardDescription>Topic-time share in the selected range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="relative h-[180px] w-[180px] shrink-0">
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
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value, name) => (
                            <div className="flex w-full items-center justify-between gap-3">
                              <span className="text-muted-foreground">{String(name)}</span>
                              <span className="font-mono font-medium tabular-nums">
                                {typeof value === "number" ? `${value}%` : String(value)}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{formatHours(totalTopicHours)}h</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                </div>
              </div>
            </div>
            {subjectData.length === 0 ? (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                No subject data in the selected range.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Start Hour Focus */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Start Hour Focus</CardTitle>
            <CardDescription>Total effective hours by session start time</CardDescription>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <TrendingUp className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          {startHourData.length > 0 ? (
            <div className="h-[180px] w-full">
              <ChartContainer config={startHourChartConfig} className="h-full w-full">
                <AreaChart data={startHourData} accessibilityLayer>
                  <defs>
                    <linearGradient id="startHourGradient" x1="0" y1="0" x2="0" y2="1">
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
                    interval={0}
                  />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    fill="url(#startHourGradient)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
              No sessions in the selected range.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
