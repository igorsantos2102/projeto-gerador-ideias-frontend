import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { prefetchIdeas, useIdeas } from "./useIdeas";

const apiFetchMock = vi.fn();

vi.mock("@/lib/api", () => ({
  apiFetch: (...args: any[]) => apiFetchMock(...args),
}));

const createResponse = (status: number, payload?: unknown) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => payload,
  text: async () =>
    typeof payload === "string" ? payload : JSON.stringify(payload),
});

const paginatedPayload = {
  content: [
    {
      id: "idea-1",
      theme: "Tecnologia",
      content: "Ideia A",
      context: "Contexto A",
      timestamp: "2025-01-01T00:00:00Z",
      isFavorite: true,
      executionTimeMs: 120,
      tokens: 40,
      author: "Usuário",
      modelUsed: "gpt-test",
    },
  ],
  totalElements: 1,
  totalPages: 1,
  size: 1,
  number: 0,
};

const communityPayload = {
  id: "idea-2",
  theme: "  SUSTENTABILIDADE ",
  content: '"Conteúdo seguro"',
  context: "'Testando contexto'",
  created_at: "2025-05-01",
  execution_time_ms: "150",
  tokens: { total: 55 },
  userName: "  Participante  ",
  model: " model-xyz ",
};

describe("useIdeas hook", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("fetches paginated responses", async () => {
    apiFetchMock.mockResolvedValue(createResponse(200, paginatedPayload));
    const { result } = renderHook(() => useIdeas({ category: "tech", page: 1 }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const data = result.current.data as {
      content: Array<{ theme: string; responseTime?: number; timestamp: Date }>;
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    };

    expect(data.content).toHaveLength(1);
    expect(data.content[0].theme).toBe("Tecnologia");
    expect(data.content[0].responseTime).toBe(120);
    expect(data.totalElements).toBe(1);
    expect(data.size).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it("converts array payloads into idea list", async () => {
    const wrappedPayload = { data: [communityPayload] };
    apiFetchMock.mockResolvedValue(createResponse(200, wrappedPayload));
    const { result } = renderHook(() => useIdeas({ category: "sustainability" }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(Array.isArray(result.current.data)).toBe(true);
    const idea = (result.current.data as unknown[])[0] as {
      theme: string;
      context: string;
      content: string;
      author?: string;
      responseTime?: number;
      tokens?: number;
      modelUsed?: string;
    };
    expect(idea.theme).toBe("Sustentabilidade");
    expect(idea.context).toBe("Testando contexto");
    expect(idea.content).toBe("Conteúdo seguro");
    expect(idea.author).toBe("Participante");
    expect(idea.responseTime).toBe(150);
    expect(idea.tokens).toBe(55);
    expect(idea.modelUsed).toBe("model-xyz");
  });

  it("returns empty when server replies 404", async () => {
    apiFetchMock.mockResolvedValue(createResponse(404, null));
    const { result } = renderHook(() => useIdeas({}));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
  });
});

describe("prefetchIdeas helper", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("builds the query string correctly", async () => {
    apiFetchMock.mockResolvedValue(createResponse(200, []));

    const filters = {
      category: "negócios",
      startDate: "2025-04-01",
      endDate: "2025-04-02",
      page: 2,
      size: 15,
    };

    await prefetchIdeas(filters);

    expect(apiFetchMock).toHaveBeenCalled();
    const url = apiFetchMock.mock.calls[0][0] as string;
    const parsed = new URL(url, "http://localhost");

    expect(parsed.pathname).toBe("/api/ideas/history");
    expect(parsed.searchParams.get("theme")).toBe("negócios");
    expect(parsed.searchParams.get("startDate")).toBe("2025-04-01T00:00:00");
    expect(parsed.searchParams.get("endDate")).toBe("2025-04-02T23:59:59");
    expect(parsed.searchParams.get("page")).toBe("2");
    expect(parsed.searchParams.get("size")).toBe("15");
  });
});
