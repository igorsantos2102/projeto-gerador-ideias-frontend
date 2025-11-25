import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'

const NavbarMock = vi.fn()
const LandingFooterMock = vi.fn()

vi.mock('@/components/Navbar/Navbar', () => ({
  Navbar: (props: any) => {
    NavbarMock(props)
    return <div data-testid="navbar" />
  },
}))

vi.mock('@/components/Footer/LandingFooter', () => ({
  LandingFooter: (props: any) => {
    LandingFooterMock(props)
    return <div data-testid="landing-footer" />
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

import { LandingPage } from '../LandingPage'

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza navbar, hero e footer', () => {
    renderWithProviders(<LandingPage />)
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByText(/Transforme palavras/i)).toBeInTheDocument()
    expect(screen.getByTestId('landing-footer')).toBeInTheDocument()
  })

  it('aciona navegação ao enviar email válido', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LandingPage />)
    await user.type(screen.getByPlaceholderText(/digite seu email/i), 'user@exemplo.com')
    await user.click(screen.getByRole('button', { name: /Começar Agora/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/register?email=user%40exemplo.com')
  })
})
