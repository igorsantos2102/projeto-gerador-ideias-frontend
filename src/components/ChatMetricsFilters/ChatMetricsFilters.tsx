import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import type { ChatFilter } from "@/types/chatMetrics";

export type ChatMetricsFiltersProps = Readonly<{
  date: string;
  onDateChange: (v: string) => void;
  chatFilter: ChatFilter;
  onChatFilterChange: (v: ChatFilter) => void;
  compare: boolean;
  onToggleCompare: () => void;
  darkMode: boolean;
  query?: string;
  onQueryChange?: (v: string) => void;
  queryPlaceholder?: string;
}>;

export default function ChatMetricsFilters({
  date,
  onDateChange,
  chatFilter,
  onChatFilterChange,
  compare,
  onToggleCompare,
  darkMode,
  query,
  queryPlaceholder,
  onQueryChange,
}: Readonly<ChatMetricsFiltersProps>) {

  const baseCard = darkMode
    ? "border-slate-700 bg-slate-900"
    : "border-gray-200 bg-white";
  const hoverCard = darkMode ? "hover:bg-slate-800" : "hover:bg-gray-50";

  const showSearch = typeof onQueryChange === "function";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm w-fit",
          baseCard
        )}
      >
        <input
          type="date"
          aria-label="Data"
          className={cn(
            "bg-transparent outline-none",
            darkMode ? "text-slate-50" : "text-gray-900"
          )}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </label>

      {/* Segmented control */}
      <fieldset
        className={cn("inline-flex gap-1 rounded-xl p-1 text-sm", baseCard)}
        aria-label="Filtro de tipo de chat"
      >
        <legend className="sr-only">Filtro de tipo de chat</legend>
        {(["ALL", "FREE", "CONTEXT"] as ChatFilter[]).map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={chatFilter === type}
            onClick={() => onChatFilterChange(type)}
            className={getChatFilterButtonClass(chatFilter === type, darkMode)}
          >
            {getChatFilterLabel(type)}
          </button>
        ))}
      </fieldset>

      {(() => {
        const canCompare = chatFilter === "ALL";
        return (
          <button
            onClick={canCompare ? onToggleCompare : undefined}
            aria-pressed={canCompare ? compare : undefined}
            aria-hidden={canCompare ? undefined : true}
            tabIndex={canCompare ? 0 : -1}
            disabled={!canCompare}
            aria-label="Alternar modo de comparação"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
              getCompareButtonClass(canCompare, compare, darkMode, baseCard, hoverCard)
            )}
            title={
              canCompare
                ? "Comparar Livre vs Contexto nos gráficos"
                : undefined
            }
          >
            <SlidersHorizontal className="h-4 w-4" />
            {compare ? "Comparando" : "Comparar"}
          </button>
        );
      })()}

      {/* Search (opcional, p.ex. username / email) */}
      {showSearch && (
        <div className="flex-1 min-w-[200px]">
          <input
            value={query ?? ""}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder={queryPlaceholder ?? "Buscar por usuário ou e-mail…"}
            aria-label="Buscar por usuário ou e-mail"
            className={cn(
              "w-full rounded-xl border px-3 py-2 text-sm outline-none",
              darkMode
                ? "border-slate-700 bg-slate-900 text-slate-50 placeholder:text-slate-500"
                : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400",
              "focus:ring-2 focus:ring-offset-0",
              darkMode ? "focus:ring-slate-500" : "focus:ring-gray-300"
            )}
          />
        </div>
      )}
    </div>
  );
}

function getChatFilterButtonClass(selected: boolean, darkMode: boolean) {
  if (selected) {
    return cn(
      "rounded-lg px-3 py-1.5 text-xs font-medium",
      darkMode ? "bg-slate-50 text-slate-900" : "bg-gray-900 text-white"
    );
  }

  return cn(
    "rounded-lg px-3 py-1.5 text-xs",
    darkMode ? "text-slate-300 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-50"
  );
}

function getChatFilterLabel(type: ChatFilter) {
  switch (type) {
    case "ALL":
      return "Todos";
    case "FREE":
      return "Livres";
    default:
      return "Com contexto";
  }
}

function getCompareButtonClass(
  canCompare: boolean,
  compare: boolean,
  darkMode: boolean,
  baseCard: string,
  hoverCard: string
) {
  if (!canCompare) {
    return "invisible pointer-events-none";
  }

  if (compare) {
    return darkMode ? "bg-slate-50 text-slate-900" : "bg-gray-900 text-white";
  }

  return cn(baseCard, hoverCard);
}
