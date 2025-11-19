import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { LandingFooter } from '../LandingFooter'

vi.mock('@/assets/githubMark/github-mark.png', () => ({ default: 'mock.png' }))

vi.mock('../AppFooter', () => ({
  AppFooter: () => <div data-testid="app-footer">footer</div>,
}))

describe('LandingFooter', () => {
  it('exibe blocos de conteúdo e links para repositórios', () => {
    renderWithProviders(<LandingFooter />)

    expect(screen.getByText(/Criaitor/i)).toBeInTheDocument()
    expect(screen.getByText(/Funcionalidades/i)).toBeInTheDocument()
    expect(screen.getByText(/Recursos do projeto/i)).toBeInTheDocument()

    const frontendLink = screen.getByRole('link', { name: /frontend/i })
    expect(frontendLink).toHaveAttribute('href', 'https://github.com/SEU-USUARIO/seu-frontend')

    const backendLink = screen.getByRole('link', { name: /backend/i })
    expect(backendLink).toHaveAttribute('href', 'https://github.com/SEU-USUARIO/seu-backend')

    expect(screen.getByTestId('app-footer')).toBeInTheDocument()
  })
})
