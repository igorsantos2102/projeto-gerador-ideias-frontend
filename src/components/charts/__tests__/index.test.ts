import { describe, expect, it } from "vitest"
import {
  InteractionsByHourChart,
  LatencyByHourChart,
  TokensByHourChart,
  getChartTheme,
} from "../index"

describe("chart index re-exports", () => {
  it("exposes each chart component", () => {
    expect(InteractionsByHourChart).toBeDefined()
    expect(LatencyByHourChart).toBeDefined()
    expect(TokensByHourChart).toBeDefined()
  })

  it("re-exports the theme helper", () => {
    const theme = getChartTheme(false)
    expect(theme.tooltip).toBeDefined()
  })
})
