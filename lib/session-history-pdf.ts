/**
 * Session History PDF export utilities.
 *
 * Business value:
 * - Users need a shareable, printable artifact of their study activity for review,
 *   reflection, and accountability beyond the UI.
 * - The export must honor active filters so the document matches exactly what users
 *   are analyzing on `/session-history`; when no filters are active, it becomes an
 *   "all sessions" report by default.
 * - Product needs a single report format that combines high-level analytics and
 *   full session/topic details (including reflections) in a clean, readable layout.
 *
 * Module responsibility:
 * - Compute report analytics from the provided sessions.
 * - Build a deterministic, paginated A4 PDF with header, filter context, summary,
 *   and detailed session content.
 * - Return both the `jsPDF` document instance and a business-friendly filename for
 *   browser download.
 */
import { format, parseISO } from "date-fns"

import type { jsPDF as JsPdfClass } from "jspdf"
import { isReflectionEmpty, reflectionToPlainText } from "@/lib/session-reflection"
import type { StudySession } from "@/types/session"

export type JsPdfConstructor = typeof JsPdfClass
type JsPdfDocument = InstanceType<JsPdfConstructor>

export interface SessionHistoryPdfExportInput {
  sessions: StudySession[]
  generatedAt: Date
  filter: {
    hasActiveFilters: boolean
    keyword: string | null
    dateFrom: string | null
    dateTo: string | null
  }
}

export interface SessionHistoryPdfAnalytics {
  totalSessions: number
  totalEffectiveTime: number
  averageSessionDuration: number
  uniqueSubjects: number
  totalTopics: number
}

export interface BuildSessionHistoryPdfResult {
  doc: JsPdfDocument
  filename: string
  analytics: SessionHistoryPdfAnalytics
}

const COLORS = {
  heading: [17, 24, 39] as const,
  muted: [75, 85, 99] as const,
  line: [209, 213, 219] as const,
  surface: [245, 245, 245] as const,
}

/**
 * Tailwind spacing token reference:
 * - `space-y-2` = 0.5rem = 8px.
 * This PDF renderer uses mm units, so we convert once and enforce it as
 * the minimum vertical spacing between distinct blocks/items.
 */
const TW_SPACE_Y_2_PX = 8
const MM_PER_PX = 25.4 / 96
const MIN_ITEM_SPACING_MM = TW_SPACE_Y_2_PX * MM_PER_PX
const DOUBLE_ITEM_SPACING_MM = MIN_ITEM_SPACING_MM * 2
const TEXT_ASCENDER_COMPENSATION_MM = 3

function withMinItemSpacing(valueMm: number): number {
  return Math.max(valueMm, MIN_ITEM_SPACING_MM)
}

function formatDuration(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainingSeconds = safeSeconds % 60

  const parts: string[] = []
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`)
  }
  parts.push(`${remainingSeconds}s`)

  return parts.join(" ")
}

function formatDateLabel(rawDate: string): string {
  try {
    return format(parseISO(rawDate), "MMM d, yyyy")
  } catch {
    return rawDate
  }
}

function formatGeneratedTimestamp(generatedAt: Date): string {
  try {
    return format(generatedAt, "PPP p")
  } catch {
    return generatedAt.toISOString()
  }
}

function formatFilenameDate(generatedAt: Date): string {
  try {
    return format(generatedAt, "yyyy-MM-dd")
  } catch {
    return generatedAt.toISOString().slice(0, 10)
  }
}

function formatFilterSummary(filter: SessionHistoryPdfExportInput["filter"]): string {
  if (!filter.hasActiveFilters) {
    return "All sessions"
  }

  const summaryParts: string[] = []

  if (filter.keyword) {
    summaryParts.push(`Keyword: "${filter.keyword}"`)
  }

  if (filter.dateFrom && filter.dateTo) {
    const formattedFrom = formatDateLabel(filter.dateFrom)
    const formattedTo = formatDateLabel(filter.dateTo)
    summaryParts.push(
      formattedFrom === formattedTo
        ? `Date: ${formattedFrom}`
        : `Date range: ${formattedFrom} to ${formattedTo}`
    )
  } else if (filter.dateFrom) {
    summaryParts.push(`Date from: ${formatDateLabel(filter.dateFrom)}`)
  } else if (filter.dateTo) {
    summaryParts.push(`Date to: ${formatDateLabel(filter.dateTo)}`)
  }

  return summaryParts.length > 0 ? summaryParts.join(" | ") : "All sessions"
}

function buildTopicRenderData(
  doc: JsPdfDocument,
  session: StudySession,
  topicIndex: number,
  maxWidth: number
): {
  hashtagsLines: string[]
  reflectionLines: string[]
  blockHeight: number
} {
  const topic = session.topics[topicIndex]
  if (!topic) {
    return {
      hashtagsLines: [],
      reflectionLines: [],
      blockHeight: 0,
    }
  }

  const hashtagsText =
    topic.hashtags.length > 0
      ? topic.hashtags.map((tag) => `#${tag}`).join(" ")
      : "No hashtags"
  const reflectionText = isReflectionEmpty(topic.reflection)
    ? "No reflection logged for this topic."
    : reflectionToPlainText(topic.reflection)

  const hashtagsLines = doc.splitTextToSize(hashtagsText, maxWidth)
  const reflectionLines = doc.splitTextToSize(reflectionText, maxWidth)

  const blockHeight =
    4.8 + Math.max(hashtagsLines.length, 1) * 4 + Math.max(reflectionLines.length, 1) * 4 + 4

  return {
    hashtagsLines,
    reflectionLines,
    blockHeight,
  }
}

export function calculateSessionHistoryPdfAnalytics(
  sessions: StudySession[]
): SessionHistoryPdfAnalytics {
  const totalSessions = sessions.length
  const totalEffectiveTime = sessions.reduce(
    (accumulator, session) => accumulator + session.effectiveTime,
    0
  )
  const totalTopics = sessions.reduce(
    (accumulator, session) => accumulator + session.topics.length,
    0
  )

  const uniqueSubjectKeys = new Set(
    sessions.flatMap((session) =>
      session.topics
        .map((topic) => topic.subjectLabel.trim().toLowerCase())
        .filter((subjectLabel) => subjectLabel.length > 0)
    )
  )

  return {
    totalSessions,
    totalEffectiveTime,
    averageSessionDuration:
      totalSessions > 0 ? Math.round(totalEffectiveTime / totalSessions) : 0,
    uniqueSubjects: uniqueSubjectKeys.size,
    totalTopics,
  }
}

export function buildSessionHistoryPdf(
  input: SessionHistoryPdfExportInput,
  jsPDF: JsPdfConstructor
): BuildSessionHistoryPdfResult {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const analytics = calculateSessionHistoryPdfAnalytics(input.sessions)
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 14
  const marginTop = 14
  const marginBottom = 10
  const footerReserve = 8
  const contentWidth = pageWidth - marginX * 2
  let cursorY = marginTop
  const contentBottom = pageHeight - marginBottom - footerReserve
  const exportScopeLabel = input.filter.hasActiveFilters
    ? "Filtered Export"
    : "All Sessions Export"

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight <= contentBottom) {
      return
    }

    doc.addPage()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.heading)
    doc.text("Session History Report", marginX, marginTop + 1.5)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...COLORS.muted)
    doc.text("Continued", pageWidth - marginX, marginTop + 1.5, {
      align: "right",
    })
    doc.setDrawColor(...COLORS.line)
    const continuationDividerY = marginTop + 4
    doc.line(marginX, continuationDividerY, pageWidth - marginX, continuationDividerY)
    cursorY =
      continuationDividerY + DOUBLE_ITEM_SPACING_MM + TEXT_ASCENDER_COMPENSATION_MM
  }

  const writeSectionHeading = (
    title: string,
    options?: { showInlineDivider?: boolean }
  ) => {
    const showInlineDivider = options?.showInlineDivider ?? true
    cursorY += MIN_ITEM_SPACING_MM
    ensureSpace(withMinItemSpacing(8.5))
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11.5)
    doc.setTextColor(...COLORS.heading)
    doc.text(title, marginX, cursorY)
    const lineStartX = marginX + doc.getTextWidth(title) + 3
    if (showInlineDivider && lineStartX < pageWidth - marginX) {
      doc.setDrawColor(...COLORS.line)
      doc.line(lineStartX, cursorY - 0.5, pageWidth - marginX, cursorY - 0.5)
    }
    cursorY += 5.5
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(17)
  doc.setTextColor(...COLORS.heading)
  doc.text("Session History Report", marginX, cursorY + 6)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9.5)
  doc.setTextColor(...COLORS.muted)
  const generatedTextBaselineY = cursorY + 11
  doc.text(
    `Generated ${formatGeneratedTimestamp(input.generatedAt)}`,
    marginX,
    generatedTextBaselineY
  )
  doc.setFontSize(8.5)
  doc.text(exportScopeLabel, pageWidth - marginX, generatedTextBaselineY, {
    align: "right",
  })
  cursorY =
    generatedTextBaselineY + MIN_ITEM_SPACING_MM + TEXT_ASCENDER_COMPENSATION_MM

  if (input.filter.hasActiveFilters) {
    writeSectionHeading("Applied Filters")
    const filterSummary = formatFilterSummary(input.filter)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.8)
    doc.setTextColor(...COLORS.muted)
    const filterLines = doc.splitTextToSize(filterSummary, contentWidth)
    ensureSpace(filterLines.length * 4.2 + withMinItemSpacing(2))
    doc.text(filterLines, marginX, cursorY)
    cursorY += filterLines.length * 4.2 + withMinItemSpacing(2)
  }

  writeSectionHeading("Analytics Summary")
  const metricRows = [
    { label: "Total sessions", value: String(analytics.totalSessions) },
    { label: "Total effective time", value: formatDuration(analytics.totalEffectiveTime) },
    {
      label: "Average session duration",
      value: formatDuration(analytics.averageSessionDuration),
    },
    { label: "Unique subjects", value: String(analytics.uniqueSubjects) },
    { label: "Total topics", value: String(analytics.totalTopics) },
  ]
  const metricGap = withMinItemSpacing(3)
  const metricCardHeight = 15
  const metricCardHalfWidth = (contentWidth - metricGap) / 2

  for (let index = 0; index < metricRows.length; index += 1) {
    const metric = metricRows[index]
    const isLastMetric = index === metricRows.length - 1
    const isSingleCardRow = isLastMetric && index % 2 === 0
    const isLeftColumn = index % 2 === 0
    const cardWidth = isSingleCardRow ? contentWidth : metricCardHalfWidth
    const cardX = isSingleCardRow
      ? marginX
      : marginX + (isLeftColumn ? 0 : metricCardHalfWidth + metricGap)

    if (isLeftColumn || isSingleCardRow) {
      ensureSpace(metricCardHeight + metricGap)
    }

    doc.setFillColor(...COLORS.surface)
    doc.setDrawColor(...COLORS.line)
    doc.roundedRect(cardX, cursorY, cardWidth, metricCardHeight, 1.5, 1.5, "FD")

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.3)
    doc.setTextColor(...COLORS.muted)
    doc.text(metric.label.toUpperCase(), cardX + 3, cursorY + 5)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(...COLORS.heading)
    doc.text(metric.value, cardX + 3, cursorY + 11)

    if (!isSingleCardRow && !isLeftColumn && index < metricRows.length) {
      cursorY += metricCardHeight + metricGap
    } else if (isSingleCardRow) {
      cursorY += metricCardHeight + metricGap
    } else if (!isSingleCardRow && isLastMetric) {
      cursorY += metricCardHeight + metricGap
    }
  }

  cursorY += withMinItemSpacing(1.5)
  writeSectionHeading("Session Details")
  cursorY += MIN_ITEM_SPACING_MM

  for (const [sessionIndex, session] of input.sessions.entries()) {
    ensureSpace(10 + withMinItemSpacing(1))
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.6)
    doc.setTextColor(...COLORS.heading)
    doc.text(
      `Session ${sessionIndex + 1} - ${formatDateLabel(session.date)}`,
      marginX,
      cursorY
    )
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.7)
    doc.setTextColor(...COLORS.muted)
    doc.text(
      `${session.startTime} - ${session.endTime} | Effective: ${formatDuration(
        session.effectiveTime
      )} | Pause: ${formatDuration(session.pauseTime)}`,
      marginX,
      cursorY + 4.2
    )
    cursorY += 4.2 + withMinItemSpacing(4)

    if (session.topics.length === 0) {
      ensureSpace(7.5)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(...COLORS.muted)
      doc.text("No topics were recorded for this session.", marginX + 2, cursorY + 0.5)
      cursorY += withMinItemSpacing(7)
    }

    for (const [topicIndex, topic] of session.topics.entries()) {
      const topicContentWidth = contentWidth - 10
      const topicRenderData = buildTopicRenderData(
        doc,
        session,
        topicIndex,
        topicContentWidth - 2
      )
      const topicBlockHeight = Math.max(topicRenderData.blockHeight, 13)
      ensureSpace(topicBlockHeight + withMinItemSpacing(2.5))

      doc.setFont("helvetica", "bold")
      doc.setFontSize(9.5)
      doc.setTextColor(...COLORS.heading)
      doc.text(
        `${topicIndex + 1}. ${topic.subjectLabel} (${formatDuration(topic.duration)})`,
        marginX + 2,
        cursorY
      )
      cursorY += 4.6

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8.8)
      doc.setTextColor(...COLORS.muted)
      doc.text(topicRenderData.hashtagsLines, marginX + 4, cursorY)
      cursorY += Math.max(topicRenderData.hashtagsLines.length, 1) * 4

      doc.setTextColor(...COLORS.muted)
      doc.text(topicRenderData.reflectionLines, marginX + 4, cursorY)
      cursorY +=
        Math.max(topicRenderData.reflectionLines.length, 1) * 4 +
        withMinItemSpacing(2.2)
    }

    cursorY += withMinItemSpacing(4)
  }

  const totalPages = doc.getNumberOfPages()
  const generatedFooterLabel = `Generated ${format(input.generatedAt, "MMM d, yyyy")}`
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber)
    doc.setDrawColor(...COLORS.line)
    doc.line(marginX, pageHeight - marginBottom - 3.5, pageWidth - marginX, pageHeight - marginBottom - 3.5)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.muted)
    doc.text(generatedFooterLabel, marginX, pageHeight - marginBottom)
    doc.text(
      `Page ${pageNumber} of ${totalPages}`,
      pageWidth - marginX,
      pageHeight - marginBottom,
      { align: "right" }
    )
  }

  return {
    doc,
    analytics,
    filename: `session-history-${
      input.filter.hasActiveFilters ? "filtered" : "all"
    }-${formatFilenameDate(input.generatedAt)}.pdf`,
  }
}
