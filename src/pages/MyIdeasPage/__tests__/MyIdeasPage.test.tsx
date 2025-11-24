import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";

const mockUseIdeas = vi.fn();
vi.mock("@/hooks/useIdeas", () => ({
  useIdeas: (filters: any) => mockUseIdeas(filters),
}));

vi.mock("@/pages/History/favoritesCache", () => ({
  fetchFavoriteIds: vi.fn().mockResolvedValue(new Set()),
  updateFavoriteCache: vi.fn(),
}));

vi.mock("@/events/historyEvents", () => ({
  subscribeHistoryRefresh: vi.fn(() => () => {}),
}));

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

const MyIdeaCardMock = vi.fn(({ idea, onDelete }: any) => (
  <div data-testid={`my-card-${idea.id}`}>
    <p>{idea.content}</p>
    <button aria-label={`delete-${idea.id}`} onClick={() => onDelete?.(idea.id)}>
      Delete
    </button>
  </div>
));

vi.mock("@/components/IdeiaCard/MyIdeaCard", () => ({
  __esModule: true,
  default: (props: any) => MyIdeaCardMock(props),
}));

import MyIdeasPage from "../MyIdeasPage";

const makeIdea = (id: string): Idea => ({
  id,
  content: `Idea ${id}`,
  theme: "Teste",
  context: "X",
  timestamp: new Date(),
  isFavorite: false,
  responseTime: 100,
});

const pageData = (page: number) =>
  Array.from({ length: 5 }, (_, idx) =>
    makeIdea(String(page * 5 + idx + 1))
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockUseIdeas.mockReset();

  mockUseIdeas.mockReturnValue({
    data: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  });

  vi.spyOn(Storage.prototype, "getItem").mockReturnValue("token");
});

describe("MyIdeasPage", () => {
  it("mostra lista + paginação", async () => {
    const user = userEvent.setup();

    // 🔥 CARREGA 10 IDEIAS — paginação aparece
    mockUseIdeas.mockReturnValue({
      data: [...pageData(0), ...pageData(1)],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyIdeasPage />);

    await waitFor(() => {
      expect(screen.getByTestId("my-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("my-card-5")).toBeInTheDocument();
    });

    // Mock para página 2
    mockUseIdeas.mockImplementationOnce(() => ({
      data: pageData(1),
      loading: false,
      error: null,
      refetch: vi.fn(),
    }));

    const nextBtn = screen.getByRole("button", { name: "next-page" });
    await user.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByTestId("my-card-6")).toBeInTheDocument();
      expect(screen.getByTestId("my-card-10")).toBeInTheDocument();
    });
  });

  it("remove ideia", async () => {
    mockUseIdeas.mockReturnValue({
      data: pageData(0),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyIdeasPage />);

    await screen.findByTestId("my-card-1");

    await userEvent.click(screen.getByRole("button", { name: "delete-1" }));

    await waitFor(() =>
      expect(screen.queryByTestId("my-card-1")).not.toBeInTheDocument()
    );
  });

  it("estado vazio", async () => {
    mockUseIdeas.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyIdeasPage />);

    await waitFor(() =>
      expect(screen.getByText(/Nenhuma ideia encontrada/i)).toBeInTheDocument()
    );
  });
});
