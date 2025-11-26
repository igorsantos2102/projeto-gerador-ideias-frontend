import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'

const themeOptionsMock = vi.hoisted(() => ({
  loadThemeOptionsMock: vi.fn(),
}))

vi.mock('@/services/ideaService', () => ({
  ideaService: {
    getMyIdeas: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}))

vi.mock('@/components/FilterHistory', () => ({
  __esModule: true,
  default: ({ categories, onChange }: any) => (
    <div>
      <div data-testid="categories-count">{categories.length}</div>
      <button data-testid="change-filter" onClick={() => onChange({ category: 'new' })}>
        Change
      </button>
    </div>
  ),
}))

vi.mock('@/components/IdeiaCard/MyIdeaCard', () => ({
  __esModule: true,
  default: ({ idea, onToggleFavorite, onDelete }: any) => (
    <div>
      <p>{idea.content}</p>
      <span data-testid={`fav-${idea.id}`}>{idea.isFavorite ? 'fav' : 'not'}</span>
      <button data-testid={`toggle-${idea.id}`} onClick={() => onToggleFavorite?.(idea.id)}>
        Toggle
      </button>
      <button data-testid={`delete-${idea.id}`} onClick={() => onDelete?.(idea.id)}>
        Delete
      </button>
    </div>
  ),
}))

vi.mock('@/lib/themeOptions', () => ({
  FALLBACK_THEME_OPTIONS: [{ label: 'Fallback', value: 'fallback' }],
  loadThemeOptions: themeOptionsMock.loadThemeOptionsMock,
}))

import MyIdeasPage from '../MyIdeasPage'
import { ideaService } from '@/services/ideaService'

const ideaServiceMock = vi.mocked(ideaService)

const buildIdea = (index: number) => ({
  id: `idea-${index}`,
  content: `Idea ${index}`,
  theme: 'Teste',
  context: 'Contexto',
  timestamp: new Date(),
  isFavorite: false,
  responseTime: 100 + index,
})

const pageData = (page: number) => ({
  content: Array.from({ length: 5 }, (_, idx) => buildIdea(page * 5 + idx + 1)),
  totalPages: 2,
  totalElements: 10,
  size: 5,
  number: page,
})

describe('MyIdeasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ideaServiceMock.toggleFavorite.mockResolvedValue(undefined)
    themeOptionsMock.loadThemeOptionsMock.mockResolvedValue([
      { label: 'Tech', value: 'tech' },
      { label: 'Data', value: 'data' },
    ])
  })

  it('mostra carregamento e depois lista de ideias com paginação', async () => {
    ideaServiceMock.getMyIdeas
      .mockResolvedValueOnce(pageData(0))
      .mockResolvedValueOnce(pageData(1))

    renderWithProviders(<MyIdeasPage />)
    expect(screen.getByText(/Carregando ideias/i)).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('Idea 1')).toBeInTheDocument())
    expect(screen.getByText('Idea 5')).toBeInTheDocument()
    expect(screen.getByLabelText('Próxima')).toBeEnabled()

    const nextPage = screen.getByLabelText('Próxima')
    await userEvent.click(nextPage)

    await waitFor(() =>
      expect(ideaServiceMock.getMyIdeas).toHaveBeenLastCalledWith(1, 5, {
        category: '',
        startDate: '',
        endDate: '',
      })
    )
    expect(screen.getByText('Idea 7')).toBeInTheDocument()
  })

  it('marca como favorito e reverte se API falha', async () => {
    ideaServiceMock.getMyIdeas.mockResolvedValueOnce(pageData(0))
    ideaServiceMock.toggleFavorite.mockImplementationOnce(async () => {
      throw new Error('fail')
    })

    renderWithProviders(<MyIdeasPage />)
    await waitFor(() => expect(screen.getByText('Idea 1')).toBeInTheDocument())

    const toggle = screen.getByTestId('toggle-idea-1')
    await userEvent.click(toggle)

    await waitFor(() => expect(ideaServiceMock.toggleFavorite).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByTestId('fav-idea-1').textContent).toBe('not'))
  })

  it('carrega temas e atualiza lista de categorias', async () => {
    ideaServiceMock.getMyIdeas.mockResolvedValueOnce(pageData(0))
    renderWithProviders(<MyIdeasPage />)

    await waitFor(() => expect(themeOptionsMock.loadThemeOptionsMock).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByTestId('categories-count').textContent).toBe('2'))
  })

  it('remove ideia via botão', async () => {
    ideaServiceMock.getMyIdeas.mockResolvedValueOnce(pageData(0))

    renderWithProviders(<MyIdeasPage />)
    await waitFor(() => expect(screen.getByText('Idea 1')).toBeInTheDocument())

    const deleteButton = screen.getByTestId('delete-idea-1')
    await userEvent.click(deleteButton)
    await waitFor(() => expect(screen.queryByText('Idea 1')).toBeNull())
  })

  it('exibe estado vazio quando a requisição falha', async () => {
    ideaServiceMock.getMyIdeas.mockRejectedValueOnce(new Error('sem sorte'))

    renderWithProviders(<MyIdeasPage />)
    await waitFor(() => expect(screen.getByText(/Nenhuma ideia encontrada/i)).toBeInTheDocument())
    expect(screen.queryByText(/Carregando ideias/i)).not.toBeInTheDocument()
  })
})
