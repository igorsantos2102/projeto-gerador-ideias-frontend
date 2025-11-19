import { memo, type ReactNode } from "react";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import {
  Heart,
  Copy,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import './style.css';
import { useTheme } from "@/hooks/useTheme";

export type Idea = {
  id: string;
  theme: string;
  context: string;
  content: string;
  timestamp: Date;
  isFavorite: boolean;
  responseTime?: number;
  author?: string;
  tokens?: number;
  modelUsed?: string;
};

export type Density = "comfortable" | "compact";
export type ActionsKind = "full" | "minimal" | "none";
export type MetaMode = "full" | "minimal" | "none";

export type BaseIdeaCardProps = {
  idea: Idea;
  density?: Density;
  clampLines?: number | null;
  showThemePill?: boolean;
  showContextPill?: boolean;
  metaMode?: MetaMode;
  showDivider?: boolean;
  actions?: ActionsKind;
  headerRight?: ReactNode;
  footerRight?: ReactNode;
  footerLeft?: ReactNode;
  onToggleFavorite?: (id: string) => void;
  onCopy?: (text: string) => void;
  onShare?: (text: string) => void;
  onClick?: () => void;
  className?: string;
};

function formatDateBR(d: Date) {
  const date = new Date(d);
  return (
    date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " às " +
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

function formatDateOnlyBR(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR");
}

type PillKind = "theme" | "context";
type PillProps = { children: ReactNode; kind?: PillKind; isDark: boolean };

function Pill({ children, kind = "theme", isDark }: Readonly<PillProps>) {
  const base = "inline-block transition-all-smooth px-4 py-2 rounded-full text-sm animate-fadeInUp";
  const cls = getPillClass(kind, isDark);

  return (
    <span 
      className={cn(base, cls)} 
      title={(children as string) || ""}
    >
      {children}
    </span>
  );
}

function FullActions({
  isFavorite,
  onFav,
  onCopy,
  onShare,
  isDark,
}: Readonly<{
  isFavorite?: boolean;
  onFav?: () => void;
  onCopy?: () => void | Promise<void>;
  onShare?: () => void | Promise<void>;
  isDark: boolean;
}>) {
  const hoverBg = isDark ? "hover:bg-slate-800" : "hover:bg-gray-100";
  const textMuted = isDark ? "text-slate-300" : "text-gray-500";
  const textHover = isDark ? "hover:text-slate-50" : "hover:text-gray-700";
  
  return (
    <div className="flex items-center gap-2">
      <button 
        aria-label="Copiar" 
        title="Copiar" 
        className={cn(
          "p-2 rounded-lg transition-all hover:scale-110 cursor-pointer",
          hoverBg,
          textMuted,
          textHover
        )}
        onClick={onCopy}>
        <Copy className="w-5 h-5" />
      </button>
      <button
        aria-label="Compartilhar"
        title="Compartilhar"
        className={cn(
          "p-2 rounded-lg transition-all hover:scale-110 cursor-pointer",
          hoverBg,
          textMuted,
          textHover
        )}
        onClick={onShare}
      >
        <Share2 className="w-5 h-5" />
      </button>
      <button
        aria-label="Favoritar"
        aria-pressed={!!isFavorite}
        className={cn(
          "p-2 rounded-lg transition-all hover:scale-110 cursor-pointer",
          hoverBg
        )}
        onClick={onFav}
        title={isFavorite ? "Desfavoritar" : "Favoritar"}
      >
          <Heart 
            className={cn("w-5 h-5 transition-all", getHeartIconClass(isFavorite, isDark))}
          />
      </button>
    </div>
  );
}


export default memo(function BaseIdeaCard({
  idea,
  density = "comfortable",
  clampLines = null,
  showThemePill = true,
  showContextPill = true,
  metaMode = "full",
  showDivider = true,
  actions = "full",
  headerRight,
  footerRight,
  footerLeft,
  onToggleFavorite,
  onCopy,
  onShare,
  onClick,
  className = "",
}: BaseIdeaCardProps) {
  const { darkMode } = useTheme();

  // helpers de estilo e flags
  const pad = density === "compact" ? "p-4" : "p-8";
  const textSize = density === "compact" ? "text-base" : "text-2xl";
  const clamp = clampLines ? ` line-clamp-${clampLines}` : "";
  const surface = darkMode
    ? "rounded-2xl border-2 bg-slate-900/70 border-slate-800 shadow-md"
    : "rounded-2xl border-2 bg-white border-gray-300 shadow-md";
  const showMeta = metaMode === "full" || metaMode === "minimal";
  const dividerSpacing = getDividerClasses(showDivider, darkMode);

  // meta node
  const metaNode = showMeta ? (
    getMetaContent(metaMode, idea, darkMode)
  ) : (
    <div />
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(idea.content);
    onCopy?.(idea.content);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Ideia Gerada",
        text: idea.content,
      });
    } else {
      await navigator.clipboard.writeText(idea.content);
    }
    onShare?.(idea.content);
  };

  const rightNode =
    footerRight ??
    getRightNode({
      actions: actions ?? "none",
      idea,
      darkMode,
      onToggleFavorite,
      onCopy: handleCopy,
      onShare: handleShare,
    });

  // actions node
  const leftNode: ReactNode = footerLeft ?? metaNode;

  const shouldShowFooter =
    metaMode !== "none" ||
    actions !== "none" ||
    !!footerRight ||
    footerLeft !== undefined;

  return (
    <SectionContainer
      className={cn(
        "idea-card-scope group cursor-pointer animate-scaleIn",
        surface,
        pad,
        className
      )}
      onClick={onClick}
    >
      {/* Header: pills */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {showThemePill && (
            <Pill kind="theme" isDark={darkMode}>
              {idea.theme}
            </Pill>
          )}
          {showContextPill && idea.context ? (
            <Pill kind="context" isDark={darkMode}>
              {idea.context}
            </Pill>
          ) : null}
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>

      {/* Body */}
      <p
        className={cn(
          `${textSize} font-light leading-relaxed mb-6 ${clamp}`,
          darkMode ? "text-slate-100" : "text-gray-800"
        )}
      >
        {idea.content}
      </p>

      {/* Footer */}
      {shouldShowFooter && (
        <div
          className={cn("flex items-center justify-between gap-4", dividerSpacing)}
        >
          {/* LADO ESQUERDO */}
          <div className="flex-1 min-w-0">
            {leftNode}
          </div>

          {/* LADO DIREITO */}
          {rightNode && (
            <div className="shrink-0">
              {rightNode}
            </div>
          )}
        </div>
      )}
    </SectionContainer>
  );
});

type RightNodeArgs = {
  actions: ActionsKind
  idea: Idea
  darkMode: boolean
  onToggleFavorite?: (id: string) => void
  onCopy: () => Promise<void>
  onShare: () => Promise<void>
}

function getMetaContent(metaMode: MetaMode, idea: Idea, darkMode: boolean) {
  if (metaMode === "full") {
    return (
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            "text-sm font-light",
            darkMode ? "text-slate-300" : "text-gray-600"
          )}
        >
          Gerado em {formatDateBR(idea.timestamp)}
        </div>
        {typeof idea.responseTime === "number" && (
          <div
            className={cn(
              "text-xs font-light",
              darkMode ? "text-slate-500" : "text-gray-500"
            )}
          >
            Tempo de resposta: {idea.responseTime}ms
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "text-xs font-light",
        darkMode ? "text-slate-400" : "text-gray-500"
      )}
    >
      {formatDateOnlyBR(idea.timestamp)}
    </div>
  )
}

function getRightNode({
  actions,
  idea,
  darkMode,
  onToggleFavorite,
  onCopy,
  onShare,
}: RightNodeArgs): ReactNode {
  if (actions !== "full") {
    return null
  }

  return (
    <FullActions
      isFavorite={idea.isFavorite}
      onFav={() => onToggleFavorite?.(idea.id)}
      onCopy={onCopy}
      onShare={onShare}
      isDark={darkMode}
    />
  )
}

function getPillClass(kind: PillKind, isDark: boolean) {
  if (kind === "theme") {
    return isDark ? "font-light bg-blue-500/10 text-blue-100" : "font-light bg-blue-100 text-blue-700"
  }

  return isDark ? "bg-slate-800 text-slate-100" : "bg-gray-100 text-gray-700"
}

function getHeartIconClass(isFavorite: boolean | undefined, isDark: boolean) {
  if (isFavorite) {
    return "fill-red-500 text-red-500"
  }

  return isDark ? "text-slate-300 hover:text-red-400" : "text-gray-500 hover:text-red-500"
}

function getDividerClasses(showDivider: boolean, isDark: boolean) {
  if (!showDivider) {
    return "pt-2"
  }

  return isDark ? "pt-6 border-t border-slate-800" : "pt-6 border-t border-gray-200"
}
