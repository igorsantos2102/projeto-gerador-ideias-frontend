import { screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./test-utils";
import { useTheme } from "@/hooks/useTheme";

function ThemeConsumer() {
  const { darkMode } = useTheme();
  return <span data-testid="dark-mode">{darkMode ? "dark" : "light"}</span>;
}

function LocationConsumer() {
  const location = useLocation();
  return <span data-testid="route">{location.pathname}</span>;
}

describe("renderWithProviders", () => {
  it("provides theme context and router location", () => {
    renderWithProviders(
      <>
        <ThemeConsumer />
        <LocationConsumer />
      </>,
      { route: "/favorites" }
    );

    expect(screen.getByTestId("dark-mode")).toHaveTextContent("light");
    expect(screen.getByTestId("route")).toHaveTextContent("/favorites");
  });
});
