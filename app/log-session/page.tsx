"use client"

import React from "react"
import { Book, Hash, Check, ChevronDown, X, MessageSquareText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIQuestionsSheet } from "@/components/log-session/ai-questions-sheet"
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
import { cn } from "@/lib/utils"
import { TagManager, type TagItem } from "@/components/log-session/tag-manager"

const defaultSubjects: TagItem[] = [
  { id: "1", value: "theoretical-physics", label: "Theoretical Physics", color: "#3b82f6" },
  { id: "2", value: "mathematics", label: "Mathematics", color: "#8b5cf6" },
  { id: "3", value: "computer-science", label: "Computer Science", color: "#22c55e" },
  { id: "4", value: "literature", label: "Literature", color: "#f97316" },
  { id: "5", value: "chemistry", label: "Chemistry", color: "#ef4444" },
  { id: "6", value: "biology", label: "Biology", color: "#14b8a6" },
  { id: "7", value: "history", label: "History", color: "#eab308" },
]

const defaultHashtags: TagItem[] = [
  { id: "1", value: "quantum", label: "#quantum", color: "#3b82f6" },
  { id: "2", value: "mechanics", label: "#mechanics", color: "#8b5cf6" },
  { id: "3", value: "algebra", label: "#algebra", color: "#22c55e" },
  { id: "4", value: "calculus", label: "#calculus", color: "#f97316" },
  { id: "5", value: "algorithms", label: "#algorithms", color: "#ef4444" },
  { id: "6", value: "data-structures", label: "#data-structures", color: "#14b8a6" },
  { id: "7", value: "philosophy", label: "#philosophy", color: "#eab308" },
  { id: "8", value: "research", label: "#research", color: "#ec4899" },
]

export default function LogSessionPage() {
  const [subjectOpen, setSubjectOpen] = React.useState(false)
  const [selectedSubject, setSelectedSubject] = React.useState("")
  const [hashtagsOpen, setHashtagsOpen] = React.useState(false)
  const [selectedHashtags, setSelectedHashtags] = React.useState<string[]>([])
  const [content, setContent] = React.useState("")
  
  const [subjects, setSubjects] = React.useState<TagItem[]>(defaultSubjects)
  const [hashtags, setHashtags] = React.useState<TagItem[]>(defaultHashtags)
  const [aiSheetOpen, setAiSheetOpen] = React.useState(false)

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  const toggleHashtag = (value: string) => {
    setSelectedHashtags((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }

  const removeHashtag = (value: string) => {
    setSelectedHashtags((current) => current.filter((item) => item !== value))
  }

  return (
    <div className="flex h-full flex-col">
      {/* Content Container */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-6 md:px-10 md:py-8">
        {/* Metadata Section */}
        <div className="space-y-4">
          {/* Selectors Row */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Subject Selector */}
            <div>
              <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={subjectOpen}
                    className="h-10 w-full justify-between rounded-md border-muted-foreground/20 font-normal shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {selectedSubject ? (
                        <>
                          <div
                            className="size-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: subjects.find((s) => s.value === selectedSubject)?.color,
                            }}
                          />
                          <span className="truncate">
                            {subjects.find((s) => s.value === selectedSubject)?.label}
                          </span>
                        </>
                      ) : (
                        <>
                          <Book className="size-4 shrink-0 text-muted-foreground" />
                          <span className="text-muted-foreground">Select subject...</span>
                        </>
                      )}
                    </div>
                    <ChevronDown className="ml-2 size-4 shrink-0 opacity-40" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <div className="flex items-center border-b">
                      <CommandInput placeholder="Search subject..." className="flex-1" />
                      <div className="pr-1">
                        <TagManager
                          subjects={subjects}
                          hashtags={hashtags}
                          onSubjectsChange={setSubjects}
                          onHashtagsChange={setHashtags}
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
                            onSelect={(value) => {
                              setSelectedSubject(value === selectedSubject ? "" : value)
                              setSubjectOpen(false)
                            }}
                          >
                            <div
                              className="mr-2 size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                selectedSubject === subject.value ? "opacity-100" : "opacity-0"
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
            </div>

            {/* Hashtags Selector */}
            <div>
              <Popover open={hashtagsOpen} onOpenChange={setHashtagsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={hashtagsOpen}
                    className="h-10 w-full justify-between rounded-md border-muted-foreground/20 font-normal shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <Hash className="size-4 shrink-0 text-muted-foreground" />
                      <span className={selectedHashtags.length > 0 ? "" : "text-muted-foreground"}>
                        {selectedHashtags.length > 0
                          ? `${selectedHashtags.length} tag${selectedHashtags.length > 1 ? "s" : ""} selected`
                          : "Add tags..."}
                      </span>
                    </div>
                    <ChevronDown className="ml-2 size-4 shrink-0 opacity-40" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <div className="flex items-center border-b">
                      <CommandInput placeholder="Search tags..." className="flex-1" />
                      <div className="pr-1">
                        <TagManager
                          subjects={subjects}
                          hashtags={hashtags}
                          onSubjectsChange={setSubjects}
                          onHashtagsChange={setHashtags}
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
                                selectedHashtags.includes(hashtag.value)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {hashtag.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Selected Hashtags Pills */}
          {selectedHashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedHashtags.map((tagValue) => {
                const tag = hashtags.find((h) => h.value === tagValue)
                return (
                  <span
                    key={tagValue}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: tag?.color ? `${tag.color}15` : undefined,
                      color: tag?.color,
                    }}
                  >
                    {tag?.label || `#${tagValue}`}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => removeHashtag(tagValue)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          removeHashtag(tagValue)
                        }
                      }}
                      className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-black/10"
                    >
                      <X className="size-3" />
                    </span>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Writing Area */}
        <div className="mt-8 flex flex-1 flex-col">
          <div className="relative flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Begin your reflection here. What did you learn? What challenged you? What connections did you make?"
              className="h-full min-h-[300px] w-full resize-none rounded-lg border-0 bg-muted/30 px-5 py-4 text-base leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          
          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground/60">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-md border-border/80 bg-background text-foreground shadow-sm hover:bg-muted"
              onClick={() => setAiSheetOpen(true)}
            >
              <MessageSquareText className="size-4" />
              <span className="hidden sm:inline">AI Prompts</span>
            </Button>
          </div>
        </div>
      </div>

      {/* AI Questions Sheet */}
      <AIQuestionsSheet open={aiSheetOpen} onOpenChange={setAiSheetOpen} />
    </div>
  )
}
