"use client"

import { Play, RotateCcw, Save, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { SESSION_TIMER_LABEL } from "@/lib/session-labels"

export function SessionTimerShellPanel() {
  return (
    <SidebarGroup className="px-3 py-2">
      <SidebarGroupLabel className="mb-3 px-0 text-[10px] font-semibold uppercase tracking-widest text-foreground group-data-[collapsible=icon]:hidden">
        {SESSION_TIMER_LABEL}
      </SidebarGroupLabel>

      <SidebarGroupContent className="space-y-4">
        <div className="rounded-lg bg-muted/40 p-4">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold tracking-tight tabular-nums dark:font-medium">
              00:00:00
            </div>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ready
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="default"
            size="icon-sm"
            className="rounded-md shadow-sm"
            aria-label="Start session timer"
            title="Start session timer"
            disabled
          >
            <Play className="size-4" />
          </Button>

          <Button
            variant="default"
            size="icon-sm"
            className="rounded-md shadow-sm"
            aria-label="Reset session timer"
            title="Reset session timer"
            disabled
          >
            <RotateCcw className="size-4" />
          </Button>

          <Button
            variant="default"
            size="icon-sm"
            className="rounded-md shadow-sm"
            aria-label="Stop session timer"
            title="Stop session timer"
            disabled
          >
            <Square className="size-4" />
          </Button>

          <Button
            variant="default"
            size="icon-sm"
            className="rounded-md shadow-sm"
            aria-label="Save session"
            title="Save session"
            disabled
          >
            <Save className="size-4" />
          </Button>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
