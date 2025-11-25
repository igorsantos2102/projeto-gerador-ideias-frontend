import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const navigateMock = vi.fn();
const isAuthenticatedMock = vi.fn();

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ darkMode: false }),
}));

vi.mock("@/lib/api", () => ({
  isAuthenticated: () => isAuthenticatedMock(),
}));

vi.mock("@/components/Header/AppHeader", () => ({
  AppHeader: () => <div data-testid="app-header" />,
}));

vi.mock("@/components/Footer/AppFooter", () => ({
  AppFooter: () => <div data-testid="app-footer" />,
}));

vi.mock("react-router-dom", async () => {
  const actual = (await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  )) as typeof import("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import { PrivateLayout } from "./PrivateLayout";

describe("PrivateLayout", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    isAuthenticatedMock.mockReset();
  });

  it("redirects to login when user is not authenticated", async () => {
    isAuthenticatedMock.mockReturnValue(false);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<div data-testid="outlet">Private</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true })
    );
  });

  it("renders children when authenticated", async () => {
    isAuthenticatedMock.mockReturnValue(true);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PrivateLayout />}>
            <Route path="/" element={<div data-testid="outlet">Private</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByTestId("outlet")).toHaveTextContent("Private")
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
