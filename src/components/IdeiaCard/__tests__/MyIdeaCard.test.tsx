import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyIdeaCard from '../MyIdeaCard'
import { useTheme } from '@/hooks/useTheme'

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

const useThemeMock = vi.mocked(useTheme)

const idea = {
  id: 'my-1',
  theme: 'Tech',
  context: 'Context',
  content: 'Conteúdo',
  timestamp: new Date(),
  isFavorite: false,
}

describe('MyIdeaCard', () => {
  beforeEach(() => {
    useThemeMock.mockReturnValue({ darkMode: false, toggleDarkMode: vi.fn() })
  })

  it('renderiza conteúdo e chama handlers', async () => {
    const toggle = vi.fn()
    const remove = vi.fn()
    renderWithProviders(
      <MyIdeaCard idea={idea} onToggleFavorite={toggle} onDelete={remove} />
    )

    expect(screen.getByText('Conteúdo')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText(/favoritar/i))
    expect(toggle).toHaveBeenCalledWith('my-1')

    await userEvent.click(screen.getByLabelText(/excluir/i))
    expect(remove).toHaveBeenCalledWith('my-1')
  })
})
