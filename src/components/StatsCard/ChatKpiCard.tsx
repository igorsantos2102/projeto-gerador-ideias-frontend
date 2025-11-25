// src/components/Stats/ChatKpiCard.tsx
import { memo, type ReactNode } from "react";
import BaseStatsCard from "./BaseStatsCard";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import type { LucideIcon } from "lucide-react";

export type ChatKpiCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  delay?: 0 | 100 | 200 | 300 | 400;
  className?: string;
  elevated?: boolean;
};

const ChatKpiCard = memo(function ChatKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  delay = 0,
  className,
  elevated = true,
}: ChatKpiCardProps) {
  const { darkMode } = useTheme();

  const header = (
    <div className="flex items-center gap-3">
      {Icon ? (
        <div
          className={cn(
            "rounded-xl p-3",
            darkMode ? "bg-slate-800" : "bg-[--color-muted]"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              darkMode ? "text-slate-50" : "text-gray-600"
            )}
          />
        </div>
      ) : null}
      <div>
        <p
          className={cn(
            "text-sm",
            darkMode ? "text-slate-200" : "text-gray-600"
          )}
        >
          {title}
        </p>

        {/* o valor fica no "value" do BaseStatsCard, mas deixamos o título junto ao ícone */}
      </div>
    </div>
  );

  return (
    <BaseStatsCard
      header={header}
      value={
        <div>
          <p
          className={cn(
            "text-4xl font-light",
            darkMode ? "text-slate-50" : "text-gray-900",
            className
          )}
        >
          {value}
        </p>
          {subtitle ? (
            <p
              className={cn(
                "mt-1 text-xs",
                darkMode ? "text-slate-400" : "text-gray-900"
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      }
      delay={delay}
      elevated={elevated}
      className={cn("p-5", className)}
    />
  );
});

export default ChatKpiCard;
