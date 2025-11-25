import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { LoginPage } from '../LoginPage'

const NavbarMock = vi.fn()
const LoginHeaderMock = vi.fn(() => <div data-testid="login-header" />)
const LoginFormMock = vi.fn(() => <div data-testid="login-form" />)
const LoginFooterMock = vi.fn(() => <div data-testid="login-footer" />)
const AppFooterMock = vi.fn()

vi.mock('@/components/Navbar/Navbar', () => ({
  Navbar: (props: any) => {
    NavbarMock(props)
    return <div data-testid="navbar" />
  },
}))

vi.mock('@/components/Login/LoginHeader', () => ({
  LoginHeader: () => {
    LoginHeaderMock()
    return <div data-testid="login-header" />
  },
}))

vi.mock('@/components/Login/LoginForm', () => ({
  LoginForm: () => {
    LoginFormMock()
    return <div data-testid="login-form" />
  },
}))

vi.mock('@/components/Login/LoginFooter', () => ({
  LoginFooter: () => {
    LoginFooterMock()
    return <div data-testid="login-footer" />
  },
}))

vi.mock('@/components/Footer/AppFooter', () => ({
  AppFooter: (props: any) => {
    AppFooterMock(props)
    return <div data-testid="app-footer" />
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza layout com Navbar e blocos do login', () => {
    renderWithProviders(<LoginPage />)

    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('login-header')).toBeInTheDocument()
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByTestId('login-footer')).toBeInTheDocument()
    expect(screen.getByTestId('app-footer')).toBeInTheDocument()

    expect(NavbarMock).toHaveBeenCalledWith(expect.objectContaining({ hideActions: true }))
    expect(AppFooterMock).toHaveBeenCalledWith(expect.objectContaining({ forceLightMode: true }))
  })
})
