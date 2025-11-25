import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppRoutes from "./index";

function stubFactory(id: string, text: string) {
  return () => <div data-testid={id}>{text}</div>;
}

vi.mock("@/layouts/PublicLayout", () => ({
  PublicLayout: () => (
    <div data-testid="public-layout">
      <Outlet />
    </div>
  ),
}));

vi.mock("@/layouts/PrivateLayout", () => ({
  PrivateLayout: () => (
    <div data-testid="private-layout">
      <Outlet />
    </div>
  ),
}));

vi.mock("@/pages/LandingPage/LandingPage", () => ({
  LandingPage: stubFactory("landing", "Landing"),
}));

vi.mock("@/pages/Login/LoginPage", () => ({
  LoginPage: stubFactory("login", "Login"),
}));

vi.mock("@/pages/Register/Register", () => ({
  RegisterPage: stubFactory("register", "Register"),
}));

vi.mock("@/pages/GeneratorPage/GeneratorPage", () => ({
  GeneratorPage: stubFactory("generator", "Generator"),
}));

vi.mock("@/pages/History/History", () => ({
  default: stubFactory("history", "History"),
}));

vi.mock("@/pages/FavoritesPage/FavoritesPage", () => ({
  default: stubFactory("favorites", "Favorites"),
}));

vi.mock("@/pages/DashboardPage/DashboardPage", () => ({
  default: stubFactory("dashboard", "Dashboard"),
}));

vi.mock("@/pages/ChatMetricsPage/ChatMetricsGate", () => ({
  ChatMetricsGate: stubFactory("chat-metrics", "Chat Metrics"),
}));

vi.mock("@/pages/MyIdeasPage/MyIdeasPage", () => ({
  default: stubFactory("my-ideas", "My Ideas"),
}));

describe("AppRoutes", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders the landing page via the public layout", () => {
    window.history.pushState({}, "", "/");
    render(<AppRoutes />);
    expect(screen.getByTestId("landing")).toHaveTextContent("Landing");
    expect(screen.getByTestId("public-layout")).toBeInTheDocument();
  });

  it("renders a private page when navigating to a protected route", () => {
    window.history.pushState({}, "", "/favorites");
    render(<AppRoutes />);
    expect(screen.getByTestId("favorites")).toHaveTextContent("Favorites");
    expect(screen.getByTestId("private-layout")).toBeInTheDocument();
  });
});
