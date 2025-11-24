import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import FilterHistory from "@/components/FilterHistory";
import { useTheme } from "@/hooks/useTheme";
import { useIdeas } from "@/hooks/useIdeas";
import { cn } from "@/lib/utils";
import MyIdeaCard from "@/components/IdeiaCard/MyIdeaCard";
import { ideaService } from "@/services/ideaService";
import { subscribeHistoryRefresh } from "@/events/historyEvents";
import { fetchFavoriteIds } from "@/pages/History/favoritesCache";

const MY_IDEAS_CACHE_KEY = "my_ideas_cache";
const PAGE_SIZE = 5;

export default function MyIdeasPage() {
  const { darkMode } = useTheme();

  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(1);

  // ================================
  // CACHE INICIAL
  // ================================
  const cachedInitialIdeas = useMemo(() => {
    try {
      const raw = localStorage.getItem(MY_IDEAS_CACHE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.map((idea: any) => ({
        ...idea,
        timestamp: new Date(idea.timestamp),
      }));
    } catch {
      return [];
    }
  }, []);

  const [ideas, setIdeas] = useState<Idea[]>(cachedInitialIdeas);

  const { data: ideasData, loading } = useIdeas(filters);

  // ================================
  // MERGE + FAVORITOS — SEM NESTING
  // ================================
  useEffect(() => {
    if (!Array.isArray(ideasData)) return;
    updateIdeasFromApi(ideasData);
    updateFavoriteStatus();
  }, [ideasData]);

  function updateIdeasFromApi(newIdeas: Idea[]) {
    setIdeas((current) => mergeIdeas(newIdeas, current));
  }

  async function updateFavoriteStatus() {
    const favIds = await fetchFavoriteIds();
    setIdeas((prev) =>
      prev.map((idea) => ({
        ...idea,
        isFavorite: favIds.has(idea.id),
      }))
    );
  }

  // ================================
  // RESET PAGE
  // ================================
  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.startDate, filters.endDate]);

  // ================================
  // NOVAS IDEIAS DO EVENTO
  // ================================
  useEffect(() => {
    const unsub = subscribeHistoryRefresh((detail) => {
      const idea = detail.idea;
      if (!idea) return;
      setIdeas((current) => mergeIdeas([idea], current));
    });

    return unsub;
  }, []);

  // ================================
  // CACHE LOCAL
  // ================================
  useEffect(() => {
    try {
      const serializable = ideas.map((idea) => ({
        ...idea,
        timestamp:
          idea.timestamp instanceof Date
            ? idea.timestamp.toISOString()
            : idea.timestamp,
      }));
      localStorage.setItem(MY_IDEAS_CACHE_KEY, JSON.stringify(serializable));
    } catch {}
  }, [ideas]);

  // ================================
  // FILTRAGEM
  // ================================
  const filtered = ideas.filter((idea) => {
    if (!idea) return false;

    const matchesCategory =
      !filters.category ||
      idea.theme?.toLowerCase() === filters.category.toLowerCase();

    const ts = new Date(idea.timestamp).getTime();

    const matchesStart =
      !filters.startDate ||
      ts >= new Date(`${filters.startDate}T00:00:00`).getTime();

    const matchesEnd =
      !filters.endDate ||
      ts <= new Date(`${filters.endDate}T23:59:59`).getTime();

    return matchesCategory && matchesStart && matchesEnd;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const sliced = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ================================
  // FAVORITAR — CORREÇÃO SONAR (L152)
  // ================================
  const handleToggleFavorite = useCallback(async (id: string) => {
    let previousValue: boolean | null = null;

    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id !== id) return idea;

        previousValue = idea.isFavorite;
        const newValue = !previousValue;

        return { ...idea, isFavorite: newValue };
      })
    );

    try {
      await ideaService.toggleFavorite(id, !previousValue!);
    } catch {
      // rollback
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, isFavorite: previousValue! } : i
        )
      );
    }
  }, []);

  const handleDelete = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div
      className={cn(
        "max-w-7xl mx-auto px-8 py-12",
        darkMode ? "text-slate-100" : "text-gray-900"
      )}
    >
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div>
          <FilterHistory
            value={filters}
            onChange={(v) =>
              setFilters({
                category: v.category ?? "",
                startDate: v.startDate ?? "",
                endDate: v.endDate ?? "",
              })
            }
            onClear={() =>
              setFilters({ category: "", startDate: "", endDate: "" })
            }
          />
        </div>

        <div className="flex flex-col gap-6">
          {loading ? (
            <LoadingBox darkMode={darkMode} />
          ) : sliced.length === 0 ? (
            <EmptyState darkMode={darkMode} />
          ) : (
            sliced.map((idea) => (
              <MyIdeaCard
                key={idea.id}
                idea={idea}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            ))
          )}

          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChange={setPage}
                dark={darkMode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingBox({ darkMode }: Readonly<{ darkMode: boolean }>) {
  return (
    <div
      className={cn(
        "rounded-lg border p-6 h-32 flex items-center justify-center text-sm",
        darkMode
          ? "bg-slate-900 border-slate-800 text-slate-200"
          : "bg-white border-gray-200 text-gray-600"
      )}
    >
      Carregando ideias...
    </div>
  );
}

function EmptyState({ darkMode }: Readonly<{ darkMode: boolean }>) {
  return (
    <div
      className={cn(
        "rounded-lg border p-6 h-32 flex items-center justify-center text-sm",
        darkMode
          ? "bg-slate-900 border-slate-800 text-slate-200"
          : "bg-white border-gray-200 text-gray-600"
      )}
    >
      Nenhuma ideia encontrada.
    </div>
  );
}

// ===============================
// PAGINAÇÃO — props readonly (Sonar)
// ===============================
function Pagination({
  page,
  totalPages,
  onChange,
  dark,
}: Readonly<{
  page: number;
  totalPages: number;
  onChange: (n: number) => void;
  dark: boolean;
}>) {
  const renderBtn = (
    label: string,
    target: number,
    disabled: boolean,
    ariaLabel: string
  ) => (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(target)}
      className={cn(
        "px-3 py-1.5 text-sm border-l",
        dark
          ? "border-slate-700 text-slate-200 hover:bg-slate-800"
          : "border-gray-300 text-gray-700 hover:bg-gray-100",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {label}
    </button>
  );

  return (
    <nav
      className={cn(
        "inline-flex items-stretch rounded-lg overflow-hidden",
        dark
          ? "border border-slate-700 bg-slate-900"
          : "border border-gray-300 bg-white shadow-sm"
      )}
    >
      {renderBtn("«", 1, page <= 1, "first-page")}
      {renderBtn("‹", page - 1, page <= 1, "previous-page")}
      <span
        className={cn(
          "px-4 py-1.5 text-sm font-semibold border-l",
          dark ? "bg-slate-700 text-white" : "bg-blue-50 text-blue-700"
        )}
      >
        {page}
      </span>
      {renderBtn("›", page + 1, page >= totalPages, "next-page")}
      {renderBtn("»", totalPages, page >= totalPages, "last-page")}
    </nav>
  );
}

// ===============================
// MERGE
// ===============================
function mergeIdeas(next: Idea[], current: Idea[]): Idea[] {
  if (current.length === 0) return next;

  const map = new Map(current.map((i) => [i.id, i]));

  const updated = current.map((idea) => {
    const fresh = next.find((n) => n.id === idea.id);
    return fresh ? { ...idea, ...fresh } : idea;
  });

  const newOnes = next.filter((i) => !map.has(i.id));

  return [...newOnes, ...updated];
}
