import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  GraduationCap,
  History,
  Timer,
} from "lucide-react"

import { StackedImageCard } from "@/components/marketing/stacked-image-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const heroBadges = [
  {
    label: "2h 40m focused",
    className:
      "left-0 top-8 -translate-x-6 bg-[#55c2d3] text-[#113340] shadow-md lg:-translate-x-10",
  },
  {
    label: "Daily goal completed",
    className:
      "right-0 top-16 translate-x-8 bg-[#f3cc78] text-[#4f3b12] shadow-md lg:translate-x-12",
  },
  {
    label: "New streak: 14 days",
    className:
      "left-0 bottom-24 -translate-x-4 bg-[#8366f2] text-white shadow-md lg:-translate-x-8",
  },
  {
    label: "3 sessions synced",
    className:
      "right-6 bottom-8 translate-y-4 bg-white text-foreground shadow-md",
  },
]

const valueCards = [
  {
    icon: Timer,
    title: "Log Sessions Fast",
    copy: "Capture subject, duration, and reflection in under a minute.",
  },
  {
    icon: History,
    title: "See Your Patterns",
    copy: "Revisit session history to learn what focus routine works best.",
  },
  {
    icon: BarChart3,
    title: "Track Momentum",
    copy: "Visual analytics make it easy to keep a consistent study streak.",
  },
]

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
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/session-history">View sessions</Link>
            </Button>
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

            <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="name@school.edu"
                className="h-12 rounded-xl border-border/70 bg-white/80 shadow-sm"
              />
              <Button asChild className="h-12 rounded-xl px-7 text-sm sm:w-auto">
                <Link href="/log-session">Start Your Focus Plan</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {valueCards.map((card) => (
                <Card
                  key={card.title}
                  className="border-border/60 bg-white/80 py-4 shadow-sm backdrop-blur-sm"
                >
                  <CardContent className="space-y-2 px-4">
                    <card.icon className="size-4 text-primary" />
                    <p className="text-sm font-semibold">{card.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {card.copy}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative overflow-visible">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_35%_35%,rgba(131,102,242,0.2),transparent_60%)] blur-2xl" />
            <div className="relative mx-auto w-full max-w-[30rem] lg:translate-x-8 xl:translate-x-14">
              <StackedImageCard
                src="/images/landing_page.avif"
                alt="Student using StudyTime to stay focused"
                priority
              />
              {heroBadges.map((badge) => (
                <div
                  key={badge.label}
                  className={`absolute rounded-full px-4 py-2 text-xs font-semibold tracking-wide ${badge.className}`}
                >
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
