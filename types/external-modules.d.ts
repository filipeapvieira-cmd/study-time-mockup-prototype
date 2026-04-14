declare module "@next/env" {
  type EnvLogger = {
    info: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
  }

  export function loadEnvConfig(
    dir: string,
    dev?: boolean,
    log?: EnvLogger,
    forceReload?: boolean,
    onReload?: (envFilePath: string) => void
  ): unknown
}

declare module "react-big-calendar" {
  import * as React from "react"

  export type CalendarView = "month" | "week" | "day" | "agenda"

  export function dateFnsLocalizer(config: {
    format: (...args: any[]) => string
    parse: (...args: any[]) => Date
    startOfWeek: (...args: any[]) => Date
    getDay: (...args: any[]) => number
    locales: Record<string, unknown>
  }): unknown

  export const Calendar: React.ComponentType<{
    localizer: unknown
    events?: unknown[]
    view?: CalendarView
    views?: CalendarView[] | Record<string, boolean>
    date?: Date
    toolbar?: boolean
    allDaySlot?: boolean
    step?: number
    timeslots?: number
    selectable?: boolean
    dayPropGetter?: (date: Date) => {
      className?: string
      style?: React.CSSProperties
    }
    eventPropGetter?: (...args: unknown[]) => {
      className?: string
      style?: React.CSSProperties
    }
    components?: {
      event?: React.ComponentType<unknown>
    }
  }>
}
