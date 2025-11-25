import { describe, expect, beforeEach, it, vi } from "vitest"
import { render } from "@testing-library/react"
import type { HourSlot } from "@/utils/chatbot_metrics"
import InteractionsByHourChart from "../InteractionsByHourChart"
import LatencyByHourChart from "../LatencyByHourChart"
import TokensByHourChart from "../TokensByHourChart"
import { getChartTheme } from "../chartTheme"

type ChartMockKey = "Bar" | "Line"

const trackedProps: Record<ChartMockKey, unknown[]> = {
  Bar: [],
  Line: [],
}

vi.mock("recharts", () => {
  const createMock = (name: ChartMockKey) => ({ children, ...props }: any) => {
    trackedProps[name].push(props)
    return (
      <div data-testid={`${name}:${props.dataKey ?? name}`}>
        {children}
      </div>
    ) as any
  }

  const Fake = ({ children }: any) => <div>{children}</div>

  return {
    ResponsiveContainer: Fake,
    BarChart: Fake,
    LineChart: Fake,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Bar: createMock("Bar"),
    Line: createMock("Line"),
  }
})

const sampleSlot: HourSlot = {
  hour: "00",
  countAll: 4,
  countFree: 1,
  countContext: 3,
  tokensInAll: 120,
  tokensOutAll: 100,
  tokensInFree: 20,
  tokensOutFree: 18,
  tokensInContext: 100,
  tokensOutContext: 82,
  avgRtAll: 200,
  avgRtFree: 150,
  avgRtContext: 205,
}

const chartColors = {
  ALL: "all",
  ALL_OUT: "allOut",
  FREE: "free",
  FREE_OUT: "freeOut",
  CONTEXT: "context",
  CTX_OUT: "ctxOut",
}

const resetTrackedProps = () => {
  trackedProps.Bar = []
  trackedProps.Line = []
}

describe("chart components", () => {
  beforeEach(() => {
    resetTrackedProps()
  })

  describe("InteractionsByHourChart", () => {
    const baseProps = {
      data: [sampleSlot],
      dark: false,
      colors: chartColors,
    }

    it("renders free/context bars when compare mode is enabled", () => {
      render(<InteractionsByHourChart {...baseProps} compare singleColor={undefined} />)

      expect(trackedProps.Bar).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ dataKey: "countFree" }),
          expect.objectContaining({ dataKey: "countContext" }),
        ])
      )
    })

    it("renders the single interactions bar when compare mode is disabled", () => {
      render(
        <InteractionsByHourChart {...baseProps} compare={false} singleColor="customFill" />
      )

      expect(trackedProps.Bar).toHaveLength(1)
      expect(trackedProps.Bar[0]).toMatchObject({
        dataKey: "countAll",
        fill: "customFill",
      })
    })
  })

  describe("LatencyByHourChart", () => {
    const baseProps = {
      data: [sampleSlot],
      dark: true,
      colors: chartColors,
    }

    it("renders separate lines when compare is true", () => {
      render(<LatencyByHourChart {...baseProps} compare />)

      expect(trackedProps.Line).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ dataKey: "avgRtFree", stroke: chartColors.FREE }),
          expect.objectContaining({ dataKey: "avgRtContext", stroke: chartColors.CONTEXT }),
        ])
      )
    })

    it("renders the aggregated line when compare is false", () => {
      render(<LatencyByHourChart {...baseProps} compare={false} singleColor="singleStroke" />)

      expect(trackedProps.Line).toHaveLength(1)
      expect(trackedProps.Line[0]).toMatchObject({
        dataKey: "avgRtAll",
        stroke: "singleStroke",
      })
    })
  })

  describe("TokensByHourChart", () => {
    const baseProps = {
      data: [sampleSlot],
      dark: false,
      colors: chartColors,
    }

    it("renders the four lines for compare mode", () => {
      render(<TokensByHourChart {...baseProps} compare />)

      expect(trackedProps.Line).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ dataKey: "tokensInFree", stroke: chartColors.FREE }),
          expect.objectContaining({ dataKey: "tokensOutFree", stroke: chartColors.FREE_OUT }),
          expect.objectContaining({ dataKey: "tokensInContext", stroke: chartColors.CONTEXT }),
          expect.objectContaining({ dataKey: "tokensOutContext", stroke: chartColors.CTX_OUT }),
        ])
      )
    })

    it("renders tokens in/out lines when compare is disabled", () => {
      render(
        <TokensByHourChart
          {...baseProps}
          compare={false}
          singleColor="primary"
          singleColorSecondary="secondary"
        />
      )

      expect(trackedProps.Line).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ dataKey: "tokensInAll", stroke: "primary" }),
          expect.objectContaining({ dataKey: "tokensOutAll", stroke: "secondary" }),
        ])
      )
    })
  })
})

describe("getChartTheme", () => {
  it("returns dark styles when requested", () => {
    const theme = getChartTheme(true)
    expect(theme.tooltip.contentStyle.background).toBe("#1e293b")
    expect(theme.tooltip.contentStyle.border).toContain("#334155")
    expect(theme.cursorFill).toContain("rgba(20,28,45")
  })

  it("returns light styles when not dark", () => {
    const theme = getChartTheme(false)
    expect(theme.tooltip.contentStyle.background).toBe("#ffffff")
    expect(theme.tooltip.contentStyle.border).toContain("#e5e7eb")
    expect(theme.cursorFill).toContain("rgba(226,232,240")
  })
})
