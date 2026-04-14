import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun } from "lucide-react"

const DEMO_QUOTE = {
  quote: "The secret of getting ahead is getting started.",
  author: "Mark Twain",
} as const

export function QuotesCard() {
  return (
    <Card className="h-full flex min-h-0 flex-col gap-3 py-5">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Daily Inspiration
        </CardTitle>
        <Sun className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-6 text-balance">&ldquo;{DEMO_QUOTE.quote}&rdquo;</p>
        <p className="mt-1 text-xs text-muted-foreground">- {DEMO_QUOTE.author}</p>
      </CardContent>
    </Card>
  )
}

