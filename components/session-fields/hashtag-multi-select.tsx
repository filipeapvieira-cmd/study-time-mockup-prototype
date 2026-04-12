"use client"

import * as React from "react"
import { Check, ChevronDown, Hash, X } from "lucide-react"

import { TagManager } from "@/components/log-session/tag-manager"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getTagItemByValue } from "@/lib/study-taxonomy"
import { cn } from "@/lib/utils"
import type { TagItem } from "@/types/tag"

interface HashtagMultiSelectProps {
  subjects: TagItem[]
  hashtags: TagItem[]
  value: string[]
  onChange: (value: string[]) => void
  onSubjectsChange: (subjects: TagItem[]) => void
  onHashtagsChange: (hashtags: TagItem[]) => void
  className?: string
}

export function HashtagMultiSelect({
  subjects,
  hashtags,
  value,
  onChange,
  onSubjectsChange,
  onHashtagsChange,
  className,
}: HashtagMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [hoverOpen, setHoverOpen] = React.useState(false)
  const hasSelectedHashtags = value.length > 0

  const toggleHashtag = React.useCallback(
    (nextValue: string) => {
      onChange(
        value.includes(nextValue)
          ? value.filter((item) => item !== nextValue)
          : [...value, nextValue],
      )
    },
    [onChange, value],
  )

  const removeHashtag = React.useCallback(
    (nextValue: string) => {
      onChange(value.filter((item) => item !== nextValue))
    },
    [onChange, value],
  )

  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      setHoverOpen(false)
    }
  }, [])

  const selectButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn(
        "h-10 w-full justify-between rounded-md font-normal",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <Hash className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn(!hasSelectedHashtags && "text-muted-foreground")}>
          {hasSelectedHashtags
            ? `${value.length} tag${value.length > 1 ? "s" : ""} selected`
            : "Add tags..."}
        </span>
      </div>
      <ChevronDown className="ml-2 size-4 shrink-0 opacity-40" />
    </Button>
  )

  const selectContent = (
    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
      <Command>
        <div className="flex items-center border-b">
          <CommandInput placeholder="Search tags..." className="flex-1" />
          <div className="pr-1">
            <TagManager
              subjects={subjects}
              hashtags={hashtags}
              onSubjectsChange={onSubjectsChange}
              onHashtagsChange={onHashtagsChange}
              initialTab="hashtags"
            />
          </div>
        </div>
        <CommandList>
          <CommandEmpty>No tag found.</CommandEmpty>
          <CommandGroup>
            {hashtags.map((hashtag) => (
              <CommandItem
                key={hashtag.id}
                value={hashtag.value}
                onSelect={() => toggleHashtag(hashtag.value)}
              >
                <div
                  className="mr-2 size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: hashtag.color }}
                />
                <Check
                  className={cn(
                    "mr-2 size-4",
                    value.includes(hashtag.value) ? "opacity-100" : "opacity-0",
                  )}
                />
                {hashtag.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  )

  if (!hasSelectedHashtags) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{selectButton}</PopoverTrigger>
        {selectContent}
      </Popover>
    )
  }

  return (
    <HoverCard
      open={hasSelectedHashtags && !open && hoverOpen}
      onOpenChange={(nextOpen) => setHoverOpen(nextOpen && !open)}
      openDelay={120}
      closeDelay={100}
    >
      <HoverCardTrigger asChild>
        <div className="w-full">
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{selectButton}</PopoverTrigger>
            {selectContent}
          </Popover>
        </div>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-72 max-w-[calc(100vw-2rem)]">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Selected hashtags</p>
          <div className="flex flex-wrap gap-2">
            {value.map((tagValue) => {
              const tag = getTagItemByValue(hashtags, tagValue)
              const label = tag?.label || `#${tagValue}`

              return (
                <Badge
                  key={tagValue}
                  variant="outline"
                  className="gap-1.5 border-transparent pr-1 shadow-none"
                  style={{
                    backgroundColor: tag?.color ? `${tag.color}15` : undefined,
                    color: tag?.color,
                  }}
                >
                  <span className="truncate">{label}</span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      removeHashtag(tagValue)
                    }}
                    className="rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                    aria-label={`Remove ${label}`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
