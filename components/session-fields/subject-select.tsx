"use client"

import * as React from "react"
import { Book, Check, ChevronDown } from "lucide-react"

import { TagManager } from "@/components/log-session/tag-manager"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getTagItemByValue } from "@/lib/study-taxonomy"
import { cn } from "@/lib/utils"
import type { TagItem } from "@/types/tag"

interface SubjectSelectProps {
  subjects: TagItem[]
  hashtags: TagItem[]
  value: string
  onChange: (value: string) => void
  onSubjectsChange: (subjects: TagItem[]) => void
  onHashtagsChange: (hashtags: TagItem[]) => void
  placeholder?: string
  className?: string
}

export function SubjectSelect({
  subjects,
  hashtags,
  value,
  onChange,
  onSubjectsChange,
  onHashtagsChange,
  placeholder = "Select subject...",
  className,
}: SubjectSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selectedSubject = getTagItemByValue(subjects, value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-10 w-full justify-between rounded-md font-normal",
            className,
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {selectedSubject ? (
              <>
                <div
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: selectedSubject.color }}
                />
                <span className="truncate">{selectedSubject.label}</span>
              </>
            ) : (
              <>
                <Book className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{placeholder}</span>
              </>
            )}
          </div>
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <div className="flex items-center">
            <CommandInput placeholder="Search subject..." className="flex-1" />
            <div className="flex h-9 items-center border-b pr-1">
              <TagManager
                subjects={subjects}
                hashtags={hashtags}
                onSubjectsChange={onSubjectsChange}
                onHashtagsChange={onHashtagsChange}
                initialTab="subjects"
              />
            </div>
          </div>
          <CommandList>
            <CommandEmpty>No subject found.</CommandEmpty>
            <CommandGroup>
              {subjects.map((subject) => (
                <CommandItem
                  key={subject.id}
                  value={subject.value}
                  onSelect={(selectedValue) => {
                    onChange(selectedValue === value ? "" : selectedValue)
                    setOpen(false)
                  }}
                >
                  <div
                    className="mr-2 size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === subject.value ? "opacity-100" : "opacity-0",
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
  )
}
