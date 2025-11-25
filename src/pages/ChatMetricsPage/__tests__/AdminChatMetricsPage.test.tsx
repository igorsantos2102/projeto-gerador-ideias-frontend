import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { AdminChatMetricsPage } from "../AdminChatMetricsPage"

const useAdminChatMetricsMock = vi.fn()

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ darkMode: false }),
}))

vi.mock("@/utils/format", () => ({
  formatInt: (value: number) => `int:${value}`,
  formatMs: (value: number) => `ms:${value}`,
  todayLocal: () => "2025-01-01",
}))

vi.mock("@/utils/chatbot_metrics", () => ({
  buildHourlySeries: () => [],
  computeKpis: () => ({ p50: 5, p95: 10, avgTokensPerInteraction: 2 }),
}))

vi.mock("@/components/charts", () => ({
  __esModule: true,
  InteractionsByHourChart: () => <div data-testid="interactions-chart" />,
  TokensByHourChart: () => <div data-testid="tokens-chart" />,
  LatencyByHourChart: () => <div data-testid="latency-chart" />,
  getChartTheme: () => ({ tooltip: {}, cursorFill: "" }),
}))

vi.mock("@/components/StatsCard/ChatKpiCard", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock("@/components/ChatMetricsFilters/ChatMetricsFilters", () => ({
  __esModule: true,
  default: ({ date, chatFilter }: any) => (
    <div data-testid="filters" data-date={date} data-filter={chatFilter}>
      Filters
    </div>
  ),
}))

vi.mock("@/components/ChatMetricsTable/ChatMetricsTable", () => ({
  __esModule: true,
  default: ({ scopeLabel }: any) => (
    <div data-testid="chat-table" data-scope={scopeLabel}>
      Table
    </div>
  ),
}))

vi.mock("@/components/common/Pagination", () => ({
  __esModule: true,
  default: ({ currentPage, totalPages }: any) => (
    <div data-testid="pagination">
      {currentPage}/{totalPages}
    </div>
  ),
}))

vi.mock("@/hooks/useChatMetrics", () => ({
  useAdminChatMetrics: (params: any) => useAdminChatMetricsMock(params),
}))

const allInteractions = [
  {
    interactionId: 1,
    timestamp: "2025-01-01T00:00:00Z",
    sessionId: 1,
    chatType: "FREE",
    tokensInput: 2,
    tokensOutput: 3,
    responseTimeMs: 10,
    userMessage: "oi",
    assistantMessage: "ok",
    ideaId: null,
    userId: 1,
    userName: "User A",
    userEmail: "a@example.com",
    userIp: "127.0.0.1",
  },
]

const pageInteractions = [
  {
    ...allInteractions[0],
    interactionId: 2,
    chatType: "CONTEXT",
  },
]

const summaryFull = {
  totalInteractions: 1,
  totalTokensInput: 10,
  totalTokensOutput: 5,
  averageResponseTimeMs: 50,
}

const summaryPage = {
  totalInteractions: 2,
  totalTokensInput: 12,
  totalTokensOutput: 7,
  averageResponseTimeMs: 40,
}

const pagination = {
  totalElements: 2,
  totalPages: 2,
  currentPage: 1,
  hasNext: true,
  hasPrevious: false,
}

const makeAllResult = () => ({
  status: "ready",
  interactions: allInteractions,
  summary: summaryFull,
  pagination: null,
  filteredUserId: null,
  refetch: vi.fn(),
})

const makePageResult = (overrides: Partial<ReturnType<typeof makeAllResult>> = {}) => ({
  status: "ready",
  interactions: pageInteractions,
  summary: summaryPage,
  pagination,
  filteredUserId: null,
  refetch: vi.fn(),
  ...overrides,
})

describe("AdminChatMetricsPage", () => {
  beforeEach(() => {
    useAdminChatMetricsMock.mockReset()
    useAdminChatMetricsMock.mockImplementation(({ size }: { size?: number }) =>
      size === 1000 ? makeAllResult() : makePageResult()
    )
  })

  it("renders KPI cards, filters, table, and pagination", () => {
    render(<AdminChatMetricsPage />)

    expect(screen.getByText(/Interações Totais/i)).toBeInTheDocument()
    expect(screen.getByTestId("filters")).toHaveAttribute("data-filter", "ALL")
    expect(screen.getByTestId("filters")).toHaveAttribute("data-date", "2025-01-01")
    expect(screen.getByTestId("chat-table")).toHaveAttribute("data-scope", "Todos os tipos")
    expect(screen.getByTestId("pagination")).toHaveTextContent("1/2")
  })

  it("shows a loading placeholder when primary data is loading", () => {
    useAdminChatMetricsMock.mockImplementation(({ size }: { size?: number }) =>
      size === 1000 ? makeAllResult() : makePageResult({ status: "loading", interactions: [], pagination: null })
    )
    render(<AdminChatMetricsPage />)

    expect(screen.getByText(/Carregando m/i)).toBeInTheDocument()
  })

  it("shows an error banner if the metrics request fails", () => {
    useAdminChatMetricsMock.mockImplementation(({ size }: { size?: number }) =>
      size === 1000 ? makeAllResult() : makePageResult({ status: "error", interactions: [], pagination: null })
    )
    render(<AdminChatMetricsPage />)

    expect(screen.getByText(/Não foi possível carregar as métricas agora/i)).toBeInTheDocument()
  })
})
