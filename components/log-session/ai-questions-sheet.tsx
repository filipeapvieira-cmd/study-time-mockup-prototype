"use client"

import * as React from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

// Mock AI-generated questions
const mockQuestions = [
  {
    id: "1",
    type: "Comprehension",
    question: "What are the key concepts you explored in this session?",
  },
  {
    id: "2",
    type: "Analysis",
    question: "How does this connect to what you learned previously?",
  },
  {
    id: "3",
    type: "Reflection",
    question: "What challenges did you face and how did you overcome them?",
  },
]

interface AIQuestionsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIQuestionsSheet({ open, onOpenChange }: AIQuestionsSheetProps) {
  const [questions, setQuestions] = React.useState<typeof mockQuestions>([])
  const [isGenerating, setIsGenerating] = React.useState(false)

  const generateQuestions = async () => {
    setIsGenerating(true)
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setQuestions(mockQuestions)
    setIsGenerating(false)
  }

  // Auto-generate when sheet opens if no questions
  React.useEffect(() => {
    if (open && questions.length === 0 && !isGenerating) {
      generateQuestions()
    }
  }, [open, questions.length, isGenerating])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Reflection Prompts</SheetTitle>
          <SheetDescription>
            Consider this questions as you continue your reflection. There is no
            right answer - explore your thoughts freely.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-3 p-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="size-6 animate-spin text-muted-foreground" />
              <span className="mt-3 text-sm text-muted-foreground">
                Generating questions...
              </span>
            </div>
          ) : questions.length > 0 ? (
            <>
              {questions.map((q) => (
                <Card key={q.id}>
                  <CardContent className="p-4">
                    <div className="pl-7">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {q.type}
                      </Badge>
                      <p className="text-sm leading-relaxed">{q.question}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={generateQuestions}
                disabled={isGenerating}
                className="mt-2"
              >
                <RefreshCw className="mr-2 size-3" />
                Generate New Questions
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="size-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No questions generated yet
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
