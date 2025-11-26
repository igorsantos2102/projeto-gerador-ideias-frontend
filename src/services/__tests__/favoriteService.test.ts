import { describe, expect, it, vi, beforeEach } from 'vitest'
import { favoriteService } from '../favoriteService'
import { apiFetch } from '@/lib/api'
import * as ideaServiceModule from '@/services/ideaService'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    apiFetch: vi.fn(),
  }
})

// Mock completo do módulo ideaService para controlar todas as suas exportações
vi.mock('@/services/ideaService', () => ({
  ideaService: {
    toggleFavorite: vi.fn(),
  },
  // Simulamos a função para que ela retorne um objeto com uma data válida
  mapResponseToIdea: vi.fn((idea) => ({ ...idea, timestamp: new Date() })),
}))

const apiFetchMock = vi.mocked(apiFetch)
const ideaServiceMocks = vi.mocked(ideaServiceModule)

const makeResponse = (body: any, ok = true) =>
  ({
    ok,
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad',
    json: vi.fn(async () => body),
    text: vi.fn(async () => JSON.stringify(body)),
  } as unknown as Response)

beforeEach(() => {
  apiFetchMock.mockReset()
  ideaServiceMocks.ideaService.toggleFavorite.mockReset()
  ideaServiceMocks.mapResponseToIdea.mockClear()
})

describe('favoriteService', () => {
  it('retorna favoritos quando o endpoint responde corretamente', async () => {
    // Objeto de API mais realista, como esperado por mapResponseToIdea
    const mockApiIdea = {
      id: 'fav-1',
      theme: 'Teste',
      content: 'Conteúdo da ideia de teste',
      createdAt: new Date().toISOString(),
    }

    apiFetchMock.mockResolvedValueOnce(
      makeResponse({ content: [mockApiIdea] })
    )

    const result = await favoriteService.getFavorites(1, 5)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/ideas/favorites?page=1&size=5')
    expect(ideaServiceMocks.mapResponseToIdea).toHaveBeenCalledWith(mockApiIdea)
    expect(result).toHaveLength(1)
  })

  it('retorna array vazio após erro', async () => {
    apiFetchMock.mockRejectedValueOnce(new Error('falha'))
    const result = await favoriteService.getFavorites()
    expect(result).toEqual([])
  })

  it('remove favorito delegando ao ideaService', async () => {
    await favoriteService.removeFavorite('123')
    expect(ideaServiceMocks.ideaService.toggleFavorite).toHaveBeenCalledWith('123', false)
  })
})
