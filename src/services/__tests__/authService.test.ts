import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import axios from 'axios'
import { authService } from '../authService'

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

const mockedPost = axios.post as unknown as Mock

describe('authService', () => {
  beforeEach(() => {
    mockedPost.mockReset()
  })

  it('envia dados corretos ao registrar usuario', async () => {
    mockedPost.mockResolvedValue({ data: { id: 'user-1' } })

    const payload = {
      name: 'Joao',
      email: 'joao@example.com',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    }

    const data = await authService.register(
      payload.name,
      payload.email,
      payload.password,
      payload.confirmPassword,
    )

    expect(mockedPost).toHaveBeenCalledWith('/api/auth/register', payload)
    expect(data).toEqual({ id: 'user-1' })
  })

  it('envia dados corretos ao fazer login', async () => {
    mockedPost.mockResolvedValue({ data: { token: 'abc', user: { id: 1 } } })

    const data = await authService.login('user@example.com', 'Senha@123')

    expect(mockedPost).toHaveBeenCalledWith('/api/auth/login', {
      email: 'user@example.com',
      password: 'Senha@123',
    })
    expect(data).toEqual({ token: 'abc', user: { id: 1 } })
  })
})
