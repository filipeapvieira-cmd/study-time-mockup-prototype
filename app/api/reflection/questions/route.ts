import { NextResponse } from "next/server"

import {
  reflectionQuestionsRequestSchema,
  reflectionQuestionsResponseSchema,
} from "@/lib/ai/contracts"
import { generateReflectionQuestions } from "@/lib/ai/reflection-questions"
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
      "The reflection questions request body must be valid JSON.",
      400,
    )
  }

  const parsed = reflectionQuestionsRequestSchema.safeParse(body)
  if (!parsed.success) {
    return createInvalidRequestResponse(parsed.error)
  }

  if (!isAiConfigured()) {
    return createAiErrorResponse(
      "ai_unavailable",
      "AI prompts are unavailable right now because the AI provider is not configured.",
      503,
    )
  }

  try {
    const result = await generateReflectionQuestions(parsed.data)

    return NextResponse.json(reflectionQuestionsResponseSchema.parse(result))
  } catch (error) {
    console.error("Failed to generate reflection questions.", error)

    return createAiErrorResponse(
      "ai_generation_failed",
      "AI prompts are unavailable right now. Please try again in a moment.",
      502,
    )
  }
}
