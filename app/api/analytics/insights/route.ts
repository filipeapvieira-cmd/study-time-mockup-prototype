import { NextResponse } from "next/server"

import {
  analyticsInsightsRequestSchema,
  analyticsInsightsResponseSchema,
} from "@/lib/ai/contracts"
import { generateAnalyticsInsights } from "@/lib/ai/analytics-insights"
import { isAiConfigured } from "@/lib/ai/provider"
import {
  createAiErrorResponse,
  createInvalidRequestResponse,
} from "@/lib/ai/route-responses"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return createAiErrorResponse(
      "invalid_request",
      "The analytics insights request body must be valid JSON.",
      400,
    )
  }

  const parsed = analyticsInsightsRequestSchema.safeParse(body)
  if (!parsed.success) {
    return createInvalidRequestResponse(parsed.error)
  }

  if (!isAiConfigured()) {
    return createAiErrorResponse(
      "ai_unavailable",
      "AI insights are unavailable right now because the AI provider is not configured.",
      503,
    )
  }

  try {
    const result = await generateAnalyticsInsights(parsed.data)

    return NextResponse.json(analyticsInsightsResponseSchema.parse(result))
  } catch (error) {
    console.error("Failed to generate analytics insights.", error)

    return createAiErrorResponse(
      "ai_generation_failed",
      "AI insights are unavailable right now. Please try again in a moment.",
      502,
    )
  }
}
