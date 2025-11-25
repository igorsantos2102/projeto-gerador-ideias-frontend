import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import FilterHistory, {
  type FilterHistoryOption,
} from "@/components/FilterHistory";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import { useIdeas, type PaginatedIdeasResponse } from "@/hooks/useIdeas";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ideaService } from "@/services/ideaService";
import CommunityIdeaCard, {
  type CommunityIdea,
} from "@/components/IdeiaCard/CommunityIdeaCard";
import {
  FALLBACK_THEME_OPTIONS,
  loadThemeOptions,
} from "@/lib/themeOptions";

const HISTORY_POLL_INTERVAL = Number(
  import.meta.env.VITE_HISTORY_POLL_INTERVAL ?? 20_000
);

export default function HistoryPage() {
  const [filters, setFilters] = useState<{
    category: string;
    startDate: string;
    endDate: string;
  }>({
    category: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState<number>(1);
  const pageSize = 6;

  const [themeOptions, setThemeOptions] = useState<FilterHistoryOption[]>(
    FALLBACK_THEME_OPTIONS
  );
  const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});

  // Passa page e size para o hook useIdeas
  const { data: ideasResponse, loading: ideasLoading, refetch } = useIdeas({
    ...filters,
    page: page - 1, // Backend usa índice começando em 0
    size: pageSize,
  });

  const { darkMode } = useTheme();

  const handleFilterChange = useCallback(
    (next: { category?: string; startDate?: string; endDate?: string }) => {
      setFilters({
        category: next.category ?? "",
        startDate: next.startDate ?? "",
        endDate: next.endDate ?? "",
      });
    },
    []
  );

  const handleFilterClear = useCallback(() => {
    setFilters({
      category: "",
      startDate: "",
      endDate: "",
    });
  }, []);

  // Reseta para página 1 quando mudar filtros
  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.startDate, filters.endDate]);

  useEffect(() => {
    if (
      typeof globalThis === "undefined" ||
      !Number.isFinite(HISTORY_POLL_INTERVAL) ||
      HISTORY_POLL_INTERVAL <= 0 ||
      typeof globalThis.setInterval !== "function" ||
      typeof globalThis.clearInterval !== "function"
    ) {
      return;
    }
    const intervalId = globalThis.setInterval(() => {
      refetch({ ignoreCache: true, silent: true });
    }, HISTORY_POLL_INTERVAL);
    return () => globalThis.clearInterval(intervalId);
  }, [refetch]);

  useEffect(() => {
    if (typeof globalThis === "undefined") return;
    const target = globalThis.document;
    if (!target) return;

    const handleVisibility = () => {
      if (target.visibilityState === "visible") {
        refetch({ ignoreCache: true, silent: true });
      }
    };

    target.addEventListener("visibilitychange", handleVisibility);
    return () =>
      target.removeEventListener("visibilitychange", handleVisibility);
  }, [refetch]);

  useEffect(() => {
    let cancelled = false;

    void loadThemeOptions()
      .then((options) => {
        if (!cancelled) {
          setThemeOptions(options);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar temas:", error);
        if (!cancelled) {
          setThemeOptions(FALLBACK_THEME_OPTIONS);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void ideaService
      .getFavorites()
      .then((favorites) => {
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        for (const fav of favorites) {
          map[fav.id] = true;
        }
        setFavoriteOverrides(map);
      })
      .catch((error) => {
        console.error("Erro ao carregar favoritos:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchedIdeas = useMemo<PaginatedIdeasResponse["content"] | Idea[]>(() => {
    if (ideasResponse && typeof ideasResponse === "object" && "content" in ideasResponse) {
      return (ideasResponse as PaginatedIdeasResponse).content;
    }
    if (Array.isArray(ideasResponse)) {
      return ideasResponse;
    }
    return [];
  }, [ideasResponse]);

  const totalElements =
    ideasResponse && typeof ideasResponse === "object" && "totalElements" in ideasResponse
      ? (ideasResponse as PaginatedIdeasResponse).totalElements
      : fetchedIdeas.length;

  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const currentPage = Math.min(page, totalPages);

  const decoratedIdeas = useMemo(() => {
    return fetchedIdeas.map((idea) => ({
      ...idea,
      isFavorite: favoriteOverrides[idea.id] ?? idea.isFavorite,
    }));
  }, [fetchedIdeas, favoriteOverrides]);

  const paginatedIdeas = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return decoratedIdeas.slice(start, start + pageSize);
  }, [decoratedIdeas, currentPage, pageSize]);

  const hasIdeas = paginatedIdeas.length > 0;

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      const currentIdea = decoratedIdeas.find((idea) => idea.id === id);
      if (!currentIdea) return;
      const nextFavoriteStatus = !currentIdea.isFavorite;
      setFavoriteOverrides((prev) => ({
        ...prev,
        [id]: nextFavoriteStatus,
      }));
      try {
        await ideaService.toggleFavorite(id, nextFavoriteStatus);
        refetch({ ignoreCache: true, silent: true });
      } catch (err) {
        console.error("Erro ao atualizar favorito:", err);
        setFavoriteOverrides((prev) => ({
          ...prev,
          [id]: currentIdea.isFavorite,
        }));
      }
    },
    [decoratedIdeas, refetch]
  );

  const paginationButtons = [
    {
      key: "first",
      label: "\u00AB",
      ariaLabel: "Primeira pagina",
      onClick: () => setPage(1),
      disabled: currentPage <= 1,
      hasBorder: false,
    },
    {
      key: "prev",
      label: "\u2039",
      ariaLabel: "Pagina anterior",
      onClick: () => setPage((p) => Math.max(1, p - 1)),
      disabled: currentPage <= 1,
      hasBorder: true,
    },
    {
      key: "next",
      label: "\u203A",
      ariaLabel: "Proxima pagina",
      onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
      disabled: currentPage >= totalPages,
      hasBorder: true,
    },
    {
      key: "last",
      label: "\u00BB",
      ariaLabel: "Ultima pagina",
      onClick: () => setPage(totalPages),
      disabled: currentPage >= totalPages,
      hasBorder: true,
    },
  ];

  const paginationButtonClass = (hasBorder: boolean, disabled: boolean) => {
    let colorClass: string;

    if (darkMode) {
      colorClass = hasBorder
        ? "border-slate-700 text-slate-200 hover:bg-slate-800"
        : "text-slate-200 hover:bg-slate-800";
    } else {
      colorClass = hasBorder
        ? "border-gray-300 text-gray-700 hover:bg-gray-100"
        : "text-gray-700 hover:bg-gray-100";
    }

    return cn(
      "px-3 py-1.5 text-sm transition-colors",
      hasBorder && "border-l",
      colorClass,
      disabled && "opacity-40 cursor-not-allowed"
    );
  };

  const loadingClass = cn(
    "rounded-lg border p-6 text-sm h-32 flex items-center justify-center",
    darkMode
      ? "bg-slate-900 border-slate-800 text-slate-200"
      : "bg-white border-gray-200 text-gray-600"
  );

  let cardsContent: ReactNode;

  if (ideasLoading) {
    cardsContent = (
      <div className={loadingClass}>Carregando ideias da comunidade...</div>
    );
  } else if (hasIdeas) {
    cardsContent = (
      <div className="grid gap-6 justify-items-center sm:grid-cols-[repeat(2,minmax(0,640px))]">
        {paginatedIdeas.map((idea) => (
          <CommunityIdeaCard
            key={idea.id}
            idea={toCommunityIdea(idea)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    );
  } else {
    cardsContent = (
      <div className={loadingClass}>
        Nenhuma ideia encontrada para os filtros selecionados.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-7xl mx-auto px-8 py-12 relative z-10",
        darkMode ? "text-slate-100" : "text-gray-900"
      )}
    >
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div>
          <FilterHistory
            value={filters}
            onChange={handleFilterChange}
            onClear={handleFilterClear}
            className="w-full"
            categories={themeOptions}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold">Ideias da Comunidade</h1>
            <p
              className={cn(
                "text-base",
                darkMode ? "text-slate-300" : "text-gray-600"
              )}
            >
              Acompanhe as contribuições mais recentes e favorite o que achar
              interessante.
            </p>
          </div>
          {cardsContent}

          {hasIdeas && totalPages > 1 && (
            <div className="flex items-center justify-center pt-2">
              <nav
                aria-label="Paginacao"
                className={cn(
                  "inline-flex items-stretch rounded-lg overflow-hidden",
                  darkMode
                    ? "border border-slate-700 bg-slate-900"
                    : "border border-gray-300 bg-white shadow-sm"
                )}
              >
                {paginationButtons.slice(0, 2).map((button) => (
                  <button
                    key={button.key}
                    aria-label={button.ariaLabel}
                    onClick={button.onClick}
                    disabled={button.disabled}
                    className={paginationButtonClass(
                      button.hasBorder,
                      button.disabled
                    )}
                  >
                    {button.label}
                  </button>
                ))}
                <span
                  className={cn(
                    "px-4 py-1.5 text-sm font-semibold border-l",
                    darkMode
                      ? "bg-slate-700 text-white border-slate-700"
                      : "bg-blue-50 text-blue-700 border-gray-300"
                  )}
                >
                  {currentPage} / {totalPages}
                </span>
                {paginationButtons.slice(2).map((button) => (
                  <button
                    key={button.key}
                    aria-label={button.ariaLabel}
                    onClick={button.onClick}
                    disabled={button.disabled}
                    className={paginationButtonClass(
                      button.hasBorder,
                      button.disabled
                    )}
                  >
                    {button.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function toCommunityIdea(idea: Idea): CommunityIdea {
  return {
    ...idea,
    author: idea.author?.trim() || "Participante desconhecido",
    tokens: idea.tokens,
  };
}
