"use client"

import React from "react"
import {
  ChevronDownIcon,
  ListTree,
  MessageSquareText,
  Pause,
  Play,
  Plus,
  Trash2,
} from "lucide-react"

import { useLogSessionDraft } from "@/components/log-session/log-session-draft-provider"
import { AIQuestionsSheet } from "@/components/log-session/ai-questions-sheet"
import { HashtagMultiSelect } from "@/components/session-fields/hashtag-multi-select"
import { SessionReflectionField } from "@/components/session-fields/session-reflection-field"
import { SubjectSelect } from "@/components/session-fields/subject-select"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getActiveTopicViewModel, getTopicLabel } from "@/lib/log-session-draft"
import {
  cloneReflection,
  createReflectionFromText,
  createEmptyReflection,
  isReflectionEmpty,
  reflectionToPlainText,
} from "@/lib/session-reflection"
import type { TagItem } from "@/types/tag"

export default function LogSessionPage() {
  const { state, actions } = useLogSessionDraft()
  const [focusRequestVersion, setFocusRequestVersion] = React.useState(0)
  const reflectionFieldRef = React.useRef<HTMLDivElement | null>(null)
  const [aiSheetOpen, setAiSheetOpen] = React.useState(false)

  const { activeTopic, selectedSubject, selectedHashtags, reflection, subjectItem } =
    React.useMemo(() => getActiveTopicViewModel(state), [state])

  const selectedHashtagItems = React.useMemo(
    () =>
      selectedHashtags
        .map((hashtagValue) =>
          state.hashtags.find((hashtag) => hashtag.value === hashtagValue),
        )
        .filter((hashtag): hashtag is TagItem => Boolean(hashtag)),
    [selectedHashtags, state.hashtags],
  )

  const subjectUsageByValue = React.useMemo(() => {
    const nextUsageByValue: Record<string, number> = {}

    for (const topicId of state.topicOrder) {
      const topic = state.topicsById[topicId]
      if (!topic?.subject) {
        continue
      }

      nextUsageByValue[topic.subject] = (nextUsageByValue[topic.subject] ?? 0) + 1
    }

    return nextUsageByValue
  }, [state.topicOrder, state.topicsById])

  const reflectionText = React.useMemo(
    () => reflectionToPlainText(reflection),
    [reflection],
  )
  const isSessionPlaying = state.sessionStatus === "playing"

  const topicItems = React.useMemo(
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
        .filter((topic): topic is { id: string; label: string } => Boolean(topic)),
    [state.subjects, state.topicOrder, state.topicsById],
  )

  const formatTime = React.useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  React.useEffect(() => {
    if (!focusRequestVersion) {
      return
    }

    let secondFrameId = 0
    const firstFrameId = requestAnimationFrame(() => {
      secondFrameId = requestAnimationFrame(() => {
        const editable =
          reflectionFieldRef.current?.querySelector<HTMLElement>(
            '[contenteditable="true"]',
          ) ?? null

        if (!editable) {
          return
        }

        editable.focus()

        const selection = window.getSelection()
        if (!selection) {
          return
        }

        const range = document.createRange()
        range.selectNodeContents(editable)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      })
    })

    return () => {
      cancelAnimationFrame(firstFrameId)
      if (secondFrameId) {
        cancelAnimationFrame(secondFrameId)
      }
    }
  }, [focusRequestVersion])

  const handleQuestionSelect = React.useCallback(
    (question: string) => {
      const previousContent = activeTopic?.reflection ?? createEmptyReflection()
      const questionReflection = createReflectionFromText(question)
      const trailingLine = createEmptyReflection()

      const nextReflection = isReflectionEmpty(previousContent)
        ? [...questionReflection, ...trailingLine]
        : [...cloneReflection(previousContent), ...questionReflection, ...trailingLine]

      actions.updateActiveTopicReflection(nextReflection)
      setAiSheetOpen(false)
      setFocusRequestVersion((previousVersion) => previousVersion + 1)
    },
    [actions, activeTopic],
  )

  if (!activeTopic) {
    return null
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-6 md:px-10 md:py-8">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-md"
                    aria-label="Topic actions"
                  >
                    <ChevronDownIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => actions.toggleTopicTimer(activeTopic.id)}
                      disabled={!isSessionPlaying}
                    >
                      {activeTopic.isRunning ? (
                        <Pause className="size-4" />
                      ) : (
                        <Play className="size-4" />
                      )}
                      {activeTopic.isRunning ? "Pause Counter" : "Start Counter"}
                      <DropdownMenuShortcut className="font-mono tabular-nums">
                        {formatTime(activeTopic.durationSeconds)}
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel>Topic Actions</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={actions.addTopic}>
                      <Plus className="size-4" />
                      Create New Topic
                    </DropdownMenuItem>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <ListTree className="size-4" />
                        Select Topic
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-44">
                          <DropdownMenuRadioGroup
                            value={activeTopic.id}
                            onValueChange={actions.selectTopic}
                          >
                            {topicItems.map((topic) => (
                              <DropdownMenuRadioItem key={topic.id} value={topic.id}>
                                {topic.label}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => actions.deleteTopic(activeTopic.id)}
                    disabled={state.topicOrder.length === 1}
                  >
                    <Trash2 className="size-4" />
                    Delete Topic
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <SubjectSelect
                subjects={state.subjects}
                hashtags={state.hashtags}
                subjectUsageByValue={subjectUsageByValue}
                value={selectedSubject}
                onChange={actions.updateActiveTopicSubject}
                onSubjectsChange={actions.updateSubjects}
                onHashtagsChange={actions.updateHashtags}
                className="flex-1"
              />
            </div>

            <div>
              <HashtagMultiSelect
                subjects={state.subjects}
                hashtags={state.hashtags}
                subjectUsageByValue={subjectUsageByValue}
                value={selectedHashtags}
                onChange={actions.updateActiveTopicHashtags}
                onSubjectsChange={actions.updateSubjects}
                onHashtagsChange={actions.updateHashtags}
              />
            </div>
          </div>
        </div>

        <div ref={reflectionFieldRef} className="mt-6 flex flex-1 flex-col">
          <SessionReflectionField
            key={activeTopic.id}
            value={reflection}
            onChange={actions.updateActiveTopicReflection}
            placeholder="Begin your reflection here. What did you learn? What challenged you? What connections did you make?"
            className="flex-1"
            textareaClassName="h-full min-h-[300px]"
            footer={
              <Button
                variant="default"
                size="sm"
                className="gap-2 rounded-md shadow-sm"
                onClick={() => setAiSheetOpen(true)}
                aria-label="Open AI prompts"
              >
                <MessageSquareText className="size-4" />
                <span className="hidden sm:inline">AI Prompts</span>
              </Button>
            }
          />
        </div>
      </div>

      <AIQuestionsSheet
        open={aiSheetOpen}
        onOpenChange={setAiSheetOpen}
        subjectValue={selectedSubject}
        subjectLabel={subjectItem?.label ?? ""}
        hashtags={selectedHashtags}
        hashtagLabels={selectedHashtagItems.map((item) => item.label)}
        reflectionText={reflectionText}
        onQuestionSelect={handleQuestionSelect}
      />
    </div>
  )
}
