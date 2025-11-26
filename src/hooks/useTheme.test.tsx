import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@/context/ThemeProvider";
import { useTheme } from "./useTheme";

describe("useTheme", () => {
  it("throws when used outside ThemeProvider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      /useTheme must be used inside ThemeProvider/
    );
  });

  it("provides context when inside ThemeProvider", () => {
    const wrapper = ({ children }: { children?: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current).toHaveProperty("darkMode");
    expect(result.current.toggleDarkMode).toBeTypeOf("function");
  });
});
