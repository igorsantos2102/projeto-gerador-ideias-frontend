import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { LoginHeader } from '../LoginHeader'
import { LoginFooter } from '../LoginFooter'

describe('Login layout helpers', () => {
  it('exibe os textos do cabeçalho', () => {
    renderWithProviders(<LoginHeader />)
    expect(screen.getByText(/Bem-vindo de volta/i)).toBeInTheDocument()
    expect(screen.getByText(/faça login para continuar/i)).toBeInTheDocument()
  })

  it('renderiza links de cadastro e retorno', () => {
    renderWithProviders(<LoginFooter />)
    expect(screen.getByRole('link', { name: /Criar uma conta/i })).toHaveAttribute('href', '/register')
    expect(screen.getByRole('link', { name: /Voltar para/i })).toHaveAttribute('href', '/')
  })
})
