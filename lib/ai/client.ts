/**
 * Business value:
 * Centralizes client-side AI response parsing so UI flows handle success and
 * error states consistently and avoid trust-breaking ambiguous failures.
 */
import type { ZodType } from "zod"

import {
  aiRouteErrorSchema,
  type AiRouteErrorCode,
} from "@/lib/ai/contracts"

type ParsedAiSuccess<T> = {
  ok: true
  data: T
}

type ParsedAiFailure = {
  ok: false
  code?: AiRouteErrorCode
  message: string
}

export async function parseAiJsonResponse<T>(
  response: Response,
  schema: ZodType<T>,
): Promise<ParsedAiSuccess<T> | ParsedAiFailure> {
  let payload: unknown = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const parsedError = aiRouteErrorSchema.safeParse(payload)

    if (parsedError.success) {
      return {
        ok: false,
        code: parsedError.data.error.code,
        message: parsedError.data.error.message,
      }
    }

    return {
      ok: false,
      message: "The AI request could not be completed.",
    }
  }

  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    return {
      ok: false,
      code: "ai_invalid_response",
      message: "The AI response could not be validated.",
    }
  }

  return {
    ok: true,
    data: parsed.data,
  }
}
