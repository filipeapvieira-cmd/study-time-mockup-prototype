"use client"

import * as React from "react"

import {
  createInitialLogSessionDraftState,
  logSessionDraftReducer,
  type LogSessionDraftState,
} from "@/lib/log-session-draft"
import type { SessionTopic } from "@/types/session"
import type { TagItem } from "@/types/tag"

interface LogSessionDraftActions {
  selectTopic: (topicId: string) => void
  addTopic: () => void
  deleteTopic: (topicId: string) => void
  updateActiveTopicSubject: (subjectValue: string) => void
  updateActiveTopicHashtags: (hashtags: string[]) => void
  updateActiveTopicReflection: (reflection: SessionTopic["reflection"]) => void
  updateSubjects: (subjects: TagItem[]) => void
  updateHashtags: (hashtags: TagItem[]) => void
  toggleSession: () => void
  stopSession: () => void
  resetSession: () => void
  toggleTopicTimer: (topicId: string) => void
}

interface LogSessionDraftContextValue {
  state: LogSessionDraftState
  actions: LogSessionDraftActions
}

const LogSessionDraftContext = React.createContext<LogSessionDraftContextValue | null>(null)

interface LogSessionDraftProviderProps {
  children: React.ReactNode
}

export function LogSessionDraftProvider({ children }: LogSessionDraftProviderProps) {
  const [state, dispatch] = React.useReducer(
    logSessionDraftReducer,
    undefined,
    createInitialLogSessionDraftState,
  )

  React.useEffect(() => {
    if (state.sessionStatus !== "playing") {
      return
    }

    const timerId = window.setInterval(() => {
      dispatch({ type: "tick" })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [state.sessionStatus])

  const selectTopic = React.useCallback((topicId: string) => {
    dispatch({ type: "selectTopic", topicId })
  }, [])

  const addTopic = React.useCallback(() => {
    dispatch({ type: "addTopic" })
  }, [])

  const deleteTopic = React.useCallback((topicId: string) => {
    dispatch({ type: "deleteTopic", topicId })
  }, [])

  const updateActiveTopicSubject = React.useCallback((subjectValue: string) => {
    dispatch({ type: "updateActiveTopicSubject", subjectValue })
  }, [])

  const updateActiveTopicHashtags = React.useCallback((hashtags: string[]) => {
    dispatch({ type: "updateActiveTopicHashtags", hashtags })
  }, [])

  const updateActiveTopicReflection = React.useCallback(
    (reflection: SessionTopic["reflection"]) => {
      dispatch({ type: "updateActiveTopicReflection", reflection })
    },
    [],
  )

  const updateSubjects = React.useCallback((subjects: TagItem[]) => {
    dispatch({ type: "updateSubjects", subjects })
  }, [])

  const updateHashtags = React.useCallback((hashtags: TagItem[]) => {
    dispatch({ type: "updateHashtags", hashtags })
  }, [])

  const toggleSession = React.useCallback(() => {
    dispatch({ type: "toggleSession" })
  }, [])

  const stopSession = React.useCallback(() => {
    dispatch({ type: "stopSession" })
  }, [])

  const resetSession = React.useCallback(() => {
    dispatch({ type: "resetSession" })
  }, [])

  const toggleTopicTimer = React.useCallback((topicId: string) => {
    dispatch({ type: "toggleTopicTimer", topicId })
  }, [])

  const actions = React.useMemo<LogSessionDraftActions>(
    () => ({
      selectTopic,
      addTopic,
      deleteTopic,
      updateActiveTopicSubject,
      updateActiveTopicHashtags,
      updateActiveTopicReflection,
      updateSubjects,
      updateHashtags,
      toggleSession,
      stopSession,
      resetSession,
      toggleTopicTimer,
    }),
    [
      addTopic,
      deleteTopic,
      resetSession,
      selectTopic,
      stopSession,
      toggleSession,
      toggleTopicTimer,
      updateActiveTopicHashtags,
      updateActiveTopicReflection,
      updateActiveTopicSubject,
      updateHashtags,
      updateSubjects,
    ],
  )

  const value = React.useMemo<LogSessionDraftContextValue>(
    () => ({
      state,
      actions,
    }),
    [actions, state],
  )

  return (
    <LogSessionDraftContext.Provider value={value}>
      {children}
    </LogSessionDraftContext.Provider>
  )
}

export function useLogSessionDraft() {
  const context = React.useContext(LogSessionDraftContext)

  if (!context) {
    throw new Error("useLogSessionDraft must be used within a LogSessionDraftProvider.")
  }

  return context
}
