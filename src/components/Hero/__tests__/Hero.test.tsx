import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import { Hero } from '../Hero'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Hero', () => {
  it('mostra erro quando o email não foi informado', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Hero />)

    await user.click(screen.getByRole('button', { name: /come/i }))
    expect(screen.getByText(/por favor, digite um e-mail/i)).toBeInTheDocument()
  })

  it('valida formato de email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Hero />)

    await user.type(screen.getByPlaceholderText(/digite seu email/i), 'invalid-email')
    await user.click(screen.getByRole('button', { name: /come/i }))

    expect(screen.getByText(/Digite um e-mail/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navega para o registro com email válido', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Hero />)

    await user.type(screen.getByPlaceholderText(/digite seu email/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /come/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/register?email=user%40example.com')
  })
})
