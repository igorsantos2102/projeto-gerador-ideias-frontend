import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HistoryPage from "../History";
import { ideaService } from "@/services/ideaService";
import { useIdeas } from "@/hooks/useIdeas";
import FilterHistory from "@/components/FilterHistory";
import { renderWithProviders } from "@/test/test-utils";

vi.mock('@/hooks/useIdeas', () => ({
  useIdeas: vi.fn(),
}));

vi.mock('@/components/IdeiaCard/CommunityIdeaCard', () => ({
  __esModule: true,
  default: ({ idea, onToggleFavorite }: any) => (
    <button
      data-testid={`idea-${idea.id}`}
      data-favorite={idea.isFavorite ? "true" : "false"}
      onClick={() => onToggleFavorite?.(idea.id)}
    >
      {idea.content}
    </button>
  ),
}));

vi.mock("@/components/FilterHistory", () => ({
  __esModule: true,
  default: ({ onChange, onClear }: any) => (
    <div>
      <button data-testid="filter-change" onClick={() => onChange({ category: "tech" })}>change</button>
      <button data-testid="filter-clear" onClick={onClear}>clear</button>
    </div>
  ),
}));

vi.mock("@/services/ideaService", () => ({
  ideaService: {
    getFavorites: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}));

vi.mock("@/lib/themeOptions", () => ({
  FALLBACK_THEME_OPTIONS: [],
  loadThemeOptions: vi.fn().mockResolvedValue([]),
}));

const useIdeasMock = vi.mocked(useIdeas);
const ideaServiceMock = vi.mocked(ideaService);

const mockIdea = {
  id: "idea-1",
  theme: "Theme",
  content: "Conteúdo",
  timestamp: new Date(),
  isFavorite: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  ideaServiceMock.getFavorites.mockResolvedValue([mockIdea]);
  ideaServiceMock.toggleFavorite.mockResolvedValue(undefined);
  useIdeasMock.mockReturnValue({
    data: {
      content: [mockIdea],
      totalElements: 1,
      totalPages: 1,
      size: 1,
      number: 0,
    },
    loading: false,
    refetch: vi.fn(),
    error: null,
  });
});

describe("HistoryPage", () => {
  it("shows loading state", () => {
    useIdeasMock.mockReturnValueOnce({
      data: null,
      loading: true,
      refetch: vi.fn(),
      error: null,
    });

    renderWithProviders(<HistoryPage />);
    expect(screen.getByText(/Carregando ideias da comunidade/i)).toBeInTheDocument();
  });

  it("renders ideas and toggles favorite", async () => {
    const refetch = vi.fn();
    useIdeasMock.mockReturnValue({
      data: {
        content: [
          { ...mockIdea, id: "idea-1" },
          { ...mockIdea, id: "idea-2" },
        ],
        totalElements: 2,
        totalPages: 1,
        size: 2,
        number: 0,
      },
      loading: false,
      refetch,
      error: null,
    });

    renderWithProviders(<HistoryPage />);

    const ideaButton = await screen.findByTestId("idea-idea-1");
    expect(ideaButton).toBeInTheDocument();

    await userEvent.click(ideaButton);
    expect(ideaServiceMock.toggleFavorite).toHaveBeenCalledWith("idea-1", false);
    await vi.waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it("reverte favorito quando API falha", async () => {
    const refetch = vi.fn();
    ideaServiceMock.getFavorites.mockResolvedValueOnce([]);
    useIdeasMock.mockReturnValue({
      data: {
        content: [{ ...mockIdea, id: "idea-1", isFavorite: false }],
        totalElements: 1,
        totalPages: 1,
        size: 1,
        number: 0,
      },
      loading: false,
      refetch,
      error: null,
    });
    ideaServiceMock.toggleFavorite.mockRejectedValueOnce(new Error("oops"));

    renderWithProviders(<HistoryPage />);

    const ideaButton = await screen.findByTestId("idea-idea-1");
    expect(ideaButton).toHaveAttribute("data-favorite", "false");

    await userEvent.click(ideaButton);
    await vi.waitFor(() => expect(ideaServiceMock.toggleFavorite).toHaveBeenCalled());
    await vi.waitFor(() => expect(ideaButton).toHaveAttribute("data-favorite", "false"));
    expect(refetch).not.toHaveBeenCalled();
  });

  it("paginates between pages", async () => {
    const refetch = vi.fn();
    useIdeasMock.mockImplementation(({ page }) => ({
      data: {
        content: [{ ...mockIdea, id: `idea-${page}-1` }],
        totalElements: 18,
        totalPages: 3,
        size: 6,
        number: page ?? 0,
      },
      loading: false,
      refetch,
      error: null,
    }));

    renderWithProviders(<HistoryPage />);

    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
    const nextBtn = screen.getByLabelText(/Proxima pagina/i);
    await userEvent.click(nextBtn);
    await vi.waitFor(() => expect(useIdeasMock).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 })));
    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();
  });

  it("allows filtering and clearing", async () => {
    renderWithProviders(<HistoryPage />);
    await userEvent.click(screen.getByTestId("filter-change"));
    await userEvent.click(screen.getByTestId("filter-clear"));
    expect(useIdeasMock).toHaveBeenCalled();
  });
});
