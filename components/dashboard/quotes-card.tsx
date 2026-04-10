"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
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
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
    setCurrentQuote(motivationalQuotes[randomIndex])
  }, [])

  const refreshQuote = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      let randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
      while (motivationalQuotes[randomIndex].quote === currentQuote.quote) {
        randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
      }
      setCurrentQuote(motivationalQuotes[randomIndex])
      setIsRefreshing(false)
    }, 300)
  }

  return (
    <Card className="flex min-h-0 flex-col gap-4 bg-gradient-to-br from-card to-muted/20 py-5">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Daily Inspiration</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshQuote}
            disabled={isRefreshing}
            className="size-8 text-muted-foreground"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh quote</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`space-y-2.5 transition-opacity duration-300 ${isRefreshing ? "opacity-0" : "opacity-100"}`}>
          <p className="text-base font-medium leading-7 text-balance">
            &ldquo;{currentQuote.quote}&rdquo;
          </p>
          <p className="text-sm text-muted-foreground">- {currentQuote.author}</p>
        </div>
      </CardContent>
    </Card>
  )
}

