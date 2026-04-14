/**
 * Business value:
 * Builds deterministic analytics evidence from study sessions so AI insights are
 * grounded in real behavior (time allocation, recency, and reflection context)
 * instead of unsupported assumptions.
 */
import { differenceInCalendarDays, format, parseISO } from "date-fns"

import type { AnalyticsInsightsRequest } from "@/lib/ai/contracts"
import { truncateNormalizedText } from "@/lib/ai/text-utils"
import { reflectionToSearchText } from "@/lib/session-reflection"
import type { StudySession } from "@/types/session"

type SubjectSharePoint = {
  name: string
  value: number
}

type TimeDistributionPoint = {
  day: string
  hours: number
}

type StartHourPoint = {
  time: string
  hours: number
}

type AnalyticsAiEvidenceInput = {
  filteredSessions: StudySession[]
  subjectData: SubjectSharePoint[]
  totalTopicHours: number
  timeDistributionData: TimeDistributionPoint[]
  startHourData: StartHourPoint[]
  period: AnalyticsInsightsRequest["period"]
  activeRange: {
    from: Date | undefined
    to: Date | undefined
  }
  anchorDate: Date
}

function formatRangeLabel(
  period: AnalyticsInsightsRequest["period"],
  activeRange: {
    from: Date | undefined
    to: Date | undefined
  },
) {
  if (activeRange.from && activeRange.to) {
    return `${format(activeRange.from, "MMM dd, yyyy")} - ${format(
      activeRange.to,
      "MMM dd, yyyy",
    )}`
  }

  if (activeRange.from) {
    return format(activeRange.from, "MMM dd, yyyy")
  }

  if (activeRange.to) {
    return format(activeRange.to, "MMM dd, yyyy")
  }

  if (period === "week") {
    return "Last 7 days"
  }

  if (period === "month") {
    return "Current month"
  }

  return "Current year"
}

/**
 * Purpose:
 * Finds subjects that have not been studied recently in the selected window and
 * returns ranked dormancy signals for AI insights.
 */
function buildDormantSubjects(
  sessions: StudySession[],
  anchorDate: Date,
): AnalyticsInsightsRequest["dormantSubjects"] {
  const subjects = new Map<
    string,
    { totalSeconds: number; lastStudiedOn: string }
  >()

  for (const session of sessions) {
    for (const topic of session.topics) {
      const current = subjects.get(topic.subjectLabel)

      if (!current) {
        subjects.set(topic.subjectLabel, {
          totalSeconds: topic.duration,
          lastStudiedOn: session.date,
        })
        continue
      }

      subjects.set(topic.subjectLabel, {
        totalSeconds: current.totalSeconds + topic.duration,
        lastStudiedOn:
          session.date > current.lastStudiedOn
            ? session.date
            : current.lastStudiedOn,
      })
    }
  }

  return Array.from(subjects.entries())
    .map(([subject, value]) => ({
      subject,
      totalHours: Math.round((value.totalSeconds / 3600) * 10) / 10,
      lastStudiedOn: value.lastStudiedOn,
      daysSinceLastStudy: Math.max(
        0,
        differenceInCalendarDays(anchorDate, parseISO(value.lastStudiedOn)),
      ),
    }))
    .filter((item) => item.daysSinceLastStudy >= 7)
    .sort((left, right) => {
      if (right.daysSinceLastStudy !== left.daysSinceLastStudy) {
        return right.daysSinceLastStudy - left.daysSinceLastStudy
      }

      return right.totalHours - left.totalHours
    })
    .slice(0, 5)
}

/**
 * Purpose:
 * Finds hashtags that have not appeared recently in the selected window and
 * returns ranked dormancy signals for AI insights.
 */
function buildDormantTags(
  sessions: StudySession[],
  anchorDate: Date,
): AnalyticsInsightsRequest["dormantTags"] {
  const tags = new Map<string, { totalUses: number; lastStudiedOn: string }>()

  for (const session of sessions) {
    for (const topic of session.topics) {
      for (const tag of topic.hashtags) {
        const current = tags.get(tag)

        if (!current) {
          tags.set(tag, {
            totalUses: 1,
            lastStudiedOn: session.date,
          })
          continue
        }

        tags.set(tag, {
          totalUses: current.totalUses + 1,
          lastStudiedOn:
            session.date > current.lastStudiedOn
              ? session.date
              : current.lastStudiedOn,
        })
      }
    }
  }

  return Array.from(tags.entries())
    .map(([tag, value]) => ({
      tag: `#${tag}`,
      totalUses: value.totalUses,
      lastStudiedOn: value.lastStudiedOn,
      daysSinceLastStudy: Math.max(
        0,
        differenceInCalendarDays(anchorDate, parseISO(value.lastStudiedOn)),
      ),
    }))
    .filter((item) => item.daysSinceLastStudy >= 7)
    .sort((left, right) => {
      if (right.daysSinceLastStudy !== left.daysSinceLastStudy) {
        return right.daysSinceLastStudy - left.daysSinceLastStudy
      }

      return right.totalUses - left.totalUses
    })
    .slice(0, 8)
}

function buildRecentTopicExcerpts(
  sessions: StudySession[],
): AnalyticsInsightsRequest["recentTopicExcerpts"] {
  return sessions
    .flatMap((session) =>
      session.topics.map((topic) => ({
        sortKey: session.createdAt,
        date: session.date,
        subject: topic.subjectLabel,
        durationMinutes: Math.max(1, Math.round(topic.duration / 60)),
        hashtags: topic.hashtags.map((tag) => `#${tag}`),
        reflectionExcerpt: truncateNormalizedText(
          reflectionToSearchText(topic.reflection),
          320,
        ),
      })),
    )
    .filter((topic) => topic.reflectionExcerpt.length > 0)
    .sort((left, right) => right.sortKey.localeCompare(left.sortKey))
    .slice(0, 8)
    .map(({ sortKey: _sortKey, ...topic }) => topic)
}

export function buildAnalyticsInsightsRequest(
  input: AnalyticsAiEvidenceInput,
): AnalyticsInsightsRequest {
  return {
    period: input.period,
    rangeLabel: formatRangeLabel(input.period, input.activeRange),
    from: input.activeRange.from
      ? format(input.activeRange.from, "yyyy-MM-dd")
      : undefined,
    to: input.activeRange.to
      ? format(input.activeRange.to, "yyyy-MM-dd")
      : undefined,
    totalSessions: input.filteredSessions.length,
    totalTopicHours: input.totalTopicHours,
    subjectDistribution: input.subjectData.slice(0, 12).map((item) => ({
      subject: item.name,
      share: item.value,
    })),
    weekdayDistribution: input.timeDistributionData,
    startHourDistribution: input.startHourData,
    dormantSubjects: buildDormantSubjects(
      input.filteredSessions,
      input.anchorDate,
    ),
    dormantTags: buildDormantTags(input.filteredSessions, input.anchorDate),
    recentTopicExcerpts: buildRecentTopicExcerpts(input.filteredSessions),
  }
}
