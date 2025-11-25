import { useEffect, useState, useCallback, useMemo } from "react";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import FavoriteCard from "@/components/IdeiaCard/FavoriteCard";
import { favoriteService } from "@/services/favoriteService";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

export default function FavoritesPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const { darkMode } = useTheme();

  useEffect(() => {
    (async () => {
      const data = await favoriteService.getFavorites();
      setIdeas(data);
      setLoading(false);
    })();
  }, []);

  const handleUnfavorite = useCallback(
    async (id: string) => {
      try {
        await favoriteService.removeFavorite(id);
        setIdeas((prev) => prev.filter((idea) => idea.id !== id));

        // Ajusta página se ficar vazia
        setPage((prev) => {
          const totalAfter = ideas.length - 1;
          const maxPage = Math.max(1, Math.ceil(totalAfter / PAGE_SIZE));
          return Math.min(prev, maxPage);
        });
      } catch (err) {
        console.error("Erro ao desfavoritar:", err);
      }
    },
    [ideas.length]
  );

  // === PAGINAÇÃO === //
  const totalPages = useMemo(
    () => Math.ceil(ideas.length / PAGE_SIZE),
    [ideas]
  );

  const paginatedIdeas = useMemo(
    () => ideas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, ideas]
  );

  const renderLoading = () => (
    <SectionContainer
      className={cn(
        "rounded-2xl p-12 text-center animate-fadeIn border",
        darkMode
          ? "bg-slate-900 border-slate-800"
          : "bg-gray-50 border-gray-200"
      )}
    >
      <p
        className={cn(
          "font-light",
          darkMode ? "text-slate-200" : "text-gray-600"
        )}
      >
        Carregando favoritos...
      </p>
    </SectionContainer>
  );

  const renderEmpty = () => (
    <SectionContainer
      className={cn(
        "rounded-2xl p-12 text-center animate-fadeIn border",
        darkMode
          ? "bg-slate-900 border-slate-800"
          : "bg-gray-50 border-gray-200"
      )}
    >
      <p
        className={cn(
          "font-light",
          darkMode ? "text-slate-200" : "text-gray-600"
        )}
      >
        Nenhuma ideia favorita ainda
      </p>
    </SectionContainer>
  );

  const getPaginationButtonClass = (disabled: boolean, hasBorder = true) => {
    const classes = ["px-4 py-2 text-sm transition-colors"];
    if (hasBorder) {
      classes.push("border-r");
    }
    classes.push(darkMode ? "border-slate-700" : "border-gray-200");
    if (disabled) {
      classes.push("opacity-40 cursor-not-allowed");
    } else {
      classes.push(darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100");
    }
    return cn(...classes);
  };

  const renderList = () => (
    <div className="mt-6">
      <div className="grid gap-y-4 sm:gap-y-4 md:gap-y-6 lg:gap-y-8">
        {paginatedIdeas.map((idea) => (
          <FavoriteCard
            key={idea.id}
            idea={idea}
            onToggleFavorite={handleUnfavorite}
          />
        ))}
      </div>

      {/* ==================== PAGINAÇÃO ESTILO COMUNIDADE ===================== */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <div
            className={cn(
              "flex items-center overflow-hidden rounded-xl border shadow-sm",
              darkMode ? "bg-slate-900/60 border-slate-700" : "bg-white border-gray-200"
            )}
          >
            {/* PRIMEIRA « */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className={getPaginationButtonClass(page === 1, true)}
            >
              «
            </button>

            {/* ANTERIOR ‹ */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={getPaginationButtonClass(page === 1, true)}
            >
              ‹
            </button>

            {/* Página atual — azul claro igual comunidade */}
            <span
              className={cn(
                "px-5 py-2 text-sm font-semibold border-r",
                darkMode ? "border-slate-700" : "border-gray-200",
                darkMode
                  ? "bg-slate-800 text-blue-400"
                  : "bg-[#E9F1FF] text-[#1F6FEB]"
              )}
            >
              {page}
            </span>

            {/* PRÓXIMA › */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={getPaginationButtonClass(page === totalPages, true)}
            >
              ›
            </button>

            {/* ÚLTIMA » */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className={getPaginationButtonClass(page === totalPages, false)}
            >
              »
            </button>
          </div>
        </div>
      )}
      {/* =================================================================== */}
    </div>
  );

  const renderContent = () => {
    if (loading) return renderLoading();
    if (ideas.length === 0) return renderEmpty();
    return renderList();
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 relative z-10 animate-fadeInUp">
      <h2
        className={cn(
          "text-3xl font-light mb-8",
          darkMode ? "text-white" : "text-gray-900"
        )}
      >
        Favoritos
      </h2>

      {renderContent()}
    </div>
  );
}
