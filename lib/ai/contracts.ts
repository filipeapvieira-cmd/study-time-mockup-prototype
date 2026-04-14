/**
 * Business value:
 * Defines strict request/response contracts for AI routes so the product can
 * return reliable, typed AI outputs and explicit failure states.
 */
import { z } from "zod"

export const aiRouteErrorCodeSchema = z.enum([
  "invalid_request",
  "ai_unavailable",
  "ai_generation_failed",
  "ai_invalid_response",
])

export type AiRouteErrorCode = z.infer<typeof aiRouteErrorCodeSchema>

export const aiRouteErrorSchema = z.object({
  error: z.object({
    code: aiRouteErrorCodeSchema,
    message: z.string().min(1),
  }),
})

export type AiRouteError = z.infer<typeof aiRouteErrorSchema>

export const reflectionQuestionsRequestSchema = z.object({
  subjectValue: z.string().trim().min(1),
  subjectLabel: z.string().trim().min(1),
  hashtags: z.array(z.string().trim().min(1)).max(12).default([]),
  hashtagLabels: z.array(z.string().trim().min(1)).max(12).default([]),
  reflectionText: z.string().trim().max(6000).default(""),
})

export type ReflectionQuestionsRequest = z.infer<
  typeof reflectionQuestionsRequestSchema
>

export const reflectionQuestionCategorySchema = z.enum([
  "summary",
  "clarify",
  "connect",
  "self-check",
  "next-step",
])

export const reflectionQuestionSchema = z.object({
  id: z.string().trim().min(1),
  category: reflectionQuestionCategorySchema,
  question: z.string().trim().min(1).max(280),
})

export const reflectionQuestionsOutputSchema = z.object({
  intro: z.string().trim().min(1).max(220),
  questions: z.array(reflectionQuestionSchema).length(3),
})

export const reflectionQuestionsResponseSchema =
  reflectionQuestionsOutputSchema.extend({
    generatedAt: z.string().datetime(),
  })

export type ReflectionQuestionsResponse = z.infer<
  typeof reflectionQuestionsResponseSchema
>

export const analyticsInsightsRequestSchema = z.object({
  period: z.enum(["week", "month", "year"]),
  rangeLabel: z.string().trim().min(1),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  totalSessions: z.number().int().nonnegative(),
  totalTopicHours: z.number().nonnegative(),
  subjectDistribution: z
    .array(
      z.object({
        subject: z.string().trim().min(1),
        share: z.number().nonnegative(),
      }),
    )
    .max(12),
  weekdayDistribution: z
    .array(
      z.object({
        day: z.string().trim().min(1),
        hours: z.number().nonnegative(),
      }),
    )
    .max(7),
  startHourDistribution: z
    .array(
      z.object({
        time: z.string().trim().min(1),
        hours: z.number().nonnegative(),
      }),
    )
    .max(24),
  dormantSubjects: z
    .array(
      z.object({
        subject: z.string().trim().min(1),
        daysSinceLastStudy: z.number().int().nonnegative(),
        totalHours: z.number().nonnegative(),
        lastStudiedOn: z.string().trim().min(1),
      }),
    )
    .max(8),
  dormantTags: z
    .array(
      z.object({
        tag: z.string().trim().min(1),
        daysSinceLastStudy: z.number().int().nonnegative(),
        totalUses: z.number().int().nonnegative(),
        lastStudiedOn: z.string().trim().min(1),
      }),
    )
    .max(10),
  recentTopicExcerpts: z
    .array(
      z.object({
        date: z.string().trim().min(1),
        subject: z.string().trim().min(1),
        durationMinutes: z.number().int().positive(),
        hashtags: z.array(z.string().trim().min(1)).max(12),
        reflectionExcerpt: z.string().trim().min(1).max(500),
      }),
    )
    .max(12),
})

export type AnalyticsInsightsRequest = z.infer<
  typeof analyticsInsightsRequestSchema
>

export const analyticsInsightFocusAreaSchema = z.enum([
  "coverage",
  "consistency",
  "timing",
  "revision",
  "reflection",
])

export const analyticsInsightSectionSchema = z.object({
  id: z.string().trim().min(1),
  focusArea: analyticsInsightFocusAreaSchema,
  title: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(240),
  evidence: z.string().trim().min(1).max(260),
  action: z.string().trim().min(1).max(220),
})

export const analyticsInsightsOutputSchema = z.object({
  overview: z.string().trim().min(1).max(260),
  insights: z.array(analyticsInsightSectionSchema).min(2).max(4),
})

export const analyticsInsightsResponseSchema =
  analyticsInsightsOutputSchema.extend({
    generatedAt: z.string().datetime(),
  })

export type AnalyticsInsightsResponse = z.infer<
  typeof analyticsInsightsResponseSchema
>
