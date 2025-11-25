import { describe, expect, it, vi, beforeEach } from "vitest";
import { ideaService } from "../ideaService";
import { apiFetch } from "@/lib/api";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

const apiFetchMock = vi.mocked(apiFetch);

const makeResponse = (body: string | Record<string, unknown>, init: ResponseInit = { status: 200 }) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), {
    headers: typeof body === "string" ? { "Content-Type": "text/plain" } : { "Content-Type": "application/json" },
    ...init,
  });

describe("ideaService additional coverage", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("builds the query string and maps payload when fetching my ideas", async () => {
    const mockPayload = {
      content: [
        {
          id: "idea-42",
          theme: "Tecnologia",
          content: "Ideia teste",
          createdAt: "2025-01-01T00:00:00Z",
          executionTimeMs: 123,
          context: "Contexto",
          isFavorite: false,
          metrics: undefined,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 5,
      number: 2,
    };

    apiFetchMock.mockResolvedValueOnce(makeResponse(mockPayload));

    const result = await ideaService.getMyIdeas(2, 5, {
      category: "tech",
      startDate: "2025-01-01",
      endDate: "2025-01-02",
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/ideas/my-ideas?page=2&size=5&theme=tech&startDate=2025-01-01T00%3A00%3A00&endDate=2025-01-02T23%3A59%3A59"
    );

    expect(result.content).toHaveLength(1);
    expect(result.content[0].id).toBe("idea-42");
    expect(result.totalPages).toBe(1);
  });

  it("throws when the backend returns a non-ok status while fetching my ideas", async () => {
    apiFetchMock.mockResolvedValueOnce(makeResponse("boom", { status: 500 }));

    await expect(ideaService.getMyIdeas(1, 10)).rejects.toThrow(
      "Erro ao carregar minhas ideias: boom"
    );
  });
});
