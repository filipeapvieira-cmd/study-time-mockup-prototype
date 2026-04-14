/**
 * Business value:
 * Keeps AI provider configuration server-side and reusable, so model access is
 * secure and switching models/providers remains low-risk.
 */
import { createOpenAI } from "@ai-sdk/openai"
import { createProviderRegistry } from "ai"

type ProviderRegistry = ReturnType<typeof createProviderRegistry>

let providerRegistry: ProviderRegistry | null = null

export function isAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim())
}

function getProviderRegistry() {
  if (!isAiConfigured()) {
    throw new Error("OPENAI_API_KEY is not configured.")
  }

  if (providerRegistry) {
    return providerRegistry
  }

  providerRegistry = createProviderRegistry({
    openai: createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
  })

  return providerRegistry
}

export function getStudyTimeAiModel() {
  const modelId = process.env.STUDYTIME_AI_MODEL?.trim() || "gpt-5.4-mini"
  return getProviderRegistry().languageModel(`openai:${modelId}`)
}
