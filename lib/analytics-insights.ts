import { format } from "date-fns"

export type InsightSeverity = "info" | "warning" | "critical"
export type InsightCategory =
  | "topic-allocation"
  | "workload-consistency"
  | "productivity-pattern"

export type AnalyticsPeriod = "week" | "month" | "year"

export interface AnalyticsDateRange {
  from?: Date
  to?: Date
}

export interface SubjectShareInput {
  name: string
  value: number
  fill?: string
}

export interface TimeDistributionPoint {
  day: string
  hours: number
}

export interface StartHourPoint {
  time: string
  hours: number
}

export interface AnalyticsInsightsInput {
  subjectData: SubjectShareInput[]
  totalTopicHours: number
  timeDistributionData: TimeDistributionPoint[]
  startHourData: StartHourPoint[]
  period: AnalyticsPeriod
  dateRange: AnalyticsDateRange
}

export interface SubjectAllocationInsightItem {
  name: string
  share: number
  expectedShare: number
  delta: number
  state: "balanced" | "over" | "under"
  fill?: string
}

export interface AnalyticsSuggestion {
  id: string
  title: string
  recommendation: string
  evidence: string
}

export interface AnalyticsInsight {
  id: string
  category: InsightCategory
  severity: InsightSeverity
  title: string
  summary: string
  evidence: string
  suggestions: AnalyticsSuggestion[]
}

export interface AnalyticsInsightsResult {
  hasData: boolean
  rangeLabel: string
  generatedAt: string
  expectedShare: number | null
  subjectAllocations: SubjectAllocationInsightItem[]
  insights: AnalyticsInsight[]
  suggestions: AnalyticsSuggestion[]
}

const WORKLOAD_STABLE_THRESHOLD = 0.35
const WORKLOAD_MODERATE_THRESHOLD = 0.6
const ALLOCATION_DELTA_THRESHOLD = 10
const CRITICAL_DELTA_THRESHOLD = 20

function roundToSingleDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

function formatHours(value: number): string {
  const rounded = roundToSingleDecimal(value)
  return Number.isInteger(rounded) ? `${rounded}h` : `${rounded.toFixed(1)}h`
}

function formatPercent(value: number): string {
  const rounded = roundToSingleDecimal(value)
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`
}

function formatSignedPercent(value: number): string {
  const rounded = roundToSingleDecimal(value)
  const magnitude = Number.isInteger(rounded)
    ? `${Math.abs(rounded)}%`
    : `${Math.abs(rounded).toFixed(1)}%`
  if (rounded === 0) {
    return "0%"
  }

  return rounded > 0 ? `+${magnitude}` : `-${magnitude}`
}

function formatRangeLabel(period: AnalyticsPeriod, dateRange: AnalyticsDateRange): string {
  if (dateRange.from && dateRange.to) {
    const fromLabel = format(dateRange.from, "MMM dd, yyyy")
    const toLabel = format(dateRange.to, "MMM dd, yyyy")
    if (fromLabel === toLabel) {
      return fromLabel
    }
    return `${fromLabel} - ${toLabel}`
  }

  if (dateRange.from) {
    return format(dateRange.from, "MMM dd, yyyy")
  }

  if (dateRange.to) {
    return format(dateRange.to, "MMM dd, yyyy")
  }

  if (period === "week") {
    return "Last 7 days"
  }

  if (period === "month") {
    return "Current month"
  }

  return "Current year"
}

function buildSubjectAllocationInsight(
  subjectData: SubjectShareInput[],
  totalTopicHours: number
): {
  expectedShare: number | null
  subjectAllocations: SubjectAllocationInsightItem[]
  insight: AnalyticsInsight
} {
  const activeSubjects = subjectData.filter((subject) => subject.value > 0)
  const expectedShare =
    activeSubjects.length > 0 ? roundToSingleDecimal(100 / activeSubjects.length) : null

  const subjectAllocations: SubjectAllocationInsightItem[] =
    expectedShare === null
      ? []
      : activeSubjects
          .map((subject) => {
            const delta = roundToSingleDecimal(subject.value - expectedShare)
            const absoluteDelta = Math.abs(delta)
            const state: SubjectAllocationInsightItem["state"] =
              absoluteDelta >= ALLOCATION_DELTA_THRESHOLD
                ? delta > 0
                  ? "over"
                  : "under"
                : "balanced"

            return {
              name: subject.name,
              share: roundToSingleDecimal(subject.value),
              expectedShare,
              delta,
              state,
              fill: subject.fill,
            }
          })
          .sort((left, right) => right.share - left.share)

  const overAllocated = subjectAllocations.filter((subject) => subject.state === "over")
  const underAllocated = subjectAllocations.filter((subject) => subject.state === "under")
  const maxAbsoluteDelta = subjectAllocations.reduce(
    (max, item) => Math.max(max, Math.abs(item.delta)),
    0
  )

  let severity: InsightSeverity = "info"
  if (maxAbsoluteDelta >= CRITICAL_DELTA_THRESHOLD) {
    severity = "critical"
  } else if (overAllocated.length > 0 || underAllocated.length > 0) {
    severity = "warning"
  }

  let summary = `No subject allocation data was found in this range (0h tracked).`
  let evidence = `Total topic time is ${formatHours(totalTopicHours)} and active subjects are 0.`

  if (expectedShare !== null) {
    if (overAllocated.length === 0 && underAllocated.length === 0) {
      summary = `Topic allocation is balanced across ${activeSubjects.length} subjects. Largest deviation from baseline is ${formatPercent(maxAbsoluteDelta)}.`
      evidence = `Expected share is ${formatPercent(expectedShare)} per subject and total topic time is ${formatHours(totalTopicHours)}.`
    } else {
      const topOver = overAllocated[0]
      const topUnder = underAllocated[0]
      const overloadedText = topOver
        ? `${topOver.name} is over baseline by ${formatSignedPercent(topOver.delta)}`
        : "No subject is over baseline"
      const underloadedText = topUnder
        ? `${topUnder.name} is under baseline by ${formatSignedPercent(topUnder.delta)}`
        : "No subject is under baseline"

      summary = `Subject allocation is uneven: ${overAllocated.length} over-allocated and ${underAllocated.length} under-allocated subjects against a ${formatPercent(expectedShare)} baseline.`
      evidence = `${overloadedText}. ${underloadedText}. Total topic time is ${formatHours(totalTopicHours)}.`
    }
  }

  const suggestions: AnalyticsSuggestion[] = []
  if (overAllocated.length > 0) {
    const primary = overAllocated[0]
    suggestions.push({
      id: "topic-over-allocation",
      title: "Reduce dominant-subject concentration",
      recommendation: `Cap ${primary.name} near ${formatPercent(primary.expectedShare)} in the next range and reallocate the excess to weaker subjects.`,
      evidence: `${primary.name} currently sits at ${formatPercent(primary.share)}, which is ${formatSignedPercent(primary.delta)} vs baseline.`,
    })
  }

  if (underAllocated.length > 0) {
    const primary = underAllocated[0]
    suggestions.push({
      id: "topic-under-allocation",
      title: "Increase weak-subject exposure",
      recommendation: `Schedule additional focused blocks for ${primary.name} until it reaches at least ${formatPercent(primary.expectedShare)} share.`,
      evidence: `${primary.name} is currently ${formatPercent(primary.share)} (${formatSignedPercent(primary.delta)} vs baseline).`,
    })
  }

  if (suggestions.length === 0 && expectedShare !== null) {
    suggestions.push({
      id: "topic-maintain-balance",
      title: "Maintain current allocation",
      recommendation: "Keep the same subject mix and review only if one subject rises by more than 10 percentage points.",
      evidence: `Largest allocation drift is ${formatPercent(maxAbsoluteDelta)} from the ${formatPercent(expectedShare)} baseline.`,
    })
  }

  return {
    expectedShare,
    subjectAllocations,
    insight: {
      id: "insight-topic-allocation",
      category: "topic-allocation",
      severity,
      title: "Topic Distribution",
      summary,
      evidence,
      suggestions,
    },
  }
}

function buildWorkloadConsistencyInsight(
  timeDistributionData: TimeDistributionPoint[]
): AnalyticsInsight {
  const weekdayHours = timeDistributionData.map((point) => point.hours)
  const totalHours = weekdayHours.reduce((sum, value) => sum + value, 0)
  const mean = weekdayHours.length > 0 ? totalHours / weekdayHours.length : 0
  const variance =
    weekdayHours.length > 0
      ? weekdayHours.reduce((sum, value) => sum + (value - mean) ** 2, 0) / weekdayHours.length
      : 0
  const standardDeviation = Math.sqrt(variance)
  const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 0

  const busiestDay = timeDistributionData.reduce<TimeDistributionPoint | null>((current, day) => {
    if (!current || day.hours > current.hours) {
      return day
    }
    return current
  }, null)

  const lightestDay = timeDistributionData.reduce<TimeDistributionPoint | null>((current, day) => {
    if (!current || day.hours < current.hours) {
      return day
    }
    return current
  }, null)

  const spreadHours =
    busiestDay && lightestDay ? roundToSingleDecimal(busiestDay.hours - lightestDay.hours) : 0

  let severity: InsightSeverity = "info"
  let consistencyLabel = "stable"
  if (coefficientOfVariation > WORKLOAD_MODERATE_THRESHOLD) {
    severity = "critical"
    consistencyLabel = "uneven"
  } else if (coefficientOfVariation > WORKLOAD_STABLE_THRESHOLD) {
    severity = "warning"
    consistencyLabel = "moderate"
  }

  let summary = "Workload consistency could not be assessed because weekday totals are 0h."
  let evidence = "Coefficient of variation is 0.0 with mean 0h/day."
  const suggestions: AnalyticsSuggestion[] = []

  if (mean > 0 && busiestDay && lightestDay) {
    summary = `Workload consistency is ${consistencyLabel}: CV is ${roundToSingleDecimal(
      coefficientOfVariation
    ).toFixed(2)} across ${formatHours(totalHours)} total weekly hours.`
    evidence = `${busiestDay.day} is highest at ${formatHours(
      busiestDay.hours
    )}, ${lightestDay.day} is lowest at ${formatHours(lightestDay.hours)}, spread is ${formatHours(
      spreadHours
    )}.`

    if (consistencyLabel === "uneven") {
      suggestions.push({
        id: "workload-uneven",
        title: "Flatten weekly spikes",
        recommendation:
          "Move at least one block from your busiest day to your two lightest days to reduce sharp workload swings.",
        evidence: `Current spread is ${formatHours(spreadHours)} with CV ${roundToSingleDecimal(
          coefficientOfVariation
        ).toFixed(2)} (> ${WORKLOAD_MODERATE_THRESHOLD}).`,
      })
    } else if (consistencyLabel === "moderate") {
      suggestions.push({
        id: "workload-moderate",
        title: "Tighten day-to-day variance",
        recommendation:
          "Shift a small portion of time from peak days to low days until daily totals differ by less than 2 hours.",
        evidence: `Current spread is ${formatHours(spreadHours)} and CV is ${roundToSingleDecimal(
          coefficientOfVariation
        ).toFixed(2)}.`,
      })
    } else {
      suggestions.push({
        id: "workload-stable",
        title: "Preserve consistent cadence",
        recommendation:
          "Keep your current daily rhythm and only adjust when the weekly spread increases above 2 hours.",
        evidence: `CV is ${roundToSingleDecimal(coefficientOfVariation).toFixed(
          2
        )} and spread is ${formatHours(spreadHours)}.`,
      })
    }
  }

  return {
    id: "insight-workload-consistency",
    category: "workload-consistency",
    severity,
    title: "Workload Consistency",
    summary,
    evidence,
    suggestions,
  }
}

function buildProductivityPatternInsight(startHourData: StartHourPoint[]): AnalyticsInsight {
  const sortedBuckets = [...startHourData]
    .filter((bucket) => bucket.hours > 0)
    .sort((left, right) => right.hours - left.hours)

  const totalHours = sortedBuckets.reduce((sum, bucket) => sum + bucket.hours, 0)
  const topBucket = sortedBuckets[0]
  const secondBucket = sortedBuckets[1]
  const topShare = topBucket && totalHours > 0 ? (topBucket.hours / totalHours) * 100 : 0

  let severity: InsightSeverity = "info"
  if (topShare >= 60) {
    severity = "warning"
  }

  let summary = "No start-hour productivity pattern is available in this range (0h tracked)."
  let evidence = "Start-hour chart contains 0 active buckets."
  const suggestions: AnalyticsSuggestion[] = []

  if (topBucket) {
    if (secondBucket) {
      const combined = roundToSingleDecimal(topBucket.hours + secondBucket.hours)
      summary = `Peak productivity clusters around ${topBucket.time} and ${secondBucket.time}, totaling ${formatHours(
        combined
      )}.`
      evidence = `${topBucket.time} contributes ${formatHours(
        topBucket.hours
      )} (${formatPercent(topShare)} of start-hour total) and ${secondBucket.time} adds ${formatHours(
        secondBucket.hours
      )}.`
    } else {
      summary = `All productive sessions start around ${topBucket.time}, with ${formatHours(
        topBucket.hours
      )} tracked.`
      evidence = `${topBucket.time} accounts for ${formatPercent(topShare)} of start-hour total (${formatHours(
        totalHours
      )}).`
    }

    if (topShare >= 60) {
      suggestions.push({
        id: "productivity-concentrated",
        title: "Protect your strongest start window",
        recommendation:
          "Reserve your highest-cognitive tasks for the top-performing start time and keep lighter review blocks outside that window.",
        evidence: `${topBucket.time} currently captures ${formatPercent(topShare)} of productive start-hour time.`,
      })
    } else {
      suggestions.push({
        id: "productivity-distributed",
        title: "Use dual high-yield windows",
        recommendation:
          "Split demanding sessions across your top two start times to maintain output while reducing schedule rigidity.",
        evidence: `${topBucket.time} and ${secondBucket?.time ?? topBucket.time} together account for ${formatHours(
          roundToSingleDecimal(topBucket.hours + (secondBucket?.hours ?? 0))
        )}.`,
      })
    }
  }

  return {
    id: "insight-productivity-pattern",
    category: "productivity-pattern",
    severity,
    title: "Productivity Pattern",
    summary,
    evidence,
    suggestions,
  }
}

export function buildAnalyticsInsights(input: AnalyticsInsightsInput): AnalyticsInsightsResult {
  const { expectedShare, subjectAllocations, insight: topicAllocationInsight } =
    buildSubjectAllocationInsight(input.subjectData, input.totalTopicHours)
  const workloadConsistencyInsight = buildWorkloadConsistencyInsight(input.timeDistributionData)
  const productivityPatternInsight = buildProductivityPatternInsight(input.startHourData)

  const insights: AnalyticsInsight[] = [
    topicAllocationInsight,
    workloadConsistencyInsight,
    productivityPatternInsight,
  ]

  const suggestions = insights.flatMap((insight) => insight.suggestions)
  const hasData = input.totalTopicHours > 0 || suggestions.length > 0

  return {
    hasData,
    rangeLabel: formatRangeLabel(input.period, input.dateRange),
    generatedAt: new Date().toISOString(),
    expectedShare,
    subjectAllocations,
    insights,
    suggestions,
  }
}
