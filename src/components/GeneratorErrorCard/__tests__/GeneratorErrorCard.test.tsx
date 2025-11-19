import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GeneratorErrorCard } from '../GeneratorErrorCard'
import { useTheme } from '@/hooks/useTheme'

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))

vi.mock('@/components/SectionContainer/SectionContainer', () => ({
  __esModule: true,
  default: ({ children }: any) => <section>{children}</section>,
}))

const useThemeMock = vi.mocked(useTheme)

describe('GeneratorErrorCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza erro inapropriado em modo claro', () => {
    useThemeMock.mockReturnValue({ darkMode: false, toggleDarkMode: vi.fn() })
    render(<GeneratorErrorCard error="Teste" errorType="inappropriate" />)

    expect(screen.getByText(/Inapropriado/i)).toBeInTheDocument()
    expect(screen.getByText('Teste')).toBeInTheDocument()
    const pill = screen.getByText(/Inapropriado/i).closest('div')
    expect(pill).toHaveClass('bg-red-700')
    expect(pill).toHaveClass('text-white')
    expect(screen.getByText('Teste')).toHaveClass('text-red-700')
  })

  it('renderiza erro geral em modo escuro', () => {
    useThemeMock.mockReturnValue({ darkMode: true, toggleDarkMode: vi.fn() })
    render(<GeneratorErrorCard error="Outro" errorType="general" />)

    expect(screen.getByText(/Erro do modelo/i)).toBeInTheDocument()
    expect(screen.getByText('Outro')).toHaveClass('text-white')
  })
})
