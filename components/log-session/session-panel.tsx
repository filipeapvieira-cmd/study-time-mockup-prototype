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

interface Topic {
  id: string
  title: string
  time: number
  isActive: boolean
}

export function SessionPanel() {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", title: "Untitled", time: 0, isActive: true },
  ])
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const activeTopic = topics.find((t) => t.isActive)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning) {
      interval = setInterval(() => {
        setTime((t) => t + 1)
        setTopics((prev) =>
          prev.map((topic) =>
            topic.isActive ? { ...topic, time: topic.time + 1 } : topic
          )
        )
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  const toggleTimer = () => setIsRunning(!isRunning)

  const resetTimer = () => {
    setIsRunning(false)
    setTime(0)
    setTopics((prev) =>
      prev.map((topic) => (topic.isActive ? { ...topic, time: 0 } : topic))
    )
  }

  const stopSession = () => {
    setIsRunning(false)
  }

  const saveSession = () => {
    setIsRunning(false)
  }

  const addTopic = () => {
    const newTopic: Topic = {
      id: Date.now().toString(),
      title: `Topic ${topics.length + 1}`,
      time: 0,
      isActive: false,
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
          Session Timer
        </SidebarGroupLabel>
        <SidebarGroupContent className="space-y-4">
          {/* Timer Display Card */}
          <div className="rounded-lg bg-muted/40 p-4">
            <div className="text-center">
              <div className="font-mono text-2xl font-bold tracking-tight tabular-nums">
                {formatTime(time)}
              </div>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {isRunning ? "Recording" : "Ready"}
              </p>
            </div>
          </div>

          {/* Play/Pause Button */}
          <Button
            onClick={toggleTimer}
            variant={isRunning ? "secondary" : "default"}
            className="h-10 w-full gap-2 rounded-md text-sm font-medium shadow-sm"
          >
            {isRunning ? (
              <>
                <Pause className="size-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="size-4" />
                Start Session
              </>
            )}
          </Button>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetTimer}
              className="size-8 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Reset timer"
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={stopSession}
              className="size-8 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Stop session"
            >
              <Square className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={saveSession}
              className="size-8 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
          Topic
        </SidebarGroupLabel>
        <SidebarGroupContent className="space-y-3">
          {/* Topic Selector Row */}
          <div className="flex items-center gap-2">
            <Select
              value={activeTopic?.id}
              onValueChange={(value) => setActiveTopic(value)}
            >
              <SelectTrigger className="flex-1 rounded-md border-muted-foreground bg-background text-foreground shadow-xs">
                <SelectValue placeholder="Select topic" />
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
              className="shrink-0 rounded-md border-muted-foreground bg-background text-foreground shadow-xs hover:bg-accent"
              onClick={addTopic}
              title="Add new topic"
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {/* Selected Topic Card */}
          {activeTopic && (
            <div className="overflow-hidden rounded-lg border border-muted-foreground bg-card shadow-xs">
              <div className="p-3">
                {editingTopicId === activeTopic.id ? (
                  /* Editing Mode */
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="h-8 flex-1 rounded-md border-muted-foreground bg-background text-sm text-foreground shadow-xs"
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
                <div className="mt-3 flex items-center justify-between rounded-md border border-muted-foreground bg-muted px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
                    Time on topic
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {formatTime(activeTopic.time)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  )
}
