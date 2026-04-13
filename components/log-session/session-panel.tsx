"use client"

import { useState, useEffect, useCallback } from "react"
import { Pause, Play, RotateCcw, Square, Save, Trash2, Plus, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { SESSION_TIMER_LABEL, TOPIC_LABEL } from "@/lib/session-labels"

interface Topic {
  id: string
  title: string
  time: number
  isActive: boolean
  isRunning: boolean
}

type SessionStatus = "stopped" | "playing" | "paused"

export function SessionPanel() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("stopped")
  const [time, setTime] = useState(0)
  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", title: "Untitled", time: 0, isActive: true, isRunning: false },
  ])
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const activeTopic = topics.find((t) => t.isActive)
  const isSessionPlaying = sessionStatus === "playing"

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isSessionPlaying) {
      interval = setInterval(() => {
        setTime((t) => t + 1)
        setTopics((prev) =>
          prev.map((topic) =>
            topic.isRunning ? { ...topic, time: topic.time + 1 } : topic
          )
        )
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSessionPlaying])

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  const stopAllTopicTimers = useCallback(() => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.isRunning ? { ...topic, isRunning: false } : topic
      )
    )
  }, [])

  const handleSessionPrimaryAction = () => {
    if (sessionStatus === "playing") {
      setSessionStatus("paused")
      stopAllTopicTimers()
      return
    }

    setSessionStatus("playing")
  }

  const resetTimer = () => {
    setSessionStatus("stopped")
    setTime(0)
    setTopics((prev) =>
      prev.map((topic) => ({ ...topic, time: 0, isRunning: false }))
    )
  }

  const stopSession = () => {
    setSessionStatus("stopped")
    stopAllTopicTimers()
  }

  const saveSession = () => {
    setSessionStatus("stopped")
    stopAllTopicTimers()
  }

  const toggleTopicTimer = (topicId: string) => {
    if (sessionStatus !== "playing") return

    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? { ...topic, isRunning: !topic.isRunning }
          : topic
      )
    )
  }

  const addTopic = () => {
    const newTopic: Topic = {
      id: Date.now().toString(),
      title: `${TOPIC_LABEL} ${topics.length + 1}`,
      time: 0,
      isActive: false,
      isRunning: false,
    }
    setTopics((prev) => [...prev, newTopic])
  }

  const deleteTopic = (id: string) => {
    if (topics.length === 1) return
    const topicToDelete = topics.find((t) => t.id === id)
    const newTopics = topics.filter((t) => t.id !== id)

    if (topicToDelete?.isActive && newTopics.length > 0) {
      newTopics[0].isActive = true
    }
    setTopics(newTopics)
  }

  const setActiveTopic = (id: string) => {
    setTopics((prev) =>
      prev.map((topic) => ({
        ...topic,
        isActive: topic.id === id,
      }))
    )
  }

  const startEditingTopic = (topic: Topic) => {
    setEditingTopicId(topic.id)
    setEditingTitle(topic.title)
  }

  const saveTopicTitle = () => {
    if (editingTopicId && editingTitle.trim()) {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === editingTopicId ? { ...t, title: editingTitle.trim() } : t
        )
      )
    }
    setEditingTopicId(null)
    setEditingTitle("")
  }

  const cancelEditingTopic = () => {
    setEditingTopicId(null)
    setEditingTitle("")
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Session Timer Group */}
      <SidebarGroup className="px-3 py-2">
        <SidebarGroupLabel className="mb-3 px-0 text-[10px] font-semibold uppercase tracking-widest text-foreground group-data-[collapsible=icon]:hidden">
          {SESSION_TIMER_LABEL}
        </SidebarGroupLabel>
        <SidebarGroupContent className="space-y-4">
          {/* Timer Display Card */}
          <div className="rounded-lg bg-muted/40 p-4">
            <div className="text-center">
              <div className="font-mono text-2xl font-bold tracking-tight tabular-nums dark:font-medium">
                {formatTime(time)}
              </div>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {sessionStatus === "playing"
                  ? "Recording"
                  : sessionStatus === "paused"
                    ? "Paused"
                    : "Ready"}
              </p>
            </div>
          </div>

          {/* Session Control Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={handleSessionPrimaryAction}
              variant="default"
              size="icon-sm"
              className="rounded-md shadow-sm"
              title={
                isSessionPlaying
                  ? "Pause session"
                  : sessionStatus === "paused"
                    ? "Resume session"
                    : "Start session"
              }
              aria-label={
                isSessionPlaying
                  ? "Pause session"
                  : sessionStatus === "paused"
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
                  : sessionStatus === "paused"
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
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button
              variant="default"
              size="icon-sm"
              onClick={stopSession}
              className="rounded-md shadow-sm"
              title="Stop session"
            >
              <Square className="size-4" />
            </Button>
            <Button
              variant="default"
              size="icon-sm"
              onClick={saveSession}
              className="rounded-md shadow-sm"
              title="Save session"
            >
              <Save className="size-4" />
            </Button>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Divider */}
      <div className="mx-3 border-t border-border/50" />

      {/* Topic Group */}
      <SidebarGroup className="flex-1 px-3 py-2">
        <SidebarGroupLabel className="mb-3 px-0 text-[10px] font-semibold uppercase tracking-widest text-foreground group-data-[collapsible=icon]:hidden">
          {TOPIC_LABEL}
        </SidebarGroupLabel>
        <SidebarGroupContent className="space-y-3">
          {/* Topic Selector Row */}
          <div className="flex min-w-0 items-center gap-2">
            <Select
              value={activeTopic?.id}
              onValueChange={(value) => setActiveTopic(value)}
            >
              <SelectTrigger className="min-w-0 flex-1 rounded-md border-input bg-background text-foreground shadow-xs">
                <SelectValue placeholder={`Select ${TOPIC_LABEL.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 rounded-md border-input bg-background text-foreground shadow-xs hover:bg-accent"
              onClick={addTopic}
              title="Add new topic"
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {/* Selected Topic Card */}
          {activeTopic && (
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
              <div className="p-3">
                {editingTopicId === activeTopic.id ? (
                  /* Editing Mode */
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="h-8 flex-1 rounded-md border-input bg-background text-sm text-foreground shadow-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveTopicTitle()
                        if (e.key === "Escape") cancelEditingTopic()
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={saveTopicTitle}
                      className="size-7 shrink-0 rounded-md text-foreground hover:bg-accent"
                    >
                      <Check className="size-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={cancelEditingTopic}
                      className="size-7 shrink-0 rounded-md text-foreground hover:bg-accent"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  /* View Mode - Title Row */
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {activeTopic.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditingTopic(activeTopic)}
                        className="size-7 rounded-md text-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTopic(activeTopic.id)}
                        disabled={topics.length === 1}
                        className="size-7 rounded-md text-foreground hover:bg-accent hover:text-destructive disabled:opacity-40"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Topic Timer Display */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggleTopicTimer(activeTopic.id)}
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
                    {formatTime(activeTopic.time)}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}
