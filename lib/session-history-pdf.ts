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
  heading: [24, 24, 27] as const,
  muted: [82, 82, 91] as const,
  line: [228, 228, 231] as const,
  metricBackground: [250, 250, 252] as const,
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

function estimateTopicBlockHeight(
  doc: JsPdfDocument,
  session: StudySession,
  topicIndex: number,
  maxWidth: number
): number {
  const topic = session.topics[topicIndex]
  if (!topic) {
    return 0
  }

  const hashtagsText =
    topic.hashtags.length > 0
      ? topic.hashtags.map((tag) => `#${tag}`).join(" ")
      : "No hashtags"
  const reflectionText =
    topic.reflection.trim().length > 0
      ? `Reflection: ${topic.reflection.trim()}`
      : "Reflection: No reflection logged for this topic."

  const hashtagsLines = doc.splitTextToSize(hashtagsText, maxWidth)
  const reflectionLines = doc.splitTextToSize(reflectionText, maxWidth)

  return 5 + hashtagsLines.length * 4.2 + reflectionLines.length * 4.2 + 2.5
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
  const marginX = 16
  const marginTop = 18
  const marginBottom = 16
  const contentWidth = pageWidth - marginX * 2
  let cursorY = marginTop

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight <= pageHeight - marginBottom) {
      return
    }

    doc.addPage()
    cursorY = marginTop
  }

  const writeSectionHeading = (title: string) => {
    ensureSpace(8)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(...COLORS.heading)
    doc.text(title, marginX, cursorY)
    cursorY += 6
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(...COLORS.heading)
  doc.text("Session History Report", marginX, cursorY)
  cursorY += 7

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.muted)
  doc.text(`Generated: ${formatGeneratedTimestamp(input.generatedAt)}`, marginX, cursorY)
  cursorY += 4.5

  doc.setDrawColor(...COLORS.line)
  doc.line(marginX, cursorY + 1, pageWidth - marginX, cursorY + 1)
  cursorY += 7

  writeSectionHeading("Applied Filters")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.muted)
  const filterLines = doc.splitTextToSize(formatFilterSummary(input.filter), contentWidth)
  doc.text(filterLines, marginX, cursorY)
  cursorY += filterLines.length * 4.5 + 3

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

  for (const metric of metricRows) {
    ensureSpace(8)
    doc.setFillColor(...COLORS.metricBackground)
    doc.setDrawColor(...COLORS.line)
    doc.rect(marginX, cursorY - 4, contentWidth, 7, "FD")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(9.5)
    doc.setTextColor(...COLORS.heading)
    doc.text(metric.label, marginX + 2, cursorY)

    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.muted)
    doc.text(metric.value, pageWidth - marginX - 2, cursorY, { align: "right" })

    cursorY += 8
  }

  cursorY += 1
  writeSectionHeading("Session Details")

  for (const [sessionIndex, session] of input.sessions.entries()) {
    const firstTopicHeight = estimateTopicBlockHeight(doc, session, 0, contentWidth - 6)
    ensureSpace(13 + firstTopicHeight)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(...COLORS.heading)
    doc.text(
      `Session ${sessionIndex + 1} - ${formatDateLabel(session.date)}`,
      marginX,
      cursorY
    )
    cursorY += 4.8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.setTextColor(...COLORS.muted)
    doc.text(
      `${session.startTime} - ${session.endTime} | Effective: ${formatDuration(
        session.effectiveTime
      )} | Pause: ${formatDuration(session.pauseTime)}`,
      marginX,
      cursorY
    )
    cursorY += 5

    if (session.topics.length === 0) {
      ensureSpace(8)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(...COLORS.muted)
      doc.text("No topics were recorded for this session.", marginX + 2, cursorY)
      cursorY += 6
    }

    for (const [topicIndex, topic] of session.topics.entries()) {
      const topicMaxWidth = contentWidth - 6
      const hashtagsText =
        topic.hashtags.length > 0
          ? topic.hashtags.map((tag) => `#${tag}`).join(" ")
          : "No hashtags"
      const reflectionText =
        topic.reflection.trim().length > 0
          ? `Reflection: ${topic.reflection.trim()}`
          : "Reflection: No reflection logged for this topic."

      const hashtagsLines = doc.splitTextToSize(hashtagsText, topicMaxWidth)
      const reflectionLines = doc.splitTextToSize(reflectionText, topicMaxWidth)
      const topicBlockHeight =
        5 + hashtagsLines.length * 4.2 + reflectionLines.length * 4.2 + 2.5

      ensureSpace(topicBlockHeight + 1)

      doc.setFont("helvetica", "bold")
      doc.setFontSize(9.8)
      doc.setTextColor(...COLORS.heading)
      doc.text(
        `${topicIndex + 1}. ${topic.subjectLabel} (${formatDuration(topic.duration)})`,
        marginX + 2,
        cursorY
      )
      cursorY += 4.6

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9.2)
      doc.setTextColor(...COLORS.muted)
      doc.text(hashtagsLines, marginX + 4, cursorY)
      cursorY += hashtagsLines.length * 4.2

      doc.text(reflectionLines, marginX + 4, cursorY)
      cursorY += reflectionLines.length * 4.2 + 2
    }

    ensureSpace(4)
    doc.setDrawColor(...COLORS.line)
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY)
    cursorY += 5
  }

  return {
    doc,
    analytics,
    filename: `session-history-${
      input.filter.hasActiveFilters ? "filtered" : "all"
    }-${formatFilenameDate(input.generatedAt)}.pdf`,
  }
}
