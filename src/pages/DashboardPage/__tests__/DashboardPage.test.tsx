import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import DashboardPage from '../DashboardPage'
import { statsService } from '@/services/statsService'
import { subscribeHistoryRefresh, type HistoryRefreshEventHandler } from '@/events/historyEvents'

vi.mock('@/services/statsService', () => ({
  statsService: {
    getStats: vi.fn(),
  },
}))

vi.mock('@/events/historyEvents', () => ({
  subscribeHistoryRefresh: vi.fn(),
}))

vi.mock('recharts', () => {
  const Fake = ({ children }: any) => <div>{children}</div>
  return {
    ResponsiveContainer: Fake,
    BarChart: Fake,
    CartesianGrid: Fake,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Tooltip: () => <div />,
    Bar: ({ children }: any) => <div>{children}</div>,
    Cell: () => <div />,
  }
})

const statsServiceMock = vi.mocked(statsService)
const subscribeMock = vi.mocked(subscribeHistoryRefresh)

describe('DashboardPage', () => {
  let refreshCallback: HistoryRefreshEventHandler | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    refreshCallback = null
    subscribeMock.mockImplementation((cb) => {
      refreshCallback = cb
      return vi.fn()
    })
  })

  it('mostra KPIs e chama o serviço de estatísticas', async () => {
    statsServiceMock.getStats.mockResolvedValue({
      totalIdeas: 8,
      totalFavorites: 3,
      averageResponseTime: 120,
    })

    const ideas = [
      { id: 'id1', theme: 'tech', context: '', content: 'A', timestamp: new Date(), isFavorite: false },
      { id: 'id2', theme: 'tech', context: '', content: 'B', timestamp: new Date(), isFavorite: false },
    ]

    renderWithProviders(<DashboardPage ideas={ideas} />)

    expect(screen.getAllByText('...').length).toBeGreaterThan(0)

    await waitFor(() => expect(screen.getByText('8')).toBeInTheDocument())
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText(/Tempo Médio/i)).toBeInTheDocument()
    expect(screen.getByText(/Ideias por Tema/i)).toBeInTheDocument()

    fireEvent.focus(window)
    await waitFor(() => expect(statsServiceMock.getStats).toHaveBeenCalledTimes(2))

    refreshCallback?.({})
    await waitFor(() => expect(statsServiceMock.getStats).toHaveBeenCalledTimes(3))
  })

  it('mantém dados zerados quando o serviço falha', async () => {
    statsServiceMock.getStats.mockRejectedValueOnce(new Error('falha'))

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThan(0)
    })
    expect(screen.getByText(/Tempo Médio/i)).toBeInTheDocument()
  })
})
