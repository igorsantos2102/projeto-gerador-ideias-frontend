import { describe, expect, it, vi, beforeEach } from "vitest";
import { chatService } from "../chatService";
import { apiFetch } from "@/lib/api";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

const apiFetchMock = vi.mocked(apiFetch);

function makeResponse(body: unknown, status = 200) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("chatService extended coverage", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost" },
      writable: true,
    });
  });

  it("formats older messages query and returns messages", async () => {
    const payload = {
      messages: [{ id: "1", role: "assistant", content: "ok", createdAt: "2025-01-01T00:00:00Z" }],
      hasMore: true,
    };
    apiFetchMock.mockResolvedValueOnce(makeResponse(payload));

    const result = await chatService.getOlderMessages(10, "2025-02-01T00:00:00Z", 15);
    expect(apiFetchMock.mock.calls[0][0]).toContain("/api/chat/sessions/10/messages");
    expect(apiFetchMock.mock.calls[0][0]).toContain("before=2025-02-01T00%3A00%3A00Z");
    expect(apiFetchMock.mock.calls[0][0]).toContain("limit=15");
    expect(result.hasMore).toBe(true);
  });

  it("throws when getOlderMessages fails", async () => {
    apiFetchMock.mockResolvedValueOnce(new Response("boom", { status: 500 }));
    await expect(chatService.getOlderMessages(1, "now")).rejects.toThrow("Erro");
  });

  it("throws when getChatLogs returns json error", async () => {
    apiFetchMock.mockResolvedValueOnce(makeResponse("error", 400));
    await expect(chatService.getChatLogs()).rejects.toThrow(/Erro 400/);
  });

  it("applies filters on getAdminChatLogs", async () => {
    const payload = {
      filteredUserId: 10,
      summary: {
        totalInteractions: 0,
        totalTokensInput: 0,
        totalTokensOutput: 0,
        averageResponseTimeMs: 0,
      },
      pagination: {
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        hasNext: false,
        hasPrevious: false,
      },
      interactions: [],
    };
    apiFetchMock.mockResolvedValueOnce(makeResponse(payload));

    const result = await chatService.getAdminChatLogs({ date: "2025-03-01", userId: 7, page: 2, size: 5 });
    expect(apiFetchMock.mock.calls[0][0]).toContain("date=2025-03-01");
    expect(apiFetchMock.mock.calls[0][0]).toContain("userId=7");
    expect(apiFetchMock.mock.calls[0][0]).toContain("page=2");
    expect(result.filteredUserId).toEqual(10);
  });
});
