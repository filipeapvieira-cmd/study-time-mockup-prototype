/**
 * Business value:
 * Provides shared text normalization/truncation helpers so AI evidence and
 * prompts use consistent text shaping across features.
 */
export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

export function truncateNormalizedText(value: string, maxLength: number) {
  const normalized = normalizeWhitespace(value)

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized
    .slice(0, Math.max(0, maxLength - 3))
    .trimEnd()}...`
}
