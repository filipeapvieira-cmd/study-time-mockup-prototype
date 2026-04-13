"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, isToday, isYesterday, parseISO } from "date-fns"
import type { Value } from "platejs"
import { usePlateViewEditor } from "platejs/react"
import {
  type ColumnDef,
  type FilterFn,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Calendar as CalendarIcon,
  Download,
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  List,
  Clock,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { EditorView } from "@/components/ui/editor"
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
import { BaseBasicNodesKit } from "@/components/basic-nodes-base-kit"
import { SessionEditorSheet } from "@/components/session-history/session-editor-sheet"
import { TEMP_STUDY_SESSIONS } from "@/lib/session-dummy-data"
import { buildSessionHistoryPdf } from "@/lib/session-history-pdf"
import {
  cloneReflection,
  isReflectionEmpty,
  reflectionToSearchText,
} from "@/lib/session-reflection"
import {
  buildSessionHistoryEditorHref,
  buildSessionHistoryListHref,
  parseSessionHistoryEditorRouteState,
} from "@/lib/session-history-route-state"
import type { StudySession } from "@/types/session"

const MIN_KEYWORD_FILTER_LENGTH = 2

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function formatDurationHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function formatDateHeader(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return "TODAY"
  if (isYesterday(date)) return "YESTERDAY"
  return format(date, "EEEE, MMMM d").toUpperCase()
}

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

function cloneStudySessions(sessions: StudySession[]): StudySession[] {
  return sessions.map((session) => ({
    ...session,
    topics: session.topics.map((topic) => ({
      ...topic,
      hashtags: [...topic.hashtags],
      reflection: cloneReflection(topic.reflection),
    })),
  }))
}

function TopicReflectionPreview({ value }: { value: Value }) {
  const editor = usePlateViewEditor(
    {
      plugins: BaseBasicNodesKit,
      value,
    },
    [value],
  )

  if (!editor) {
    return null
  }

  return (
    <EditorView
      editor={editor}
      variant="none"
      className="cursor-pointer text-sm text-foreground/80 [&_p]:my-0 [&_p]:py-0.5"
    />
  )
}

const sessionGlobalFilterFn: FilterFn<StudySession> = (
  row,
  columnId,
  filterValue
) => {
  if (typeof filterValue !== "string") {
    return true
  }

  const keyword = filterValue.trim().toLowerCase()
  if (!keyword || keyword.length < MIN_KEYWORD_FILTER_LENGTH) {
    return true
  }

  const searchableText = String(row.getValue(columnId)).toLowerCase()
  return searchableText.includes(keyword)
}

function SessionHistoryPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [sessions, setSessions] = React.useState<StudySession[]>(() =>
    cloneStudySessions(TEMP_STUDY_SESSIONS)
  )
  const [filterValue, setFilterValue] = React.useState("")
  const [appliedFilterValue, setAppliedFilterValue] = React.useState("")
  const [isFilterTransitionPending, startFilterTransition] = React.useTransition()
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "date", desc: true },
  ])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [viewMode, setViewMode] = React.useState<"compact" | "expanded">("compact")
  const [isExporting, setIsExporting] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const keywordInputDisplayValue = React.useMemo(() => filterValue.trim(), [filterValue])
  const keywordFilterDisplayValue = React.useMemo(
    () => appliedFilterValue.trim(),
    [appliedFilterValue]
  )
  const normalizedKeyword = React.useMemo(
    () => keywordFilterDisplayValue.toLowerCase(),
    [keywordFilterDisplayValue]
  )
  const hasKeywordInput = keywordInputDisplayValue.length > 0
  const isKeywordFilterActive =
    normalizedKeyword.length >= MIN_KEYWORD_FILTER_LENGTH
  const showKeywordTrailingControl = hasKeywordInput || isFilterTransitionPending
  const isDateFilterActive = Boolean(dateRange.from || dateRange.to)
  const hasActiveFilters = isKeywordFilterActive || isDateFilterActive

  const handleFilterInputChange = React.useCallback(
    (nextValue: string) => {
      setFilterValue(nextValue)
      startFilterTransition(() => {
        setAppliedFilterValue(nextValue)
      })
    },
    [startFilterTransition]
  )

  const dateFilteredSessions = React.useMemo(() => {
    const dateFrom = dateRange.from ?? dateRange.to
    const dateTo = dateRange.to ?? dateRange.from
    const normalizedFrom = dateFrom ? format(dateFrom, "yyyy-MM-dd") : null
    const normalizedTo = dateTo ? format(dateTo, "yyyy-MM-dd") : null

    return sessions.filter((session) => {
      if (normalizedFrom && session.date < normalizedFrom) {
        return false
      }

      if (normalizedTo && session.date > normalizedTo) {
        return false
      }

      return true
    })
  }, [dateRange.from, dateRange.to, sessions])

  const columns = React.useMemo<ColumnDef<StudySession>[]>(
    () => [
      {
        id: "subject",
        accessorFn: (session) =>
          session.topics
            .map(
              (topic) =>
                `${topic.subjectLabel} ${reflectionToSearchText(topic.reflection)} ${topic.hashtags.join(" ")}`,
            )
            .join(" "),
        header: "Subject",
        enableSorting: false,
        enableGlobalFilter: true,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            {row.original.topics.map((topic) => (
              <div key={topic.id} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-4 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: topic.subjectColor }}
                />
                <span className="text-sm font-medium leading-tight">{topic.subjectLabel}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "date",
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            type="button"
            variant="ghost"
            className="gap-1 p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => row.original.date,
        enableGlobalFilter: false,
      },
      {
        id: "effectiveTime",
        accessorKey: "effectiveTime",
        header: ({ column }) => (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto gap-1 p-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="hidden sm:inline">Session </span>Duration
            <ArrowUpDown className="size-4" />
          </Button>
        ),
        cell: ({ row }) => formatDuration(row.original.effectiveTime),
        enableGlobalFilter: false,
      },
    ],
    []
  )

  const table = useReactTable({
    data: dateFilteredSessions,
    columns,
    state: {
      sorting,
      globalFilter: isKeywordFilterActive ? normalizedKeyword : "",
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn: sessionGlobalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const filteredSessions = table.getFilteredRowModel().rows.map((row) => row.original)
  const paginatedSessions = table.getRowModel().rows.map((row) => row.original)
  const totalRows = filteredSessions.length
  const totalPages = Math.max(1, table.getPageCount())
  const currentPage = Math.min(table.getState().pagination.pageIndex + 1, totalPages)

  const routeEditorState = React.useMemo(
    () => parseSessionHistoryEditorRouteState(searchParams),
    [searchParams]
  )
  const selectedSession = React.useMemo(
    () =>
      sessions.find((session) => session.id === routeEditorState.sessionId) ?? null,
    [routeEditorState.sessionId, sessions]
  )
  const initialTopicId = React.useMemo(() => {
    if (!selectedSession) {
      return null
    }

    if (
      routeEditorState.topicId &&
      selectedSession.topics.some((topic) => topic.id === routeEditorState.topicId)
    ) {
      return routeEditorState.topicId
    }

    return selectedSession.topics[0]?.id ?? null
  }, [routeEditorState.topicId, selectedSession])
  const editorOpen = selectedSession !== null && initialTopicId !== null
  const currentHref = React.useMemo(() => {
    const queryString = searchParams.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  }, [pathname, searchParams])

  const groupedSessions = React.useMemo(
    () => groupSessionsByDate(paginatedSessions),
    [paginatedSessions]
  )
  const sortedDates = React.useMemo(() => Object.keys(groupedSessions), [groupedSessions])

  const replaceRoute = React.useCallback(
    (nextHref: string) => {
      if (nextHref !== currentHref) {
        router.replace(nextHref, { scroll: false })
      }
    },
    [currentHref, router]
  )

  const setEditorRoute = React.useCallback(
    (sessionId: string, topicId: string) => {
      replaceRoute(
        buildSessionHistoryEditorHref({
          pathname,
          searchParams,
          sessionId,
          topicId,
        })
      )
    },
    [pathname, replaceRoute, searchParams]
  )

  const clearEditorRoute = React.useCallback(() => {
    replaceRoute(
      buildSessionHistoryListHref({
        pathname,
        searchParams,
      })
    )
  }, [pathname, replaceRoute, searchParams])

  React.useEffect(() => {
    const { sessionId, topicId } = routeEditorState

    if (!sessionId) {
      if (topicId) {
        clearEditorRoute()
      }
      return
    }

    if (!selectedSession) {
      clearEditorRoute()
      return
    }

    const fallbackTopicId = selectedSession.topics[0]?.id ?? null
    if (!fallbackTopicId) {
      clearEditorRoute()
      return
    }

    const hasRequestedTopic =
      topicId !== null &&
      selectedSession.topics.some((topic) => topic.id === topicId)
    const resolvedTopicId = hasRequestedTopic ? topicId : fallbackTopicId

    if (resolvedTopicId !== topicId) {
      setEditorRoute(selectedSession.id, resolvedTopicId)
    }
  }, [clearEditorRoute, routeEditorState, selectedSession, setEditorRoute])

  const handleRowClick = (session: StudySession, topicId?: string) => {
    const nextTopicId = topicId ?? session.topics[0]?.id
    if (!nextTopicId) {
      return
    }

    setEditorRoute(session.id, nextTopicId)
  }

  const handleKeyboardActivation = (
    event: React.KeyboardEvent<HTMLElement>,
    action: () => void
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      action()
    }
  }

  const handleSaveSession = (updatedSession: StudySession) => {
    setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)))
    clearEditorRoute()
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))

    if (routeEditorState.sessionId === sessionId) {
      clearEditorRoute()
    }
  }

  const handleEditorOpenChange = (open: boolean) => {
    if (!open) {
      clearEditorRoute()
    }
  }

  const noSessionsToExport = filteredSessions.length === 0
  const exportButtonLabel = hasActiveFilters
    ? "Download filtered sessions PDF"
    : "Download all sessions PDF"
  const exportButtonTitle = isExporting
    ? "Generating session history PDF"
    : noSessionsToExport
      ? "No sessions to export"
      : exportButtonLabel

  const handleExportPdf = React.useCallback(async () => {
    if (isExporting || noSessionsToExport) {
      return
    }

    setIsExporting(true)

    try {
      const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js")
      const normalizedDateFrom = dateRange.from ?? dateRange.to
      const normalizedDateTo = dateRange.to ?? dateRange.from

      const { doc, filename } = buildSessionHistoryPdf(
        {
          sessions: filteredSessions,
          generatedAt: new Date(),
          filter: {
            hasActiveFilters,
            keyword: isKeywordFilterActive ? keywordFilterDisplayValue : null,
            dateFrom: normalizedDateFrom
              ? format(normalizedDateFrom, "yyyy-MM-dd")
              : null,
            dateTo: normalizedDateTo ? format(normalizedDateTo, "yyyy-MM-dd") : null,
          },
        },
        jsPDF
      )

      doc.save(filename)
    } finally {
      setIsExporting(false)
    }
  }, [
    dateRange.from,
    dateRange.to,
    filteredSessions,
    hasActiveFilters,
    isExporting,
    isKeywordFilterActive,
    keywordFilterDisplayValue,
    noSessionsToExport,
  ])

  return (
    <div className="flex min-h-full flex-col gap-6 p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
          <p className="text-muted-foreground">
            Detailed log of your intellectual growth and focus sessions.
          </p>
        </div>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-[300px]">
            <Input
              placeholder="Filter..."
              value={filterValue}
              onChange={(event) => handleFilterInputChange(event.target.value)}
              className={`w-full text-sm font-medium placeholder:font-normal ${showKeywordTrailingControl ? "pr-9" : ""}`}
            />
            {isFilterTransitionPending ? (
              <Loader2
                className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin"
                aria-hidden="true"
              />
            ) : hasKeywordInput ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                onClick={() => handleFilterInputChange("")}
                aria-label="Clear keyword filter"
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <div className="flex flex-1 items-center gap-2 sm:flex-none">
              {isDateFilterActive ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setDateRange({ from: undefined, to: undefined })}
                  aria-label="Clear date filter"
                >
                  <X className="size-4" />
                </Button>
              ) : null}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-2 sm:flex-none">
                    <CalendarIcon className="size-4 shrink-0" />
                    <span className="truncate">
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                            {format(dateRange.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM dd, yyyy")
                        )
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
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={handleExportPdf}
                disabled={isExporting || noSessionsToExport}
                aria-label={exportButtonTitle}
                title={exportButtonTitle}
              >
                {isExporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {viewMode === "compact" ? (
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const headerClassName =
                        header.column.id === "subject"
                          ? "min-w-[200px]"
                          : header.column.id === "date"
                            ? "min-w-[100px]"
                            : header.column.id === "effectiveTime"
                              ? "min-w-[120px] text-right"
                              : undefined

                      return (
                        <TableHead key={header.id} className={headerClassName}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => handleRowClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const cellClassName =
                          cell.column.id === "date"
                            ? "whitespace-nowrap"
                            : cell.column.id === "effectiveTime"
                              ? "whitespace-nowrap text-right font-mono"
                              : undefined

                        return (
                          <TableCell key={cell.id} className={cellClassName}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No sessions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-6">
            {sortedDates.length > 0 ? (
              sortedDates.map((date) => (
                <div key={date}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                      {formatDateHeader(date)}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="flex flex-col gap-3">
                    {groupedSessions[date].map((session) => {
                      return (
                        <div
                          key={session.id}
                          className="group cursor-pointer rounded-lg border bg-card p-4 transition-all hover:shadow-md"
                          onClick={() => handleRowClick(session)}
                          onKeyDown={(event) =>
                            handleKeyboardActivation(event, () => handleRowClick(session))
                          }
                          role="button"
                          tabIndex={0}
                        >
                          <div className="flex gap-4">
                            <div className="flex shrink-0 flex-col items-center gap-1 text-center text-muted-foreground">
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

                            <div className="flex min-w-0 flex-1 flex-col gap-3">
                              {session.topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  className="cursor-pointer rounded-lg border bg-card p-4 transition-all"
                                  style={{
                                    borderLeftWidth: "4px",
                                    borderLeftColor: topic.subjectColor,
                                  }}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleRowClick(session, topic.id)
                                  }}
                                  onKeyDown={(event) => {
                                    event.stopPropagation()
                                    handleKeyboardActivation(event, () =>
                                      handleRowClick(session, topic.id)
                                    )
                                  }}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="font-medium text-foreground">
                                      {topic.subjectLabel}
                                    </span>
                                    <span className="text-xs font-mono text-muted-foreground">
                                      {formatDurationHuman(topic.duration)}
                                    </span>
                                  </div>

                                  {topic.hashtags.length > 0 ? (
                                    <div className="mb-2 flex flex-wrap gap-2">
                                      {topic.hashtags.map((tag) => (
                                        <span
                                          key={tag}
                                          className="text-sm text-muted-foreground"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  ) : null}

                                  {!isReflectionEmpty(topic.reflection) ? (
                                    <div className="max-h-40 overflow-hidden">
                                      <TopicReflectionPreview value={topic.reflection} />
                                    </div>
                                  ) : (
                                    <p className="overflow-hidden text-sm italic text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:10]">
                                      No reflection logged for this topic.
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No sessions found.
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{totalRows} row(s) total.</p>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap">Rows per page</span>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number.parseInt(value, 10))}
              >
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
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="size-4 shrink-0" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0 sm:size-9"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="size-4 shrink-0" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0 sm:size-9"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="size-4 shrink-0" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0 sm:size-9"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="size-4 shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SessionEditorSheet
        session={selectedSession}
        initialTopicId={initialTopicId}
        open={editorOpen}
        onOpenChange={handleEditorOpenChange}
        onSave={handleSaveSession}
        onDelete={handleDeleteSession}
      />
    </div>
  )
}

function SessionHistoryPageFallback() {
  return (
    <div className="flex min-h-full items-center justify-center p-4 md:p-6">
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
    </div>
  )
}

export default function SessionHistoryPage() {
  return (
    <React.Suspense fallback={<SessionHistoryPageFallback />}>
      <SessionHistoryPageContent />
    </React.Suspense>
  )
}
