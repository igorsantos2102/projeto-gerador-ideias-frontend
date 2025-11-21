import { Heart } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import type { Idea } from "./BaseIdeiaCard";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export type CommunityIdea = Idea & {
  author: string;
};

type CommunityIdeaCardProps = Readonly<
  {
    idea: CommunityIdea;
    onToggleFavorite?: (id: string) => void;
    clampLines?: number | null;
    className?: string;
  } & Omit<HTMLAttributes<HTMLElement>, "children">
>;

export default function CommunityIdeaCard({
  idea,
  onToggleFavorite,
  clampLines = 3,
  className,
  ...rest
}: CommunityIdeaCardProps) {
  const { darkMode } = useTheme();

  const surface = darkMode
    ? "bg-slate-900/60 border border-slate-700 hover:border-slate-500"
    : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg";

  const createdAtLabel = new Date(idea.timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const authorLabel = idea.author?.trim() || "Participante desconhecido";
  const responseLabel =
    typeof idea.responseTime === "number" && Number.isFinite(idea.responseTime)
      ? `${idea.responseTime}ms`
      : "--";

  const clampClass = getClampClass(clampLines);

  return (
    <article
      className={cn(
        "transition-all-smooth cursor-pointer rounded-2xl p-6 flex flex-col gap-6 w-full max-w-[640px]",
        surface,
        className
      )}
      {...rest}
    >
      <div className="flex items-start justify-between gap-4">
            <PillList idea={idea} darkMode={darkMode} />

        <button
          aria-label={idea.isFavorite ? "Desfavoritar" : "Favoritar"}
          className="opacity-100 transition-all-smooth p-1 hover:scale-110 cursor-pointer"
          title={idea.isFavorite ? "Remover dos favoritos" : "Favoritar"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(idea.id);
          }}
        >
          <Heart className={cn("w-5 h-5 transition-all", getHeartClass(idea.isFavorite, darkMode))} />
        </button>
      </div>

      <p
        className={cn(
          "text-base leading-relaxed",
          darkMode ? "text-slate-100" : "text-gray-800",
          clampClass
        )}
      >
        {idea.content}
      </p>

      <div
        className={cn(
          "flex items-center justify-between gap-4 pt-4 border-t",
          darkMode ? "border-slate-800" : "border-gray-200"
        )}
      >
        <MetaColumn
          authorLabel={authorLabel}
          createdAtLabel={createdAtLabel}
          darkMode={darkMode}
        />
        <StatsColumn
          responseLabel={responseLabel}
          darkMode={darkMode}
        />
      </div>
    </article>
  );
}

type PillListProps = {
  idea: CommunityIdea;
  darkMode: boolean;
};

function PillList({ idea, darkMode }: PillListProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Pill variant="theme" dark={darkMode}>
        {idea.theme}
      </Pill>
      {idea.context ? (
        <Pill variant="context" dark={darkMode}>
          {idea.context}
        </Pill>
      ) : null}
      {idea.modelUsed ? (
        <Pill variant="model" dark={darkMode}>
          {idea.modelUsed}
        </Pill>
      ) : null}
    </div>
  );
}

type MetaColumnProps = {
  readonly authorLabel: string;
  readonly createdAtLabel: string;
  readonly darkMode: boolean;
};

function MetaColumn({ authorLabel, createdAtLabel, darkMode }: MetaColumnProps) {
  const textClass = cn(darkMode ? "text-slate-400" : "text-gray-500");
  return (
    <div className="flex flex-col gap-0.5 text-xs font-light">
      <div className={textClass}>
        Por:{" "}
        <span className={cn("font-medium", darkMode ? "text-slate-100" : "text-gray-700")}>
          {authorLabel}
        </span>
      </div>
      <div className={textClass}>{createdAtLabel}</div>
    </div>
  );
}

type StatsColumnProps = {
  readonly responseLabel: string;
  readonly darkMode: boolean;
};

function StatsColumn({ responseLabel, darkMode }: StatsColumnProps) {
  const textClass = cn(darkMode ? "text-slate-400" : "text-gray-500");
  const valueClass = cn("font-medium", darkMode ? "text-slate-100" : "text-gray-700");
  return (
    <div className="text-right space-y-0.5 text-xs font-light">
      <div className={textClass}>
        Tempo: <span className={valueClass}>{responseLabel}</span>
      </div>
    </div>
  );
}

type PillProps = {
  readonly children: ReactNode;
  readonly variant?: "theme" | "context" | "model";
  readonly dark: boolean;
};

function Pill({ children, variant = "theme", dark }: PillProps) {
  const base = "px-4 py-1.5 rounded-full text-sm font-light";
  let styles = "";

  switch (variant) {
    case "context":
      styles = dark ? "bg-slate-800 text-slate-100" : "bg-gray-100 text-gray-700";
      break;
    case "model":
      styles = dark ? "bg-indigo-900/40 text-indigo-100" : "bg-indigo-50 text-indigo-700";
      break;
    default:
      styles = dark ? "bg-blue-500/10 text-blue-100" : "bg-blue-100 text-blue-700";
  }

  return (
    <span className={cn(base, styles)} title={(children as string) || ""}>
      {children}
    </span>
  );
}

function getClampClass(clampLines: number | null): string {
  if (clampLines === null) return "";
  if (clampLines <= 1) return "line-clamp-1";
  if (clampLines === 2) return "line-clamp-2";
  if (clampLines === 3) return "line-clamp-3";
  if (clampLines === 4) return "line-clamp-4";
  return `line-clamp-${clampLines}`;
}

function getHeartClass(isFavorite: boolean, darkMode: boolean) {
  if (isFavorite) {
    return "fill-red-500 text-red-500";
  }

  return darkMode ? "text-slate-300 hover:text-red-400" : "text-gray-400 hover:text-red-500";
}
