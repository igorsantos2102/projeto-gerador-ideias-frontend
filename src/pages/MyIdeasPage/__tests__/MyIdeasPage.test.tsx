import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'

vi.mock('@/services/ideaService', () => ({
  ideaService: {
    getMyIdeas: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}))

vi.mock('@/components/IdeiaCard/MyIdeaCard', () => ({
  __esModule: true,
  default: ({ idea, onToggleFavorite, onDelete }: any) => (
    <div>
      <p>{idea.content}</p>
      <button data-testid={`toggle-${idea.id}`} onClick={() => onToggleFavorite?.(idea.id)}>
        Toggle
      </button>
      <button data-testid={`delete-${idea.id}`} onClick={() => onDelete?.(idea.id)}>
        Delete
      </button>
    </div>
  ),
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

    await waitFor(() => expect(ideaServiceMock.getMyIdeas).toHaveBeenLastCalledWith(1, 5))
    expect(screen.getByText('Idea 7')).toBeInTheDocument()
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
