import { describe, it, expect, vi, beforeEach } from 'vitest'
import { themeService, type Theme } from '../themeService'
import { apiFetch } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

const mockApiFetch = vi.mocked(apiFetch)
const mockResponse = (body: any, init: ResponseInit = { status: 200 }) =>
  new Response(body !== null ? JSON.stringify(body) : null, {
    headers: body !== null ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  })

describe('themeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll retorna a lista de temas', async () => {
    const payload: Theme[] = [{ id: 1, name: 'Tecnologia' }]
    mockApiFetch.mockResolvedValueOnce(mockResponse(payload))

    const result = await themeService.getAll()

    expect(mockApiFetch).toHaveBeenCalledWith('/api/themes', { method: 'GET' })
    expect(result).toEqual(payload)
  })

  it('getAll lança erro quando API falha', async () => {
    mockApiFetch.mockResolvedValueOnce(mockResponse(null, { status: 500 }))
    await expect(themeService.getAll()).rejects.toThrow('Erro ao buscar temas')
  })

  it('create envia POST com body', async () => {
    const payload = { id: 2, name: 'Saúde' }
    mockApiFetch.mockResolvedValueOnce(mockResponse(payload))

    const result = await themeService.create({ name: 'Saúde' })

    expect(mockApiFetch).toHaveBeenCalledWith('/api/themes', {
      method: 'POST',
      body: JSON.stringify({ name: 'Saúde' }),
    })
    expect(result).toEqual(payload)
  })

  it('update envia PUT com body', async () => {
    const payload = { id: 3, name: 'Viagem' }
    mockApiFetch.mockResolvedValueOnce(mockResponse(payload))

    const result = await themeService.update(3, { name: 'Viagem' })

    expect(mockApiFetch).toHaveBeenCalledWith('/api/themes/3', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Viagem' }),
    })
    expect(result).toEqual(payload)
  })

  it('delete chama endpoint com DELETE', async () => {
    mockApiFetch.mockResolvedValueOnce(mockResponse(null, { status: 200 }))

    await themeService.delete(7)

    expect(mockApiFetch).toHaveBeenCalledWith('/api/themes/7', { method: 'DELETE' })
  })

  it('getById retorna um único registro', async () => {
    const payload = { id: 9, name: 'Negócio' }
    mockApiFetch.mockResolvedValueOnce(mockResponse(payload))

    const result = await themeService.getById(9)

    expect(mockApiFetch).toHaveBeenCalledWith('/api/themes/9', { method: 'GET' })
    expect(result).toEqual(payload)
  })
})

