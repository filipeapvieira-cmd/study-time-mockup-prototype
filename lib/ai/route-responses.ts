/**
 * Business value:
 * Standardizes AI route error payloads so clients can show trustworthy
 * unavailable/error states.
 */
import { NextResponse } from "next/server"
import type { ZodError } from "zod"

import {
  aiRouteErrorSchema,
  type AiRouteErrorCode,
} from "@/lib/ai/contracts"

export function createAiErrorResponse(
  code: AiRouteErrorCode,
  message: string,
  status: number,
) {
  return NextResponse.json(
    aiRouteErrorSchema.parse({
      error: {
        code,
        message,
      },
    }),
    { status },
  )
}

export function createInvalidRequestResponse(error: ZodError) {
  const message =
    error.issues[0]?.message || "The request payload is invalid for this AI route."

  return createAiErrorResponse("invalid_request", message, 400)
}
