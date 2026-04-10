"use client"

import * as React from "react"
import {
  Book,
  Hash,
  Check,
  ChevronDown,
  X,
  Clock,
  Pause,
  Play,
  Plus,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { cn } from "@/lib/utils"
import type { TagItem } from "@/components/log-session/tag-manager"
import {
  type StudySession,
  type SessionTopic,
  formatSecondsToDuration,
  calculateEffectiveTime,
  validateSessionTimes,
} from "@/types/session"

// Default subjects and hashtags
const defaultSubjects: TagItem[] = [
  { id: "1", value: "theoretical-physics", label: "Theoretical Physics", color: "#3b82f6" },
  { id: "2", value: "mathematics", label: "Mathematics", color: "#8b5cf6" },
  { id: "3", value: "computer-science", label: "Computer Science", color: "#22c55e" },
  { id: "4", value: "literature", label: "Literature", color: "#f97316" },
  { id: "5", value: "chemistry", label: "Chemistry", color: "#ef4444" },
  { id: "6", value: "biology", label: "Biology", color: "#14b8a6" },
  { id: "7", value: "history", label: "History", color: "#eab308" },
  { id: "8", value: "user-experience-design", label: "UI109007: User experience design", color: "#ec4899" },
]

const defaultHashtags: TagItem[] = [
  { id: "1", value: "quantum", label: "#quantum", color: "#3b82f6" },
  { id: "2", value: "mechanics", label: "#mechanics", color: "#8b5cf6" },
  { id: "3", value: "algebra", label: "#algebra", color: "#22c55e" },
  { id: "4", value: "calculus", label: "#calculus", color: "#f97316" },
  { id: "5", value: "algorithms", label: "#algorithms", color: "#ef4444" },
  { id: "6", value: "data-structures", label: "#data-structures", color: "#14b8a6" },
  { id: "7", value: "research", label: "#research", color: "#eab308" },
  { id: "8", value: "ux-design", label: "#ux-design", color: "#ec4899" },
]

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
  // Form state
  const [selectedSubject, setSelectedSubject] = React.useState("")
  const [subjectOpen, setSubjectOpen] = React.useState(false)
  const [selectedHashtags, setSelectedHashtags] = React.useState<string[]>([])
  const [hashtagsOpen, setHashtagsOpen] = React.useState(false)
  const [reflection, setReflection] = React.useState("")
  
  // Time state
  const [startTime, setStartTime] = React.useState("09:00")
  const [endTime, setEndTime] = React.useState("10:00")
  const [pauseMinutes, setPauseMinutes] = React.useState(0)
  const [pauseSeconds, setPauseSeconds] = React.useState(0)
  
  // Topics state
  const [topics, setTopics] = React.useState<SessionTopic[]>([])
  const [selectedTopicId, setSelectedTopicId] = React.useState<string | null>(null)
  const [isEditingTopic, setIsEditingTopic] = React.useState(false)
  const [editTopicName, setEditTopicName] = React.useState("")
  const [editTopicDuration, setEditTopicDuration] = React.useState({ h: 0, m: 0, s: 0 })
  const [editTopicReflection, setEditTopicReflection] = React.useState("")
  const [isAddingTopic, setIsAddingTopic] = React.useState(false)
  
  // Validation state
  const [timeError, setTimeError] = React.useState<string | null>(null)
  
  // Available tags
  const [subjects] = React.useState<TagItem[]>(defaultSubjects)
  const [hashtags] = React.useState<TagItem[]>(defaultHashtags)

  // Get selected topic
  const selectedTopic = topics.find((t) => t.id === selectedTopicId)

  // Initialize form when session changes
  React.useEffect(() => {
    if (session) {
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
    }
  }, [session])

  // Update edit form when selected topic changes
  React.useEffect(() => {
    if (selectedTopic && !isAddingTopic) {
      setEditTopicName(selectedTopic.name)
      setEditTopicDuration({
        h: Math.floor(selectedTopic.duration / 3600),
        m: Math.floor((selectedTopic.duration % 3600) / 60),
        s: selectedTopic.duration % 60,
      })
      setEditTopicReflection(selectedTopic.reflection || "")
    }
  }, [selectedTopic, isAddingTopic])

  // Calculate effective time
  const pauseTimeSeconds = pauseMinutes * 60 + pauseSeconds
  const effectiveTime = calculateEffectiveTime(startTime, endTime, pauseTimeSeconds)
  
  // Validate times
  React.useEffect(() => {
    const validation = validateSessionTimes(startTime, endTime, pauseTimeSeconds)
    setTimeError(validation.valid ? null : validation.error || null)
  }, [startTime, endTime, pauseTimeSeconds])

  const wordCount = reflection.trim() ? reflection.trim().split(/\s+/).length : 0

  const toggleHashtag = (value: string) => {
    setSelectedHashtags((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }

  const removeHashtag = (value: string) => {
    setSelectedHashtags((current) => current.filter((item) => item !== value))
  }

  // Topic management
  const startAddTopic = () => {
    setIsAddingTopic(true)
    setIsEditingTopic(true)
    setEditTopicName("")
    setEditTopicDuration({ h: 0, m: 0, s: 0 })
    setEditTopicReflection("")
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
        reflection: editTopicReflection,
      }
      setTopics([...topics, newTopic])
      setSelectedTopicId(newTopic.id)
    } else if (selectedTopicId) {
      setTopics(topics.map((t) =>
        t.id === selectedTopicId
          ? { ...t, name: editTopicName.trim(), duration: durationSeconds, reflection: editTopicReflection }
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
    
    const selectedSubjectData = subjects.find((s) => s.value === selectedSubject)
    
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
    if (session) {
      onDelete(session.id)
    }
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
                {/* Subject Combobox */}
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={subjectOpen}
                        className="w-full justify-between font-normal"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {selectedSubject ? (
                            <>
                              <div
                                className="size-3 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: subjects.find((s) => s.value === selectedSubject)?.color,
                                }}
                              />
                              <span className="truncate">
                                {subjects.find((s) => s.value === selectedSubject)?.label}
                              </span>
                            </>
                          ) : (
                            <>
                              <Book className="size-4 shrink-0" />
                              <span>Select subject...</span>
                            </>
                          )}
                        </div>
                        <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search subject..." />
                        <CommandList>
                          <CommandEmpty>No subject found.</CommandEmpty>
                          <CommandGroup>
                            {subjects.map((subject) => (
                              <CommandItem
                                key={subject.id}
                                value={subject.value}
                                onSelect={(value) => {
                                  setSelectedSubject(value === selectedSubject ? "" : value)
                                  setSubjectOpen(false)
                                }}
                              >
                                <div
                                  className="mr-2 size-3 shrink-0 rounded-full"
                                  style={{ backgroundColor: subject.color }}
                                />
                                <Check
                                  className={cn(
                                    "mr-2 size-4",
                                    selectedSubject === subject.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {subject.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Hashtags Multi-Select */}
                <div className="space-y-2">
                  <Label>Hashtags</Label>
                  <Popover open={hashtagsOpen} onOpenChange={setHashtagsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={hashtagsOpen}
                        className="w-full justify-between font-normal"
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="size-4 shrink-0" />
                          {selectedHashtags.length > 0
                            ? `${selectedHashtags.length} selected`
                            : "Select hashtags..."}
                        </div>
                        <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search hashtags..." />
                        <CommandList>
                          <CommandEmpty>No hashtag found.</CommandEmpty>
                          <CommandGroup>
                            {hashtags.map((hashtag) => (
                              <CommandItem
                                key={hashtag.id}
                                value={hashtag.value}
                                onSelect={() => toggleHashtag(hashtag.value)}
                              >
                                <div
                                  className="mr-2 size-3 shrink-0 rounded-full"
                                  style={{ backgroundColor: hashtag.color }}
                                />
                                <Check
                                  className={cn(
                                    "mr-2 size-4",
                                    selectedHashtags.includes(hashtag.value)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {hashtag.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {selectedHashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedHashtags.map((tagValue) => {
                        const tag = hashtags.find((h) => h.value === tagValue)
                        return (
                          <span
                            key={tagValue}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                            style={{
                              backgroundColor: tag?.color ? `${tag.color}20` : undefined,
                              color: tag?.color,
                              border: `1px solid ${tag?.color || "currentColor"}`,
                            }}
                          >
                            {tag?.label || `#${tagValue}`}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={() => removeHashtag(tagValue)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  removeHashtag(tagValue)
                                }
                              }}
                              className="cursor-pointer rounded-full hover:opacity-70"
                            >
                              <X className="size-3" />
                            </span>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Section: Reflection (Main Focus) */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Reflection
              </h3>
              <div className="space-y-2">
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Your session reflection..."
                  className="min-h-[250px] w-full resize-y rounded-md border border-input bg-background px-4 py-3 text-base leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{wordCount} words</span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Section: Topics (Compact) */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Topics
              </h3>
              
              {/* Single row topic selector with actions */}
              <div className="flex items-center gap-2">
                {topics.length > 0 || isAddingTopic ? (
                  <>
                    {isEditingTopic ? (
                      <Input
                        value={editTopicName}
                        onChange={(e) => setEditTopicName(e.target.value)}
                        placeholder="Topic name..."
                        className="flex-1"
                        autoFocus
                      />
                    ) : (
                      <Select
                        value={selectedTopicId || undefined}
                        onValueChange={setSelectedTopicId}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a topic..." />
                        </SelectTrigger>
                        <SelectContent>
                          {topics.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              <div className="flex items-center gap-2">
                                <span>{topic.name}</span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  ({formatSecondsToDuration(topic.duration)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {/* Duration input when editing */}
                    {isEditingTopic && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          max={23}
                          value={editTopicDuration.h}
                          onChange={(e) => setEditTopicDuration({ ...editTopicDuration, h: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-12 text-center h-9 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">h</span>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          value={editTopicDuration.m}
                          onChange={(e) => setEditTopicDuration({ ...editTopicDuration, m: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
                          className="w-12 text-center h-9 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">m</span>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          value={editTopicDuration.s}
                          onChange={(e) => setEditTopicDuration({ ...editTopicDuration, s: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
                          className="w-12 text-center h-9 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">s</span>
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
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
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={startAddTopic}
                    className="w-full gap-2"
                  >
                    <Plus className="size-4" />
                    Add Topic
                  </Button>
                )}
              </div>


            </section>

            <Separator />

            {/* Section: Time Information */}
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Time Information
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
                    Paused
                  </Label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={pauseMinutes}
                      onChange={(e) => setPauseMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-center h-9 text-sm"
                      placeholder="m"
                    />
                    <span className="self-center text-muted-foreground">:</span>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={pauseSeconds}
                      onChange={(e) => setPauseSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="text-center h-9 text-sm"
                      placeholder="s"
                    />
                  </div>
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
