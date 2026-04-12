"use client"

import * as React from "react"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface SessionReflectionFieldProps {
  value: string
  onChange: (value: string) => void
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
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="relative flex-1">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-h-[250px] resize-none rounded-lg border-0 bg-muted/30 px-5 py-4 text-base leading-relaxed placeholder:text-muted-foreground/50 shadow-none focus-visible:ring-2 focus-visible:ring-ring/20",
            textareaClassName,
          )}
        />
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
