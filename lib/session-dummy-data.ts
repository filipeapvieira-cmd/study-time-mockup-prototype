import { getTagItemByValue, PROTOTYPE_SUBJECTS } from "@/lib/study-taxonomy"
import type { SessionTopic, StudySession } from "@/types/session"

type SampleTopicConfig = Omit<SessionTopic, "subjectLabel" | "subjectColor">
type SampleSessionConfig = Omit<StudySession, "topics"> & {
  topics: SampleTopicConfig[]
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
  }
}

function createSampleSession(session: SampleSessionConfig): StudySession {
  return {
    ...session,
    topics: session.topics.map(createTopic),
  }
}

export const TEMP_STUDY_SESSIONS: StudySession[] = [
  createSampleSession({
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
  }),
  createSampleSession({
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
  }),
  createSampleSession({
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
  }),
  createSampleSession({
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
  }),
  createSampleSession({
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
  }),
  createSampleSession({
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
  }),
  createSampleSession({
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
  }),
  createSampleSession({
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
  }),
  createSampleSession({
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
  }),
  createSampleSession({
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
  }),
]
