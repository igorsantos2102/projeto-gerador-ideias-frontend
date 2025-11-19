import { describe, expect, it, beforeEach, afterEach, vi } from "vitest"
import {
  apiFetch,
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "../api"

type MockResponse = Partial<Response>

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>

const createResponse = (overrides: MockResponse = {}): Response =>
  ({
    ok: overrides.ok ?? true,
    status: overrides.status ?? 200,
    json: overrides.json ?? vi.fn(async () => ({})),
    text: overrides.text ?? vi.fn(async () => ""),
  } as unknown as Response)

describe("api helpers", () => {
  const originalFetch = global.fetch
  const originalLocation = window.location

  const mockLocation = (uri: string) => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: uri,
        pathname: uri,
      },
    })
  }

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.resetAllMocks()
    global.fetch = originalFetch
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  it("returns null when storage access throws", () => {
    const spy = vi
      .spyOn(window.localStorage, "getItem")
      .mockImplementation(() => {
        throw new Error("fail")
      })

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()

    spy.mockRestore()
  })

  it("stores and clears tokens via helpers", () => {
    setAccessToken("access")
    setRefreshToken("refresh")

    expect(localStorage.getItem("auth_token")).toBe("access")
    expect(localStorage.getItem("refresh_token")).toBe("refresh")

    clearAuthTokens()

    expect(localStorage.getItem("auth_token")).toBeNull()
    expect(localStorage.getItem("refresh_token")).toBeNull()
  })

  it("adds authorization header when token is present", async () => {
    localStorage.setItem("auth_token", "user-token")
    const fetchMock = vi.fn().mockResolvedValue(createResponse())
    global.fetch = fetchMock

    const response = await apiFetch("/api/test")

    expect(response).toBeDefined()
    const [, options] = fetchMock.mock.calls[0]
    const headers = options?.headers as Headers
    expect(headers.get("Authorization")).toBe("Bearer user-token")
    expect(headers.get("Accept")).toBe("application/json")
  })

  it("refreshes token on 401 and retries request", async () => {
    localStorage.setItem("auth_token", "old-token")
    localStorage.setItem("refresh_token", "old-refresh")

    const firstResponse = createResponse({ ok: false, status: 401 })
    const refreshResponse = createResponse({
      status: 200,
      json: vi.fn(async () => ({
        accessToken: "new-token",
        refreshToken: "new-refresh",
      })),
    })
    const retriedResponse = createResponse({ status: 200 })

    const fetchMock = vi.fn<FetchFn>()
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce(refreshResponse)
      .mockResolvedValueOnce(retriedResponse)

    global.fetch = fetchMock

    const result = await apiFetch("/api/chat")

    expect(result).toBe(retriedResponse)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(localStorage.getItem("auth_token")).toBe("new-token")
    expect(localStorage.getItem("refresh_token")).toBe("new-refresh")
    const retriedOptions = fetchMock.mock.calls[2][1]
    const restrictedHeaders = retriedOptions?.headers as Headers
    expect(restrictedHeaders.get("Authorization")).toBe("Bearer new-token")
  })

  it("clears tokens and redirects when refresh fails", async () => {
    localStorage.setItem("auth_token", "token")
    localStorage.setItem("refresh_token", "refresh")
    mockLocation("/dashboard")

    const unauthorized = createResponse({ ok: false, status: 401 })
    const refreshFailure = createResponse({ ok: false, status: 401 })

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(unauthorized)
      .mockResolvedValueOnce(refreshFailure)

    await apiFetch("/api/secret")

    expect(localStorage.getItem("auth_token")).toBeNull()
    expect(localStorage.getItem("refresh_token")).toBeNull()
    expect(window.location.href).toBe("/login")
  })

  it("redirects when server returns 401 and no token is stored", async () => {
    mockLocation("/app")
    global.fetch = vi.fn().mockResolvedValue(createResponse({ ok: false, status: 401 }))

    await apiFetch("/api/public")

    expect(window.location.href).toBe("/login")
  })
})
