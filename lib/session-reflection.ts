/**
 * Session reflection domain helpers.
 *
 * Business context:
 * - Reflection text is now authored as rich content (PlateJS) instead of plain textarea input.
 * - Product surfaces this same reflection content in multiple workflows: live logging,
 *   session-history review, search/filter, and PDF export.
 * - To keep those workflows consistent, we need a single place that defines:
 *   creation defaults, safe cloning semantics, and deterministic plain-text extraction.
 *
 * Module responsibility:
 * - Provide canonical constructors for reflection values.
 * - Protect state boundaries by deep-cloning editor values before reuse.
 * - Convert rich reflection values to plain text for secondary channels
 *   (search indexing, word counts, export rendering, empty checks).
 */
import type { Value } from "platejs"

const EMPTY_REFLECTION: Value = [
  {
    type: "p",
    children: [{ text: "" }],
  },
]

export function createEmptyReflection(): Value {
  return cloneReflection(EMPTY_REFLECTION)
}

export function createReflectionFromText(text: string): Value {
  const normalized = text.replace(/\r\n?/g, "\n")

  if (!normalized.trim()) {
    return createEmptyReflection()
  }

  return normalized.split("\n").map((line) => ({
    type: "p",
    children: [{ text: line }],
  })) as Value
}

export function cloneReflection(reflection: Value): Value {
  if (typeof structuredClone === "function") {
    return structuredClone(reflection)
  }

  return JSON.parse(JSON.stringify(reflection)) as Value
}

export function reflectionToPlainText(reflection: Value): string {
  return reflection.map((node) => getNodeText(node)).join("\n").trim()
}

export function reflectionToSearchText(reflection: Value): string {
  return reflectionToPlainText(reflection).replace(/\s+/g, " ").trim()
}

export function isReflectionEmpty(reflection: Value): boolean {
  return reflectionToPlainText(reflection).length === 0
}

function getNodeText(node: unknown): string {
  if (!node || typeof node !== "object") {
    return ""
  }

  const record = node as { text?: unknown; children?: unknown[] }

  if (typeof record.text === "string") {
    return record.text
  }

  if (!Array.isArray(record.children)) {
    return ""
  }

  return record.children.map((child) => getNodeText(child)).join("")
}
