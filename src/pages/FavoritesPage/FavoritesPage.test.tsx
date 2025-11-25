import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FavoritesPage from "./FavoritesPage";

const getFavoritesMock = vi.fn();
const removeFavoriteMock = vi.fn();

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ darkMode: false }),
}));

vi.mock("@/services/favoriteService", () => ({
  favoriteService: {
    getFavorites: () => getFavoritesMock(),
    removeFavorite: (id: string) => removeFavoriteMock(id),
  },
}));

vi.mock("@/components/IdeiaCard/FavoriteCard", () => ({
  __esModule: true,
  default: ({ idea, onToggleFavorite }: { idea: { id: string; content: string }; onToggleFavorite?: (id: string) => void }) => (
    <div data-testid={`favorite-${idea.id}`}>
      <span>{idea.content}</span>
      <button data-testid={`remove-${idea.id}`} onClick={() => onToggleFavorite?.(idea.id)}>
        Remove
      </button>
    </div>
  ),
}));

describe("FavoritesPage", () => {
  beforeEach(() => {
    getFavoritesMock.mockReset();
    removeFavoriteMock.mockReset();
  });

  it("renders favorite ideas and allows unfavoriting", async () => {
    getFavoritesMock.mockResolvedValue([
      {
        id: "idea-1",
        theme: "Tema",
        context: "Contexto",
        content: "Primeira ideia",
        timestamp: new Date("2025-01-01"),
        isFavorite: true,
      },
      {
        id: "idea-2",
        theme: "Outro tema",
        context: "Outro contexto",
        content: "Segunda ideia",
        timestamp: new Date("2025-01-02"),
        isFavorite: true,
      },
    ]);

    removeFavoriteMock.mockResolvedValue(undefined);

    render(<FavoritesPage />);

    await waitFor(() =>
      expect(screen.getByTestId("favorite-idea-1")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("remove-idea-1"));

    await waitFor(() => expect(removeFavoriteMock).toHaveBeenCalledWith("idea-1"));
    expect(screen.queryByTestId("favorite-idea-1")).toBeNull();
  });

  it("renders empty state when there are no favorites", async () => {
    getFavoritesMock.mockResolvedValue([]);

    render(<FavoritesPage />);

    await waitFor(() =>
      expect(screen.getByText(/Nenhuma ideia favorita ainda/i)).toBeInTheDocument()
    );
  });
});
