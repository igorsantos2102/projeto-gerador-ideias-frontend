import { Heart, Trash2 } from "lucide-react";
import BaseIdeaCard, { type BaseIdeaCardProps } from "./BaseIdeiaCard";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type MyIdeaCardProps = Readonly<
  Omit<
    BaseIdeaCardProps,
    | "density"
    | "clampLines"
    | "actions"
    | "metaMode"
    | "showDivider"
    | "headerRight"
    | "footerRight"
  >
> & {
  onDelete?: (id: string) => void
}

export default function MyIdeaCard(props: MyIdeaCardProps) {
  const { darkMode } = useTheme();

  const { onDelete, ...baseProps } = props;

  const listSurface = darkMode
    ? "bg-slate-900/50 border border-slate-700 hover:border-slate-500"
    : "bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200 hover:border-blue-300 hover-lift transition-all-smooth";
  
  const headerRight = (
    <button
      aria-label="Favoritar"
      className="opacity-0 group-hover:opacity-100 transition-all-smooth p-1 hover:scale-110 cursor-pointer"
      title={props.idea.isFavorite ? "Desfavoritar" : "Favoritar"}
      onClick={(e) => {
        e.stopPropagation();
        props.onToggleFavorite?.(props.idea.id);
      }}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all",
          props.idea.isFavorite
            ? "fill-red-500 text-red-500"
            : darkMode
              ? "text-slate-300 hover:text-red-400"
              : "text-gray-500 hover:text-red-500"
        )}
      />
    </button>
  );

  const footerRight = (
    <button
      aria-label="Excluir"
      className={cn(
        "opacity-0 group-hover:opacity-100 transition-all-smooth p-1 rounded hover:scale-110 cursor-pointer",
        darkMode
          ? "text-red-400 hover:bg-red-500/10"
          : "text-red-600 hover:bg-red-100/50"
      )}
      title="Excluir"
      onClick={(e) => {
        e.stopPropagation();
        onDelete?.(props.idea.id);
      }}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );

  return (
    <BaseIdeaCard
      density="compact"
      clampLines={2}
      actions="none"
      metaMode="minimal"
      showDivider={false}
      headerRight={headerRight}
      footerRight={footerRight}
      className={`${listSurface}`}
      {...baseProps}
    />
  );
}
