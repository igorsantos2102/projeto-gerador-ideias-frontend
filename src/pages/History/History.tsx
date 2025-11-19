import { useCallback, useEffect, useState } from "react";
import FilterHistory from "@/components/FilterHistory";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import CommunityIdeaCard, { type CommunityIdea } from "@/components/IdeiaCard/CommunityIdeaCard";
import { ideaService } from "@/services/ideaService";
import { fetchFavoriteIds, resetFavoritesCache } from "./favoritesCache";
import { subscribeHistoryRefresh } from "@/events/historyEvents";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type Filters = {
  category: string;
  startDate: string;
  endDate: string;
};

export default function HistoryPage() {
  const { darkMode } = useTheme();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filters, setFilters] = useState<Filters>({
    category: "",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const pageSize = 6;

  /** 🔄 Converte Idea → CommunityIdea */
  const toCommunityIdea = (idea: Idea): CommunityIdea => ({
    ...idea,
    author: idea.author?.trim() || "Participante desconhecido",
  });

  const loadIdeas = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);

    try {
      const result = await ideaService.getCommunityIdeas({
        category: filters.category,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page,
        size: pageSize,
      });

      const favoriteIds = await fetchFavoriteIds();

      setIdeas(
        result.content.map((idea) => ({
          ...idea,
          isFavorite: favoriteIds.has(idea.id),
        }))
      );

      setTotalPages(result.totalPages);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [filters, page]);

  /** Atualiza quando filtros ou página mudam */
  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  /** Atualiza quando evento global de refresh é disparado */
  useEffect(() => {
    const unsub = subscribeHistoryRefresh(() => loadIdeas({ silent: true }));
    return unsub;
  }, [loadIdeas]);

  /** Ao voltar para aba → refaz favoritos + refetch */
  useEffect(() => {
    const onFocus = () => {
      resetFavoritesCache();
      loadIdeas({ silent: true });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadIdeas]);

  /** ❤️ Favoritar / desfavoritar */
  const toggleFavorite = async (id: string) => {
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, isFavorite: !i.isFavorite } : i
      )
    );

    try {
      const idea = ideas.find((i) => i.id === id);
      if (!idea) return;

      await ideaService.toggleFavorite(id, !idea.isFavorite);

      resetFavoritesCache();
      loadIdeas({ silent: true });
    } catch {
      // Reverte se erro
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, isFavorite: !i.isFavorite } : i
        )
      );
    }
  };

  return (
    <div
      className={cn(
        "max-w-7xl mx-auto px-8 py-12",
        darkMode ? "text-slate-100" : "text-gray-900"
      )}
    >
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <FilterHistory
          value={filters}
          onChange={(next) => {
            setFilters({
              category: next.category ?? "",
              startDate: next.startDate ?? "",
              endDate: next.endDate ?? "",
            });
            setPage(0);
          }}
          onClear={() => {
            setFilters({ category: "", startDate: "", endDate: "" });
            setPage(0);
          }}
        />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold">Ideias da Comunidade</h1>
            <p className={cn("text-base", darkMode ? "text-slate-300" : "text-gray-600")}>
              Acompanhe as contribuições recentes e favorite o que achar interessante.
            </p>
          </div>

          {/* LISTAGEM */}
          {loading ? (
            <div className="p-6 text-center">Carregando...</div>
          ) : ideas.length === 0 ? (
            <div className="p-6 text-center">Nenhuma ideia encontrada.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 justify-items-center">
              {ideas.map((idea) => (
                <CommunityIdeaCard
                  key={idea.id}
                  idea={toCommunityIdea(idea)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {/* PAGINAÇÃO */}
          <div className="flex justify-center mt-6 gap-2">
            <button onClick={() => setPage(0)} disabled={page === 0}>
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ‹
            </button>

            <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded">
              {page + 1}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page + 1 >= totalPages}
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page + 1 >= totalPages}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
