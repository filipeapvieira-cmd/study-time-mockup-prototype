import type { ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { LogSessionDraftProvider } from "@/components/log-session/log-session-draft-provider"
import { AppThemeBoundary } from "@/components/app-theme-boundary"
import { Toaster } from "@/components/ui/sonner"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type AppLayoutProps = {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AppThemeBoundary>
      <div className="relative mx-auto min-h-svh max-w-7xl">
        <SidebarProvider>
          <LogSessionDraftProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-14 items-center gap-2 border-b border-border px-4 md:hidden">
                <SidebarTrigger className="-ml-1" />
                <span className="font-semibold">StudyTime</span>
              </header>
              <main className="flex-1 h-full overflow-auto">{children}</main>
            </SidebarInset>
          </LogSessionDraftProvider>
        </SidebarProvider>
        <Toaster />
      </div>
    </AppThemeBoundary>
  )
}
