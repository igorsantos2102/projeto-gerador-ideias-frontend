import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  darkMode?: boolean;
};

export default function Pagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  darkMode = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
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
        onClick={() => onPageChange(1)}
        disabled={!hasPrevious}
        className={cn(
          "px-3 py-1.5 text-sm transition-colors",
          darkMode
            ? "text-slate-200 hover:bg-slate-800"
            : "text-gray-700 hover:bg-gray-100",
          !hasPrevious && "opacity-40 cursor-not-allowed"
        )}
      >
        {"\u00AB"}
      </button>
      <button
        aria-label="Página anterior"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        className={cn(
          "px-3 py-1.5 text-sm border-l",
          darkMode
            ? "border-slate-700 text-slate-200 hover:bg-slate-800"
            : "border-gray-300 text-gray-700 hover:bg-gray-100",
          !hasPrevious && "opacity-40 cursor-not-allowed"
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
        {currentPage} / {totalPages}
      </span>
      <button
        aria-label="Próxima página"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={cn(
          "px-3 py-1.5 text-sm border-l",
          darkMode
            ? "border-slate-700 text-slate-200 hover:bg-slate-800"
            : "border-gray-300 text-gray-700 hover:bg-gray-100",
          !hasNext && "opacity-40 cursor-not-allowed"
        )}
      >
        {"\u203A"}
      </button>
      <button
        aria-label="Última página"
        onClick={() => onPageChange(totalPages)}
        disabled={!hasNext}
        className={cn(
          "px-3 py-1.5 text-sm border-l",
          darkMode
            ? "border-slate-700 text-slate-200 hover:bg-slate-800"
            : "border-gray-300 text-gray-700 hover:bg-gray-100",
          !hasNext && "opacity-40 cursor-not-allowed"
        )}
      >
        {"\u00BB"}
      </button>
    </nav>
  );
}

