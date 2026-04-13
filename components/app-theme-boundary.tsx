"use client"

import { useEffect, type ReactNode } from "react"

import { ThemeProvider } from "@/components/theme-provider"

type AppThemeBoundaryProps = {
  children: ReactNode
}

function ThemeCleanup() {
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("dark", "light")
      document.documentElement.style.colorScheme = ""
    }
  }, [])

  return null
}

export function AppThemeBoundary({ children }: AppThemeBoundaryProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeCleanup />
      {children}
    </ThemeProvider>
  )
}
