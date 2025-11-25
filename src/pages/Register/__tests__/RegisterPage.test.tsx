import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { RegisterPage } from '../Register'

const NavbarMock = vi.fn()
const RegisterFormMock = vi.fn(() => <div data-testid="register-form" />)
const AppFooterMock = vi.fn()

vi.mock('@/components/Navbar/Navbar', () => ({
  Navbar: (props: any) => {
    NavbarMock(props)
    return <div data-testid="navbar" />
  },
}))

vi.mock('@/components/Register/RegisterForm', () => ({
  RegisterForm: () => {
    RegisterFormMock()
    return <div data-testid="register-form" />
  },
}))

vi.mock('@/components/Footer/AppFooter', () => ({
  AppFooter: (props: any) => {
    AppFooterMock(props)
    return <div data-testid="app-footer" />
  },
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza Navbar, formulário e footer', () => {
    renderWithProviders(<RegisterPage />)

    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
    expect(screen.getByTestId('app-footer')).toBeInTheDocument()

    expect(NavbarMock).toHaveBeenCalledWith(expect.objectContaining({ hideActions: true }))
    expect(AppFooterMock).toHaveBeenCalledWith(expect.objectContaining({ forceLightMode: true }))
  })
})
