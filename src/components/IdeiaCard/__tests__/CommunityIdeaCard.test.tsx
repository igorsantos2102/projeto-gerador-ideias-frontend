import { describe, expect, it, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { screen } from '@testing-library/react'
import CommunityIdeaCard from '../CommunityIdeaCard'
import { useTheme } from '@/hooks/useTheme'
import type { CommunityIdea } from '../CommunityIdeaCard'

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

const useThemeMock = vi.mocked(useTheme)

const baseIdea: CommunityIdea = {
  id: 'idea-1',
  theme: 'Inovação',
  context: 'Tecnologia',
  content: 'Ideia teste',
  timestamp: new Date('2025-01-02T12:00:00Z'),
  isFavorite: false,
  responseTime: 250,
  author: 'Usuário',
}

describe('CommunityIdeaCard', () => {
  beforeEach(() => {
    useThemeMock.mockReturnValue({ darkMode: false, toggleDarkMode: vi.fn() })
  })

  it('mostra informações principais, pills e chama o toggle', async () => {
    const toggle = vi.fn()

    renderWithProviders(<CommunityIdeaCard idea={baseIdea} onToggleFavorite={toggle} />)

    expect(screen.getByText('Inovação')).toBeInTheDocument()
    expect(screen.getByText('Tecnologia')).toBeInTheDocument()
    expect(screen.getByText('Ideia teste')).toBeInTheDocument()
    expect(screen.getByText(/Tempo:/i)).toBeInTheDocument()
    expect(screen.getByText(/250ms/i)).toBeInTheDocument()
    expect(screen.getByText('Usuário')).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /favoritar/i })
    await userEvent.click(button)
    expect(toggle).toHaveBeenCalledWith('idea-1')
  })

  it('mostra labels fallback quando valores não existem e responde ao delete', async () => {
    useThemeMock.mockReturnValue({ darkMode: true, toggleDarkMode: vi.fn() })

    const idea: CommunityIdea = {
      ...baseIdea,
      isFavorite: true,
      responseTime: undefined,
      tokens: undefined,
      author: '',
      theme: '',
    }
    const toggle = vi.fn()
    renderWithProviders(<CommunityIdeaCard idea={idea} onToggleFavorite={toggle} />)

    expect(screen.getByText(/Participante desconhecido/i)).toBeInTheDocument()
    expect(screen.getAllByText('--').length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: /desfavoritar/i }))
    expect(toggle).toHaveBeenCalledTimes(1)
  })
})
