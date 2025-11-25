import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAdminChatMetrics, useChatMetrics } from "./useChatMetrics";

const getChatLogsMock = vi.fn();
const getAdminChatLogsMock = vi.fn();

vi.mock("@/services/chatService", () => ({
  chatService: {
    getChatLogs: (...args: any[]) => getChatLogsMock(...args),
    getAdminChatLogs: (...args: any[]) => getAdminChatLogsMock(...args),
  },
}));

const baseInteraction = {
  interactionId: 1,
  timestamp: new Date(2025, 0, 1, 2, 0, 0).toISOString(),
  sessionId: 1,
  chatType: "IDEA_BASED",
  ideaId: 12,
  userMessage: "Olá",
  assistantMessage: "Oi",
  metrics: {
    tokensInput: 10,
    tokensOutput: 20,
    totalTokens: 30,
    responseTimeMs: 150,
  },
};

const freeInteraction = {
  interactionId: 2,
  timestamp: new Date(2025, 0, 1, 3, 0, 0).toISOString(),
  sessionId: 1,
  chatType: "FREE",
  ideaId: null,
  userMessage: "Teste",
  assistantMessage: "Resposta",
  metrics: {
    tokensInput: 5,
    tokensOutput: 10,
    totalTokens: 15,
    responseTimeMs: 250,
  },
};

const baseSummary = {
  totalInteractions: 2,
  totalTokensInput: 15,
  totalTokensOutput: 30,
  totalTokens: 45,
  averageResponseTimeMs: 200,
};

const basePagination = {
  totalElements: 2,
  totalPages: 1,
  currentPage: 1,
  hasNext: false,
  hasPrevious: false,
};

const sampleResponse = {
  summary: baseSummary,
  pagination: basePagination,
  interactions: [baseInteraction, freeInteraction],
};

const adminResponse = {
  filteredUserId: 42,
  summary: baseSummary,
  pagination: basePagination,
  interactions: [
    {
      ...baseInteraction,
      userId: 5,
      userName: "Admin",
      userEmail: "admin@example.com",
      userIp: "127.0.0.1",
    },
  ],
};

describe("useChatMetrics hook", () => {
  beforeEach(() => {
    getChatLogsMock.mockReset();
    getAdminChatLogsMock.mockReset();
  });

  it("skips fetching when disabled", async () => {
    const { result } = renderHook(() => useChatMetrics({ enabled: false }));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(getChatLogsMock).not.toHaveBeenCalled();
  });

  it("loads and maps chat metrics", async () => {
    getChatLogsMock.mockResolvedValue(sampleResponse);
    const { result } = renderHook(() => useChatMetrics());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    expect(result.current.interactions).toHaveLength(2);
    expect(result.current.interactions[0].chatType).toBe("CONTEXT");
    expect(result.current.interactions[1].chatType).toBe("FREE");
    expect(result.current.summary.totalInteractions).toBe(baseSummary.totalInteractions);
    expect(result.current.pagination).toEqual(basePagination);
  });

  it("handles errors during fetch", async () => {
    getChatLogsMock.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useChatMetrics());
    await waitFor(() => expect(result.current.status).toBe("error"));

    expect(result.current.interactions).toEqual([]);
    expect(result.current.pagination).toBeNull();
  });
});

describe("useAdminChatMetrics hook", () => {
  beforeEach(() => {
    getAdminChatLogsMock.mockReset();
  });

  it("loads admin metrics and includes filtered user id", async () => {
    getAdminChatLogsMock.mockResolvedValue(adminResponse);
    const { result } = renderHook(() => useAdminChatMetrics());
    await waitFor(() => expect(result.current.status).toBe("ready"));

    expect(result.current.filteredUserId).toBe(adminResponse.filteredUserId);
    expect(result.current.interactions).toHaveLength(1);
    expect(result.current.interactions[0].userName).toBe("Admin");
  });
});
