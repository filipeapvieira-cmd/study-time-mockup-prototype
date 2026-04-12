"use client"

import React from "react"
import { format, isToday, isYesterday, parseISO } from "date-fns"
import {
  SlidersHorizontal,
  Calendar as CalendarIcon,
  Filter,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  List,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SessionEditorSheet } from "@/components/session-history/session-editor-sheet"
import { getTagItemByValue, PROTOTYPE_SUBJECTS } from "@/lib/study-taxonomy"
import type { StudySession } from "@/types/session"

type SampleSessionConfig = Omit<StudySession, "subjectColor" | "subjectLabel">

function createSampleSession(session: SampleSessionConfig): StudySession {
  const subject = getTagItemByValue(PROTOTYPE_SUBJECTS, session.subject)

  if (!subject) {
    throw new Error(`Unknown prototype subject: ${session.subject}`)
  }

  return {
    ...session,
    subjectLabel: subject.label,
    subjectColor: subject.color,
  }
}

const sampleSessions: StudySession[] = [
  createSampleSession({
    id: "1",
    subject: "computer-science",
    hashtags: ["research"],
    reflection: "Today I focused on understanding the fundamentals of user research methodologies. I learned about different interview techniques and how to synthesize qualitative data effectively.",
    feelings: "Motivated",
    date: "2026-03-28",
    startTime: "14:00",
    endTime: "14:49",
    pauseTime: 0,
    effectiveTime: 2930,
    topics: [
      { id: "t1", name: "User Research Methods", duration: 1200 },
      { id: "t2", name: "Interview Techniques", duration: 900 },
      { id: "t3", name: "Data Synthesis", duration: 830 },
    ],
    createdAt: "2026-03-28T14:00:00Z",
    updatedAt: "2026-03-28T14:49:00Z",
  }),
  createSampleSession({
    id: "2",
    subject: "theoretical-physics",
    hashtags: ["quantum"],
    reflection: "Deep dive into wave-particle duality. Finally wrapping my head around the core concepts.",
    feelings: "Challenged",
    date: "2026-03-28",
    startTime: "09:00",
    endTime: "10:36",
    pauseTime: 60,
    effectiveTime: 5760,
    topics: [
      { id: "t4", name: "Wave-Particle Duality", duration: 3600 },
      { id: "t5", name: "Quantum States", duration: 2160 },
    ],
    createdAt: "2026-03-28T09:00:00Z",
    updatedAt: "2026-03-28T10:36:00Z",
  }),
  createSampleSession({
    id: "3",
    subject: "mathematics",
    hashtags: ["calculus"],
    reflection: "Practiced integration by parts. Needed more time on the tricky trigonometric substitutions.",
    feelings: "Focused",
    date: "2026-03-27",
    startTime: "16:00",
    endTime: "17:11",
    pauseTime: 0,
    effectiveTime: 4260,
    topics: [
      { id: "t6", name: "Integration by Parts", duration: 2400 },
      { id: "t7", name: "Trig Substitutions", duration: 1860 },
    ],
    createdAt: "2026-03-27T16:00:00Z",
    updatedAt: "2026-03-27T17:11:00Z",
  }),
  createSampleSession({
    id: "4",
    subject: "computer-science",
    hashtags: ["algorithms"],
    reflection: "",
    feelings: "",
    date: "2026-03-25",
    startTime: "11:00",
    endTime: "12:25",
    pauseTime: 0,
    effectiveTime: 5100,
    topics: [],
    createdAt: "2026-03-25T11:00:00Z",
    updatedAt: "2026-03-25T12:25:00Z",
  }),
  createSampleSession({
    id: "5",
    subject: "literature",
    hashtags: [],
    reflection: "",
    feelings: "",
    date: "2026-03-23",
    startTime: "10:00",
    endTime: "11:15",
    pauseTime: 0,
    effectiveTime: 4492,
    topics: [],
    createdAt: "2026-03-23T10:00:00Z",
    updatedAt: "2026-03-23T11:15:00Z",
  }),
  createSampleSession({
    id: "6",
    subject: "chemistry",
    hashtags: [],
    reflection: "",
    feelings: "",
    date: "2026-03-22",
    startTime: "14:00",
    endTime: "15:29",
    pauseTime: 0,
    effectiveTime: 5318,
    topics: [],
    createdAt: "2026-03-22T14:00:00Z",
    updatedAt: "2026-03-22T15:29:00Z",
  }),
  createSampleSession({
    id: "7",
    subject: "biology",
    hashtags: [],
    reflection: "",
    feelings: "",
    date: "2026-03-22",
    startTime: "09:00",
    endTime: "11:07",
    pauseTime: 0,
    effectiveTime: 7645,
    topics: [],
    createdAt: "2026-03-22T09:00:00Z",
    updatedAt: "2026-03-22T11:07:00Z",
  }),
  createSampleSession({
    id: "8",
    subject: "history",
    hashtags: [],
    reflection: "",
    feelings: "",
    date: "2026-03-21",
    startTime: "15:00",
    endTime: "16:03",
    pauseTime: 0,
    effectiveTime: 3787,
    topics: [],
    createdAt: "2026-03-21T15:00:00Z",
    updatedAt: "2026-03-21T16:03:00Z",
  }),
  createSampleSession({
    id: "9",
    subject: "computer-science",
    hashtags: ["research"],
    reflection: "Very productive session today. Made significant progress on the user persona development.",
    feelings: "Very good",
    date: "2026-03-21",
    startTime: "10:00",
    endTime: "10:52",
    pauseTime: 0,
    effectiveTime: 3121,
    topics: [
      { id: "t6", name: "User Personas", duration: 1800 },
      { id: "t7", name: "Journey Mapping", duration: 1321 },
    ],
    createdAt: "2026-03-21T10:00:00Z",
    updatedAt: "2026-03-21T10:52:00Z",
  }),
  createSampleSession({
    id: "10",
    subject: "literature",
    hashtags: [],
    reflection: "",
    feelings: "",
    date: "2026-03-18",
    startTime: "13:00",
    endTime: "14:07",
    pauseTime: 0,
    effectiveTime: 4018,
    topics: [],
    createdAt: "2026-03-18T13:00:00Z",
    updatedAt: "2026-03-18T14:07:00Z",
  }),
]

// Helper function to format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

// Helper function to format duration in human readable format (e.g., "1h 36m")
function formatDurationHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Helper function to format date group header
function formatDateHeader(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return "TODAY"
  if (isYesterday(date)) return "YESTERDAY"
  return format(date, "EEEE, MMMM d").toUpperCase()
}

// Group sessions by date
function groupSessionsByDate(sessions: StudySession[]): Record<string, StudySession[]> {
  return sessions.reduce((groups, session) => {
    const date = session.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(session)
    return groups
  }, {} as Record<string, StudySession[]>)
}

export default function SessionHistoryPage() {
  const [sessions, setSessions] = React.useState<StudySession[]>(sampleSessions)
  const [filterValue, setFilterValue] = React.useState("")
  const [rowsPerPage, setRowsPerPage] = React.useState("10")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [viewMode, setViewMode] = React.useState<"compact" | "expanded">("compact")
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(2026, 2, 28),
    to: new Date(2026, 2, 28),
  })

  // Editor state
  const [editorOpen, setEditorOpen] = React.useState(false)
  const [selectedSession, setSelectedSession] = React.useState<StudySession | null>(null)

  const totalRows = 488
  const totalPages = Math.ceil(totalRows / parseInt(rowsPerPage))

  // Group sessions by date for expanded view
  const groupedSessions = React.useMemo(() => groupSessionsByDate(sessions), [sessions])
  const sortedDates = React.useMemo(
    () => Object.keys(groupedSessions).sort((a, b) => b.localeCompare(a)),
    [groupedSessions]
  )

  const handleRowClick = (session: StudySession) => {
    setSelectedSession(session)
    setEditorOpen(true)
  }

  const handleSaveSession = (updatedSession: StudySession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    )
    setEditorOpen(false)
    setSelectedSession(null)
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    setEditorOpen(false)
    setSelectedSession(null)
  }

  return (
    <div className="flex min-h-full flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
          <p className="text-muted-foreground">
            Detailed log of your intellectual growth and focus sessions.
          </p>
        </div>
        {/* View Toggle */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as "compact" | "expanded")}
          className="hidden sm:flex"
        >
          <ToggleGroupItem value="compact" aria-label="Compact view" title="Compact view">
            <List className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="expanded" aria-label="Expanded view" title="Expanded view">
            <LayoutGrid className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0" />
            <Input
              placeholder="Filter..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full text-sm font-medium placeholder:font-normal sm:w-[200px]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile View Toggle */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "compact" | "expanded")}
              className="sm:hidden"
            >
              <ToggleGroupItem value="compact" aria-label="Compact view" size="sm">
                <List className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="expanded" aria-label="Expanded view" size="sm">
                <LayoutGrid className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 gap-2 sm:flex-none">
                  <CalendarIcon className="size-4 shrink-0" />
                  <span className="truncate">
                    {dateRange.from && dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                        {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      "Select date range"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) =>
                    setDateRange({ from: range?.from, to: range?.to })
                  }
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Filter className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Download className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content - Table or Cards */}
        {viewMode === "compact" ? (
          /* Compact Table View */
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Subject</TableHead>
                  <TableHead className="min-w-[100px]">
                    <Button variant="ghost" className="gap-1 p-0 hover:bg-transparent">
                      Date
                      <ArrowUpDown className="size-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[120px] text-right">
                    <Button variant="ghost" className="gap-1 p-0 hover:bg-transparent">
                      <span className="hidden sm:inline">Session </span>Duration
                      <ArrowUpDown className="size-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(session)}
                  >
                    <TableCell className="whitespace-nowrap">{session.subjectLabel}</TableCell>
                    <TableCell className="whitespace-nowrap">{session.date}</TableCell>
                    <TableCell className="whitespace-nowrap text-right font-mono">
                      {formatDuration(session.effectiveTime)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* Expanded View */
          <div className="flex flex-1 flex-col gap-6">
            {sortedDates.map((date) => (
              <div key={date}>
                {/* Date Group Header */}
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                    {formatDateHeader(date)}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                
                {/* Sessions for this date */}
                <div className="flex flex-col gap-3">
                  {groupedSessions[date].map((session) => (
                    <div
                      key={session.id}
                      className="group cursor-pointer rounded-lg border bg-card p-4 transition-all hover:shadow-md"
                      style={{ borderLeftWidth: "4px", borderLeftColor: session.subjectColor }}
                      onClick={() => handleRowClick(session)}
                    >
                      <div className="flex gap-4">
                        {/* Left side - Time and Duration */}
                        <div className="flex shrink-0 flex-col items-start gap-1 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            <span className="text-sm font-medium text-foreground">
                              {session.startTime}
                            </span>
                          </div>
                          <span className="text-xs">
                            {formatDurationHuman(session.effectiveTime)}
                          </span>
                        </div>

                        {/* Right side - Subject */}
                        <div className="min-w-0 flex-1">
                          {/* Subject and Hashtags */}
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span
                              className="font-medium"
                              style={{ color: session.subjectColor }}
                            >
                              {session.subjectLabel}
                            </span>
                            {session.hashtags.map((tag) => (
                              <span
                                key={tag}
                                className="text-sm text-muted-foreground"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Reflection */}
                          {session.reflection ? (
                            <p className="mb-2 text-sm text-foreground/80">
                              {session.reflection}
                            </p>
                          ) : (
                            <p className="mb-2 text-sm italic text-muted-foreground">
                              No reflection logged for this session.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {totalRows} row(s) total.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap">Rows per page</span>
              <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                <SelectTrigger className="w-[70px] font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0 sm:size-9"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="size-4 shrink-0" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0 sm:size-9"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4 shrink-0" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0 sm:size-9"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="size-4 shrink-0" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0 sm:size-9"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="size-4 shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Session Editor Sheet */}
      <SessionEditorSheet
        session={selectedSession}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSaveSession}
        onDelete={handleDeleteSession}
      />
    </div>
  )
}
