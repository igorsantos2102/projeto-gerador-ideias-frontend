import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme } from "@/hooks/useTheme";

function StatusIndicator() {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <>
      <span data-testid="dark-mode">{darkMode ? "true" : "false"}</span>
      <button type="button" onClick={toggleDarkMode}>
        Toggle
      </button>
    </>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("honors stored preference", async () => {
    localStorage.setItem("darkMode", "true");
    render(
      <ThemeProvider>
        <StatusIndicator />
      </ThemeProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("dark-mode")).toHaveTextContent("true")
    );
  });

  it("toggles state and syncs with localStorage", async () => {
    render(
      <ThemeProvider>
        <StatusIndicator />
      </ThemeProvider>
    );

    const button = screen.getByRole("button", { name: /toggle/i });
    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByTestId("dark-mode")).toHaveTextContent("true")
    );
    expect(localStorage.getItem("darkMode")).toBe("true");

    fireEvent.click(button);
    await waitFor(() =>
      expect(screen.getByTestId("dark-mode")).toHaveTextContent("false")
    );
    expect(localStorage.getItem("darkMode")).toBe("false");
  });
});
