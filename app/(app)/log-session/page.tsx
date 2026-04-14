"use client"

import React from "react"
import { MessageSquareText } from "lucide-react"

import { useLogSessionDraft } from "@/components/log-session/log-session-draft-provider"
import { AIQuestionsSheet } from "@/components/log-session/ai-questions-sheet"
import { HashtagMultiSelect } from "@/components/session-fields/hashtag-multi-select"
import { SessionReflectionField } from "@/components/session-fields/session-reflection-field"
import { SubjectSelect } from "@/components/session-fields/subject-select"
import { Button } from "@/components/ui/button"
import {
  getActiveTopicViewModel,
  getAvailableSubjectsForActiveTopic,
} from "@/lib/log-session-draft"
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
  const availableSubjects = React.useMemo(
    () => getAvailableSubjectsForActiveTopic(state),
    [state],
  )

  const selectedHashtagItems = React.useMemo(
    () =>
      selectedHashtags
        .map((hashtagValue) =>
          state.hashtags.find((hashtag) => hashtag.value === hashtagValue),
        )
        .filter((hashtag): hashtag is TagItem => Boolean(hashtag)),
    [selectedHashtags, state.hashtags],
  )

  const reflectionText = React.useMemo(
    () => reflectionToPlainText(reflection),
    [reflection],
  )

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
            <div>
              <SubjectSelect
                subjects={availableSubjects}
                allSubjects={state.subjects}
                hashtags={state.hashtags}
                value={selectedSubject}
                onChange={actions.updateActiveTopicSubject}
                onSubjectsChange={actions.updateSubjects}
                onHashtagsChange={actions.updateHashtags}
              />
            </div>

            <div>
              <HashtagMultiSelect
                subjects={state.subjects}
                hashtags={state.hashtags}
                value={selectedHashtags}
                onChange={actions.updateActiveTopicHashtags}
                onSubjectsChange={actions.updateSubjects}
                onHashtagsChange={actions.updateHashtags}
              />
            </div>
          </div>
        </div>

        <div ref={reflectionFieldRef} className="mt-8 flex flex-1 flex-col">
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
