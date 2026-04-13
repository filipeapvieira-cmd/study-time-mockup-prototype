import { getTagItemByValue, PROTOTYPE_SUBJECTS } from "@/lib/study-taxonomy"
import { createReflectionFromText } from "@/lib/session-reflection"
import type { SessionTopic, StudySession } from "@/types/session"

type SampleTopicConfig = Omit<SessionTopic, "subjectLabel" | "subjectColor" | "reflection"> & {
  reflection: string
}
type SampleSessionConfig = Omit<StudySession, "topics"> & {
  topics: SampleTopicConfig[]
}

const SUBJECT_ROTATION = [
  "theoretical-physics",
  "mathematics",
  "computer-science",
  "literature",
  "chemistry",
  "biology",
  "history",
] as const

type PrototypeSubject = (typeof SUBJECT_ROTATION)[number]

const HASHTAG_PALETTE_BY_SUBJECT: Record<PrototypeSubject, readonly string[]> = {
  "theoretical-physics": ["quantum", "mechanics", "research"],
  mathematics: ["algebra", "calculus", "research"],
  "computer-science": ["algorithms", "data-structures", "research"],
  literature: ["philosophy", "research", "algebra"],
  chemistry: ["mechanics", "research", "quantum"],
  biology: ["research", "mechanics", "philosophy"],
  history: ["philosophy", "research", "mechanics"],
}

const REFLECTIONS_BY_SUBJECT: Record<PrototypeSubject, readonly string[]> = {
  "theoretical-physics": [
    "Sketched a cleaner derivation for wave packets and marked every hidden assumption.",
    "Compared two measurement interpretations and wrote down where they produce different intuition.",
    "Rebuilt the thought experiment timeline so each state transition is explicit.",
    "Tested dimensional analysis against edge-case units to catch subtle setup errors.",
    "Linked perturbation approximations to the exact form to see where drift begins.",
    "Walked through boundary conditions and identified the one that controls stability most.",
  ],
  mathematics: [
    "Converted a messy argument into a stepwise proof with fewer leaps.",
    "Practiced symbolic manipulation until the cancellation pattern felt automatic.",
    "Reframed the same problem geometrically and algebraically to compare blind spots.",
    "Annotated each theorem application with why its preconditions are actually satisfied.",
    "Ran a quick error analysis and tracked where rounding assumptions start to matter.",
    "Built a compact formula sheet from mistakes made in the previous attempt.",
  ],
  "computer-science": [
    "Profiled two implementations and documented where memory pressure overtook CPU time.",
    "Refactored a recursive routine into an iterative version to remove stack overhead.",
    "Benchmarked indexing strategies with realistic payload sizes instead of toy inputs.",
    "Wrote invariants next to each loop and used them to isolate a logic bug quickly.",
    "Mapped service boundaries and found one API contract that was underspecified.",
    "Designed a fallback path for partial failures and validated the retry behavior.",
  ],
  literature: [
    "Tracked how the narrator shifts reliability across chapters and flagged turning points.",
    "Compared rhetorical devices in two essays and mapped how tone changes persuasion.",
    "Built a quote bank by theme instead of chronology to speed up synthesis writing.",
    "Rewrote a dense paragraph into plain language without losing conceptual nuance.",
    "Charted argument structure and highlighted where evidence supports or overreaches.",
    "Contrasted translations to see which word choices alter the philosophical emphasis.",
  ],
  chemistry: [
    "Balanced reaction pathways and noted where side products become kinetically favorable.",
    "Compared catalyst options by activation profile and practical lab constraints.",
    "Revisited electron-flow notation and corrected a recurring sign convention mistake.",
    "Matched spectroscopy peaks against candidate structures and ruled out weak fits.",
    "Modeled concentration changes over time to separate rate effects from measurement noise.",
    "Summarized intermolecular forces with one concrete example per interaction type.",
  ],
  biology: [
    "Mapped signaling cascades and highlighted where feedback loops change system behavior.",
    "Compared experimental controls and identified one variable that still confounds results.",
    "Built a cell-process timeline to connect molecular events with observed phenotypes.",
    "Linked genotype variations to expression patterns and marked uncertain causal steps.",
    "Reviewed microscopy notes and standardized labels for faster cross-session comparison.",
    "Contrasted immune response stages and listed biomarkers useful for each phase.",
  ],
  history: [
    "Sequenced policy decisions and identified the exact point where negotiation collapsed.",
    "Cross-checked primary and secondary sources to separate interpretation from evidence.",
    "Mapped trade routes to explain why political alliances shifted over one decade.",
    "Built a cause-and-effect chain from local events to broader regional consequences.",
    "Compared speeches from rival factions and tracked shifts in public framing.",
    "Summarized archival notes into a timeline that exposes gaps for further reading.",
  ],
}

const REFLECTION_CLOSERS = [
  "Ended by writing three questions for the next session.",
  "Captured one practical takeaway to apply immediately.",
  "Noted the exact checkpoint to resume from tomorrow.",
  "Flagged one unresolved contradiction to investigate next.",
  "Recorded a concise summary while the details were fresh.",
  "Added a quick self-quiz to verify retention later.",
] as const

const GENERATED_SESSION_START_TIMES = [
  "06:45",
  "07:20",
  "08:10",
  "09:05",
  "10:30",
  "11:40",
  "13:15",
  "14:05",
  "15:20",
  "16:35",
  "18:00",
  "19:10",
] as const

const GENERATED_TOPIC_DURATIONS = [
  900, 1020, 1140, 1260, 1380, 1500, 1620, 1740, 1860, 1980, 2100, 2220,
] as const

const GENERATED_TOPIC_COUNT_PATTERN = [1, 2, 2, 3, 1, 2, 3, 2] as const
const GENERATED_PAUSE_PATTERN = [0, 0, 120, 180, 240, 300, 420] as const
const REFLECTION_MIN_LINES = 10
const REFLECTION_MAX_LINES = 75

type ReflectionLineFactoryContext = {
  subjectLabel: string
  hashtagsText: string
  durationMinutes: number
}

const REFLECTION_LINE_FACTORIES: readonly ((
  lineNumber: number,
  context: ReflectionLineFactoryContext
) => string)[] = [
  (lineNumber, context) =>
    `Checkpoint ${lineNumber}: Reframed the core question in ${context.subjectLabel} to reduce scope drift.`,
  (lineNumber, context) =>
    `Checkpoint ${lineNumber}: Matched this note against ${context.hashtagsText} and kept only evidence-backed claims.`,
  (lineNumber, context) =>
    `Checkpoint ${lineNumber}: Added one concrete example and one counter-example to pressure-test understanding.`,
  (lineNumber, context) =>
    `Checkpoint ${lineNumber}: Spotted repetition in my reasoning and rewrote assumptions from first principles.`,
  (lineNumber, context) =>
    `Checkpoint ${lineNumber}: Compared today's approach with last session to identify what actually improved.`,
  (lineNumber, context) =>
    `Checkpoint ${lineNumber}: Captured a quick confidence score of ${
      (lineNumber + context.durationMinutes) % 5 + 1
    }/5 with rationale.`,
  (lineNumber) =>
    `Checkpoint ${lineNumber}: Logged a potential bog signal where effort increased but insight did not.`,
  (lineNumber, context) =>
    `Checkpoint ${lineNumber}: Converted one abstract idea into a practical next-step checklist.`,
  (lineNumber, context) =>
    `Checkpoint ${lineNumber}: Normalized terminology so labels stay consistent across ${context.subjectLabel} notes.`,
  (lineNumber, context) =>
    `Checkpoint ${lineNumber}: Wrote the smallest test to verify whether the new explanation holds under variation.`,
  (lineNumber, context) =>
    `Checkpoint ${lineNumber}: Noted one unresolved uncertainty to revisit in a ${
      context.durationMinutes >= 30 ? "short" : "focused"
    } follow-up block.`,
  (lineNumber) =>
    `Checkpoint ${lineNumber}: Summarized this segment in one sentence before moving to the next thread.`,
]

function normalizeReflectionText(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim()
}

function getReflectionSeed(topic: SampleTopicConfig): number {
  const topicIdToken = Number.parseInt(topic.id.replace(/\D/g, ""), 10) || 0
  const hashtagToken = topic.hashtags.join("").length * 17
  return topicIdToken + topic.duration + hashtagToken
}

function buildTopicReflection(
  topic: SampleTopicConfig,
  subjectLabel: string
): string {
  const existingLines = topic.reflection
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (existingLines.length >= REFLECTION_MIN_LINES) {
    return existingLines.slice(0, REFLECTION_MAX_LINES).join("\n")
  }

  const seed = getReflectionSeed(topic)
  const targetLineCount =
    REFLECTION_MIN_LINES +
    (seed % (REFLECTION_MAX_LINES - REFLECTION_MIN_LINES + 1))
  const durationMinutes = Math.max(1, Math.round(topic.duration / 60))
  const hashtagsText =
    topic.hashtags.length > 0
      ? topic.hashtags.map((tag) => `#${tag}`).join(" ")
      : "#none"

  const lines: string[] = [
    `Summary: ${normalizeReflectionText(topic.reflection)}`,
    `Subject focus: ${subjectLabel}.`,
    `Tags in play: ${hashtagsText}.`,
    `Focused duration: ${durationMinutes} minute${durationMinutes === 1 ? "" : "s"}.`,
  ]

  while (lines.length < targetLineCount) {
    const lineNumber = lines.length + 1
    const factory =
      REFLECTION_LINE_FACTORIES[
        (seed + lineNumber * 5) % REFLECTION_LINE_FACTORIES.length
      ]

    lines.push(
      factory(lineNumber, {
        subjectLabel,
        hashtagsText,
        durationMinutes,
      })
    )
  }

  return lines.slice(0, REFLECTION_MAX_LINES).join("\n")
}

function createTopic(topic: SampleTopicConfig): SessionTopic {
  const subject = getTagItemByValue(PROTOTYPE_SUBJECTS, topic.subject)

  if (!subject) {
    throw new Error(`Unknown prototype subject: ${topic.subject}`)
  }

  return {
    ...topic,
    subjectLabel: subject.label,
    subjectColor: subject.color,
    reflection: createReflectionFromText(buildTopicReflection(topic, subject.label)),
  }
}

function createSampleSession(session: SampleSessionConfig): StudySession {
  return {
    ...session,
    topics: session.topics.map(createTopic),
  }
}

function parseTimeToSeconds(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 3600 + minutes * 60
}

function formatSecondsToTime(seconds: number): string {
  const day = 24 * 3600
  const normalized = ((seconds % day) + day) % day
  const hours = Math.floor(normalized / 3600)
  const minutes = Math.floor((normalized % 3600) / 60)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

function offsetDate(date: string, days: number): string {
  const source = new Date(`${date}T00:00:00Z`)
  source.setUTCDate(source.getUTCDate() - days)
  return source.toISOString().slice(0, 10)
}

function toTimestamp(date: string, time: string): string {
  return `${date}T${time}:00Z`
}

function buildGeneratedSampleSessions(
  startSessionId: number,
  startTopicId: number,
  count: number
): SampleSessionConfig[] {
  let nextTopicId = startTopicId

  return Array.from({ length: count }, (_, index) => {
    const topicCount =
      GENERATED_TOPIC_COUNT_PATTERN[index % GENERATED_TOPIC_COUNT_PATTERN.length]
    const date = offsetDate("2026-03-17", index)
    const startTime =
      GENERATED_SESSION_START_TIMES[index % GENERATED_SESSION_START_TIMES.length]
    const pauseTime = GENERATED_PAUSE_PATTERN[index % GENERATED_PAUSE_PATTERN.length]

    const topics: SampleTopicConfig[] = Array.from(
      { length: topicCount },
      (_, topicIndex) => {
        const subject =
          SUBJECT_ROTATION[
            (index * 2 + topicIndex * 3) % SUBJECT_ROTATION.length
          ]
        const hashtagsForSubject = HASHTAG_PALETTE_BY_SUBJECT[subject]
        const primaryHashtag =
          hashtagsForSubject[(index + topicIndex) % hashtagsForSubject.length]
        const secondaryHashtag =
          hashtagsForSubject[
            (index + topicIndex + 1) % hashtagsForSubject.length
          ]
        const duration =
          GENERATED_TOPIC_DURATIONS[
            (index + topicIndex * 2) % GENERATED_TOPIC_DURATIONS.length
          ]
        const reflectionBase =
          REFLECTIONS_BY_SUBJECT[subject][
            (index + topicIndex) % REFLECTIONS_BY_SUBJECT[subject].length
          ]
        const reflectionCloser =
          REFLECTION_CLOSERS[
            (index * 3 + topicIndex) % REFLECTION_CLOSERS.length
          ]

        return {
          id: `t${nextTopicId++}`,
          duration,
          subject,
          hashtags:
            topicIndex % 2 === 0
              ? [primaryHashtag]
              : [primaryHashtag, secondaryHashtag],
          reflection: `${reflectionBase} ${reflectionCloser}`,
        }
      }
    )

    const effectiveTime = topics.reduce(
      (total, topic) => total + topic.duration,
      0
    )
    const endTime = formatSecondsToTime(
      parseTimeToSeconds(startTime) + effectiveTime + pauseTime
    )

    return {
      id: String(startSessionId + index),
      date,
      startTime,
      endTime,
      pauseTime,
      effectiveTime,
      topics,
      createdAt: toTimestamp(date, startTime),
      updatedAt: toTimestamp(date, endTime),
    }
  })
}

const BASE_SAMPLE_SESSIONS: SampleSessionConfig[] = [
  {
    id: "1",
    date: "2026-03-28",
    startTime: "14:00",
    endTime: "14:49",
    pauseTime: 0,
    effectiveTime: 2930,
    topics: [
      {
        id: "t1",
        duration: 1200,
        subject: "computer-science",
        hashtags: ["research"],
        reflection:
          "Mapped the difference between exploratory and evaluative research methods.",
      },
      {
        id: "t2",
        duration: 900,
        subject: "literature",
        hashtags: ["philosophy"],
        reflection:
          "Focused on phrasing open-ended prompts and documenting quotes with less bias.",
      },
      {
        id: "t3",
        duration: 830,
        subject: "mathematics",
        hashtags: ["data-structures"],
        reflection:
          "Grouped interview findings into clusters and tested a first-pass synthesis structure.",
      },
    ],
    createdAt: "2026-03-28T14:00:00Z",
    updatedAt: "2026-03-28T14:49:00Z",
  },
  {
    id: "2",
    date: "2026-03-28",
    startTime: "09:00",
    endTime: "10:36",
    pauseTime: 60,
    effectiveTime: 5760,
    topics: [
      {
        id: "t4",
        duration: 3600,
        subject: "theoretical-physics",
        hashtags: ["quantum"],
        reflection:
          "Revisited the double-slit experiment and the measurement interpretation.",
      },
      {
        id: "t5",
        duration: 2160,
        subject: "mathematics",
        hashtags: ["algebra"],
        reflection:
          "Spent time expressing state changes in cleaner linear algebra notation.",
      },
    ],
    createdAt: "2026-03-28T09:00:00Z",
    updatedAt: "2026-03-28T10:36:00Z",
  },
  {
    id: "3",
    date: "2026-03-27",
    startTime: "16:00",
    endTime: "17:11",
    pauseTime: 0,
    effectiveTime: 4260,
    topics: [
      {
        id: "t6",
        duration: 2400,
        subject: "mathematics",
        hashtags: ["calculus"],
        reflection:
          "Worked through repeated integration-by-parts patterns until the setup felt automatic.",
      },
      {
        id: "t7",
        duration: 1860,
        subject: "theoretical-physics",
        hashtags: ["mechanics"],
        reflection:
          "Applied substitution patterns to motion equations and checked where the setup still slowed me down.",
      },
    ],
    createdAt: "2026-03-27T16:00:00Z",
    updatedAt: "2026-03-27T17:11:00Z",
  },
  {
    id: "4",
    date: "2026-03-25",
    startTime: "11:00",
    endTime: "12:25",
    pauseTime: 0,
    effectiveTime: 5100,
    topics: [
      {
        id: "t8",
        duration: 5100,
        subject: "computer-science",
        hashtags: ["algorithms"],
        reflection:
          "Worked through graph traversal tradeoffs and compared two shortest-path strategies.",
      },
    ],
    createdAt: "2026-03-25T11:00:00Z",
    updatedAt: "2026-03-25T12:25:00Z",
  },
  {
    id: "5",
    date: "2026-03-23",
    startTime: "10:00",
    endTime: "11:15",
    pauseTime: 0,
    effectiveTime: 4492,
    topics: [
      {
        id: "t9",
        duration: 4492,
        subject: "literature",
        hashtags: ["philosophy"],
        reflection:
          "Annotated a dense essay and tracked how the author shifts tone between arguments.",
      },
    ],
    createdAt: "2026-03-23T10:00:00Z",
    updatedAt: "2026-03-23T11:15:00Z",
  },
  {
    id: "6",
    date: "2026-03-22",
    startTime: "14:00",
    endTime: "15:29",
    pauseTime: 0,
    effectiveTime: 5318,
    topics: [
      {
        id: "t10",
        duration: 5318,
        subject: "chemistry",
        hashtags: ["mechanics"],
        reflection:
          "Reviewed reaction energy diagrams and compared why some catalysts change the pathway shape.",
      },
    ],
    createdAt: "2026-03-22T14:00:00Z",
    updatedAt: "2026-03-22T15:29:00Z",
  },
  {
    id: "7",
    date: "2026-03-22",
    startTime: "09:00",
    endTime: "11:07",
    pauseTime: 0,
    effectiveTime: 7645,
    topics: [
      {
        id: "t11",
        duration: 7645,
        subject: "biology",
        hashtags: ["research"],
        reflection:
          "Traced how cell-signaling examples map to a larger feedback-loop pattern across systems.",
      },
    ],
    createdAt: "2026-03-22T09:00:00Z",
    updatedAt: "2026-03-22T11:07:00Z",
  },
  {
    id: "8",
    date: "2026-03-21",
    startTime: "15:00",
    endTime: "16:03",
    pauseTime: 0,
    effectiveTime: 3787,
    topics: [
      {
        id: "t12",
        duration: 3787,
        subject: "history",
        hashtags: ["philosophy"],
        reflection:
          "Followed the sequence of political decisions that turned a local dispute into a wider conflict.",
      },
    ],
    createdAt: "2026-03-21T15:00:00Z",
    updatedAt: "2026-03-21T16:03:00Z",
  },
  {
    id: "9",
    date: "2026-03-21",
    startTime: "10:00",
    endTime: "10:52",
    pauseTime: 0,
    effectiveTime: 3121,
    topics: [
      {
        id: "t13",
        duration: 1800,
        subject: "computer-science",
        hashtags: ["research"],
        reflection:
          "Refined primary persona motivations and removed duplicated assumptions.",
      },
      {
        id: "t14",
        duration: 1321,
        subject: "history",
        hashtags: ["philosophy"],
        reflection:
          "Documented the sequence of user touchpoints and where decision friction appeared.",
      },
    ],
    createdAt: "2026-03-21T10:00:00Z",
    updatedAt: "2026-03-21T10:52:00Z",
  },
  {
    id: "10",
    date: "2026-03-18",
    startTime: "13:00",
    endTime: "14:07",
    pauseTime: 0,
    effectiveTime: 4018,
    topics: [
      {
        id: "t15",
        duration: 4018,
        subject: "literature",
        hashtags: ["research"],
        reflection:
          "Compared two critical interpretations and noted where their assumptions diverge most sharply.",
      },
    ],
    createdAt: "2026-03-18T13:00:00Z",
    updatedAt: "2026-03-18T14:07:00Z",
  },
]

const generatedSeedSessionId = BASE_SAMPLE_SESSIONS.length + 1
const generatedSeedTopicId =
  BASE_SAMPLE_SESSIONS.reduce((total, session) => total + session.topics.length, 0) +
  1

const GENERATED_SAMPLE_SESSIONS = buildGeneratedSampleSessions(
  generatedSeedSessionId,
  generatedSeedTopicId,
  50
)

export const TEMP_STUDY_SESSIONS: StudySession[] = [
  ...BASE_SAMPLE_SESSIONS.map(createSampleSession),
  ...GENERATED_SAMPLE_SESSIONS.map(createSampleSession),
]
