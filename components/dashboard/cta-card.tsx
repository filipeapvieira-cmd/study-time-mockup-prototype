import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Highlighter } from "@/components/ui/highlighter"
import { mockUserFirstName } from "@/lib/mock-user"
import Image from "next/image"
import Link from "next/link"

export function CtaCard() {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-secondary via-accent to-muted py-0">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 overflow-hidden md:block [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_100%)]">
        <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/dashboard/study-desk.avif"
          alt="A calm study desk with books and warm light."
          fill
          priority
          sizes="(max-width: 767px) 0px, 50vw"
          className="scale-105 object-cover [object-position:24%_center] opacity-100 saturate-160 contrast-120 brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-secondary/4 to-secondary/16" />
        </div>
      </div>

      <CardContent className="relative z-10 flex flex-col gap-4 px-6 py-8 md:px-8 md:py-10 md:pr-[44%] lg:pr-[46%]">

        <h2 className="text-2xl font-bold tracking-tight text-balance md:text-3xl max-w-sm">
          Welcome back, {mockUserFirstName}
        </h2>
        
        <p className="text-muted-foreground max-w-md">
          The{" "}
          <Highlighter
            action="underline"
            color="var(--chart-5)"
            strokeWidth={2}
            iterations={1}
          >
            quiet mind is the most productive
          </Highlighter>. Your study session is ready whenever you are.
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
