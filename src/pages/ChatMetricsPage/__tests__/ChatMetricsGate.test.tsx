import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { ChatMetricsGate } from "../ChatMetricsGate"

const getUserRoleMock = vi.fn()
const checkAdminAccessMock = vi.fn()

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ darkMode: false }),
}))

vi.mock("@/lib/jwt", () => ({
  getUserRole: () => getUserRoleMock(),
  checkAdminAccess: () => checkAdminAccessMock(),
}))

vi.mock("../AdminChatMetricsPage", () => ({
  AdminChatMetricsPage: () => <div>Admin Metrics</div>,
}))

vi.mock("../UserChatMetricPage", () => ({
  UserChatMetricsPage: () => <div>User Metrics</div>,
}))

describe("ChatMetricsGate", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("shows the loading placeholder while resolving role", () => {
    getUserRoleMock.mockReturnValue(new Promise(() => {}))
    render(<ChatMetricsGate />)

    expect(screen.getByText(/Verificando permissões/i)).toBeInTheDocument()
  })

  it("renders admin page when the role resolves to ADMIN", async () => {
    getUserRoleMock.mockResolvedValue("ADMIN")
    render(<ChatMetricsGate />)

    expect(await screen.findByText("Admin Metrics")).toBeInTheDocument()
    expect(checkAdminAccessMock).not.toHaveBeenCalled()
  })

  it("falls back to user page when role is not admin", async () => {
    getUserRoleMock.mockResolvedValue("USER")
    checkAdminAccessMock.mockResolvedValue(false)

    render(<ChatMetricsGate />)

    expect(await screen.findByText("User Metrics")).toBeInTheDocument()
    expect(checkAdminAccessMock).toHaveBeenCalled()
  })
})
