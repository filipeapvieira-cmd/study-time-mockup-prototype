"use client"

import { useState, useEffect } from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
    <Card className="flex min-h-0 flex-col bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-chart-2/10">
              <Sparkles className="size-4 text-chart-2" />
            </div>
            <span className="text-sm font-medium">Daily Inspiration</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshQuote}
            disabled={isRefreshing}
            className="size-8"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh quote</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center pt-2">
        <div className={`space-y-3 transition-opacity duration-300 ${isRefreshing ? "opacity-0" : "opacity-100"}`}>
          <p className="text-lg font-medium leading-relaxed text-balance">
            &ldquo;{currentQuote.quote}&rdquo;
          </p>
          <p className="text-sm text-muted-foreground">
            — {currentQuote.author}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
