"use client"

import { useCallback } from "react"
import { Pause, Play, RotateCcw, Save, Square } from "lucide-react"

import { useLogSessionDraft } from "@/components/log-session/log-session-draft-provider"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { SESSION_TIMER_LABEL } from "@/lib/session-labels"

export function SessionPanel() {
  const { state, actions } = useLogSessionDraft()
  const isSessionPlaying = state.sessionStatus === "playing"

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  const handleSessionPrimaryAction = () => {
    actions.toggleSession()
  }

  const resetTimer = () => {
    actions.resetSession()
  }

  const stopSession = () => {
    actions.stopSession()
  }

  const saveSession = () => {
    actions.stopSession()
  }

  return (
    <SidebarGroup className="px-3 py-2">
      <SidebarGroupLabel className="mb-3 px-0 text-[10px] font-semibold uppercase tracking-widest text-foreground group-data-[collapsible=icon]:hidden">
        {SESSION_TIMER_LABEL}
      </SidebarGroupLabel>
      <SidebarGroupContent className="space-y-4">
        <div className="rounded-lg bg-muted/40 p-4">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold tracking-tight tabular-nums dark:font-medium">
              {formatTime(state.sessionElapsedSeconds)}
            </div>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {state.sessionStatus === "playing"
                ? "Recording"
                : state.sessionStatus === "paused"
                  ? "Paused"
                  : "Ready"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={handleSessionPrimaryAction}
            variant="default"
            size="icon-sm"
            className="rounded-md shadow-sm"
            title={
              isSessionPlaying
                ? "Pause session"
                : state.sessionStatus === "paused"
                  ? "Resume session"
                  : "Start session"
            }
            aria-label={
              isSessionPlaying
                ? "Pause session"
                : state.sessionStatus === "paused"
                  ? "Resume session"
                  : "Start session"
            }
            aria-pressed={isSessionPlaying}
          >
            {isSessionPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            <span className="sr-only">
              {isSessionPlaying
                ? "Pause session"
                : state.sessionStatus === "paused"
                  ? "Resume session"
                  : "Start session"}
            </span>
          </Button>
          <Button
            variant="default"
            size="icon-sm"
            onClick={resetTimer}
            className="rounded-md shadow-sm"
            title="Reset timer"
            aria-label="Reset timer"
          >
            <RotateCcw className="size-4" />
          </Button>
          <Button
            variant="default"
            size="icon-sm"
            onClick={stopSession}
            className="rounded-md shadow-sm"
            title="Stop session"
            aria-label="Stop session"
          >
            <Square className="size-4" />
          </Button>
          <Button
            variant="default"
            size="icon-sm"
            onClick={saveSession}
            className="rounded-md shadow-sm"
            title="Save session"
            aria-label="Save session"
          >
            <Save className="size-4" />
          </Button>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
