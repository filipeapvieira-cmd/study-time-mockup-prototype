"use client";

import React from "react";
import { MessageSquareText } from "lucide-react";

import { AIQuestionsSheet } from "@/components/log-session/ai-questions-sheet";
import { HashtagMultiSelect } from "@/components/session-fields/hashtag-multi-select";
import { SessionReflectionField } from "@/components/session-fields/session-reflection-field";
import { SubjectSelect } from "@/components/session-fields/subject-select";
import { Button } from "@/components/ui/button";
import { createEmptyReflection } from "@/lib/session-reflection";
import {
  cloneTagItems,
  PROTOTYPE_HASHTAGS,
  PROTOTYPE_SUBJECTS,
} from "@/lib/study-taxonomy";
import type { TagItem } from "@/types/tag";

export default function LogSessionPage() {
  const [selectedSubject, setSelectedSubject] = React.useState("");
  const [selectedHashtags, setSelectedHashtags] = React.useState<string[]>([]);
  const [content, setContent] = React.useState(createEmptyReflection);
  const [subjects, setSubjects] = React.useState<TagItem[]>(() =>
    cloneTagItems(PROTOTYPE_SUBJECTS),
  );
  const [hashtags, setHashtags] = React.useState<TagItem[]>(() =>
    cloneTagItems(PROTOTYPE_HASHTAGS),
  );
  const [aiSheetOpen, setAiSheetOpen] = React.useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-6 md:px-10 md:py-8">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <SubjectSelect
                subjects={subjects}
                hashtags={hashtags}
                value={selectedSubject}
                onChange={setSelectedSubject}
                onSubjectsChange={setSubjects}
                onHashtagsChange={setHashtags}
              />
            </div>

            <div>
              <HashtagMultiSelect
                subjects={subjects}
                hashtags={hashtags}
                value={selectedHashtags}
                onChange={setSelectedHashtags}
                onSubjectsChange={setSubjects}
                onHashtagsChange={setHashtags}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-1 flex-col">
          <SessionReflectionField
            value={content}
            onChange={setContent}
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

      <AIQuestionsSheet open={aiSheetOpen} onOpenChange={setAiSheetOpen} />
    </div>
  );
}
