import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, API_BASE_URL } from "../api";

const makeResponse = (body: string | Record<string, unknown>, init: ResponseInit = { status: 200 }) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), {
    headers: { "Content-Type": typeof body === "string" ? "text/plain" : "application/json" },
    ...init,
  });

describe("apiFetch", () => {
  const fetchMock = vi.fn();
  const originalFetch = globalThis.fetch;
  const storage = new Map<string, string | null>();

  const localStorageStub: Partial<Storage> = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  };

  beforeEach(() => {
    storage.clear();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("localStorage", localStorageStub as Storage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", originalFetch);
  });

  it("adds Authorization header when token configured", async () => {
    storage.set("auth_token", "token-123");
    fetchMock.mockResolvedValueOnce(makeResponse({ ok: true }));

    await apiFetch("/foo");

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE_URL}/foo`);
    expect(fetchMock.mock.calls[0][1].headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("retries with refreshed token on 401", async () => {
    storage.set("auth_token", "old-token");
    storage.set("refresh_token", "refresh-old");

    const initialResponse = makeResponse("", { status: 401 });
    const refreshResponse = new Response(
      JSON.stringify({ accessToken: "new-token", refreshToken: "refresh-new" }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
    const successResponse = makeResponse({ data: "ok" });

    fetchMock
      .mockResolvedValueOnce(initialResponse)
      .mockResolvedValueOnce(refreshResponse)
      .mockResolvedValueOnce(successResponse);

    const result = await apiFetch("/protected");

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const refreshCall = fetchMock.mock.calls[1][0];
    expect(refreshCall).toContain("/api/auth/refresh");
    expect(result).toBe(successResponse);
  });
});
