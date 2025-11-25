import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TokenProgressBar } from '../TokenProgressBar'

describe('TokenProgressBar', () => {
  it('exibe o rótulo, porcentagem e classes corretas para status bom', () => {
    const { container } = render(<TokenProgressBar tokensRemaining={8000} />)

    expect(screen.getByText('8.000 / 10.000')).toBeInTheDocument()
    expect(screen.getByText('80%')).toHaveClass('text-emerald-600')

    const bar = container.querySelector('div[style]')
    expect(bar).toHaveStyle({ width: '80%' })
  })

  it('usa classe crítica e esconde o rótulo quando showLabel=false', () => {
    render(<TokenProgressBar tokensRemaining={100} maxTokens={1000} showLabel={false} size="lg" />)

    expect(screen.queryByText(/100 \/ 1\.000/)).toBeNull()
    expect(screen.queryByText('10%')).toBeNull()

    const inner = document.querySelector('.bg-rose-500')
    expect(inner).toHaveAttribute('style', expect.stringContaining('width: 10%'))
  })
})
