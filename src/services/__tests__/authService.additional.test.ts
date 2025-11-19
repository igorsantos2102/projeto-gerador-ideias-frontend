import { describe, expect, it, vi, beforeEach } from 'vitest'
import { authService } from '../authService'
import axios from 'axios'

vi.mock('axios')

const axiosPostMock = vi.mocked(axios.post)

beforeEach(() => {
  vi.resetAllMocks()
})

describe('authService additional coverage', () => {
  it('register envia dados e retorna resposta', async () => {
    axiosPostMock.mockResolvedValueOnce({ data: { accessToken: 'a', refreshToken: 'r' } })
    const response = await authService.register('Usuário', 'user@example.com', 'Senha1!', 'Senha1!')
    expect(axiosPostMock).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
      name: 'Usuário',
      email: 'user@example.com',
    }))
    expect(response.accessToken).toBe('a')
  })

  it('login e refresh retornam dados', async () => {
    axiosPostMock.mockResolvedValueOnce({ data: { accessToken: 'a1', refreshToken: 'r1' } })
    await authService.login('u', 'p')
    expect(axiosPostMock).toHaveBeenCalledWith('/api/auth/login', { email: 'u', password: 'p' })

    axiosPostMock.mockResolvedValueOnce({ data: { accessToken: 'a2', refreshToken: 'r2' } })
    await authService.refreshToken('refresh1')
    expect(axiosPostMock).toHaveBeenCalledWith('/api/auth/refresh', { refreshToken: 'refresh1' })
  })

  it('logout adiciona header e ignora erro', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    axiosPostMock.mockResolvedValueOnce({ data: {} })
    await authService.logout('refresh')
    expect(axiosPostMock).toHaveBeenCalledWith(
      '/api/auth/logout',
      { refreshToken: 'refresh' },
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.stringContaining('Bearer') }),
      })
    )

    axiosPostMock.mockRejectedValueOnce(new Error('bad'))
    await authService.logout()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
