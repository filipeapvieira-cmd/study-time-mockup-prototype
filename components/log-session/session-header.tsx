"use client"

import { Calendar, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useZenMode } from "@/contexts/zen-mode-context"
import { useSidebar } from "@/components/ui/sidebar"

export function SessionHeader() {
  const { isZenMode, setZenMode } = useZenMode()
  const { setOpen } = useSidebar()

  const handleZenModeToggle = () => {
    const nextIsZenMode = !isZenMode

    setZenMode(nextIsZenMode)
    setOpen(!nextIsZenMode)
  }

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).toUpperCase()

  return (
    <div className="hidden sm:block">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          <span>{formattedDate}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZenModeToggle}
          className="gap-2 rounded-md text-muted-foreground hover:text-foreground"
        >
          {isZenMode ? (
            <>
              <Minimize2 className="size-4" />
              Exit Zen Mode
            </>
          ) : (
            <>
              <Maximize2 className="size-4" />
              Zen Mode
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
