"use client"

import {
  BarChart3,
  Clock3,
  MessageSquareText,
  Target,
} from "lucide-react"

import type {
  AnalyticsInsightsResult,
  InsightCategory,
  InsightSeverity,
  SubjectAllocationInsightItem,
} from "@/lib/analytics-insights"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"

type AIInsightPanelProps = {
  insightsResult: AnalyticsInsightsResult
  className?: string
}

function getSeverityBadgeVariant(severity: InsightSeverity): "secondary" | "outline" | "destructive" {
  if (severity === "critical") {
    return "destructive"
  }

  if (severity === "warning") {
    return "outline"
  }

  return "secondary"
}

function getCategoryIcon(category: InsightCategory) {
  if (category === "topic-allocation") {
    return Target
  }

  if (category === "workload-consistency") {
    return BarChart3
  }

  return Clock3
}

function formatPercent(value: number): string {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`
}

function formatSignedPercent(value: number): string {
  if (value === 0) {
    return "0%"
  }

  const absoluteValue = Math.abs(value)
  const magnitude = Number.isInteger(absoluteValue)
    ? `${absoluteValue}%`
    : `${absoluteValue.toFixed(1)}%`

  return value > 0 ? `+${magnitude}` : `-${magnitude}`
}

function formatAllocationState(item: SubjectAllocationInsightItem): string {
  if (item.state === "balanced") {
    return "Balanced"
  }

  if (item.state === "over") {
    return "Over-allocated"
  }

  return "Under-allocated"
}

export function AIInsightPanel({ insightsResult, className }: AIInsightPanelProps) {
  const accordionDefaultValues = insightsResult.insights.map((insight) => insight.id)

  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MessageSquareText className="size-4" />
          AI Insight Panel
        </CardTitle>
        <CardDescription>
          Assistant analysis for {insightsResult.rangeLabel}.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!insightsResult.hasData ? (
          <Empty className="min-h-[280px]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquareText />
              </EmptyMedia>
              <EmptyTitle>No insights available yet</EmptyTitle>
              <EmptyDescription>
                Add study sessions in this date range to generate evidence-based insights.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="h-[540px] pr-3 xl:h-[calc(100svh-240px)]">
            <Accordion type="multiple" defaultValue={accordionDefaultValues} className="w-full">
              {insightsResult.insights.map((insight) => {
                const Icon = getCategoryIcon(insight.category)
                return (
                  <AccordionItem key={insight.id} value={insight.id}>
                    <AccordionTrigger>
                      <div className="flex w-full items-start gap-3">
                        <Icon className="mt-0.5 size-4 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="text-sm font-medium">{insight.title}</span>
                          <span className="text-xs text-muted-foreground">{insight.summary}</span>
                        </div>
                        <Badge variant={getSeverityBadgeVariant(insight.severity)}>
                          {insight.severity}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground">{insight.evidence}</p>

                      {insight.category === "topic-allocation" &&
                      insightsResult.subjectAllocations.length > 0 &&
                      insightsResult.expectedShare !== null ? (
                        <div className="flex flex-col gap-3 rounded-md border p-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Subject share</span>
                            <span>Baseline {formatPercent(insightsResult.expectedShare)}</span>
                          </div>
                          {insightsResult.subjectAllocations.slice(0, 5).map((allocation) => (
                            <div key={allocation.name} className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="truncate pr-2 font-medium">{allocation.name}</span>
                                <span>{formatPercent(allocation.share)}</span>
                              </div>
                              <Progress
                                value={Math.max(0, Math.min(100, allocation.share))}
                                className="h-1.5"
                              />
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{formatAllocationState(allocation)}</span>
                                <span>
                                  Delta {formatSignedPercent(allocation.delta)} vs baseline
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {insight.suggestions.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Improvement Suggestions
                          </h4>
                          {insight.suggestions.map((suggestion) => (
                            <div key={suggestion.id} className="rounded-md border p-3">
                              <p className="text-sm font-medium">{suggestion.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {suggestion.recommendation}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Evidence: {suggestion.evidence}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
