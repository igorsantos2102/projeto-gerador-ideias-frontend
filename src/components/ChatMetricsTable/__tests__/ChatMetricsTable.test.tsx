import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatMetricsTable from '../ChatMetricsTable'

vi.mock('@/utils/format', () => ({
  hhmm: vi.fn(() => '10:30'),
  formatMs: vi.fn(() => '123ms'),
}))

const baseRow = {
  interactionId: 101,
  timestamp: '2025-01-01T10:30:00Z',
  sessionId: 555,
  chatFilter: 'FREE' as const,
  tokensInput: 5,
  tokensOutput: 7,
  responseTimeMs: 123456,
  userMessage: 'Olá',
  assistantMessage: 'Tudo bem?',
  ideaId: 42,
  userName: 'João',
  userEmail: 'joao@example.com',
}

describe('ChatMetricsTable', () => {
  it('renderiza cabeçalhos e estatísticas básicas', () => {
    render(<ChatMetricsTable items={[baseRow]} dark={false} scopeLabel="ALL" />)

    expect(screen.getByText(/interações/i)).toHaveTextContent('Interações (1)')
    expect(screen.getByText(/mostrando:/i)).toHaveTextContent('Mostrando: Todos')
    expect(screen.getByText(/tokens \(entrada\/saída\/total\)/i)).toBeInTheDocument()
    expect(screen.getByText(/tempo de resposta/i)).toBeInTheDocument()
    expect(screen.queryByText(/usuário/i)).not.toBeInTheDocument()
  })

  it('mostra colunas de usuário e IDs quando habilitado', () => {
    render(
      <ChatMetricsTable
        items={[{ ...baseRow, userMessage: 'Oi' }]}
        dark
        showUserColumns
        showIds
      />
    )

    expect(screen.getByText(/usuário/i)).toBeInTheDocument()
    expect(screen.getByText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByText(/ids/i)).toBeInTheDocument()
    expect(screen.getByText(/joão/i)).toBeInTheDocument()
    expect(screen.getByText(/joao@example.com/i)).toBeInTheDocument()
  })

  it('alterna o detalhe da linha quando o botão é clicado', async () => {
    render(<ChatMetricsTable items={[baseRow]} dark={false} />)
    const button = screen.getByRole('button', { name: /ver/i })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/mensagem do usuário/i)).toBeInTheDocument()
    expect(screen.getByText(/mensagem da assistente/i)).toBeInTheDocument()

    await userEvent.click(button)
    expect(screen.queryByText(/mensagem da assistente/i)).not.toBeInTheDocument()
  })
})
