"use client"

import * as React from "react"
import {
  Check,
  X,
  AlertTriangle,
  Clock,
  Pause,
  Play,
  Plus,
  Pencil,
  Trash2,
  Save,
} from "lucide-react"

import { HashtagMultiSelect } from "@/components/session-fields/hashtag-multi-select"
import { SessionReflectionField } from "@/components/session-fields/session-reflection-field"
import { SubjectSelect } from "@/components/session-fields/subject-select"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldGroup, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { SESSION_TIMER_LABEL, TOPIC_LABEL } from "@/lib/session-labels"
import {
  cloneTagItems,
  getTagItemByValue,
  PROTOTYPE_HASHTAGS,
  PROTOTYPE_SUBJECTS,
} from "@/lib/study-taxonomy"
import { cn } from "@/lib/utils"
import type { TagItem } from "@/types/tag"
import {
  type StudySession,
  type SessionTopic,
  formatSecondsToDuration,
  calculateEffectiveTime,
  validateSessionTimes,
} from "@/types/session"

interface SessionEditorSheetProps {
  session: StudySession | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (session: StudySession) => void
  onDelete: (sessionId: string) => void
}

type DurationParts = {
  h: number
  m: number
  s: number
}

function durationToParts(duration: number): DurationParts {
  return {
    h: Math.floor(duration / 3600),
    m: Math.floor((duration % 3600) / 60),
    s: duration % 60,
  }
}

function partsToDuration(parts: DurationParts): number {
  return parts.h * 3600 + parts.m * 60 + parts.s
}

export function SessionEditorSheet({
  session,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: SessionEditorSheetProps) {
  const [selectedSubject, setSelectedSubject] = React.useState("")
  const [selectedHashtags, setSelectedHashtags] = React.useState<string[]>([])
  const [reflection, setReflection] = React.useState("")

  const [startTime, setStartTime] = React.useState("09:00")
  const [endTime, setEndTime] = React.useState("10:00")
  const [pauseMinutes, setPauseMinutes] = React.useState(0)
  const [pauseSeconds, setPauseSeconds] = React.useState(0)

  const [topics, setTopics] = React.useState<SessionTopic[]>([])
  const [selectedTopicId, setSelectedTopicId] = React.useState<string | null>(null)
  const [editTopicDuration, setEditTopicDuration] = React.useState<DurationParts>({
    h: 0,
    m: 0,
    s: 0,
  })
  const [isEditingTopic, setIsEditingTopic] = React.useState(false)
  const [isAddingTopic, setIsAddingTopic] = React.useState(false)
  const [isTopicLoading, setIsTopicLoading] = React.useState(false)

  const [timeError, setTimeError] = React.useState<string | null>(null)
  const [subjects, setSubjects] = React.useState<TagItem[]>(() =>
    cloneTagItems(PROTOTYPE_SUBJECTS),
  )
  const [hashtags, setHashtags] = React.useState<TagItem[]>(() =>
    cloneTagItems(PROTOTYPE_HASHTAGS),
  )
  const topicLoadTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadTopicIntoForm = React.useCallback((topic?: SessionTopic | null) => {
    setSelectedSubject(topic?.subject ?? "")
    setSelectedHashtags(topic?.hashtags ?? [])
    setReflection(topic?.reflection ?? "")
    setEditTopicDuration(durationToParts(topic?.duration ?? 0))
  }, [])

  const selectedTopic = React.useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) ?? null,
    [selectedTopicId, topics],
  )

  const isTopicEditable = isEditingTopic || isAddingTopic
  const pauseTimeSeconds = pauseMinutes * 60 + pauseSeconds
  const effectiveTime = calculateEffectiveTime(startTime, endTime, pauseTimeSeconds)
  const topicDurationSeconds = partsToDuration(editTopicDuration)

  const availableSubjects = React.useMemo(() => {
    const usedSubjects = new Set(
      topics
        .filter((topic) => topic.id !== selectedTopicId)
        .map((topic) => topic.subject),
    )

    return subjects.filter(
      (subject) => subject.value === selectedSubject || !usedSubjects.has(subject.value),
    )
  }, [selectedSubject, selectedTopicId, subjects, topics])

  const canAddTopic = React.useMemo(
    () => subjects.some((subject) => !topics.some((topic) => topic.subject === subject.value)),
    [subjects, topics],
  )

  const topicValidationMessage = React.useMemo(() => {
    if (!selectedSubject) {
      return "Choose a subject for this topic."
    }

    const duplicateSubject = topics.some(
      (topic) => topic.id !== selectedTopicId && topic.subject === selectedSubject,
    )

    if (duplicateSubject) {
      return "This subject is already used in this session."
    }

    return null
  }, [selectedSubject, selectedTopicId, topics])

  React.useEffect(() => {
    if (!open || !session) return

    if (topicLoadTimeoutRef.current) {
      clearTimeout(topicLoadTimeoutRef.current)
      topicLoadTimeoutRef.current = null
    }

    const initialTopics = session.topics
    const initialTopic = initialTopics[0] ?? null

    loadTopicIntoForm(initialTopic)
    setStartTime(session.startTime)
    setEndTime(session.endTime)
    setPauseMinutes(Math.floor(session.pauseTime / 60))
    setPauseSeconds(session.pauseTime % 60)
    setTopics(initialTopics)
    setSelectedTopicId(initialTopic?.id ?? null)
    setIsEditingTopic(false)
    setIsAddingTopic(false)
    setIsTopicLoading(false)
    setTimeError(null)
  }, [loadTopicIntoForm, open, session])

  React.useEffect(() => {
    if (open) return

    if (topicLoadTimeoutRef.current) {
      clearTimeout(topicLoadTimeoutRef.current)
      topicLoadTimeoutRef.current = null
    }

    setIsTopicLoading(false)
  }, [open])

  React.useEffect(() => {
    return () => {
      if (topicLoadTimeoutRef.current) {
        clearTimeout(topicLoadTimeoutRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    const validation = validateSessionTimes(startTime, endTime, pauseTimeSeconds)
    setTimeError(validation.valid ? null : validation.error ?? null)
  }, [startTime, endTime, pauseTimeSeconds])

  const buildTopicFromForm = React.useCallback(
    (topicId: string): SessionTopic => {
      const subjectData = getTagItemByValue(subjects, selectedSubject)

      return {
        id: topicId,
        duration: topicDurationSeconds,
        subject: selectedSubject,
        subjectLabel: subjectData?.label ?? "",
        subjectColor: subjectData?.color ?? "",
        hashtags: selectedHashtags,
        reflection,
      }
    },
    [reflection, selectedHashtags, selectedSubject, subjects, topicDurationSeconds],
  )

  const commitSelectedTopic = React.useCallback(
    (sourceTopics: SessionTopic[]) => {
      if (!selectedTopicId || topicValidationMessage) {
        return sourceTopics
      }

      const updatedTopic = buildTopicFromForm(selectedTopicId)

      return sourceTopics.map((topic) =>
        topic.id === selectedTopicId ? updatedTopic : topic,
      )
    },
    [buildTopicFromForm, selectedTopicId, topicValidationMessage],
  )

  const startEditTopic = () => {
    if (!selectedTopic) return

    loadTopicIntoForm(selectedTopic)
    setIsAddingTopic(false)
    setIsEditingTopic(true)
  }

  const startAddTopic = () => {
    if (!canAddTopic) return

    const nextSubject = subjects.find(
      (subject) => !topics.some((topic) => topic.subject === subject.value),
    )

    if (!nextSubject) return

    const draftTopic: SessionTopic = {
      id: crypto.randomUUID(),
      duration: 0,
      subject: nextSubject.value,
      subjectLabel: nextSubject.label,
      subjectColor: nextSubject.color,
      hashtags: [],
      reflection: "",
    }

    setTopics((prev) => [...prev, draftTopic])
    setSelectedTopicId(draftTopic.id)
    loadTopicIntoForm(draftTopic)
    setIsAddingTopic(true)
    setIsEditingTopic(true)
    setIsTopicLoading(false)
  }

  const saveTopicEdit = () => {
    if (!selectedTopicId || topicValidationMessage) return

    const nextTopics = commitSelectedTopic(topics)
    const committedTopic = nextTopics.find((topic) => topic.id === selectedTopicId) ?? null

    setTopics(nextTopics)
    loadTopicIntoForm(committedTopic)
    setIsEditingTopic(false)
    setIsAddingTopic(false)
  }

  const cancelTopicEdit = () => {
    if (isAddingTopic && selectedTopicId) {
      const remainingTopics = topics.filter((topic) => topic.id !== selectedTopicId)
      const nextTopic = remainingTopics[0] ?? null

      setTopics(remainingTopics)
      setSelectedTopicId(nextTopic?.id ?? null)
      loadTopicIntoForm(nextTopic)
    } else {
      loadTopicIntoForm(selectedTopic)
    }

    setIsEditingTopic(false)
    setIsAddingTopic(false)
  }

  const deleteTopic = () => {
    if (!selectedTopicId || topics.length <= 1) return

    if (topicLoadTimeoutRef.current) {
      clearTimeout(topicLoadTimeoutRef.current)
      topicLoadTimeoutRef.current = null
    }

    const currentIndex = topics.findIndex((topic) => topic.id === selectedTopicId)
    const remainingTopics = topics.filter((topic) => topic.id !== selectedTopicId)
    const nextTopic =
      remainingTopics[Math.max(0, currentIndex - 1)] ?? remainingTopics[0] ?? null

    setTopics(remainingTopics)
    setSelectedTopicId(nextTopic?.id ?? null)
    loadTopicIntoForm(nextTopic)
    setIsEditingTopic(false)
    setIsAddingTopic(false)
    setIsTopicLoading(false)
  }

  const handleSave = () => {
    if (!session || timeError || !selectedTopicId || topicValidationMessage) return

    const nextTopics = isTopicEditable ? commitSelectedTopic(topics) : topics

    const updatedSession: StudySession = {
      ...session,
      startTime,
      endTime,
      pauseTime: pauseTimeSeconds,
      effectiveTime,
      topics: nextTopics,
      updatedAt: new Date().toISOString(),
    }

    onSave(updatedSession)
  }

  const handleDelete = () => {
    if (!session) return
    onDelete(session.id)
  }

  const handleTopicSelect = (value: string) => {
    if (value === selectedTopicId || isTopicEditable) return

    const topic = topics.find((item) => item.id === value)

    if (!topic) return

    if (topicLoadTimeoutRef.current) {
      clearTimeout(topicLoadTimeoutRef.current)
    }

    setIsTopicLoading(true)
    topicLoadTimeoutRef.current = setTimeout(() => {
      setSelectedTopicId(value)
      loadTopicIntoForm(topic)
      setIsTopicLoading(false)
      topicLoadTimeoutRef.current = null
    }, 350)
  }

  if (!session) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden p-0 sm:max-w-2xl md:max-w-3xl"
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <SheetHeader className="shrink-0 border-b px-6 pt-6 pb-4">
            <SheetTitle className="text-xl">Edit Session</SheetTitle>
            <SheetDescription>
              {session.date} &middot; {formatSecondsToDuration(effectiveTime)} recorded
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-6 px-6 py-6">
              <section>
                <h3 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Topic Metadata
                </h3>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldTitle>Subject</FieldTitle>
                    <FieldContent>
                      <div className={cn(!isTopicEditable && "pointer-events-none opacity-80")}>
                        <SubjectSelect
                          subjects={availableSubjects}
                          hashtags={hashtags}
                          value={selectedSubject}
                          onChange={setSelectedSubject}
                          onSubjectsChange={setSubjects}
                          onHashtagsChange={setHashtags}
                        />
                      </div>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldTitle>Hashtags</FieldTitle>
                    <FieldContent>
                      <div className={cn(!isTopicEditable && "pointer-events-none opacity-80")}>
                        <HashtagMultiSelect
                          subjects={subjects}
                          hashtags={hashtags}
                          value={selectedHashtags}
                          onChange={setSelectedHashtags}
                          onSubjectsChange={setSubjects}
                          onHashtagsChange={setHashtags}
                        />
                      </div>
                    </FieldContent>
                  </Field>
                </FieldGroup>

                {topicValidationMessage ? (
                  <div className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertTriangle className="size-4 shrink-0" />
                    {topicValidationMessage}
                  </div>
                ) : null}
              </section>

              <Separator />

              <section>
                <h3 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Reflection
                </h3>
                <div className={cn(!isTopicEditable && "pointer-events-none opacity-80")}>
                  <SessionReflectionField
                    value={reflection}
                    onChange={setReflection}
                    placeholder="Your topic reflection..."
                  />
                </div>
              </section>

              <Separator />

            <section>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                {SESSION_TIMER_LABEL}
              </h3>

              {timeError ? (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="size-4 shrink-0" />
                  {timeError}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="start-time" className="flex items-center gap-2 text-xs">
                    <Play className="size-3" />
                    Start
                  </label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="end-time" className="flex items-center gap-2 text-xs">
                    <Clock className="size-3" />
                    End
                  </label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-xs">
                    <Pause className="size-3" />
                    Paused (m/s)
                  </span>
                  <InputGroup
                    aria-label="Paused duration"
                    data-invalid={timeError ? "true" : undefined}
                    className="h-9"
                  >
                    <InputGroupInput
                      type="number"
                      min={0}
                      value={pauseMinutes}
                      onChange={(event) =>
                        setPauseMinutes(Math.max(0, parseInt(event.target.value, 10) || 0))
                      }
                      className="min-w-0 basis-0 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="mm"
                      aria-label="Paused minutes"
                    />
                    <InputGroupText className="shrink-0 px-1 font-medium tabular-nums">
                      :
                    </InputGroupText>
                    <InputGroupInput
                      type="number"
                      min={0}
                      max={59}
                      value={pauseSeconds}
                      onChange={(event) =>
                        setPauseSeconds(
                          Math.min(59, Math.max(0, parseInt(event.target.value, 10) || 0)),
                        )
                      }
                      className="min-w-0 basis-0 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="ss"
                      aria-label="Paused seconds"
                    />
                  </InputGroup>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-xs">
                    <Clock className="size-3" />
                    Effective
                  </span>
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-mono">
                    {timeError ? "--:--:--" : formatSecondsToDuration(effectiveTime)}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            <section>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                    {TOPIC_LABEL}
                  </FieldTitle>
                  <FieldContent className="gap-3">
                    <div className="w-full">
                      <Select
                        value={selectedTopicId || undefined}
                        onValueChange={handleTopicSelect}
                        disabled={isTopicEditable || topics.length === 0}
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder={`Select a ${TOPIC_LABEL.toLowerCase()}...`} />
                        </SelectTrigger>
                        <SelectContent>
                          {topics.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="truncate">{topic.subjectLabel}</span>
                                <span className="font-mono text-xs text-muted-foreground">
                                  ({formatSecondsToDuration(topic.duration)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      {isTopicEditable ? (
                        <InputGroup aria-label={`${TOPIC_LABEL} duration`} className="w-full sm:max-w-sm">
                          <InputGroupInput
                            type="number"
                            min={0}
                            value={editTopicDuration.h}
                            onChange={(event) =>
                              setEditTopicDuration((prev) => ({
                                ...prev,
                                h: Math.max(0, parseInt(event.target.value, 10) || 0),
                              }))
                            }
                            className="min-w-0 basis-0 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            placeholder="hh"
                            aria-label="Topic hours"
                          />
                          <InputGroupText className="shrink-0 px-1 font-medium tabular-nums">
                            h
                          </InputGroupText>
                          <InputGroupInput
                            type="number"
                            min={0}
                            max={59}
                            value={editTopicDuration.m}
                            onChange={(event) =>
                              setEditTopicDuration((prev) => ({
                                ...prev,
                                m: Math.min(59, Math.max(0, parseInt(event.target.value, 10) || 0)),
                              }))
                            }
                            className="min-w-0 basis-0 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            placeholder="mm"
                            aria-label="Topic minutes"
                          />
                          <InputGroupText className="shrink-0 px-1 font-medium tabular-nums">
                            m
                          </InputGroupText>
                          <InputGroupInput
                            type="number"
                            min={0}
                            max={59}
                            value={editTopicDuration.s}
                            onChange={(event) =>
                              setEditTopicDuration((prev) => ({
                                ...prev,
                                s: Math.min(59, Math.max(0, parseInt(event.target.value, 10) || 0)),
                              }))
                            }
                            className="min-w-0 basis-0 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            placeholder="ss"
                            aria-label="Topic seconds"
                          />
                          <InputGroupText className="shrink-0 px-1 font-medium tabular-nums">
                            s
                          </InputGroupText>
                        </InputGroup>
                      ) : (
                        <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-mono sm:min-w-36">
                          {selectedTopic ? formatSecondsToDuration(selectedTopic.duration) : "--:--:--"}
                        </div>
                      )}

                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        {isTopicEditable ? (
                          <>
                            <Button
                              size="sm"
                              onClick={saveTopicEdit}
                              disabled={Boolean(topicValidationMessage)}
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelTopicEdit}>
                              <X className="size-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-9"
                              onClick={startEditTopic}
                              disabled={!selectedTopic}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-9 text-destructive hover:text-destructive"
                              onClick={deleteTopic}
                              disabled={!selectedTopic || topics.length <= 1}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="size-9"
                              onClick={startAddTopic}
                              disabled={!canAddTopic}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </section>
          </div>
          </div>
          <SheetFooter className="shrink-0 border-t px-6 py-4">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="size-4" />
                    Delete Session
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the session
                      and all associated topic notes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={Boolean(timeError || topicValidationMessage || !selectedTopicId)}
                  className="gap-2"
                >
                  <Save className="size-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </SheetFooter>

          {open && isTopicLoading ? (
            <div
              aria-live="polite"
              className="absolute inset-0 flex items-center justify-center bg-background/45 backdrop-blur-[1px]"
            >
              <div className="flex flex-col items-center gap-3 rounded-lg border bg-background px-6 py-5 text-center shadow-sm">
                <Spinner className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading topic details...</p>
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
