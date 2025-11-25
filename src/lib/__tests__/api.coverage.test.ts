import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../api";

const makeResponse = (body: unknown, status = 200) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("apiFetch extra branches", () => {
  const fetchMock = vi.fn();
  const storage = new Map<string, string | null>();
  const originalFetch = globalThis.fetch;
  const originalLocation = globalThis.location;

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
    Object.defineProperty(globalThis, "location", {
      value: { pathname: "/dashboard", href: "" },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", originalFetch);
    Object.defineProperty(globalThis, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("redireciona para login quando 401 sem token", async () => {
    fetchMock.mockResolvedValueOnce(makeResponse("", 401));

    const result = await apiFetch("/secure");

    expect(result.status).toBe(401);
    expect((globalThis.location as any).href).toBe("/login");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("limpa tokens e redireciona se refresh falha", async () => {
    storage.set("auth_token", "old");
    storage.set("refresh_token", "refresh-old");

    fetchMock
      .mockResolvedValueOnce(makeResponse("", 401)) // primeira tentativa
      .mockResolvedValueOnce(makeResponse({ error: "denied" }, 401)); // refresh falha

    const result = await apiFetch("/secure");

    expect(result.status).toBe(401);
    expect(storage.get("auth_token")).toBeUndefined();
    expect(storage.get("refresh_token")).toBeUndefined();
    expect((globalThis.location as any).href).toBe("/login");
  });
});
