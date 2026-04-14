"use client"

import * as React from "react"
import {
  AlertCircle,
  Book,
  MessageSquareText,
  RefreshCw,
} from "lucide-react"

import {
  reflectionQuestionsResponseSchema,
  type ReflectionQuestionsResponse,
} from "@/lib/ai/contracts"
import { parseAiJsonResponse } from "@/lib/ai/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const QUESTION_CATEGORY_LABELS = {
  summary: "Summary",
  clarify: "Clarify",
  connect: "Connect",
  "self-check": "Self-check",
  "next-step": "Next step",
} as const

type ReflectionQuestionsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "validation"; message: string }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string }
  | { status: "success"; result: ReflectionQuestionsResponse }

interface AIQuestionsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectValue: string
  subjectLabel: string
  hashtags: string[]
  hashtagLabels: string[]
  reflectionText: string
  onQuestionSelect: (question: string) => void
}

export function AIQuestionsSheet({
  open,
  onOpenChange,
  subjectValue,
  subjectLabel,
  hashtags,
  hashtagLabels,
  reflectionText,
  onQuestionSelect,
}: AIQuestionsSheetProps) {
  const [state, setState] = React.useState<ReflectionQuestionsState>({
    status: "idle",
  })
  const skipCloseAutoFocusRef = React.useRef(false)

  const requestBody = React.useMemo(
    () => ({
      subjectValue,
      subjectLabel,
      hashtags: hashtags.slice(0, 12),
      hashtagLabels: hashtagLabels.slice(0, 12),
      reflectionText,
    }),
    [hashtagLabels, hashtags, reflectionText, subjectLabel, subjectValue],
  )
  const requestBodyRef = React.useRef(requestBody)

  React.useEffect(() => {
    requestBodyRef.current = requestBody
  }, [requestBody])

  const generateQuestions = React.useCallback(
    async (signal?: AbortSignal) => {
      const currentRequestBody = requestBodyRef.current

      if (!currentRequestBody.subjectValue || !currentRequestBody.subjectLabel) {
        setState({
          status: "validation",
          message: "Select a topic subject before requesting AI prompts.",
        })
        return
      }

      setState({ status: "loading" })

      try {
        const response = await fetch("/api/reflection/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentRequestBody),
          signal,
        })

        const parsed = await parseAiJsonResponse(
          response,
          reflectionQuestionsResponseSchema,
        )

        if (!parsed.ok) {
          setState({
            status:
              parsed.code === "ai_unavailable" ? "unavailable" : "error",
            message: parsed.message,
          })
          return
        }

        setState({
          status: "success",
          result: parsed.data,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }

        setState({
          status: "error",
          message: "The AI prompts could not be generated right now.",
        })
      }
    },
    [],
  )

  React.useEffect(() => {
    if (!open) {
      return
    }

    const controller = new AbortController()
    void generateQuestions(controller.signal)

    return () => controller.abort()
  }, [generateQuestions, open])

  const handleQuestionSelect = React.useCallback(
    (question: string) => {
      skipCloseAutoFocusRef.current = true
      onQuestionSelect(question)
    },
    [onQuestionSelect],
  )

  const hasReflectionText = reflectionText.trim().length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="overflow-y-auto"
        onCloseAutoFocus={(event) => {
          if (!skipCloseAutoFocusRef.current) {
            return
          }

          event.preventDefault()
          skipCloseAutoFocusRef.current = false
        }}
      >
        <SheetHeader>
          <SheetTitle>Reflection Prompts</SheetTitle>
          <SheetDescription>
            Use AI-generated questions to deepen what you write about this
            study topic.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {subjectLabel ? (
              <Badge variant="secondary">{subjectLabel}</Badge>
            ) : null}
            {hashtagLabels.map((label) => {
              const normalizedLabel = label.startsWith("#")
                ? label
                : `#${label}`

              return (
                <Badge key={label} variant="outline">
                  {normalizedLabel}
                </Badge>
              )
            })}
          </div>

          {state.status === "idle" || state.status === "loading" ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="size-6 animate-spin text-muted-foreground" />
              <span className="mt-3 text-sm text-muted-foreground">
                Generating AI prompts...
              </span>
            </div>
          ) : state.status === "success" ? (
            <>
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {state.result.intro}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {hasReflectionText
                      ? "These prompts use your current reflection draft, selected subject, tags, and related study history."
                      : "These prompts use your selected subject, tags, and related study history."}
                  </p>
                </CardContent>
              </Card>

              {state.result.questions.map((question) => (
                <Card
                  key={question.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleQuestionSelect(question.question)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") {
                      return
                    }

                    event.preventDefault()
                    handleQuestionSelect(question.question)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      <Badge variant="secondary" className="w-fit text-xs">
                        {QUESTION_CATEGORY_LABELS[question.category]}
                      </Badge>
                      <p className="text-sm leading-relaxed">
                        {question.question}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => void generateQuestions()}
                className="mt-2"
              >
                <RefreshCw className="mr-2 size-3" />
                Generate New Prompts
              </Button>
            </>
          ) : (
            <Empty className="min-h-[280px]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  {state.status === "validation" ? (
                    <Book className="size-4 shrink-0 text-muted-foreground" />
                  ) : state.status === "unavailable" ? (
                    <AlertCircle />
                  ) : (
                    <MessageSquareText />
                  )}
                </EmptyMedia>
                <EmptyTitle>
                  {state.status === "validation"
                    ? "Subject required"
                    : state.status === "unavailable"
                      ? "AI prompts unavailable"
                      : "AI prompts unavailable right now"}
                </EmptyTitle>
                <EmptyDescription>{state.message}</EmptyDescription>
              </EmptyHeader>
              {state.status !== "validation" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void generateQuestions()}
                >
                  <RefreshCw className="mr-2 size-3" />
                  Try Again
                </Button>
              ) : null}
            </Empty>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
