import { describe, expect, it } from "vitest";
import type { Interaction } from "@/types/chatMetrics";
import { buildHourlySeries, computeKpis, percentile } from "@/utils/chatbot_metrics";

const createInteraction = (overrides: Partial<Interaction> = {}): Interaction => ({
  interactionId: overrides.interactionId ?? 1,
  timestamp: overrides.timestamp ?? new Date(2025, 0, 1, 2, 0, 0).toISOString(),
  sessionId: overrides.sessionId ?? 1,
  chatType: overrides.chatType ?? "FREE",
  tokensInput: overrides.tokensInput ?? 10,
  tokensOutput: overrides.tokensOutput ?? 5,
  responseTimeMs: overrides.responseTimeMs ?? 100,
  userMessage: overrides.userMessage ?? "teste",
  assistantMessage: overrides.assistantMessage ?? "ola",
  ideaId: overrides.ideaId ?? null,
});

describe("chatbot metrics helpers", () => {
  it("aggregates hourly values and averages", () => {
    const interactions: Interaction[] = [
      createInteraction({
        interactionId: 1,
        chatType: "FREE",
        tokensInput: 12,
        tokensOutput: 8,
        responseTimeMs: 110,
        timestamp: new Date(2025, 0, 1, 2, 0, 0).toISOString(),
      }),
      createInteraction({
        interactionId: 2,
        chatType: "CONTEXT",
        tokensInput: 5,
        tokensOutput: 3,
        responseTimeMs: 250,
        timestamp: new Date(2025, 0, 1, 2, 15, 0).toISOString(),
      }),
      createInteraction({
        interactionId: 3,
        chatType: "FREE",
        tokensInput: 4,
        tokensOutput: 2,
        responseTimeMs: 80,
        timestamp: new Date(2025, 0, 1, 5, 0, 0).toISOString(),
      }),
    ];

    const series = buildHourlySeries(interactions);
    const twoAmSlot = series[2];
    expect(twoAmSlot.countAll).toBe(2);
    expect(twoAmSlot.countFree).toBe(1);
    expect(twoAmSlot.countContext).toBe(1);
    expect(twoAmSlot.tokensInAll).toBe(17);
    expect(twoAmSlot.tokensOutAll).toBe(11);
    expect(twoAmSlot.tokensInFree).toBe(12);
    expect(twoAmSlot.tokensOutFree).toBe(8);
    expect(twoAmSlot.tokensInContext).toBe(5);
    expect(twoAmSlot.tokensOutContext).toBe(3);
    expect(twoAmSlot.avgRtAll).toBe(Math.round((110 + 250) / 2));
    expect(twoAmSlot.avgRtFree).toBe(110);
    expect(twoAmSlot.avgRtContext).toBe(250);

    const fiveAmSlot = series[5];
    expect(fiveAmSlot.countAll).toBe(1);
    expect(fiveAmSlot.countFree).toBe(1);
    expect(fiveAmSlot.avgRtAll).toBe(80);
  });
});

describe("percentile helper", () => {
  it("returns zero for empty arrays", () => {
    expect(percentile([], 50)).toBe(0);
  });

  it("interpolates values correctly", () => {
    const values = [10, 30, 50];
    expect(percentile(values, 50)).toBe(30);
    expect(percentile(values, 75)).toBe(40);
  });
});

describe("computeKpis helper", () => {
  it("produces totals and averages", () => {
    const interactions: Interaction[] = [
      createInteraction({
        interactionId: 10,
        tokensInput: 20,
        tokensOutput: 30,
        responseTimeMs: 100,
      }),
      createInteraction({
        interactionId: 12,
        tokensInput: 10,
        tokensOutput: 15,
        responseTimeMs: 200,
      }),
      createInteraction({
        interactionId: 14,
        tokensInput: 5,
        tokensOutput: 5,
        responseTimeMs: 300,
      }),
    ];

    const result = computeKpis(interactions);
    expect(result.totalInput).toBe(35);
    expect(result.totalOutput).toBe(50);
    expect(result.totalAll).toBe(85);
    expect(result.avgRt).toBe((100 + 200 + 300) / 3);
    expect(result.avgTokensPerInteraction).toBe(85 / 3);
    expect(result.p50).toBe(200);
    expect(result.p95).toBe(290);
  });
});
