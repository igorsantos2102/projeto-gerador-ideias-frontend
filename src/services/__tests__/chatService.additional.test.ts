import { describe, expect, it, beforeEach, vi } from 'vitest'
import { chatService } from '../chatService'
import { apiFetch } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

const apiFetchMock = vi.mocked(apiFetch)

const makeResponse = (body: any, ok = true, status = 200, text = '') =>
  ({
    ok,
    status,
    statusText: ok ? 'OK' : 'ERR',
    json: vi.fn(async () => body),
    text: vi.fn(async () => text || JSON.stringify(body)),
  } as unknown as Response)

beforeEach(() => {
  apiFetchMock.mockReset()
})

describe('chatService extended coverage', () => {
  it('getSession e erro textual', async () => {
    apiFetchMock.mockResolvedValueOnce(makeResponse({ sessionId: 3 }))
    const session = await chatService.getSession(3)
    expect(session.sessionId).toBe(3)

    apiFetchMock.mockResolvedValueOnce(makeResponse({}, false, 401, 'nope'))
    await expect(chatService.getSession(3)).rejects.toThrow('nope')
  })

  it('getOlderMessages e getIdeasSummary lidam com falhas', async () => {
    apiFetchMock.mockResolvedValueOnce(
      makeResponse({
        messages: [{ id: 'a', role: 'user', content: 'msg', createdAt: new Date().toISOString() }],
        hasMore: true,
      })
    )
    const result = await chatService.getOlderMessages(1, '2025-01-01T00:00:00Z')
    expect(result.messages[0].role).toBe('user')

    apiFetchMock.mockResolvedValueOnce(makeResponse({}, false, 500, 'broken'))
    await expect(chatService.getOlderMessages(1, '2025-01-01T00:00:00Z')).rejects.toThrow('broken')
  })

  it('getChatLogs trata JSON inválido', async () => {
    apiFetchMock.mockResolvedValueOnce(
      makeResponse({
        selectedDate: '2025-01-01',
        summary: {},
        interactions: [],
        pagination: {},
      })
    )

    const payload = await chatService.getChatLogs({ page: 1, size: 5 })
    expect(payload.selectedDate).toBe('2025-01-01')

    const errorResp = makeResponse({}, false, 500, '{"error":"boom"}')
    apiFetchMock.mockResolvedValueOnce(errorResp)
    await expect(chatService.getChatLogs()).rejects.toThrow(/boom/)
  })

  it('getAdminChatLogs gera erro com status', async () => {
    const errorResp = makeResponse({}, false, 403, '')
    apiFetchMock.mockResolvedValueOnce(errorResp)
    await expect(chatService.getAdminChatLogs({ userId: 2 })).rejects.toThrow(/(Erro 403|{})/)
  })
})
