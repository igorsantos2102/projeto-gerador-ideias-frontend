import { describe, expect, it, vi, beforeEach } from 'vitest'
import { chatService } from '../chatService'
import { apiFetch } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

const apiFetchMock = vi.mocked(apiFetch)

const createResponse = (body: any, ok = true, status = 200, statusText = 'OK') =>
  ({
    ok,
    status,
    statusText,
    json: vi.fn(async () => body),
    text: vi.fn(async () => JSON.stringify(body)),
  } as unknown as Response)

beforeEach(() => {
  apiFetchMock.mockReset()
})

describe('chatService', () => {
  it('inicia chat enviando ideia opcional', async () => {
    const payload = {
      sessionId: 1,
      chatType: 'FREE',
      messages: [],
      tokensInput: 0,
      tokensOutput: 0,
    }
    apiFetchMock.mockResolvedValueOnce(createResponse(payload))

    const result = await chatService.startChat(42)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/chat/start', {
      method: 'POST',
      body: JSON.stringify({ ideaId: 42 }),
    })
    expect(result.sessionId).toBe(1)
  })

  it('lança erro ao enviar mensagem quando backend responde mal', async () => {
    const failure = createResponse({ message: 'confirmar' }, false, 400, 'Bad Request')
    failure.json = vi.fn(async () => ({ message: 'confirmar' }))
    apiFetchMock.mockResolvedValueOnce(failure)

    await expect(chatService.sendMessage(12, 'Oi')).rejects.toThrow('confirmar')
  })

  it('consulta mensagens antigas com query params', async () => {
    const items = {
      messages: [
        {
          id: 5,
          role: 'assistant',
          content: 'ok',
          createdAt: '2025-01-01T00:00:00Z',
          tokensInput: 2,
          tokensOutput: 3,
        },
      ],
      hasMore: true,
    }
    apiFetchMock.mockResolvedValueOnce(createResponse(items))

    const result = await chatService.getOlderMessages(123, '2025-02-01T01:00:00Z', 50)

    expect(apiFetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat/sessions/123/messages')
    )
    expect(result.messages[0].role).toBe('assistant')
    expect(result.hasMore).toBe(true)
  })

  it('mapeia ideias do resumo', async () => {
    const raw = [
      { id: 1, theme: 'Tema', summary: 'Resumo curto', createdAt: '2025' },
    ]
    apiFetchMock.mockResolvedValueOnce(createResponse(raw))

    const result = await chatService.getIdeasSummary()

    expect(result[0].ideaId).toBe('1')
    expect(result[0].title).toBe('Tema')
  })
})
