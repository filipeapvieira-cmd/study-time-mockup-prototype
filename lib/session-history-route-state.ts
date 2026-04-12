/**
 * Session History route-state helpers.
 *
 * Business need:
 * - A dashboard "Recent Sessions" subject row should deep-link into `/session-history`
 *   and open the editor sheet on the exact session topic the user clicked.
 * - URL state is the canonical source of truth for this behavior so links are shareable,
 *   reload-safe, and deterministic.
 * - The editor open state must not break other present/future query params
 *   (for example filter, sort, or pagination), so these helpers always preserve unknown params.
 *
 * URL contract:
 * - `sessionId`: identifies the session to open in Session History.
 * - `topicId`: identifies the topic that should be selected in the sheet.
 *
 * Helper responsibilities:
 * - Parse editor route state from current search params.
 * - Build an editor-open href (`sessionId` + `topicId`) while preserving unrelated params.
 * - Build a list/default href by removing only editor-specific params.
 */
type SearchParamsLike = Pick<URLSearchParams, "get" | "toString">

export const SESSION_HISTORY_SESSION_ID_PARAM = "sessionId"
export const SESSION_HISTORY_TOPIC_ID_PARAM = "topicId"

export type SessionHistoryEditorRouteState = {
  sessionId: string | null
  topicId: string | null
}

function sanitizeQueryValue(value: string | null): string | null {
  if (!value) {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

function cloneSearchParams(searchParams: SearchParamsLike): URLSearchParams {
  return new URLSearchParams(searchParams.toString())
}

function buildHref(pathname: string, searchParams: URLSearchParams): string {
  const queryString = searchParams.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}

export function parseSessionHistoryEditorRouteState(
  searchParams: SearchParamsLike
): SessionHistoryEditorRouteState {
  return {
    sessionId: sanitizeQueryValue(
      searchParams.get(SESSION_HISTORY_SESSION_ID_PARAM)
    ),
    topicId: sanitizeQueryValue(searchParams.get(SESSION_HISTORY_TOPIC_ID_PARAM)),
  }
}

type BuildSessionHistoryEditorHrefInput = {
  pathname: string
  searchParams: SearchParamsLike
  sessionId: string
  topicId: string
}

export function buildSessionHistoryEditorHref({
  pathname,
  searchParams,
  sessionId,
  topicId,
}: BuildSessionHistoryEditorHrefInput): string {
  const nextSearchParams = cloneSearchParams(searchParams)

  nextSearchParams.set(SESSION_HISTORY_SESSION_ID_PARAM, sessionId)
  nextSearchParams.set(SESSION_HISTORY_TOPIC_ID_PARAM, topicId)

  return buildHref(pathname, nextSearchParams)
}

type BuildSessionHistoryListHrefInput = {
  pathname: string
  searchParams: SearchParamsLike
}

export function buildSessionHistoryListHref({
  pathname,
  searchParams,
}: BuildSessionHistoryListHrefInput): string {
  const nextSearchParams = cloneSearchParams(searchParams)

  nextSearchParams.delete(SESSION_HISTORY_SESSION_ID_PARAM)
  nextSearchParams.delete(SESSION_HISTORY_TOPIC_ID_PARAM)

  return buildHref(pathname, nextSearchParams)
}
