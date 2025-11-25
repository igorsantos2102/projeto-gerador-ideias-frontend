import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'

const HISTORY_REFRESH_EVENT = 'history:refresh'

export type HistoryRefreshEventDetail = {
  idea?: Idea
}

export type HistoryRefreshEventHandler = (detail: HistoryRefreshEventDetail) => void

export function emitHistoryRefreshRequest(detail: HistoryRefreshEventDetail = {}) {
  if (typeof window === 'undefined') return
  const event = new CustomEvent(HISTORY_REFRESH_EVENT, { detail })
  window.dispatchEvent(event)
}

export function subscribeHistoryRefresh(handler: HistoryRefreshEventHandler) {
  if (typeof window === 'undefined') {
    return () => {}
  }
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<HistoryRefreshEventDetail>).detail
    handler(detail ?? {})
  }
  window.addEventListener(HISTORY_REFRESH_EVENT, listener)
  return () => window.removeEventListener(HISTORY_REFRESH_EVENT, listener)
}
