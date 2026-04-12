"use client"

import { Calendar } from "lucide-react"

export function SessionHeader() {
  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).toUpperCase()

  return (
    <div className="hidden sm:block">
      <div className="mx-auto flex max-w-3xl items-center px-6 pt-6 md:px-10 md:pt-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}
