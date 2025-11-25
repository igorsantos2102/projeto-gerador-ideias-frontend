import { useEffect, useRef, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import BaseIdeiaCard, { type BaseIdeaCardProps } from "./BaseIdeiaCard";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

interface FavoriteCardProps
  extends Omit<
    BaseIdeaCardProps,
    | "density"
    | "clampLines"
    | "actions"
    | "metaMode"
    | "showDivider"
    | "headerRight"
  > {
  onToggleFavorite?: (id: string) => void;
}

export default function FavoriteCard({
  idea,
  onToggleFavorite,
  ...props
}: Readonly<FavoriteCardProps>) {
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  const { darkMode } = useTheme();

  // Evita atualizar estado após desmontar
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);

    try {
      // 🔥 Sempre trata como promise async (mais seguro)
      await Promise.resolve(onToggleFavorite?.(idea.id));
    } catch (err) {
      console.error("Erro ao desfavoritar:", err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const headerRight = (
  <button
    aria-label={idea.isFavorite ? "Desfavoritar" : "Favoritar"}
    className="opacity-100 transition-all-smooth p-1 hover:scale-110 cursor-pointer"
    title={idea.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    onClick={handleClick}
    disabled={loading}
  >
    {(() => {
      if (loading) {
        return <Loader2 className="w-4 h-4 animate-spin text-red-500" />;
      }
      if (idea.isFavorite) {
        return <Heart className="w-4 h-4 fill-red-500 text-red-500" />;
      }
      return <Heart className="w-4 h-4 text-red-500" />;
    })()}
  </button>
);

  return (
    <BaseIdeiaCard
      density="compact"
      clampLines={2}
      actions="none"
      metaMode="minimal"
      showDivider={false}
      headerRight={headerRight}
      className={cn(
        darkMode
          ? "bg-slate-900/60 border-slate-700 hover:border-slate-500"
          : "bg-linear-to-r from-pink-50 to-red-50/40 border border-red-200 hover:border-red-300",
        "transition-all-smooth"
      )}
      idea={idea}
      {...props}
    />
  );
}
