"use client"

import { BookOpen, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export function CtaCard() {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-secondary via-accent to-muted">
      <CardContent className="relative flex flex-col gap-4 py-8 px-6 md:py-10 md:px-8">
        {/* Decorative circles */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center">
          <div className="size-28 rounded-full border border-border/50 flex items-center justify-center">
            <div className="size-20 rounded-full border border-border/50 flex items-center justify-center">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="size-5 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span className="size-1.5 rounded-full bg-chart-2" />
          Continue Learning
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight text-balance md:text-3xl max-w-sm">
          Welcome back, Scholar
        </h2>
        
        <p className="text-muted-foreground max-w-md">
          The quiet mind is the most productive. Your study session is ready
          whenever you are.
        </p>
        
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild>
            <Link href="/log-session">
              <Play className="mr-2 size-4" />
              Enter Focus Mode
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
