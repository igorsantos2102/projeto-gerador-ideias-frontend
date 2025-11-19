import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ideaService } from '../ideaService'
import { apiFetch } from '@/lib/api'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

const mockApiFetch = vi.mocked(apiFetch)
const mockResponse = (body: any, init: ResponseInit = { status: 200 }) =>
  new Response(body !== null ? JSON.stringify(body) : null, {
    headers: body !== null ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  })

describe('ideaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost' },
      writable: true,
    })
  })

  it('gera ideia adicionando skipCache quando necess�rio', async () => {
    const payload = {
      id: 1,
      theme: 'Tecnologia',
      content: 'Nova ideia',
      createdAt: '2025-01-01T00:00:00Z',
      executionTimeMs: 123,
      context: 'Pitch',
    }
    mockApiFetch.mockResolvedValueOnce(mockResponse(payload))

    const result = await ideaService.generateIdea(5, 'Pitch', true)

    expect(mockApiFetch).toHaveBeenCalledWith('/api/ideas/generate?skipCache=true', {
      method: 'POST',
      body: JSON.stringify({ theme: 5, context: 'Pitch' }),
    })
    expect(result).toMatchObject<Idea>({
      id: '1',
      theme: 'Tecnologia',
      content: 'Nova ideia',
      context: 'Pitch',
      isFavorite: false,
      timestamp: expect.any(Date),
    })
  })

  it('lan�a erro quando generateIdea falha', async () => {
    mockApiFetch.mockResolvedValueOnce(mockResponse('falha', { status: 500 }))
    await expect(ideaService.generateIdea(1, 'ctx')).rejects.toThrow('falha')
  })

  it('gera ideia surpresa e mapeia a resposta', async () => {
    const payload = {
      id: 'surprise',
      theme: 'Viagem',
      content: 'App que conecta viajantes',
      createdAt: '2025-02-02T12:00:00Z',
      executionTimeMs: 321,
    }
    mockApiFetch.mockResolvedValueOnce(mockResponse(payload))

    const idea = await ideaService.generateSurpriseIdea()

    expect(mockApiFetch).toHaveBeenCalledWith('/api/ideas/surprise-me', {
      method: 'POST',
    })
    expect(idea.theme).toBe('Viagem')
    expect(idea.id).toBe('surprise')
  })

  it('propaga erro quando surprise falha', async () => {
    mockApiFetch.mockResolvedValueOnce(mockResponse('erro surpresa', { status: 500 }))
    await expect(ideaService.generateSurpriseIdea()).rejects.toThrow('erro surpresa')
  })

  it('faz o toggle de favorito enviando o m�todo correto', async () => {
    mockApiFetch.mockResolvedValue(mockResponse(null))

    await ideaService.toggleFavorite('idea-1', true)
    expect(mockApiFetch).toHaveBeenCalledWith('/api/ideas/idea-1/favorite', { method: 'POST' })

    await ideaService.toggleFavorite('idea-1', false)
    expect(mockApiFetch).toHaveBeenLastCalledWith('/api/ideas/idea-1/favorite', { method: 'DELETE' })
  })

  it('propaga erro quando o toggle falha', async () => {
    mockApiFetch.mockResolvedValueOnce(mockResponse('erro', { status: 500 }))
    await expect(ideaService.toggleFavorite('idea-2', true)).rejects.toThrow('erro')
  })

  it('retorna a lista de favoritos', async () => {
    const payload: Idea[] = [
      {
        id: 'idea-1',
        theme: 'Tecnologia',
        context: 'Apps',
        content: 'Assistente IA',
        timestamp: '2025-11-10T20:18:52.915Z' as unknown as Date,
        isFavorite: true,
      },
    ]
    mockApiFetch.mockResolvedValueOnce(mockResponse(payload))

    const result = await ideaService.getFavorites()
    expect(mockApiFetch).toHaveBeenCalledWith('/api/ideas/favorites')
    expect(result).toEqual(payload)
  })

  it('lan�a erro quando getFavorites recebe status != 200', async () => {
    mockApiFetch.mockResolvedValueOnce(mockResponse(null, { status: 500 }))
    await expect(ideaService.getFavorites()).rejects.toThrow('Erro ao buscar favoritos')
  })
})

