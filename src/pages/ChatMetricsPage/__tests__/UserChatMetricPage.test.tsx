import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserChatMetricsPage } from "../UserChatMetricPage"

const useChatMetricsMock = vi.fn()

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
  computeKpis: () => ({ p50: 2, p95: 4, avgTokensPerInteraction: 1 }),
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
  default: ({ date, chatFilter, onChatFilterChange, onToggleCompare, onDateChange }: any) => (
    <div data-testid="filters" data-date={date} data-filter={chatFilter}>
      <button data-testid="set-free" onClick={() => onChatFilterChange("FREE")}>Free</button>
      <button data-testid="toggle-compare" onClick={() => onToggleCompare()}>Compare</button>
      <button data-testid="change-date" onClick={() => onDateChange("2025-01-02")}>Date</button>
    </div>
  ),
}))

vi.mock("@/components/ChatMetricsTable/ChatMetricsTable", () => ({
  __esModule: true,
  default: ({ scopeLabel, items }: any) => (
    <div data-testid="chat-table" data-scope={scopeLabel} data-count={items.length}>
      Table
    </div>
  ),
}))

vi.mock("@/components/common/Pagination", () => ({
  __esModule: true,
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <span>{currentPage}/{totalPages}</span>
      <button data-testid="next-page" onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
}))

vi.mock("@/hooks/useChatMetrics", () => ({
  useChatMetrics: (params: any) => useChatMetricsMock(params),
}))

const fullInteractions = [
  {
    interactionId: 1,
    timestamp: "2025-01-01T00:00:00Z",
    sessionId: 1,
    chatType: "FREE",
    tokensInput: 4,
    tokensOutput: 2,
    responseTimeMs: 12,
    userMessage: "ola",
    assistantMessage: "resposta",
    ideaId: null,
  },
]

const pageInteractions = [
  {
    ...fullInteractions[0],
    interactionId: 2,
    chatType: "CONTEXT",
  },
]

const summaryFull = {
  totalInteractions: 1,
  totalTokensInput: 5,
  totalTokensOutput: 3,
  averageResponseTimeMs: 30,
}

const summaryPage = {
  totalInteractions: 2,
  totalTokensInput: 6,
  totalTokensOutput: 4,
  averageResponseTimeMs: 25,
}

const pagination = {
  totalElements: 2,
  totalPages: 2,
  currentPage: 1,
  hasNext: true,
  hasPrevious: false,
}

const makeFullResult = () => ({
  status: "ready",
  interactions: fullInteractions,
  summary: summaryFull,
  pagination: null,
  refetch: vi.fn(),
})

const makePageResult = (overrides: Partial<ReturnType<typeof makeFullResult>> = {}) => ({
  status: "ready",
  interactions: pageInteractions,
  summary: summaryPage,
  pagination,
  refetch: vi.fn(),
  ...overrides,
})

describe("UserChatMetricsPage", () => {
  beforeEach(() => {
    useChatMetricsMock.mockReset()
    useChatMetricsMock.mockImplementation(({ size, page }: { size?: number; page?: number }) =>
      size === 1000 ? makeFullResult() : makePageResult({ pagination: { ...pagination, currentPage: page ?? 1 } })
    )
    vi.stubGlobal("scrollTo", vi.fn())
  })

  it("renders header, filters, and table when data is ready", () => {
    render(<UserChatMetricsPage />)

    expect(screen.getByRole("heading", { name: /Minhas m/ })).toBeInTheDocument()
    expect(screen.getByTestId("filters")).toHaveAttribute("data-filter", "ALL")
    expect(screen.getByTestId("chat-table")).toHaveAttribute("data-scope", "ALL")
    expect(screen.getByTestId("pagination")).toHaveTextContent("1/2")
  })

  it("shows loading indicator when metrics are still loading", () => {
    useChatMetricsMock.mockImplementation(({ size }: { size?: number }) =>
      size === 1000 ? makeFullResult() : makePageResult({ status: "loading", interactions: [], pagination: null })
    )

    render(<UserChatMetricsPage />)

    expect(screen.getByText(/Carregando m/i)).toBeInTheDocument()
  })

  it("displays an error banner when fetching fails", () => {
    useChatMetricsMock.mockImplementation(({ size }: { size?: number }) =>
      size === 1000 ? makeFullResult() : makePageResult({ status: "error", interactions: [], pagination: null })
    )

    render(<UserChatMetricsPage />)

    expect(screen.getByText(/Não foi possível carregar as métricas agora/i)).toBeInTheDocument()
  })

  it("filters by chat type and toggles compare", async () => {
    useChatMetricsMock.mockImplementation(({ size }: { size?: number }) =>
      size === 1000
        ? makeFullResult()
        : makePageResult({
            interactions: [
              ...pageInteractions,
              { ...pageInteractions[0], interactionId: 3, chatType: "FREE" },
            ],
          })
    )

    render(<UserChatMetricsPage />)

    expect(screen.getByTestId("chat-table")).toHaveAttribute("data-count", "2")
    await userEvent.click(screen.getByTestId("set-free"))
    expect(screen.getByTestId("chat-table")).toHaveAttribute("data-scope", "FREE")
    expect(screen.getByTestId("chat-table")).toHaveAttribute("data-count", "1")

    await userEvent.click(screen.getByTestId("toggle-compare"))
    expect(useChatMetricsMock).toHaveBeenCalled()
  })

  it("paginates and resets page on date change", async () => {
    const paginationSpy = vi.fn()
    useChatMetricsMock.mockImplementation(({ size, page }: { size?: number; page?: number }) => {
      if (size === 1000) return makeFullResult()
      paginationSpy({ size, page })
      return makePageResult({ pagination: { ...pagination, currentPage: page ?? 1 } })
    })

    render(<UserChatMetricsPage />)

    await userEvent.click(screen.getByTestId("next-page"))
    expect(paginationSpy).toHaveBeenCalledWith(expect.objectContaining({ size: 10, page: 2 }))

    await userEvent.click(screen.getByTestId("change-date"))
    expect(paginationSpy).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
  })
})
