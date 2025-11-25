import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import Pagination from "../Pagination"

describe("Pagination", () => {
  it("does not render when there is a single page", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={1}
        hasNext={false}
        hasPrevious={false}
        onPageChange={vi.fn()}
      />
    )

    expect(screen.queryByRole("navigation")).toBeNull()
  })

  it("calls onPageChange for each navigation button", () => {
    const handleChange = vi.fn()

    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        hasNext
        hasPrevious
        onPageChange={handleChange}
      />
    )

    const buttons = screen.getAllByRole("button")

    fireEvent.click(buttons[0]) // first page
    fireEvent.click(buttons[1]) // previous page
    fireEvent.click(buttons[2]) // next page
    fireEvent.click(buttons[3]) // last page

    expect(handleChange).toHaveBeenNthCalledWith(1, 1)
    expect(handleChange).toHaveBeenNthCalledWith(2, 1)
    expect(handleChange).toHaveBeenNthCalledWith(3, 3)
    expect(handleChange).toHaveBeenNthCalledWith(4, 5)
  })

  it("disables navigation buttons when there are no next or previous pages", () => {
    const handleChange = vi.fn()

    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        hasNext={false}
        hasPrevious={false}
        onPageChange={handleChange}
      />
    )

    const buttons = screen.getAllByRole("button")

    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
      fireEvent.click(btn)
    })

    expect(handleChange).not.toHaveBeenCalled()
  })

  it("applies dark mode classes when requested", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={4}
        hasNext
        hasPrevious={false}
        onPageChange={vi.fn()}
        darkMode
      />
    )

    const nav = screen.getByRole("navigation")
    expect(nav).toHaveClass("bg-slate-900")
  })
})
