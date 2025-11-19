import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { handleLogout, useLogout } from "../auth"
import { authService } from "@/services/authService"

vi.mock("@/services/authService", () => ({
  authService: {
    logout: vi.fn(),
  },
}))

const navigateMock = vi.fn()

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}))

describe("auth helpers", () => {
  const originalLocation = window.location

  const mockLocation = (path: string) => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: path,
        pathname: path,
      },
    })
  }

  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  it("calls logout with stored refresh token and redirects", async () => {
    const logoutMock = vi.mocked(authService.logout)
    logoutMock.mockResolvedValueOnce(undefined)

    localStorage.setItem("refresh_token", "refresh")
    localStorage.setItem("auth_token", "access")
    localStorage.setItem("user", JSON.stringify({ name: "x" }))
    mockLocation("/dashboard")

    await handleLogout()

    expect(logoutMock).toHaveBeenCalledWith("refresh")
    expect(localStorage.getItem("user")).toBeNull()
    expect(localStorage.getItem("auth_token")).toBeNull()
    expect(window.location.href).toBe("/login")
  })

  it("returns a hook that logs out and navigates to login", async () => {
    const logoutMock = vi.mocked(authService.logout)
    logoutMock.mockResolvedValueOnce(undefined)

    localStorage.setItem("refresh_token", "ref-token")
    localStorage.setItem("auth_token", "auth-token")
    localStorage.setItem("user", "someone")

    const { result } = renderHook(() => useLogout())

    await act(async () => {
      await result.current()
    })

    expect(navigateMock).toHaveBeenCalledWith("/login")
    expect(localStorage.getItem("user")).toBeNull()
    expect(localStorage.getItem("auth_token")).toBeNull()
  })
})
