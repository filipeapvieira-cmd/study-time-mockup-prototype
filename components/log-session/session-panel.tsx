"use client"

import { useCallback, useMemo } from "react"
import { Pause, Play, RotateCcw, Square, Save, Trash2, Plus } from "lucide-react"

import { useLogSessionDraft } from "@/components/log-session/log-session-draft-provider"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import {
  getActiveTopic,
  getTopicLabel,
} from "@/lib/log-session-draft"
import { SESSION_TIMER_LABEL, TOPIC_LABEL } from "@/lib/session-labels"

type TopicItem = {
  id: string
  label: string
}

export function SessionPanel() {
  const { state, actions } = useLogSessionDraft()

  const activeTopic = getActiveTopic(state)
  const isSessionPlaying = state.sessionStatus === "playing"

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  const topicItems = useMemo<TopicItem[]>(
    () =>
      state.topicOrder
        .map((topicId, index) => {
          const topic = state.topicsById[topicId]
          if (!topic) {
            return null
          }

          return {
            id: topicId,
            label: getTopicLabel(topic, { subjects: state.subjects }, index + 1),
          }
        })
        .filter((topic): topic is TopicItem => Boolean(topic)),
    [state.subjects, state.topicOrder, state.topicsById],
  )

  const activeTopicLabel = useMemo(() => {
    if (!activeTopic) {
      return "Topic 1"
    }

    const activeIndex = state.topicOrder.indexOf(activeTopic.id)
    return getTopicLabel(
      activeTopic,
      { subjects: state.subjects },
      activeIndex >= 0 ? activeIndex + 1 : 1,
    )
  }, [activeTopic, state.subjects, state.topicOrder])

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

  if (!activeTopic) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
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

      <div className="mx-3 border-t border-border/50" />

      <SidebarGroup className="flex-1 px-3 py-2">
        <SidebarGroupLabel className="mb-3 px-0 text-[10px] font-semibold uppercase tracking-widest text-foreground group-data-[collapsible=icon]:hidden">
          {TOPIC_LABEL}
        </SidebarGroupLabel>
        <SidebarGroupContent className="space-y-3">
          <div className="flex min-w-0 items-center gap-2">
            <Select value={activeTopic.id} onValueChange={actions.selectTopic}>
              <SelectTrigger
                className="min-w-0 flex-1 rounded-md border-input bg-background text-foreground shadow-xs"
                aria-label={`Select ${TOPIC_LABEL.toLowerCase()}`}
              >
                <SelectValue placeholder={`Select ${TOPIC_LABEL.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {topicItems.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 rounded-md border-input bg-background text-foreground shadow-xs hover:bg-accent"
              onClick={actions.addTopic}
              title="Add new topic"
              aria-label="Add new topic"
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
            <div className="p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                  {activeTopicLabel}
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => actions.deleteTopic(activeTopic.id)}
                    disabled={state.topicOrder.length === 1}
                    className="size-7 rounded-md text-foreground hover:bg-accent hover:text-destructive disabled:opacity-40"
                    aria-label="Delete topic"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => actions.toggleTopicTimer(activeTopic.id)}
                disabled={!isSessionPlaying}
                className="mt-3 h-auto w-full justify-between rounded-md border-input bg-muted px-3 py-2 text-foreground shadow-none hover:bg-background hover:text-foreground disabled:bg-muted disabled:text-foreground disabled:opacity-60"
                title={activeTopic.isRunning ? "Pause topic timer" : "Start topic timer"}
                aria-label={activeTopic.isRunning ? "Pause topic timer" : "Start topic timer"}
                aria-pressed={activeTopic.isRunning}
              >
                <span className="flex items-center">
                  {activeTopic.isRunning ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {formatTime(activeTopic.durationSeconds)}
                </span>
              </Button>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}
