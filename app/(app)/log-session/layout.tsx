import { SessionHeader } from "@/components/log-session/session-header"

export default function LogSessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full flex-col">
      <SessionHeader />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
