import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Brand } from '../Brand'

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

import { useTheme } from '@/hooks/useTheme'
const useThemeMock = vi.mocked(useTheme)

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('@/assets/CriaitorAssets/LOGO FUNDO BRANCO - SEM FUNDO.png', () => ({ default: 'light.png' }))
vi.mock('@/assets/CriaitorAssets/LOGO FUNDO PRETO - SEM FUNDO.png', () => ({ default: 'dark.png' }))

describe('Brand', () => {
  beforeEach(() => {
    useThemeMock.mockReturnValue({ darkMode: false, toggleDarkMode: vi.fn() })
    navigateMock.mockReset()
  })

  it('exibe o logo claro e navega no clique padrão', async () => {
    render(<Brand />)
    const button = screen.getByRole('button', { name: /voltar para a página inicial/i })
    const img = screen.getByRole('img', { name: /logo do criaitor/i })

    expect(img).toHaveAttribute('src', 'light.png')
    await userEvent.click(button)
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('usa o logo escuro quando darkMode=true e chama onClick personalizado', async () => {
    useThemeMock.mockReturnValue({ darkMode: true, toggleDarkMode: vi.fn() })
    const handler = vi.fn()
    render(<Brand onClick={handler} />)
    const button = screen.getByRole('button', { name: /voltar para a página inicial/i })
    const img = screen.getByRole('img', { name: /logo do criaitor/i })

    expect(img).toHaveAttribute('src', 'dark.png')
    await userEvent.click(button)
    expect(handler).toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
