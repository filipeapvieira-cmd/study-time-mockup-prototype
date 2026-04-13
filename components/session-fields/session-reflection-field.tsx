"use client"

import * as React from "react"
import { Bold, Code, Highlighter, Italic, Strikethrough, Underline } from "lucide-react"
import type { Value } from "platejs"
import { Plate, usePlateEditor } from "platejs/react"

import { BasicNodesKit } from "@/components/basic-nodes-kit"
import { Editor, EditorContainer } from "@/components/ui/editor"
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button"
import { Toolbar, ToolbarGroup } from "@/components/ui/toolbar"
import { cloneReflection, reflectionToPlainText } from "@/lib/session-reflection"
import { cn } from "@/lib/utils"

interface SessionReflectionFieldProps {
  value: Value
  onChange: (value: Value) => void
  placeholder: string
  className?: string
  textareaClassName?: string
  footer?: React.ReactNode
}

export function SessionReflectionField({
  value,
  onChange,
  placeholder,
  className,
  textareaClassName,
  footer,
}: SessionReflectionFieldProps) {
  const editor = usePlateEditor(
    {
      plugins: BasicNodesKit,
      value: cloneReflection(value),
    },
    [],
  )

  const plainText = React.useMemo(() => reflectionToPlainText(value), [value])
  const wordCount = plainText ? plainText.split(/\s+/).length : 0

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="relative flex-1">
        <Plate
          editor={editor}
          onChange={({ value: nextValue }) =>
            onChange(cloneReflection(nextValue as Value))
          }
        >
          <EditorContainer
            className={cn(
              "min-h-[250px] rounded-lg border-0 bg-muted/30 px-5 py-4 shadow-none focus-within:ring-2 focus-within:ring-ring/20",
              textareaClassName,
            )}
          >
            <Toolbar className="mb-2 flex-wrap gap-1 border-b border-border/50 pb-2">
              <ToolbarGroup>
                <MarkToolbarButton
                  nodeType="bold"
                  tooltip="Bold (Ctrl+B)"
                  aria-label="Toggle bold formatting"
                >
                  <Bold className="size-4" />
                </MarkToolbarButton>
                <MarkToolbarButton
                  nodeType="italic"
                  tooltip="Italic (Ctrl+I)"
                  aria-label="Toggle italic formatting"
                >
                  <Italic className="size-4" />
                </MarkToolbarButton>
                <MarkToolbarButton
                  nodeType="underline"
                  tooltip="Underline (Ctrl+U)"
                  aria-label="Toggle underline formatting"
                >
                  <Underline className="size-4" />
                </MarkToolbarButton>
                <MarkToolbarButton
                  nodeType="strikethrough"
                  tooltip="Strikethrough (Ctrl+Shift+X)"
                  aria-label="Toggle strikethrough formatting"
                >
                  <Strikethrough className="size-4" />
                </MarkToolbarButton>
                <MarkToolbarButton
                  nodeType="code"
                  tooltip="Code (Ctrl+E)"
                  aria-label="Toggle inline code formatting"
                >
                  <Code className="size-4" />
                </MarkToolbarButton>
                <MarkToolbarButton
                  nodeType="highlight"
                  tooltip="Highlight (Ctrl+Shift+H)"
                  aria-label="Toggle highlight formatting"
                >
                  <Highlighter className="size-4" />
                </MarkToolbarButton>
              </ToolbarGroup>
              <span className="text-muted-foreground ml-auto text-[11px]">
                Headings: Ctrl+Alt+1..6
              </span>
            </Toolbar>
            <Editor
              variant="none"
              aria-label="Session reflection editor"
              placeholder={placeholder}
              className="min-h-[190px] px-0 py-1 text-base leading-relaxed placeholder:text-muted-foreground/50 [&_p]:py-0 **:data-slate-placeholder:!top-0 **:data-slate-placeholder:!translate-y-0"
            />
          </EditorContainer>
        </Plate>
      </div>
      <div
        className={cn(
          "flex items-center gap-3",
          footer ? "justify-between" : "justify-start",
        )}
      >
        <span className="text-xs font-medium text-foreground/90">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        {footer ? <div className="shrink-0">{footer}</div> : null}
      </div>
    </div>
  )
}
