import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { PasswordToggle } from "../PasswordToggle"

describe("PasswordToggle", () => {
  it("renders the visible icon when the value is true", () => {
    const onToggle = vi.fn()
    const { container } = render(
      <PasswordToggle visible onToggle={onToggle} className="extra-class" />
    )

    const firstPath = container.querySelector("path")
    expect(firstPath).toHaveAttribute("d", expect.stringContaining("M15 12a3 3 0 11-6 0 3 3 0 016 0z"))

    const button = screen.getByRole("button")
    expect(button).toHaveClass("extra-class")

    fireEvent.click(button)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it("renders the hidden icon when visible is false", () => {
    render(<PasswordToggle visible={false} onToggle={vi.fn()} />)

    const firstPath = screen.getByRole("button").querySelector("path")
    expect(firstPath).toHaveAttribute("d", expect.stringContaining("M13.875 18.825A10.05 10.05 0 0112 19"))
  })
})
