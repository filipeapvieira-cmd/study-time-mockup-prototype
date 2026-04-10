"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Play,
  History,
  BarChart3,
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
  GraduationCap,
  PanelLeft,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useZenMode } from "@/contexts/zen-mode-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { SessionPanel } from "@/components/log-session/session-panel"

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Log Session",
    url: "/log-session",
    icon: Play,
  },
  {
    title: "Session History",
    url: "/session-history",
    icon: History,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, open, toggleSidebar } = useSidebar()
  const { isZenMode } = useZenMode()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Mobile: show full brand header without collapse button */}
            {isMobile && (
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <GraduationCap className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">StudyTime</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Focus Tracker
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            )}

            {/* Desktop expanded: brand link + permanent PanelLeft collapse button */}
            {!isMobile && open && (
              <div className="flex items-center gap-2">
                <SidebarMenuButton size="lg" asChild className="flex-1">
                  <Link href="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <GraduationCap className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">StudyTime</span>
                      <span className="truncate text-xs text-muted-foreground">
                        Focus Tracker
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <PanelLeft className="size-4" />
                </button>
              </div>
            )}

            {/* Desktop collapsed: logo tile that swaps to PanelLeft on hover */}
            {!isMobile && !open && (
              <button
                type="button"
                onClick={toggleSidebar}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocus={() => setIsHovered(true)}
                onBlur={() => setIsHovered(false)}
                aria-label="Open sidebar"
                title="Open sidebar"
                className="relative flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground transition-all hover:bg-sidebar-primary/90"
              >
                <GraduationCap 
                  className={`size-4 absolute transition-opacity duration-150 ${isHovered ? 'opacity-0' : 'opacity-100'}`} 
                />
                <PanelLeft 
                  className={`size-4 absolute transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`} 
                />
              </button>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Session Panel - only shown on Log Session page when not in Zen mode */}
        {pathname === "/log-session" && !isZenMode && (
          <>
            <SidebarSeparator className="mx-0 group-data-[collapsible=icon]:hidden" />
            <SidebarGroup className="flex-1 group-data-[collapsible=icon]:hidden">
              <SidebarGroupContent className="h-full">
                <SessionPanel />
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src="/avatar.jpg" alt="User" />
                    <AvatarFallback className="rounded-lg">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">John Doe</span>
                    <span className="truncate text-xs text-muted-foreground">
                      john@example.com
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src="/avatar.jpg" alt="User" />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">John Doe</span>
                      <span className="truncate text-xs text-muted-foreground">
                        john@example.com
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {/* SidebarRail - only visible on mobile, desktop uses header controls */}
      <div className="md:hidden">
        <SidebarRail />
      </div>
    </Sidebar>
  )
}
