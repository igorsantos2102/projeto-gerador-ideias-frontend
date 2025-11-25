import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { Navbar } from '../Navbar'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Navbar', () => {
  it('renderiza ações padrão e navega para as rotas corretas', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)

    await user.click(screen.getByRole('button', { name: /voltar para a/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')

    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login')

    await user.click(screen.getByRole('button', { name: /come/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/register')
  })

  it('permite ocultar as actions', () => {
    renderWithProviders(<Navbar hideActions />)
    expect(screen.queryByRole('link', { name: /log in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /come/i })).not.toBeInTheDocument()
  })
})
