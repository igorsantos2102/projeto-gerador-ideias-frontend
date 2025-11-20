import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'
import { renderWithProviders } from '@/test/test-utils'
import { resetFavoritesCache } from '../favoritesCache'

const getFavoritesMock = vi.fn().mockResolvedValue([])
const getCommunityIdeasMock = vi.fn().mockResolvedValue({
  content: [],
  totalElements: 0,
  totalPages: 1,
  size: 6,
  number: 0,
})
const toggleFavoriteMock = vi.fn()
vi.mock('@/services/ideaService', () => ({
  ideaService: {
    getFavorites: (...args: unknown[]) => getFavoritesMock(...args),
    getCommunityIdeas: (...args: unknown[]) => getCommunityIdeasMock(...args),
    toggleFavorite: (...args: unknown[]) => toggleFavoriteMock(...args),
  },
}))

const CommunityIdeaCardMock = vi.fn((props: {
  idea: Idea
  onToggleFavorite?: (id: string) => void
}) => (
  <div data-testid={`history-card-${props.idea.id}`}>
    <p>{props.idea.content}</p>
    <span data-testid={`favorite-flag-${props.idea.id}`}>{String(props.idea.isFavorite)}</span>
    <button aria-label={`Favoritar ${props.idea.id}`} onClick={() => props.onToggleFavorite?.(props.idea.id)}>
      Favoritar
    </button>
  </div>
))

vi.mock('@/components/IdeiaCard/CommunityIdeaCard', () => ({
  default: (props: any) => CommunityIdeaCardMock(props),
}))

const makeIdea = (id: string): Idea => ({
  id,
  theme: 'Tecnologia',
  context: 'Teste',
  content: `Ideia ${id}`,
  timestamp: new Date('2025-01-01T10:00:00Z'),
  isFavorite: false,
})

async function renderHistoryPage() {
  const module = await import('../History')
  const HistoryPage = module.default
  let rendered

  await act(async () => {
    rendered = renderWithProviders(<HistoryPage />)
  })

  return rendered!
}

describe('HistoryPage', () => {
  beforeEach(() => {
    resetFavoritesCache()
    vi.clearAllMocks()
    getFavoritesMock.mockReset()
    getCommunityIdeasMock.mockReset()
    getFavoritesMock.mockResolvedValue([])
    getCommunityIdeasMock.mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 1,
      size: 6,
      number: 0,
    })
  })

  it('mostra estado de carregamento', async () => {
    let resolveFetch!: (value: {
      content: Idea[]
      totalElements: number
      totalPages: number
      size: number
      number: number
    }) => void

    const loadingPromise = new Promise<{
      content: Idea[]
      totalElements: number
      totalPages: number
      size: number
      number: number
    }>((resolve) => {
      resolveFetch = resolve
    })

    getCommunityIdeasMock.mockReturnValueOnce(loadingPromise)

    await renderHistoryPage()

    expect(screen.getByText(/Carregando\.\.\./i)).toBeInTheDocument()

    await act(async () => {
      resolveFetch({
        content: [],
        totalElements: 0,
        totalPages: 1,
        size: 6,
        number: 0,
      })
      await loadingPromise
    })

    await waitFor(() => expect(screen.getByText(/Nenhuma ideia encontrada/i)).toBeInTheDocument())
  })

  it('renderiza mensagem vazia', async () => {
    getCommunityIdeasMock.mockResolvedValueOnce({
      content: [],
      totalElements: 0,
      totalPages: 1,
      size: 6,
      number: 0,
    })

    await renderHistoryPage()

    await waitFor(() => expect(screen.getByText(/Nenhuma ideia encontrada/i)).toBeInTheDocument())
    expect(getFavoritesMock).toHaveBeenCalled()
  })

  it('renderiza cards e navega na paginacao', async () => {
    const user = userEvent.setup()
    const ideas = Array.from({ length: 7 }, (_, idx) => makeIdea(String(idx + 1)))

    getCommunityIdeasMock.mockResolvedValueOnce({
      content: ideas,
      totalElements: ideas.length,
      totalPages: 2,
      size: 6,
      number: 0,
    })

    const pageTwoIdea = makeIdea('7')
    getCommunityIdeasMock.mockResolvedValueOnce({
      content: [pageTwoIdea],
      totalElements: ideas.length,
      totalPages: 2,
      size: 6,
      number: 1,
    })

    await renderHistoryPage()
    await screen.findByTestId('history-card-1')
    expect(screen.getByTestId('history-card-6')).toBeInTheDocument()

    const firstCallProps = CommunityIdeaCardMock.mock.calls[0][0]
    expect(typeof firstCallProps.onToggleFavorite).toBe('function')

    const nextButton = screen.getByRole('button', { name: '›' })
    await user.click(nextButton)

    await screen.findByTestId('history-card-7')
    expect(screen.queryByTestId('history-card-1')).toBeNull()
    expect(screen.queryByTestId('history-card-6')).toBeNull()
    expect(screen.getByTestId('history-card-7')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('marca o card como favorito via handler', async () => {
    const idea = makeIdea('fav-1')

    getCommunityIdeasMock.mockResolvedValueOnce({
      content: [idea],
      totalElements: 1,
      totalPages: 1,
      size: 6,
      number: 0,
    })

    getCommunityIdeasMock.mockResolvedValueOnce({
      content: [{ ...idea, isFavorite: true }],
      totalElements: 1,
      totalPages: 1,
      size: 6,
      number: 0,
    })

    await renderHistoryPage()
    await screen.findByTestId('history-card-fav-1')
    expect(screen.getByTestId('favorite-flag-fav-1')).toHaveTextContent('false')

    const toggleHandler = CommunityIdeaCardMock.mock.calls.at(-1)?.[0].onToggleFavorite
    expect(typeof toggleHandler).toBe('function')

    await act(async () => {
      toggleHandler?.('fav-1')
    })

    await waitFor(() => expect(toggleFavoriteMock).toHaveBeenCalledWith('fav-1', true))
    await waitFor(() => expect(getCommunityIdeasMock).toHaveBeenCalledTimes(2))
  })
})
