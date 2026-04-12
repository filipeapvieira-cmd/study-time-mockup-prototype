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
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
  const [isEditingTopic, setIsEditingTopic] = React.useState(false)
  const [editTopicName, setEditTopicName] = React.useState("")
  const [editTopicDuration, setEditTopicDuration] = React.useState({ h: 0, m: 0, s: 0 })
  const [isAddingTopic, setIsAddingTopic] = React.useState(false)

  const [timeError, setTimeError] = React.useState<string | null>(null)
  const [subjects, setSubjects] = React.useState<TagItem[]>(() =>
    cloneTagItems(PROTOTYPE_SUBJECTS),
  )
  const [hashtags, setHashtags] = React.useState<TagItem[]>(() =>
    cloneTagItems(PROTOTYPE_HASHTAGS),
  )

  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId)

  React.useEffect(() => {
    if (!session) return

    setSelectedSubject(session.subject)
    setSelectedHashtags(session.hashtags)
    setReflection(session.reflection)
    setStartTime(session.startTime)
    setEndTime(session.endTime)
    setPauseMinutes(Math.floor(session.pauseTime / 60))
    setPauseSeconds(session.pauseTime % 60)
    setTopics(session.topics)
    setSelectedTopicId(session.topics[0]?.id || null)
    setIsEditingTopic(false)
    setIsAddingTopic(false)
    setTimeError(null)
  }, [session])

  React.useEffect(() => {
    if (!selectedTopic || isAddingTopic) return

    setEditTopicName(selectedTopic.name)
    setEditTopicDuration({
      h: Math.floor(selectedTopic.duration / 3600),
      m: Math.floor((selectedTopic.duration % 3600) / 60),
      s: selectedTopic.duration % 60,
    })
  }, [isAddingTopic, selectedTopic])

  const pauseTimeSeconds = pauseMinutes * 60 + pauseSeconds
  const effectiveTime = calculateEffectiveTime(startTime, endTime, pauseTimeSeconds)

  React.useEffect(() => {
    const validation = validateSessionTimes(startTime, endTime, pauseTimeSeconds)
    setTimeError(validation.valid ? null : validation.error || null)
  }, [startTime, endTime, pauseTimeSeconds])

  const startAddTopic = () => {
    setIsAddingTopic(true)
    setIsEditingTopic(true)
    setEditTopicName("")
    setEditTopicDuration({ h: 0, m: 0, s: 0 })
    setSelectedTopicId(null)
  }

  const saveTopicEdit = () => {
    if (!editTopicName.trim()) return
    
    const durationSeconds = editTopicDuration.h * 3600 + editTopicDuration.m * 60 + editTopicDuration.s
    
    if (isAddingTopic) {
      const newTopic: SessionTopic = {
        id: crypto.randomUUID(),
        name: editTopicName.trim(),
        duration: durationSeconds,
      }
      setTopics([...topics, newTopic])
      setSelectedTopicId(newTopic.id)
    } else if (selectedTopicId) {
      setTopics(topics.map((t) =>
        t.id === selectedTopicId
          ? { ...t, name: editTopicName.trim(), duration: durationSeconds }
          : t
      ))
    }
    
    setIsEditingTopic(false)
    setIsAddingTopic(false)
  }

  const cancelTopicEdit = () => {
    setIsEditingTopic(false)
    setIsAddingTopic(false)
    if (topics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(topics[0].id)
    }
  }

  const deleteTopic = () => {
    if (!selectedTopicId) return
    const newTopics = topics.filter((t) => t.id !== selectedTopicId)
    setTopics(newTopics)
    setSelectedTopicId(newTopics[0]?.id || null)
    setIsEditingTopic(false)
  }

  const handleSave = () => {
    if (!session || timeError) return

    const selectedSubjectData = getTagItemByValue(subjects, selectedSubject)

    const updatedSession: StudySession = {
      ...session,
      subject: selectedSubject,
      subjectLabel: selectedSubjectData?.label || "",
      subjectColor: selectedSubjectData?.color || "",
      hashtags: selectedHashtags,
      reflection,
      startTime,
      endTime,
      pauseTime: pauseTimeSeconds,
      effectiveTime,
      topics,
      updatedAt: new Date().toISOString(),
    }
    
    onSave(updatedSession)
  }

  const handleDelete = () => {
    if (!session) return
    onDelete(session.id)
  }

  if (!session) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl md:max-w-3xl flex flex-col p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle className="text-xl">Edit Session</SheetTitle>
          <SheetDescription>
            {session.date} &middot; {formatSecondsToDuration(session.effectiveTime)} recorded
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Section: Session Metadata */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Session Metadata
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <SubjectSelect
                    subjects={subjects}
                    hashtags={hashtags}
                    value={selectedSubject}
                    onChange={setSelectedSubject}
                    onSubjectsChange={setSubjects}
                    onHashtagsChange={setHashtags}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hashtags</Label>
                  <HashtagMultiSelect
                    subjects={subjects}
                    hashtags={hashtags}
                    value={selectedHashtags}
                    onChange={setSelectedHashtags}
                    onSubjectsChange={setSubjects}
                    onHashtagsChange={setHashtags}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Section: Reflection (Main Focus) */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Reflection
              </h3>
              <SessionReflectionField
                value={reflection}
                onChange={setReflection}
                placeholder="Your session reflection..."
              />
            </section>

            <Separator />

            {/* Section: Session Timer */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                {SESSION_TIMER_LABEL}
              </h3>

              {timeError && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="size-4 shrink-0" />
                  {timeError}
                </div>
              )}

              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="flex items-center gap-2 text-xs">
                    <Play className="size-3" />
                    Start
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time" className="flex items-center gap-2 text-xs">
                    <Clock className="size-3" />
                    End
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs">
                    <Pause className="size-3" />
                    Paused (m/s)
                  </Label>
                  <InputGroup
                    aria-label="Paused duration"
                    data-invalid={timeError ? "true" : undefined}
                    className="h-9"
                  >
                    <InputGroupInput
                      type="number"
                      min={0}
                      value={pauseMinutes}
                      onChange={(e) => setPauseMinutes(Math.max(0, parseInt(e.target.value) || 0))}
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
                      onChange={(e) => setPauseSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="min-w-0 basis-0 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="ss"
                      aria-label="Paused seconds"
                    />
                  </InputGroup>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs">
                    <Clock className="size-3" />
                    Effective
                  </Label>
                  <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-mono">
                    {timeError ? "--:--:--" : formatSecondsToDuration(effectiveTime)}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Section: Topic */}
            <section>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {TOPIC_LABEL}
                  </FieldTitle>
                  <FieldContent className="gap-3">
                    {topics.length > 0 || isAddingTopic ? (
                      <>
                        <div className="w-full">
                          {isEditingTopic ? (
                            <Input
                              value={editTopicName}
                              onChange={(e) => setEditTopicName(e.target.value)}
                              placeholder={`${TOPIC_LABEL} name...`}
                              className="h-9 w-full"
                              autoFocus
                            />
                          ) : (
                            <Select
                              value={selectedTopicId || undefined}
                              onValueChange={setSelectedTopicId}
                            >
                              <SelectTrigger className="h-9 w-full">
                                <SelectValue placeholder={`Select a ${TOPIC_LABEL.toLowerCase()}...`} />
                              </SelectTrigger>
                              <SelectContent>
                                {topics.map((topic) => (
                                  <SelectItem key={topic.id} value={topic.id}>
                                    <div className="flex min-w-0 items-center gap-2">
                                      <span className="truncate">{topic.name}</span>
                                      <span className="font-mono text-xs text-muted-foreground">
                                        ({formatSecondsToDuration(topic.duration)})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          {isEditingTopic ? (
                            <InputGroup aria-label={`${TOPIC_LABEL} duration`} className="w-full sm:max-w-sm">
                              <InputGroupInput
                                type="number"
                                min={0}
                                max={23}
                                value={editTopicDuration.h}
                                onChange={(e) =>
                                  setEditTopicDuration({
                                    ...editTopicDuration,
                                    h: Math.max(0, parseInt(e.target.value) || 0),
                                  })
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
                                onChange={(e) =>
                                  setEditTopicDuration({
                                    ...editTopicDuration,
                                    m: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)),
                                  })
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
                                onChange={(e) =>
                                  setEditTopicDuration({
                                    ...editTopicDuration,
                                    s: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)),
                                  })
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
                            {isEditingTopic ? (
                              <>
                                <Button size="sm" onClick={saveTopicEdit} disabled={!editTopicName.trim()}>
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
                                  onClick={() => setIsEditingTopic(true)}
                                  disabled={!selectedTopicId}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-9 text-destructive hover:text-destructive"
                                  onClick={deleteTopic}
                                  disabled={!selectedTopicId}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="size-9"
                                  onClick={startAddTopic}
                                >
                                  <Plus className="size-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={startAddTopic}
                        className="w-full gap-2"
                      >
                        <Plus className="size-4" />
                        Add {TOPIC_LABEL}
                      </Button>
                    )}
                  </FieldContent>
                </Field>
              </FieldGroup>
            </section>
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t shrink-0">
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
                    and all associated data including topics and reflection notes.
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
              <Button size="sm" onClick={handleSave} disabled={!!timeError} className="gap-2">
                <Save className="size-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
