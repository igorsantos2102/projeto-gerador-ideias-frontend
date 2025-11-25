import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'
import { renderWithProviders } from '@/test/test-utils'

const mockUseIdeas = vi.fn()
vi.mock('@/hooks/useIdeas', () => ({
  useIdeas: (filters: unknown) => mockUseIdeas(filters),
}))

const getFavoritesMock = vi.fn().mockResolvedValue([])
vi.mock('@/services/ideaService', () => ({
  ideaService: {
    getFavorites: (...args: unknown[]) => getFavoritesMock(...args),
    toggleFavorite: vi.fn(),
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
  return renderWithProviders(<HistoryPage />)
}

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseIdeas.mockReset()
    getFavoritesMock.mockReset()
    getFavoritesMock.mockResolvedValue([])
  })

  it('mostra estado de carregamento', async () => {
    mockUseIdeas.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() })
    await renderHistoryPage()
    expect(screen.getByText(/Carregando ideias/i)).toBeInTheDocument()
  })

  it('renderiza mensagem vazia', async () => {
    mockUseIdeas.mockReturnValue({ data: [], loading: false, error: null, refetch: vi.fn() })
    await renderHistoryPage()
    await waitFor(() => expect(getFavoritesMock).toHaveBeenCalledTimes(1))
    expect(screen.getByText(/Nenhuma ideia encontrada/i)).toBeInTheDocument()
  })

  it('renderiza cards e navega na paginacao', async () => {
    const user = userEvent.setup()
    const ideas = Array.from({ length: 7 }, (_, idx) => makeIdea(String(idx + 1)))
    mockUseIdeas.mockReturnValue({ data: ideas, loading: false, error: null, refetch: vi.fn() })

    await renderHistoryPage()
    await screen.findByTestId('history-card-1')
    expect(screen.getByTestId('history-card-6')).toBeInTheDocument()

    const firstCallProps = CommunityIdeaCardMock.mock.calls[0][0]
    expect(typeof firstCallProps.onToggleFavorite).toBe('function')

    await user.click(screen.getByRole('button', { name: /proxima pagina/i }))
    await screen.findByTestId('history-card-7')
    expect(screen.queryByTestId('history-card-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('history-card-6')).not.toBeInTheDocument()
    expect(screen.getByTestId('history-card-7')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('marca o card como favorito via handler', async () => {
    const idea = makeIdea('fav-1')
    mockUseIdeas.mockReturnValue({ data: [idea], loading: false, error: null, refetch: vi.fn() })

    await renderHistoryPage()
    await screen.findByTestId('history-card-fav-1')
    expect(screen.getByTestId('favorite-flag-fav-1')).toHaveTextContent('false')

    const toggleHandler = CommunityIdeaCardMock.mock.calls.at(-1)?.[0].onToggleFavorite
    expect(typeof toggleHandler).toBe('function')

    await act(async () => {
      toggleHandler?.('fav-1')
    })

    await waitFor(() => {
      expect(screen.getByTestId('favorite-flag-fav-1')).toHaveTextContent('true')
    })
  })
})
