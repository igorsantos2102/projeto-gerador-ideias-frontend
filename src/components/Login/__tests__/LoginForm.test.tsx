import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { LoginForm } from '../LoginForm'
import { renderWithProviders } from '@/test/test-utils'
import { authService } from '@/services/authService'
import { setAuthTokens } from '@/lib/api'
import { prefetchIdeas } from '@/hooks/useIdeas'

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
    login: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  setAuthTokens: vi.fn(),
}))

vi.mock('@/hooks/useIdeas', () => ({
  prefetchIdeas: vi.fn().mockResolvedValue(undefined),
}))

const loginMock = vi.mocked(authService.login)

describe('LoginForm', () => {
  let storageSpy: ReturnType<typeof vi.spyOn>
  const prefetchIdeasMock = vi.mocked(prefetchIdeas)

  beforeEach(() => {
    mockNavigate.mockReset()
    loginMock.mockReset()
    prefetchIdeasMock.mockClear()
    storageSpy = vi.spyOn(Storage.prototype, 'setItem')
  })

  afterEach(() => {
    storageSpy.mockRestore()
  })

  it('realiza login com sucesso e salva token', async () => {
    loginMock.mockResolvedValue({
      accessToken: 'access-123',
      refreshToken: 'refresh-abc',
      uuid: 'user-uuid',
      name: 'Tester',
      email: 'user@example.com',
    })
    renderWithProviders(<LoginForm />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'Senha@123')

    await user.click(screen.getByRole('button', { name: /fazer login/i }))

    expect(loginMock).toHaveBeenCalledWith('user@example.com', 'Senha@123')
    expect(setAuthTokens).toHaveBeenCalledWith('access-123', 'refresh-abc')
    expect(storageSpy).toHaveBeenCalledWith(
      'user',
      JSON.stringify({ uuid: 'user-uuid', name: 'Tester', email: 'user@example.com' })
    )
    expect(prefetchIdeasMock).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/generator')
  })

  it('exibe alerta quando o login falha', async () => {
    loginMock.mockRejectedValue(new Error('invalid'))

    renderWithProviders(<LoginForm />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'senha')

    await user.click(screen.getByRole('button', { name: /fazer login/i }))

    expect(await screen.findByText(/falha ao fazer login/i)).toBeInTheDocument()
    
    // Aguarda um pouco para garantir que o navigate não foi chamado
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(mockNavigate).toHaveBeenCalledTimes(0)
  })
})
