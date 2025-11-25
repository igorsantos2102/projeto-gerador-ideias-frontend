import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import App from "../App"

vi.mock("@/routes", () => ({
  __esModule: true,
  default: () => <div data-testid="app-routes">rotas carregadas</div>,
}))

describe("App", () => {
  it("renders the routing layer", () => {
    render(<App />)
    expect(screen.getByTestId("app-routes")).toHaveTextContent("rotas carregadas")
  })
})
