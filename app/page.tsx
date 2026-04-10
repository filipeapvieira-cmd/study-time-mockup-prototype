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
      
      <StatsCards />
      
      {/* Recent Sessions and Daily Motivation - responsive grid */}
      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        {/* Recent Sessions first on mobile, second on large screens */}
        <RecentSessionsCard />
        <QuotesCard />
      </div>
    </div>
  )
}
