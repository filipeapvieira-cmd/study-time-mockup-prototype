import Link from "next/link"
import {
  ArrowRight,
  GraduationCap,
} from "lucide-react"

import { PixelImage } from "@/components/ui/pixel-image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="relative isolate bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(243,204,120,0.16),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(131,102,242,0.14),transparent_35%),linear-gradient(180deg,#f8f6f1_0%,#faf9f6_45%,#ffffff_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-size:44px_44px] [background-image:linear-gradient(to_right,rgba(17,24,39,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.06)_1px,transparent_1px)]" />

      <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-6 pb-14 pt-8 md:px-10 lg:px-14">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">StudyTime</p>
              <p className="text-xs text-muted-foreground">Focus Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/dashboard">
                Enter app
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="space-y-8">
            <div className="space-y-5">
              <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
                Better Sessions.
                <br />
                Stronger Study Habits.
              </h1>
              <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                StudyTime helps you move from random study blocks to intentional
                focus sessions with clear reflection, history, and progress you
                can feel every week.
              </p>
            </div>

          </div>

          <div className="relative overflow-visible">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_35%_35%,rgba(131,102,242,0.2),transparent_60%)] blur-2xl" />
            <div className="relative mx-auto w-full max-w-[30rem] lg:translate-x-8 xl:translate-x-14">
              <div className="origin-top-right translate-x-2 translate-y-1 rotate-[4deg]">
                <PixelImage
                  src="/images/landing_page.avif"
                  customGrid={{ rows: 4, cols: 6 }}
                  grayscaleAnimation
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
