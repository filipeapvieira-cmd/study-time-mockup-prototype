"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun } from "lucide-react"
import { useEffect, useState } from "react"

const motivationalQuotes = [
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    quote:
      "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    quote:
      "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
  },
  {
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
  },
  {
    quote: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
  {
    quote: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
  },
]

export function QuotesCard() {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0])

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
    setCurrentQuote(motivationalQuotes[randomIndex])
  }, [])

  return (
    <Card className="h-full flex min-h-0 flex-col gap-3 py-5">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Daily Inspiration
        </CardTitle>
        <Sun className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-6 text-balance">&ldquo;{currentQuote.quote}&rdquo;</p>
        <p className="mt-1 text-xs text-muted-foreground">- {currentQuote.author}</p>
      </CardContent>
    </Card>
  )
}

