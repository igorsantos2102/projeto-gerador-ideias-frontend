import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { screen } from '@testing-library/react'
import { AppHeader } from '../AppHeader'
import { useLogout } from '@/lib/auth'
import { useTheme } from '@/hooks/useTheme'

vi.mock('../Brand', () => ({
  __esModule: true,
  default: () => <div data-testid="brand">Brand</div>,
}))

vi.mock('../UserMenu', () => ({
  __esModule: true,
  default: ({ userName, nav }: any) => (
    <div data-testid="user-menu">
      {userName}
      <span data-testid="nav-length">{nav?.length ?? 0}</span>
    </div>
  ),
}))

vi.mock('@/lib/auth', () => ({
  useLogout: vi.fn(),
}))

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

const logoutMock = vi.fn()
const useLogoutMock = vi.mocked(useLogout)
const useThemeMock = vi.mocked(useTheme)

beforeEach(() => {
  vi.clearAllMocks()
  useThemeMock.mockReturnValue({ darkMode: false, toggleDarkMode: vi.fn() })
  useLogoutMock.mockReturnValue(logoutMock)
  localStorage.setItem('user', JSON.stringify({ name: 'Tester' }))
})

describe('AppHeader', () => {
  it('renderiza navegação primária e passa logout/nav para UserMenu', () => {
    const customNav = [
      { to: '/generator', label: 'Início' },
      { to: '/community', label: 'Comunidade' },
      { to: '/favorites', label: 'Favoritos' },
    ]
    renderWithProviders(<AppHeader nav={customNav} className="extra" />)

    expect(screen.getByTestId('brand')).toBeInTheDocument()
    expect(screen.getByText(/Início/i)).toBeInTheDocument()
    expect(screen.getByText(/Comunidade/i)).toBeInTheDocument()
    expect(screen.getByTestId('user-menu')).toHaveTextContent('Tester')
    expect(screen.getByTestId('nav-length')).toHaveTextContent('3')
  })

  it('aplica classes de tema escuro quando necessário', () => {
    useThemeMock.mockReturnValue({ darkMode: true, toggleDarkMode: vi.fn() })
    renderWithProviders(<AppHeader />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-slate-900/95')
  })
})
