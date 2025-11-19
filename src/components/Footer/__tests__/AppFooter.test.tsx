import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { screen } from '@testing-library/react'
import { AppFooter } from '../AppFooter'
import { useTheme } from '@/hooks/useTheme'

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

const useThemeMock = vi.mocked(useTheme)

describe('AppFooter', () => {
  it('usa classes escuras conforme o tema atual', () => {
    useThemeMock.mockReturnValue({ darkMode: true, toggleDarkMode: vi.fn() })
    renderWithProviders(<AppFooter />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('bg-slate-950')
  })

  it('força modo claro quando `forceLightMode` esta ativo', () => {
    useThemeMock.mockReturnValue({ darkMode: true, toggleDarkMode: vi.fn() })
    renderWithProviders(<AppFooter forceLightMode />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('bg-background')
    expect(footer).not.toHaveClass('bg-slate-950')
  })
})
