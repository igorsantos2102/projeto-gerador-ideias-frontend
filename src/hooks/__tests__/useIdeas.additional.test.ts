import { describe, expect, it, vi } from "vitest";
import { fetchIdeasFromAPI, buildQuery } from "../useIdeas";
import { apiFetch } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const makeResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("useIdeas helpers", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("builds complex query strings", () => {
    const query = buildQuery({
      category: "negócios",
      startDate: "2025-04-01",
      endDate: "2025-04-02",
      page: 3,
      size: 15,
    });

    expect(query).toContain("theme=neg%C3%B3cios");
    expect(query).toContain("startDate=2025-04-01T00%3A00%3A00");
    expect(query).toContain("endDate=2025-04-02T23%3A59%3A59");
    expect(query).toContain("page=3");
    expect(query).toContain("size=15");
  });

  it("maps paginated responses to Idea list", async () => {
    const payload = {
      content: [
        {
          id: "idea-1",
          theme: "test",
          context: "ctx",
          content: '"quoted"',
          createdAt: "2025-01-01",
          executionTimeMs: "150",
          tokens: { total: 45 },
          isFavorite: true,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 1,
      number: 0,
    };

    apiFetchMock.mockResolvedValueOnce(makeResponse(payload));

    const result = await fetchIdeasFromAPI("foo=1");
    expect(Array.isArray(result)).toBe(false);
    expect((result as any).content).toHaveLength(1);
    const idea = (result as any).content[0];
    expect(idea.id).toBe("idea-1");
    expect(idea.context).toBe("ctx");
    expect(idea.tokens).toBe(45);
    expect(idea.responseTime).toBe(150);
    expect(apiFetchMock).toHaveBeenCalledWith("/api/ideas/history?foo=1", { signal: undefined });
  });

  it("handles array fallback responses", async () => {
    const fallback = { data: [{ id: 5, theme: "Community", content: "'content'", createdAt: "2025-02-02", executionTimeMs: 120 }] };
    apiFetchMock.mockResolvedValueOnce(makeResponse(fallback));

    const result = await fetchIdeasFromAPI("");
    expect(Array.isArray(result)).toBe(true);
    expect((result as any[])[0].theme).toBe("Community");
  });

  it("returns empty array for 404", async () => {
    apiFetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));
    const result = await fetchIdeasFromAPI("");
    expect(result).toEqual([]);
  });

  it("throws when response not ok", async () => {
    apiFetchMock.mockResolvedValueOnce(new Response("bad", { status: 500 }));
    await expect(fetchIdeasFromAPI("")).rejects.toThrow(/Erro 500/);
  });
});
