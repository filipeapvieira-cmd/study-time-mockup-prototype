import type { LucideIcon } from "lucide-react"
import {
  Bold,
  Book,
  ChevronDown,
  Code,
  Hash,
  Highlighter,
  Italic,
  MessageSquareText,
  Pause,
  Trash2,
  Strikethrough,
  Underline,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const REFLECTION_PLACEHOLDER =
  "Begin your reflection here. What did you learn? What challenged you? What connections did you make?"

interface ConceptCardProps {
  title: string
  description: string
  children: React.ReactNode
}

function ConceptCard({ title, description, children }: ConceptCardProps) {
  return (
    <Card className="gap-0 overflow-hidden border-border/80 py-0">
      <CardHeader className="border-b border-border/60 py-5">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-5">{children}</CardContent>
    </Card>
  )
}

interface FieldShellProps {
  icon: LucideIcon
  placeholder: string
  className?: string
}

function FieldShell({ icon: Icon, placeholder, className }: FieldShellProps) {
  return (
    <Button
      variant="outline"
      disabled
      className={`h-10 w-full justify-between rounded-md font-normal ${className ?? ""}`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-muted-foreground">{placeholder}</span>
      </div>
      <ChevronDown className="size-4 shrink-0 opacity-40" />
    </Button>
  )
}

interface TopicTimerControlsProps {
  time: string
  includeDelete?: boolean
  compact?: boolean
}

function TopicTimerControls({
  time,
  includeDelete = false,
  compact = false,
}: TopicTimerControlsProps) {
  return (
    <div className={`flex items-center ${compact ? "gap-1.5" : "gap-2"}`}>
      <div className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`}>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-md"
          disabled
          aria-label="Pause topic timer"
        >
          <Pause className="size-4" />
        </Button>

        {includeDelete ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md text-muted-foreground"
            disabled
            aria-label="Delete topic"
          >
            <Trash2 className="size-4" />
          </Button>
        ) : null}
      </div>

      <div
        className={`rounded-md border border-border bg-muted ${compact ? "px-2 py-1" : "px-3 py-1.5"}`}
      >
        <span
          className={`font-mono font-semibold tabular-nums text-foreground ${compact ? "text-xs" : "text-sm"}`}
        >
          {time}
        </span>
      </div>
    </div>
  )
}

interface ReflectionShellProps {
  timerDock?: React.ReactNode
  toolbarInlineControls?: React.ReactNode
  hideHeadingHint?: boolean
}

function ReflectionShell({
  timerDock,
  toolbarInlineControls,
  hideHeadingHint = false,
}: ReflectionShellProps) {
  return (
    <div className="rounded-lg bg-muted/30">
      {timerDock ? (
        <div className="border-b border-border/50 px-5 py-3">{timerDock}</div>
      ) : null}

      <div className="px-5 py-4">
        <div className="mb-2 flex flex-wrap items-center gap-1 border-b border-border/50 pb-2">
          <Button variant="ghost" size="icon-sm" disabled aria-label="Bold">
            <Bold className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled aria-label="Italic">
            <Italic className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled aria-label="Underline">
            <Underline className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled aria-label="Strikethrough">
            <Strikethrough className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled aria-label="Code">
            <Code className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled aria-label="Highlight">
            <Highlighter className="size-4" />
          </Button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {toolbarInlineControls}
            {hideHeadingHint ? null : (
              <span className="text-[11px] text-muted-foreground">
                Headings: Ctrl+Alt+1..6
              </span>
            )}
          </div>
        </div>

        <p className="min-h-[190px] py-1 text-base leading-relaxed text-muted-foreground/70">
          {REFLECTION_PLACEHOLDER}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-foreground/90">0 words</span>
          <Button
            variant="default"
            size="sm"
            className="gap-2 rounded-md shadow-sm"
            disabled
          >
            <MessageSquareText className="size-4" />
            <span className="hidden sm:inline">AI Prompts</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function LogSessionConceptsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-6 md:px-10 md:py-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Log Session Concepts</h1>
        <p className="text-sm text-muted-foreground">
          Shell-only page with four ways to embed Topic Timer in the main area.
        </p>
      </div>

      <div className="space-y-6 pb-8">
        <ConceptCard
          title="Concept A: Unified Control Bar"
          description="A single integrated bar keeps Subject, Topic Timer, and Hashtags visually connected without duplicating subject context."
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-border/80 bg-card p-3 shadow-xs">
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <FieldShell icon={Book} placeholder="Select subject..." />
                <div className="flex justify-center md:border-x md:border-border/60 md:px-3">
                  <TopicTimerControls time="00:16:24" includeDelete />
                </div>
                <FieldShell icon={Hash} placeholder="Add tags..." />
              </div>
            </div>
            <ReflectionShell />
          </div>
        </ConceptCard>

        <ConceptCard
          title="Concept B: Editor Header Inline"
          description="Subject and Hashtags stay clean at the top while timer controls are integrated into the editor header where writing happens."
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldShell icon={Book} placeholder="Select subject..." />
              <FieldShell icon={Hash} placeholder="Add tags..." />
            </div>
            <ReflectionShell
              toolbarInlineControls={
                <div className="rounded-md border border-border/70 bg-card/80 px-1.5 py-1">
                  <TopicTimerControls time="00:09:11" compact includeDelete />
                </div>
              }
              hideHeadingHint
            />
          </div>
        </ConceptCard>

        <ConceptCard
          title="Concept C: Editor Dock"
          description="The timer dock sits directly above the editor body and keeps only the controls needed while writing."
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldShell icon={Book} placeholder="Select subject..." />
              <FieldShell icon={Hash} placeholder="Add tags..." />
            </div>

            <ReflectionShell
              timerDock={
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <TopicTimerControls time="00:18:05" includeDelete />
                </div>
              }
            />
          </div>
        </ConceptCard>

        <ConceptCard
          title="Concept D: Under-Fields Micro Dock"
          description="A lightweight timer strip sits between setup fields and editor, offering quick control without competing with the main form."
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldShell icon={Book} placeholder="Select subject..." />
              <FieldShell icon={Hash} placeholder="Add tags..." />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Topic Timer
              </span>
              <TopicTimerControls time="00:05:46" compact includeDelete />
            </div>

            <ReflectionShell />
          </div>
        </ConceptCard>
      </div>
    </div>
  )
}
