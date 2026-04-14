import { cloneReflection, createEmptyReflection } from "@/lib/session-reflection"
import {
  cloneTagItems,
  getTagItemByValue,
  PROTOTYPE_HASHTAGS,
  PROTOTYPE_SUBJECTS,
} from "@/lib/study-taxonomy"
import type { SessionTopic } from "@/types/session"
import type { TagItem } from "@/types/tag"

export type SessionStatus = "stopped" | "playing" | "paused"

/**
 * Business entity for one topic being drafted during an in-progress log session.
 * Each topic owns its own form data so users can switch topics without data loss.
 */
export interface LogSessionTopicDraft {
  id: string
  subject: string
  hashtags: string[]
  reflection: SessionTopic["reflection"]
  durationSeconds: number
  isRunning: boolean
}

/**
 * Route-level source of truth for the `/log-session` workflow.
 * Keeps sidebar controls and main editor in sync through one state tree.
 */
export interface LogSessionDraftState {
  topicsById: Record<string, LogSessionTopicDraft>
  topicOrder: string[]
  activeTopicId: string | null
  sessionStatus: SessionStatus
  sessionElapsedSeconds: number
  subjects: TagItem[]
  hashtags: TagItem[]
}

/**
 * Domain events for the log-session draft lifecycle.
 * These events encode business rules such as one topic per subject and
 * synchronized timer behavior between session and topic scopes.
 */
export type LogSessionDraftAction =
  | { type: "selectTopic"; topicId: string }
  | { type: "addTopic" }
  | { type: "deleteTopic"; topicId: string }
  | { type: "updateActiveTopicSubject"; subjectValue: string }
  | { type: "updateActiveTopicHashtags"; hashtags: string[] }
  | { type: "updateActiveTopicReflection"; reflection: SessionTopic["reflection"] }
  | { type: "updateSubjects"; subjects: TagItem[] }
  | { type: "updateHashtags"; hashtags: TagItem[] }
  | { type: "toggleSession" }
  | { type: "stopSession" }
  | { type: "resetSession" }
  | { type: "toggleTopicTimer"; topicId: string }
  | { type: "tick" }

interface LogSessionTaxonomy {
  subjects: TagItem[]
}

interface ActiveTopicViewModel {
  activeTopic: LogSessionTopicDraft | null
  selectedSubject: string
  selectedHashtags: string[]
  reflection: SessionTopic["reflection"]
  subjectItem: TagItem | null
  topicLabel: string
}

function createTopicDraft(id: string): LogSessionTopicDraft {
  return {
    id,
    subject: "",
    hashtags: [],
    reflection: createEmptyReflection(),
    durationSeconds: 0,
    isRunning: false,
  }
}

function getNextTopicId(topicOrder: string[]): string {
  const maxTopicNumber = topicOrder.reduce((max, topicId) => {
    const [, maybeNumber] = topicId.split("topic-")
    const topicNumber = Number.parseInt(maybeNumber ?? "", 10)
    return Number.isFinite(topicNumber) && topicNumber > max ? topicNumber : max
  }, 0)

  return `topic-${maxTopicNumber + 1}`
}

function getActiveTopicIndex(state: LogSessionDraftState, topicId: string): number {
  const topicIndex = state.topicOrder.indexOf(topicId)
  return topicIndex >= 0 ? topicIndex + 1 : 1
}

function stopAllTopicTimers(
  topicsById: Record<string, LogSessionTopicDraft>,
): Record<string, LogSessionTopicDraft> {
  let hasRunningTopic = false

  for (const topic of Object.values(topicsById)) {
    if (topic.isRunning) {
      hasRunningTopic = true
      break
    }
  }

  if (!hasRunningTopic) {
    return topicsById
  }

  const updatedTopics: Record<string, LogSessionTopicDraft> = {}
  for (const [topicId, topic] of Object.entries(topicsById)) {
    updatedTopics[topicId] = topic.isRunning ? { ...topic, isRunning: false } : topic
  }

  return updatedTopics
}

function hasAvailableSubject(state: LogSessionDraftState): boolean {
  if (state.subjects.length === 0 || state.topicOrder.length >= state.subjects.length) {
    return false
  }

  const usedSubjects = new Set(
    state.topicOrder
      .map((topicId) => state.topicsById[topicId]?.subject ?? "")
      .filter(Boolean),
  )

  return state.subjects.some((subject) => !usedSubjects.has(subject.value))
}

function updateActiveTopic(
  state: LogSessionDraftState,
  updater: (topic: LogSessionTopicDraft) => LogSessionTopicDraft,
): LogSessionDraftState {
  if (!state.activeTopicId) {
    return state
  }

  const activeTopic = state.topicsById[state.activeTopicId]
  if (!activeTopic) {
    return state
  }

  const updatedTopic = updater(activeTopic)
  if (updatedTopic === activeTopic) {
    return state
  }

  return {
    ...state,
    topicsById: {
      ...state.topicsById,
      [updatedTopic.id]: updatedTopic,
    },
  }
}

export function createInitialLogSessionDraftState(): LogSessionDraftState {
  const initialTopic = createTopicDraft("topic-1")

  return {
    topicsById: { [initialTopic.id]: initialTopic },
    topicOrder: [initialTopic.id],
    activeTopicId: initialTopic.id,
    sessionStatus: "stopped",
    sessionElapsedSeconds: 0,
    subjects: cloneTagItems(PROTOTYPE_SUBJECTS),
    hashtags: cloneTagItems(PROTOTYPE_HASHTAGS),
  }
}

/**
 * Central business reducer for the log-session page.
 * Guarantees deterministic updates for topic switching, taxonomy edits, and timers.
 */
export function logSessionDraftReducer(
  state: LogSessionDraftState,
  action: LogSessionDraftAction,
): LogSessionDraftState {
  switch (action.type) {
    case "selectTopic": {
      if (!state.topicsById[action.topicId]) {
        return state
      }

      return {
        ...state,
        activeTopicId: action.topicId,
      }
    }
    case "addTopic": {
      if (!hasAvailableSubject(state)) {
        return state
      }

      const nextTopicId = getNextTopicId(state.topicOrder)
      const nextTopic = createTopicDraft(nextTopicId)

      return {
        ...state,
        topicsById: {
          ...state.topicsById,
          [nextTopicId]: nextTopic,
        },
        topicOrder: [...state.topicOrder, nextTopicId],
        activeTopicId: nextTopicId,
      }
    }
    case "deleteTopic": {
      if (state.topicOrder.length <= 1 || !state.topicsById[action.topicId]) {
        return state
      }

      const removedTopicIndex = state.topicOrder.indexOf(action.topicId)
      const nextTopicOrder = state.topicOrder.filter((topicId) => topicId !== action.topicId)
      const nextActiveTopicId =
        state.activeTopicId === action.topicId
          ? nextTopicOrder[Math.max(0, removedTopicIndex - 1)] ?? nextTopicOrder[0] ?? null
          : state.activeTopicId

      const { [action.topicId]: _, ...nextTopicsById } = state.topicsById

      return {
        ...state,
        topicsById: nextTopicsById,
        topicOrder: nextTopicOrder,
        activeTopicId: nextActiveTopicId,
      }
    }
    case "updateActiveTopicSubject": {
      return updateActiveTopic(state, (topic) => {
        const nextSubjectValue = action.subjectValue

        if (!nextSubjectValue) {
          return {
            ...topic,
            subject: "",
          }
        }

        const subjectInUse = state.topicOrder.some((topicId) => {
          if (topicId === topic.id) {
            return false
          }

          return state.topicsById[topicId]?.subject === nextSubjectValue
        })

        if (subjectInUse || topic.subject === nextSubjectValue) {
          return topic
        }

        return {
          ...topic,
          subject: nextSubjectValue,
        }
      })
    }
    case "updateActiveTopicHashtags": {
      const validHashtagValues = new Set(state.hashtags.map((hashtag) => hashtag.value))
      const nextHashtags = Array.from(new Set(action.hashtags)).filter((hashtagValue) =>
        validHashtagValues.has(hashtagValue),
      )

      return updateActiveTopic(state, (topic) => {
        const hashtagsUnchanged =
          topic.hashtags.length === nextHashtags.length &&
          topic.hashtags.every((value, index) => value === nextHashtags[index])

        if (hashtagsUnchanged) {
          return topic
        }

        return {
          ...topic,
          hashtags: nextHashtags,
        }
      })
    }
    case "updateActiveTopicReflection": {
      return updateActiveTopic(state, (topic) => ({
        ...topic,
        reflection: cloneReflection(action.reflection),
      }))
    }
    case "updateSubjects": {
      const nextSubjects = cloneTagItems(action.subjects)
      const validSubjectValues = new Set(nextSubjects.map((subject) => subject.value))
      const nextTopicsById: Record<string, LogSessionTopicDraft> = {}

      for (const topicId of state.topicOrder) {
        const topic = state.topicsById[topicId]
        if (!topic) continue

        nextTopicsById[topicId] = validSubjectValues.has(topic.subject)
          ? topic
          : { ...topic, subject: "" }
      }

      return {
        ...state,
        subjects: nextSubjects,
        topicsById: nextTopicsById,
      }
    }
    case "updateHashtags": {
      const nextHashtags = cloneTagItems(action.hashtags)
      const validHashtagValues = new Set(nextHashtags.map((hashtag) => hashtag.value))
      const nextTopicsById: Record<string, LogSessionTopicDraft> = {}

      for (const topicId of state.topicOrder) {
        const topic = state.topicsById[topicId]
        if (!topic) continue

        nextTopicsById[topicId] = {
          ...topic,
          hashtags: topic.hashtags.filter((hashtagValue) => validHashtagValues.has(hashtagValue)),
        }
      }

      return {
        ...state,
        hashtags: nextHashtags,
        topicsById: nextTopicsById,
      }
    }
    case "toggleSession": {
      if (state.sessionStatus === "playing") {
        return {
          ...state,
          sessionStatus: "paused",
          topicsById: stopAllTopicTimers(state.topicsById),
        }
      }

      return {
        ...state,
        sessionStatus: "playing",
      }
    }
    case "stopSession": {
      return {
        ...state,
        sessionStatus: "stopped",
        topicsById: stopAllTopicTimers(state.topicsById),
      }
    }
    case "resetSession": {
      const nextTopicsById: Record<string, LogSessionTopicDraft> = {}

      for (const topicId of state.topicOrder) {
        const topic = state.topicsById[topicId]
        if (!topic) continue

        nextTopicsById[topicId] = {
          ...topic,
          durationSeconds: 0,
          isRunning: false,
        }
      }

      return {
        ...state,
        sessionStatus: "stopped",
        sessionElapsedSeconds: 0,
        topicsById: nextTopicsById,
      }
    }
    case "toggleTopicTimer": {
      if (state.sessionStatus !== "playing") {
        return state
      }

      const topic = state.topicsById[action.topicId]
      if (!topic) {
        return state
      }

      return {
        ...state,
        topicsById: {
          ...state.topicsById,
          [action.topicId]: {
            ...topic,
            isRunning: !topic.isRunning,
          },
        },
      }
    }
    case "tick": {
      if (state.sessionStatus !== "playing") {
        return state
      }

      const nextTopicsById: Record<string, LogSessionTopicDraft> = {}

      for (const topicId of state.topicOrder) {
        const topic = state.topicsById[topicId]
        if (!topic) continue

        nextTopicsById[topicId] = topic.isRunning
          ? {
              ...topic,
              durationSeconds: topic.durationSeconds + 1,
            }
          : topic
      }

      return {
        ...state,
        sessionElapsedSeconds: state.sessionElapsedSeconds + 1,
        topicsById: nextTopicsById,
      }
    }
    default: {
      return state
    }
  }
}

/**
 * Returns the currently active topic, if any.
 */
export function getActiveTopic(state: LogSessionDraftState): LogSessionTopicDraft | null {
  if (!state.activeTopicId) {
    return null
  }

  return state.topicsById[state.activeTopicId] ?? null
}

/**
 * Computes the user-facing label shown in the sidebar topic selector.
 * Business rule: prefer selected subject label; otherwise use `Topic N`.
 */
export function getTopicLabel(
  topic: LogSessionTopicDraft,
  taxonomy: LogSessionTaxonomy,
  fallbackTopicIndex: number,
): string {
  if (topic.subject) {
    const subject = getTagItemByValue(taxonomy.subjects, topic.subject)
    if (subject?.label) {
      return subject.label
    }
  }

  return `Topic ${fallbackTopicIndex}`
}

/**
 * Returns the active-topic values consumed by main-content fields and AI prompts.
 * Provides safe defaults so the editor can render before any user input exists.
 */
export function getActiveTopicViewModel(state: LogSessionDraftState): ActiveTopicViewModel {
  const activeTopic = getActiveTopic(state)
  const selectedSubject = activeTopic?.subject ?? ""
  const selectedHashtags = activeTopic?.hashtags ?? []
  const reflection = activeTopic?.reflection ?? createEmptyReflection()
  const subjectItem = selectedSubject
    ? getTagItemByValue(state.subjects, selectedSubject) ?? null
    : null
  const topicLabel = activeTopic
    ? getTopicLabel(activeTopic, { subjects: state.subjects }, getActiveTopicIndex(state, activeTopic.id))
    : "Topic 1"

  return {
    activeTopic,
    selectedSubject,
    selectedHashtags,
    reflection,
    subjectItem,
    topicLabel,
  }
}

/**
 * Enforces the one-topic-per-subject business rule for the Subject selector.
 * The active topic keeps its current subject available while other used subjects are filtered out.
 */
export function getAvailableSubjectsForActiveTopic(state: LogSessionDraftState): TagItem[] {
  const activeTopic = getActiveTopic(state)
  const usedByOtherTopics = new Set(
    state.topicOrder
      .filter((topicId) => topicId !== activeTopic?.id)
      .map((topicId) => state.topicsById[topicId]?.subject ?? "")
      .filter(Boolean),
  )

  return state.subjects.filter(
    (subject) => subject.value === activeTopic?.subject || !usedByOtherTopics.has(subject.value),
  )
}

/**
 * Determines whether a new topic can be created under current taxonomy and assignments.
 */
export function canAddTopic(state: LogSessionDraftState): boolean {
  return hasAvailableSubject(state)
}
