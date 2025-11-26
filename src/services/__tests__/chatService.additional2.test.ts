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

const makeResponse = (body: string, init: ResponseInit) =>
  new Response(body, {
    headers: { "Content-Type": "text/plain" },
    ...init,
  });

describe("chatService additional failure cases", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("throws spelling out backend message on getChatLogs failure", async () => {
    apiFetchMock.mockResolvedValueOnce(makeResponse("boom", { status: 500 }));
    await expect(chatService.getChatLogs()).rejects.toThrow("boom");
  });

  it("includes filters when calling getAdminChatLogs", async () => {
    const response = new Response(
      JSON.stringify({
        summary: { totalInteractions: 0, totalTokensInput: 0, totalTokensOutput: 0, averageResponseTimeMs: 0 },
        pagination: { totalElements: 0, totalPages: 0, currentPage: 0, hasNext: false, hasPrevious: false },
        interactions: [],
        filteredUserId: 2,
        selectedDate: "2025-01-01",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    apiFetchMock.mockResolvedValueOnce(response);

    const result = await chatService.getAdminChatLogs({ userId: 5, page: 2, size: 10, date: "2025-02-01" });

    expect(result.filteredUserId).toBe(2);
    expect(apiFetchMock).toHaveBeenCalled();
    expect(apiFetchMock.mock.calls[0][0]).toBe(
      "/api/chat/admin/logs?date=2025-02-01&userId=5&page=2&size=10"
    );
  });
});
