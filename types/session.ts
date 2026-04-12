// Types for Study Session management

export interface SessionTopic {
  id: string
  duration: number // Duration in seconds
  subject: string
  subjectLabel: string
  subjectColor: string
  hashtags: string[]
  reflection: string
}

export interface StudySession {
  id: string
  date: string
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  pauseTime: number // Pause duration in seconds
  effectiveTime: number // Calculated: endTime - startTime - pauseTime in seconds
  topics: SessionTopic[]
  createdAt: string
  updatedAt: string
}

// Helper functions for time calculations
export function parseTimeToSeconds(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 3600 + minutes * 60
}

export function formatSecondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export function formatSecondsToDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function calculateEffectiveTime(
  startTime: string,
  endTime: string,
  pauseTime: number
): number {
  const startSeconds = parseTimeToSeconds(startTime)
  const endSeconds = parseTimeToSeconds(endTime)
  const totalSeconds = endSeconds - startSeconds
  return Math.max(0, totalSeconds - pauseTime)
}

export function validateSessionTimes(
  startTime: string,
  endTime: string,
  pauseTime: number
): { valid: boolean; error?: string } {
  const startSeconds = parseTimeToSeconds(startTime)
  const endSeconds = parseTimeToSeconds(endTime)
  
  if (endSeconds <= startSeconds) {
    return { valid: false, error: "End time must be after start time" }
  }
  
  const totalDuration = endSeconds - startSeconds
  if (pauseTime >= totalDuration) {
    return { valid: false, error: "Pause time cannot exceed total session duration" }
  }
  
  return { valid: true }
}
