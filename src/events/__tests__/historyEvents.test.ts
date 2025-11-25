import { describe, it, expect, vi, afterEach } from 'vitest'
import { emitHistoryRefreshRequest, subscribeHistoryRefresh } from '../historyEvents'

describe('historyEvents', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('emite evento de refresh', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    emitHistoryRefreshRequest()
    expect(dispatchSpy).toHaveBeenCalledTimes(1)
    expect(dispatchSpy.mock.calls[0][0]).toBeInstanceOf(Event)
    expect(dispatchSpy.mock.calls[0][0].type).toBe('history:refresh')
  })

  it('permite inscrever e remover listeners', () => {
    const handler = vi.fn()
    const unsubscribe = subscribeHistoryRefresh(handler)

    window.dispatchEvent(new Event('history:refresh'))
    expect(handler).toHaveBeenCalledTimes(1)

    unsubscribe()
    window.dispatchEvent(new Event('history:refresh'))
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
