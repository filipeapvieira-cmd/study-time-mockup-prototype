"use client"

import {
  AlertCircle,
  MessageSquareText,
  RefreshCw,
  Sparkles,
} from "lucide-react"

import type { AnalyticsInsightsResponse } from "@/lib/ai/contracts"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"

const FOCUS_AREA_LABELS = {
  coverage: "Coverage",
  consistency: "Consistency",
  timing: "Timing",
  revision: "Revision",
  reflection: "Reflection",
} as const

export type AnalyticsInsightPanelState =
  | { status: "idle"; rangeLabel: string }
  | { status: "loading"; rangeLabel: string }
  | { status: "empty"; rangeLabel: string; message: string }
  | { status: "unavailable"; rangeLabel: string; message: string }
  | { status: "error"; rangeLabel: string; message: string }
  | {
      status: "success"
      rangeLabel: string
      result: AnalyticsInsightsResponse
    }

type AIInsightPanelProps = {
  state: AnalyticsInsightPanelState
  className?: string
  onRetry?: () => void
}

function renderEmptyState(
  state: AnalyticsInsightPanelState,
  onRetry?: () => void,
) {
  switch (state.status) {
    case "idle":
    case "loading":
      return (
        <div className="flex min-h-[280px] flex-col items-center justify-center">
          <RefreshCw className="size-6 animate-spin text-muted-foreground" />
          <span className="mt-3 text-sm text-muted-foreground">
            Generating AI insights...
          </span>
        </div>
      )

    case "empty":
      return (
        <Empty className="min-h-[280px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkles />
            </EmptyMedia>
            <EmptyTitle>No AI insights for this range</EmptyTitle>
            <EmptyDescription>{state.message}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )

    case "unavailable":
    case "error":
      return (
        <Empty className="min-h-[280px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {state.status === "unavailable" ? (
                <AlertCircle />
              ) : (
                <MessageSquareText />
              )}
            </EmptyMedia>
            <EmptyTitle>
              {state.status === "unavailable"
                ? "AI insights unavailable"
                : "AI insights unavailable right now"}
            </EmptyTitle>
            <EmptyDescription>{state.message}</EmptyDescription>
          </EmptyHeader>
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 size-3" />
              Try Again
            </Button>
          ) : null}
        </Empty>
      )

    case "success":
      return null
  }
}

function renderInsights(result: AnalyticsInsightsResponse) {
  const accordionDefaultValues = result.insights.map((insight) => insight.id)

  return (
    <ScrollArea className="h-[540px] pr-3 xl:h-full">
      <div className="flex flex-col gap-4">
        <Card className="border-dashed py-4">
          <CardContent className="px-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {result.overview}
            </p>
          </CardContent>
        </Card>

        <Accordion
          type="multiple"
          defaultValue={accordionDefaultValues}
          className="w-full"
        >
          {result.insights.map((insight) => (
            <AccordionItem key={insight.id} value={insight.id}>
              <AccordionTrigger>
                <div className="flex w-full items-start gap-3">
                  <MessageSquareText className="mt-0.5 size-4 text-muted-foreground" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-sm font-medium">{insight.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {insight.summary}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {FOCUS_AREA_LABELS[insight.focusArea]}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Evidence
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {insight.evidence}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Next Action
                  </p>
                  <p className="mt-1 text-sm">{insight.action}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  )
}

export function AIInsightPanel({
  state,
  className,
  onRetry,
}: AIInsightPanelProps) {
  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MessageSquareText className="size-4" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Assistant analysis for {state.rangeLabel}.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        {state.status === "success"
          ? renderInsights(state.result)
          : renderEmptyState(state, onRetry)}
      </CardContent>
    </Card>
  )
}
