import { describe, expect, it, vi, beforeEach } from 'vitest'
import { statsService } from '../statsService'
import { apiFetch } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

const apiFetchMock = vi.mocked(apiFetch)

const makeResponse = (body: any, ok = true, status = 200) =>
  ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Fail',
    json: vi.fn(async () => body),
    text: vi.fn(async () => JSON.stringify(body)),
  } as unknown as Response)

beforeEach(() => {
  apiFetchMock.mockReset()
})

describe('statsService', () => {
  it('retorna estatísticas quando todos endpoints funcionam', async () => {
    apiFetchMock
      .mockResolvedValueOnce(makeResponse({ averageGenerationTimeMs: 220 }))
      .mockResolvedValueOnce(makeResponse({ count: 12 }))
      .mockResolvedValueOnce(makeResponse({ generatedIdeasCount: 7 }))

    const result = await statsService.getStats()

    expect(result).toEqual({
      averageResponseTime: 220,
      totalFavorites: 12,
      totalIdeas: 7,
    })
  })

  it('trata falhas individuais mantendo zero nos valores afetados', async () => {
    apiFetchMock
      .mockResolvedValueOnce(makeResponse({ message: 'nop' }, false, 500))
      .mockResolvedValueOnce(makeResponse({ count: 3 }))
      .mockResolvedValueOnce(makeResponse({ generatedIdeasCount: 1 }))

    const result = await statsService.getStats()

    expect(result.averageResponseTime).toBe(0)
    expect(result.totalFavorites).toBe(3)
    expect(result.totalIdeas).toBe(1)
  })
})
