import { describe, expect, it } from "vitest"
import { buildHourlySeries, computeKpis, percentile } from "../chatbot_metrics"
import type { Interaction } from "@/types/chatMetrics"

const makeInteraction = (overrides: Partial<Interaction> = {}): Interaction => ({
  interactionId: 1,
  timestamp: "2025-01-01T10:00:00Z",
  sessionId: 101,
  chatType: "FREE",
  tokensInput: 10,
  tokensOutput: 5,
  responseTimeMs: 100,
  userMessage: "oi",
  assistantMessage: "opa",
  ...overrides,
})

describe("chatbot_metrics helpers", () => {
  it("buildHourlySeries aggregates counts and tokens per slot", () => {
    const interactions: Interaction[] = [
      makeInteraction({ timestamp: "2025-01-01T10:00:00Z", chatType: "FREE", tokensInput: 10, tokensOutput: 5, responseTimeMs: 100 }),
      makeInteraction({ timestamp: "2025-01-01T10:30:00Z", chatType: "CONTEXT", tokensInput: 20, tokensOutput: 10, responseTimeMs: 200 }),
    ]

    const series = buildHourlySeries(interactions)
    expect(series).toHaveLength(24)
    const hour = new Date(interactions[0].timestamp).getHours()
    const slot = series[hour]
    expect(slot.countAll).toBe(2)
    expect(slot.countFree).toBe(1)
    expect(slot.countContext).toBe(1)
    expect(slot.tokensInAll).toBe(30)
    expect(slot.tokensOutAll).toBe(15)
    expect(slot.avgRtAll).toBe(150)
    expect(slot.avgRtFree).toBe(100)
    expect(slot.avgRtContext).toBe(200)
  })

  it("buildHourlySeries returns zeroed averages when no interactions at hour", () => {
    const series = buildHourlySeries([])
    expect(series[0].avgRtAll).toBe(0)
    expect(series[0].countAll).toBe(0)
  })

  it("percentile returns 0 for empty arrays", () => {
    expect(percentile([], 50)).toBe(0)
  })

  it("percentile interpolates between values", () => {
    const values = [10, 20, 30]
    expect(percentile(values, 50)).toBe(20)
    expect(percentile(values, 25)).toBe(15)
    expect(percentile(values, 75)).toBe(25)
  })

  it("computeKpis sums tokens and computes averages", () => {
    const interactions: Interaction[] = [
      makeInteraction({ tokensInput: 10, tokensOutput: 5, responseTimeMs: 100 }),
      makeInteraction({ tokensInput: 20, tokensOutput: 15, responseTimeMs: 200 }),
    ]

    const result = computeKpis(interactions)
    expect(result.totalInput).toBe(30)
    expect(result.totalOutput).toBe(20)
    expect(result.totalAll).toBe(50)
    expect(result.avgRt).toBe(150)
    expect(result.avgTokensPerInteraction).toBe(25)
    expect(result.p50).toBe(150)
    expect(result.p95).toBe(195)
  })

})
