import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { forwardRef } from 'react'
import type { LucideIcon, LucideProps } from 'lucide-react'
import BaseStatsCard from '../BaseStatsCard'
import ChatKpiCard from '../ChatKpiCard'
import StatsCardWithIcon from '../StatsCardWithIcon'

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))
import { useTheme } from '@/hooks/useTheme'
const useThemeMock = vi.mocked(useTheme)

const DummyIcon = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <svg data-testid="dummy-icon" ref={ref} {...props}>
      <circle cx="2" cy="2" r="2" />
    </svg>
  )
) as LucideIcon

describe('Stats cards', () => {
  beforeEach(() => {
    useThemeMock.mockReturnValue({ darkMode: false, toggleDarkMode: vi.fn() })
  })

  it('BaseStatsCard aplica delay e mostra header e footer', () => {
    const { container } = render(
      <BaseStatsCard
        header="Cabeçalho"
        value={<span>42</span>}
        footer="Rodapé"
        delay={200}
        className="extra"
      />
    )

    expect(screen.getByText('Cabeçalho')).toBeInTheDocument()
    expect(screen.getByText('Rodapé')).toBeInTheDocument()
    expect(container.querySelector('.animation-delay-200')).toBeInTheDocument()
    expect(container.querySelector('.extra')).toBeInTheDocument()
  })

  it('BaseStatsCard usa classes de dark mode', () => {
    useThemeMock.mockReturnValueOnce({ darkMode: true, toggleDarkMode: vi.fn() })
    const { container } = render(<BaseStatsCard value={<span>10</span>} />)
    expect(container.querySelector('.bg-slate-900')).toBeInTheDocument()
  })

  it('ChatKpiCard renderiza ícone e subtítulo', () => {
    render(
      <ChatKpiCard
        title="Interações"
        value="320"
        subtitle="média"
        icon={DummyIcon}
      />
    )

    expect(screen.getByText('Interações')).toBeInTheDocument()
    expect(screen.getByText('média')).toBeInTheDocument()
    expect(screen.getByTestId('dummy-icon')).toBeInTheDocument()
  })

  it('StatsCardWithIcon usa classes customizadas e título', () => {
    render(
      <StatsCardWithIcon
        title="Tokens"
        value="777"
        Icon={DummyIcon}
        iconBgClassName="bg-purple-200"
        iconClassName="text-purple-500"
        titleClassName="uppercase"
        valueClassName="font-bold"
        className="card-class"
      />
    )

    expect(screen.getByText('Tokens')).toHaveClass('uppercase')
    expect(screen.getByText('777')).toHaveClass('font-bold')
    expect(screen.getByTestId('dummy-icon')).toBeInTheDocument()
    expect(screen.getByText('777').closest('.stats-card-scope')).toHaveClass('card-class')
  })
})
