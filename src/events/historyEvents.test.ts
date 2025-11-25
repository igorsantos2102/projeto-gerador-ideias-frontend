import { describe, expect, it, vi } from "vitest";
import {
  emitHistoryRefreshRequest,
  subscribeHistoryRefresh,
} from "@/events/historyEvents";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";

describe("history refresh events", () => {
  it("invokes listener when emission occurs and cleans up listener", () => {
    const handler = vi.fn();
    const cleanup = subscribeHistoryRefresh(handler);

    const idea: Idea = {
      id: "abc-123",
      theme: "Tema",
      context: "Contexto",
      content: "Ideia de teste",
      timestamp: new Date("2025-10-01T12:00:00Z"),
      isFavorite: false,
    };

    emitHistoryRefreshRequest({ idea });
    expect(handler).toHaveBeenCalledWith({ idea });

    cleanup();
    emitHistoryRefreshRequest({ idea: undefined });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
