import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TokenNotification } from '../TokenNotification'

vi.useRealTimers()

describe('TokenNotification', () => {
  it('apresenta alerta quando tokens estão abaixo do limite e fecha ao descartar', async () => {
    const onDismiss = vi.fn()
    render(<TokenNotification tokensRemaining={1500} onDismiss={onDismiss} />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/atenção: tokens baixos/i)
    expect(alert).toHaveTextContent('1.500 tokens restantes')

    const bar = alert.querySelector('div[style]')
    expect(bar).toHaveStyle({ width: '15%' })

    await userEvent.click(screen.getByLabelText(/fechar notifica/i))
    await waitFor(() => expect(alert).not.toBeInTheDocument())
    expect(onDismiss).toHaveBeenCalled()
  })

  it('mostra texto crítico quando tokens abaixo do limiar crítico', async () => {
    render(<TokenNotification tokensRemaining={900} maxTokens={1000} />)

    expect(await screen.findByText(/tokens críticos/i)).toBeInTheDocument()
    expect(screen.getByText(/900 tokens restantes/i)).toBeInTheDocument()
  })

  it('não renderiza nada quando os tokens estão acima do aviso', () => {
    render(<TokenNotification tokensRemaining={5000} />)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
