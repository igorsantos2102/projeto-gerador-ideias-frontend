import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FavoriteCard from '../FavoriteCard'
import type { BaseIdeaCardProps } from '../BaseIdeiaCard'
import { renderWithProviders } from '@/test/test-utils'

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('@/components/SectionContainer/SectionContainer', () => ({
  default: ({ children, className, onClick }: any) => (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  ),
}))

const mockIdea: BaseIdeaCardProps['idea'] = {
  id: '1',
  theme: 'Inovação',
  context: 'Tecnologia',
  content: 'Uma ideia incrível para o futuro da IA',
  timestamp: new Date('2025-11-10T00:00:00Z'),
  isFavorite: false,
  responseTime: 123,
}
const favoritedIdea: BaseIdeaCardProps['idea'] = {
  ...mockIdea,
  id: 'fav-1',
  isFavorite: true,
}

describe('FavoriteCard', () => {
  it('renderiza corretamente as informações do card', () => {
    renderWithProviders(<FavoriteCard idea={mockIdea} onToggleFavorite={() => {}} />)

    expect(screen.getByText(/inovação/i)).toBeInTheDocument()
    expect(screen.getByText(/uma ideia incrível/i)).toBeInTheDocument()
  })

  it('chama o callback ao clicar em desfavoritar', async () => {
    const user = userEvent.setup()
    const onToggleFavorite = vi.fn()

    renderWithProviders(<FavoriteCard idea={favoritedIdea} onToggleFavorite={onToggleFavorite} />)

    const button = screen.getByRole('button', { name: /desfavoritar/i })

    await user.click(button)

    await waitFor(() => {
      expect(onToggleFavorite).toHaveBeenCalledWith(favoritedIdea.id)
      expect(onToggleFavorite).toHaveBeenCalledTimes(1)
    })
  })

  it('mostra o ícone de carregamento enquanto está processando', async () => {
    const user = userEvent.setup()
    const onToggleFavorite = vi.fn(() => new Promise<void>((res) => setTimeout(res, 200)))

    renderWithProviders(<FavoriteCard idea={favoritedIdea} onToggleFavorite={onToggleFavorite} />)
    const button = screen.getByRole('button', { name: /desfavoritar/i })

    await user.click(button)

    expect(screen.getByRole('button', { name: /desfavoritar/i })).toBeDisabled()
  })
})
