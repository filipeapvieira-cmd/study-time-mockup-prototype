import { CtaCard } from "@/components/dashboard/cta-card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { QuotesCard } from "@/components/dashboard/quotes-card"
import { RecentSessionsCard } from "@/components/dashboard/recent-sessions-card"

export default function DashboardPage() {
  return (
    <div className="flex min-h-full flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your study progress and stay motivated.
        </p>
      </div>
      
      <CtaCard />

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <RecentSessionsCard />
        <div className="grid content-start gap-6">
          <QuotesCard />
          <StatsCards />
        </div>
      </div>
    </div>
  )
}
