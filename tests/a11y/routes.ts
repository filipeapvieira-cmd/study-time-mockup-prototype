export const AUDIT_ROUTES = [
  { id: "marketing-home", path: "/" },
  { id: "dashboard", path: "/dashboard" },
  { id: "analytics", path: "/analytics" },
  { id: "log-session", path: "/log-session" },
  { id: "session-history", path: "/session-history" },
] as const;

export const AUDIT_THEMES = ["light", "dark"] as const;

export type AuditTheme = (typeof AUDIT_THEMES)[number];
