"use client"

import React from "react"
import {
  addSeconds,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  getYear,
  parse,
  parseISO,
  startOfWeek,
} from "date-fns"
import { enUS } from "date-fns/locale"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StudySession } from "@/types/session"

type StudyActivityPeriod = "week" | "month" | "year"
type StudyActivityDateRange = {
  from: Date | undefined
  to: Date | undefined
}

type StudyActivityCalendarProps = {
  period: StudyActivityPeriod
  activeRange: StudyActivityDateRange
  filteredSessions: StudySession[]
  latestSessionDate: Date | undefined
}

type StudyActivityEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
}

type YearCell = {
  key: string
  date: Date
  inMonth: boolean
  inRange: boolean
  isActive: boolean
}

const WEEK_STARTS_ON = 1
const WEEKDAY_SHORT = ["M", "T", "W", "T", "F", "S", "S"] as const

const calendarLocalizer = dateFnsLocalizer({
  format,
  parse: (value, formatString) => parse(value, formatString, new Date()),
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
  getDay,
  locales: {
    "en-US": enUS,
  },
})

function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

function isDateWithinRange(
  dateKey: string,
  fromKey: string | null,
  toKey: string | null
): boolean {
  if (fromKey && dateKey < fromKey) {
    return false
  }

  if (toKey && dateKey > toKey) {
    return false
  }

  return true
}

function chunkByWeek(cells: YearCell[]): YearCell[][] {
  const result: YearCell[][] = []
  for (let index = 0; index < cells.length; index += 7) {
    result.push(cells.slice(index, index + 7))
  }
  return result
}

function buildDateTime(dateKey: string, time: string): Date {
  const [hoursRaw, minutesRaw] = time.split(":")
  const hours = Number.parseInt(hoursRaw ?? "0", 10)
  const minutes = Number.parseInt(minutesRaw ?? "0", 10)
  const date = parseISO(dateKey)
  date.setHours(
    Number.isNaN(hours) ? 0 : hours,
    Number.isNaN(minutes) ? 0 : minutes,
    0,
    0
  )
  return date
}

export function StudyActivityCalendar({
  period,
  activeRange,
  filteredSessions,
  latestSessionDate,
}: StudyActivityCalendarProps) {
  const activeByDate = React.useMemo(() => {
    const totals = new Map<string, number>()

    for (const session of filteredSessions) {
      if (session.effectiveTime <= 0) {
        continue
      }

      totals.set(session.date, (totals.get(session.date) ?? 0) + session.effectiveTime)
    }

    return totals
  }, [filteredSessions])

  const activeDateKeys = React.useMemo(
    () => new Set(Array.from(activeByDate.keys())),
    [activeByDate]
  )

  const rangeStartKey = React.useMemo(
    () => (activeRange.from ? toDateKey(activeRange.from) : null),
    [activeRange.from]
  )
  const rangeEndKey = React.useMemo(
    () => (activeRange.to ? toDateKey(activeRange.to) : null),
    [activeRange.to]
  )

  const calendarAnchorDate = React.useMemo(
    () => activeRange.from ?? activeRange.to ?? latestSessionDate ?? new Date(),
    [activeRange.from, activeRange.to, latestSessionDate]
  )

  const calendarEvents = React.useMemo<StudyActivityEvent[]>(
    () => {
      if (period === "week") {
        return filteredSessions
          .filter((session) => session.effectiveTime > 0)
          .map((session) => {
            const start = buildDateTime(session.date, session.startTime)
            const end = addSeconds(start, session.effectiveTime)

            return {
              id: `study-activity-session-${session.id}`,
              title: "Study activity",
              start,
              end,
              allDay: false,
            }
          })
          .sort((left, right) => left.start.getTime() - right.start.getTime())
      }

      // Month view uses background-highlight only; no separate event bars.
      return []
    },
    [filteredSessions, period]
  )

  const dayPropGetter = React.useCallback(
    (date: Date) => {
      const dateKey = toDateKey(date)
      if (!isDateWithinRange(dateKey, rangeStartKey, rangeEndKey)) {
        return {
          className: "analytics-activity-calendar__day--out-of-range",
          style: {
            backgroundColor:
              "color-mix(in oklch, var(--muted) 55%, var(--background))",
            color:
              "color-mix(in oklch, var(--foreground) 70%, var(--muted-foreground))",
          },
        }
      }

      if (period === "week") {
        return {
          className: "analytics-activity-calendar__day--inactive",
          style: {
            backgroundColor: "var(--background)",
          },
        }
      }

      if (activeDateKeys.has(dateKey)) {
        return {
          className: "analytics-activity-calendar__day--active",
          style: {
            backgroundColor:
              "color-mix(in oklch, var(--chart-2) 16%, var(--background))",
          },
        }
      }

      return {
        className: "analytics-activity-calendar__day--inactive",
        style: {
          backgroundColor: "var(--muted)",
        },
      }
    },
    [activeDateKeys, period, rangeEndKey, rangeStartKey]
  )

  const eventPropGetter = React.useCallback(() => {
    return {
      className: "analytics-activity-calendar__event",
      style: {
        backgroundColor: "var(--chart-2)",
        borderColor: "var(--chart-2)",
        color: "transparent",
      },
    }
  }, [])

  const yearToRender = React.useMemo(
    () => getYear(calendarAnchorDate),
    [calendarAnchorDate]
  )

  const yearMonthGrid = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthStart = new Date(yearToRender, monthIndex, 1)
      const monthEnd = endOfMonth(monthStart)
      const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON })
      const gridEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON })
      const cells = eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
        const dateKey = toDateKey(date)
        const inMonth = date.getMonth() === monthIndex
        const inRange =
          inMonth && isDateWithinRange(dateKey, rangeStartKey, rangeEndKey)

        return {
          key: dateKey,
          date,
          inMonth,
          inRange,
          isActive: inRange && activeDateKeys.has(dateKey),
        }
      })

      return {
        label: format(monthStart, "MMMM"),
        weeks: chunkByWeek(cells),
      }
    })
  }, [activeDateKeys, rangeEndKey, rangeStartKey, yearToRender])

  const calendarView = period === "week" ? "week" : "month"

  return (
    <Card className="min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Study Activity Calendar</CardTitle>
        <CardDescription>Daily activity in the selected analytics range</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-3 rounded-[3px] border"
              style={{
                backgroundColor: "var(--chart-2)",
                borderColor: "var(--chart-2)",
              }}
            />
            Active
          </div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-3 rounded-[3px] border"
              style={{
                backgroundColor: "var(--muted)",
                borderColor: "var(--border)",
              }}
            />
            No activity
          </div>
        </div>

        {period === "year" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {yearMonthGrid.map((month) => (
              <section key={month.label} className="rounded-md border border-border p-3">
                <h3 className="mb-2 text-xs font-medium text-foreground">{month.label}</h3>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
                  {WEEKDAY_SHORT.map((dayLabel, index) => (
                    <span key={`${month.label}-${dayLabel}-${index}`}>{dayLabel}</span>
                  ))}
                </div>
                <div className="mt-1 space-y-1">
                  {month.weeks.map((week, weekIndex) => (
                    <div key={`${month.label}-week-${weekIndex}`} className="grid grid-cols-7 gap-1">
                      {week.map((cell) => (
                        <div
                          key={`${month.label}-${cell.key}`}
                          aria-label={format(cell.date, "MMM dd, yyyy")}
                          className="flex aspect-square items-center justify-center rounded-[4px] border text-[10px] font-medium"
                          style={
                            !cell.inMonth
                              ? {
                                  backgroundColor: "transparent",
                                  borderColor: "transparent",
                                  color: "transparent",
                                }
                              : cell.isActive
                                ? {
                                    backgroundColor: "var(--chart-2)",
                                    borderColor: "var(--chart-2)",
                                    color: "var(--background)",
                                  }
                                : cell.inRange
                                  ? {
                                      backgroundColor: "var(--muted)",
                                      borderColor: "var(--border)",
                                      color: "var(--muted-foreground)",
                                    }
                                  : {
                                      backgroundColor:
                                        "color-mix(in oklch, var(--muted) 55%, var(--background))",
                                      borderColor: "var(--border)",
                                      color:
                                        "color-mix(in oklch, var(--foreground) 70%, var(--muted-foreground))",
                                    }
                          }
                        >
                          {cell.inMonth ? format(cell.date, "d") : ""}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="analytics-activity-calendar rounded-md border border-border p-1">
            <BigCalendar
              localizer={calendarLocalizer}
              events={calendarEvents}
              view={calendarView}
              views={["week", "month"]}
              date={calendarAnchorDate}
              toolbar={false}
              allDaySlot={period !== "week"}
              step={period === "week" ? 60 : 30}
              timeslots={1}
              selectable={false}
              dayPropGetter={dayPropGetter}
              eventPropGetter={eventPropGetter}
              components={{
                event: () => <span className="sr-only">Study activity</span>,
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
