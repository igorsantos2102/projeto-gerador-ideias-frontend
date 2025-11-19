import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import FilterHistory from "@/components/FilterHistory";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import MyIdeaCard from "@/components/IdeiaCard/MyIdeaCard";
import { ideaService } from "@/services/ideaService";

const PAGE_SIZE = 5;

export default function MyIdeasPage() {
  const { darkMode } = useTheme();

  // === STATE === //
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
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Sempre resetar para página 1 ao mudar filtros
  useMemo(() => {
    setPage(1);
  }, [filters.category, filters.startDate, filters.endDate]);

  // === CARREGA PAGINAÇÃO REAL DO BACKEND === //
  useEffect(() => {
    let cancelled = false;

    const loadIdeas = async () => {
      setIdeasLoading(true);

      try {
        const data = await ideaService.getMyIdeas(page - 1, PAGE_SIZE);

        if (!cancelled) {
          setIdeas(data.content);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error("Erro ao carregar minhas ideias:", err);
        if (!cancelled) {
          setIdeas([]);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) {
          setIdeasLoading(false);
        }
      }
    };

    loadIdeas();

    return () => {
      cancelled = true;
    };
  }, [page, filters]);

  // HANDLERS LOCAIS (frontend)
  const handleToggleFavorite = async (id: string) => {
    let optimisticValue: boolean | null = null;
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id !== id) return idea;
        optimisticValue = !idea.isFavorite;
        return { ...idea, isFavorite: optimisticValue };
      })
    );

    if (optimisticValue === null) return;

    try {
      await ideaService.toggleFavorite(id, optimisticValue);
    } catch (err) {
      console.error("Erro ao atualizar favorito:", err);
      // Reverte a UI em caso de erro na API
      const revertValue = !(optimisticValue ?? false);
      setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, isFavorite: revertValue } : idea)));
    }
  };

  const handleDelete = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  // === RENDER LIST === //
  const contentClass = cn(
    "rounded-lg border p-6 text-sm h-32 flex items-center justify-center",
    darkMode
      ? "bg-slate-900 border-slate-800 text-slate-200"
      : "bg-white border-gray-200 text-gray-600"
  );

  let listContent: ReactNode =
    ideas.length > 0 ? (
      ideas.map((idea) => (
        <MyIdeaCard
          key={idea.id}
          idea={idea}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      ))
    ) : (
      <div className={contentClass}>Nenhuma ideia encontrada.</div>
    );

  if (ideasLoading) {
    listContent = <div className={contentClass}>Carregando ideias...</div>;
  }

  return (
    <div
      className={cn(
        "max-w-7xl mx-auto px-8 py-12 relative z-10",
        darkMode ? "text-slate-100" : "text-gray-900"
      )}
    >
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* FILTROS */}
        <div>
          <FilterHistory
            fixed={false}
            value={filters}
            onChange={(v) =>
              setFilters({
                category: v.category ?? "",
                startDate: v.startDate ?? "",
                endDate: v.endDate ?? "",
              })
            }
          />
        </div>

        {/* LISTA */}
        <div className="flex flex-col gap-6">
          {listContent}

          {/* PAGINAÇÃO */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center pt-2">
              <nav
                aria-label="Paginação"
                className={cn(
                  "inline-flex items-stretch rounded-lg overflow-hidden",
                  darkMode
                    ? "border border-slate-700 bg-slate-900"
                    : "border border-gray-300 bg-white shadow-sm"
                )}
              >
                <button
                  aria-label="Primeira página"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className={cn(
                    "px-3 py-1.5 text-sm transition-colors",
                    darkMode
                      ? "text-slate-200 hover:bg-slate-800"
                      : "text-gray-700 hover:bg-gray-100",
                    page <= 1 && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {"\u00AB"}
                </button>

                <button
                  aria-label="Anterior"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={cn(
                    "px-3 py-1.5 text-sm border-l",
                    darkMode
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    page <= 1 && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {"\u2039"}
                </button>

                <span
                  className={cn(
                    "px-4 py-1.5 text-sm font-semibold border-l",
                    darkMode
                      ? "bg-slate-700 text-white border-slate-700"
                      : "bg-blue-50 text-blue-700 border-gray-300"
                  )}
                >
                  {page}
                </span>

                <button
                  aria-label="Próxima"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={cn(
                    "px-3 py-1.5 text-sm border-l",
                    darkMode
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    page >= totalPages && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {"\u203A"}
                </button>

                <button
                  aria-label="Última página"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className={cn(
                    "px-3 py-1.5 text-sm border-l",
                    darkMode
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    page >= totalPages && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {"\u00BB"}
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
