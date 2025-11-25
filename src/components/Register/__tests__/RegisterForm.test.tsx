import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { RegisterForm } from '../RegisterForm'
import { authService } from '@/services/authService'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/services/authService', () => ({
  authService: {
    register: vi.fn(),
  },
}))

const registerMock = vi.mocked(authService.register)

async function fillForm(email: string) {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText(/Seu nome/i), 'Usuário Teste')
  await user.clear(screen.getByPlaceholderText(/Seu email/i))
  await user.type(screen.getByPlaceholderText(/Seu email/i), email)
  await user.type(screen.getByLabelText(/^Senha$/i), 'Senha@123')
  await user.type(screen.getByLabelText(/Confirmar Senha/i), 'Senha@123')
  return user
}

describe('RegisterForm', () => {
  beforeEach(() => {
    registerMock.mockReset()
    mockNavigate.mockReset()
  })

  it('pré-preenche o email vindo da URL', () => {
    renderWithProviders(<RegisterForm />, { route: '/register?email=user@exemplo.com' })
    expect(screen.getByPlaceholderText(/Seu email/i)).toHaveValue('user@exemplo.com')
  })

  it('mostra erro quando a senha não atende critérios', async () => {
    renderWithProviders(<RegisterForm />)
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText(/Seu nome/i), 'Pessoa')
    await user.type(screen.getByPlaceholderText(/Seu email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/^Senha$/i), '12345678')
    await user.type(screen.getByLabelText(/Confirmar Senha/i), '12345678')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(
      screen.getByText(/A senha deve ter no mínimo 8 caracteres/i)
    ).toBeInTheDocument()
  })

  it('submete com sucesso e redireciona para o login', async () => {
    registerMock.mockResolvedValueOnce({
      id: 'user-1',
      accessToken: 'access-123',
      refreshToken: 'refresh-abc',
      uuid: 'user-1',
      name: 'User Teste',
      email: 'user@example.com',
    } as any)
    renderWithProviders(<RegisterForm />)

    const user = await fillForm('user@example.com')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(registerMock).toHaveBeenCalledWith(
      'Usuário Teste',
      'user@example.com',
      'Senha@123',
      'Senha@123'
    )
    expect(mockNavigate).toHaveBeenCalledWith('/generator', { replace: true })
  })

  it('exibe mensagem amigável quando backend retorna conflito', async () => {
    registerMock.mockRejectedValueOnce({ response: { status: 409 } })
    renderWithProviders(<RegisterForm />)

    const user = await fillForm('user@example.com')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(screen.getByText(/Este e-mail já está em uso/i)).toBeInTheDocument()
  })
})
