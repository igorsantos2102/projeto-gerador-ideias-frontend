import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '../UserMenu'
import { useTheme } from '@/hooks/useTheme'

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

const useThemeMock = vi.mocked(useTheme)

describe('UserMenu', () => {
  const toggleDarkMode = vi.fn()
  beforeEach(() => {
    vi.clearAllMocks()
    useThemeMock.mockReturnValue({
      darkMode: false,
      toggleDarkMode,
    } as any)
  })

  it('abre menu, lista nav + dashboards e alterna tema', async () => {
    const nav = [
      { to: '/generator', label: 'Início' },
      { to: '/dashboard', label: 'Painel' },
    ]
    renderWithProviders(<UserMenu userName="Ana" nav={nav} />)

    await userEvent.click(screen.getByRole('button', { name: /Ana/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Painel')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('menuitem', { name: /Modo escuro/i }))
    expect(toggleDarkMode).toHaveBeenCalled()
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('fecha menu ao sair e chama logout/navegação', async () => {
    const logout = vi.fn()
    const { rerender } = renderWithProviders(
      <UserMenu userName="Ana" nav={[]} onLogout={logout} />
    )

    await userEvent.click(screen.getByRole('button', { name: /Ana/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Sair/i }))
    expect(logout).toHaveBeenCalled()
    expect(screen.queryByRole('menu')).toBeNull()

    // sem logout chama navigate
    navigateMock.mockClear()
    rerender(<UserMenu userName="Ana" nav={[]} />)
    await userEvent.click(screen.getByRole('button', { name: /Ana/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Sair/i }))
    expect(navigateMock).toHaveBeenCalledWith('/login')
  })
})
