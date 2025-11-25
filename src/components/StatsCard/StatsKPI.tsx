import { memo, type ReactNode } from "react";
import BaseStatsCard from "./BaseStatsCard";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

export type StatsKPIProps = {
  title: string;
  value: ReactNode;
  delay?: 0 | 100 | 200 | 300 | 400;
  className?: string;
  elevated?: boolean;
  labelClassName?: string;
  valueClassName?: string;
};

export default memo(function StatsKPI({
  title,
  value,
  delay = 0,
  className,
  elevated = false,
  labelClassName,
  valueClassName,
}: StatsKPIProps) {
  const { darkMode } = useTheme();

  const header = (
    <p
      className={cn(
        "text-sm font-light mb-3",
        darkMode ? "text-slate-300" : "text-gray-600",
        labelClassName
      )}
    >
      {title}
    </p>
  );

  return (
    <BaseStatsCard
      header={header}
      value={
        <p
          className={cn(
            "text-5xl font-light",
            darkMode ? "text-slate-50" : "text-gray-900",
            valueClassName
          )}
        >
          {value}
        </p>
      }
      delay={delay}
      elevated={elevated}
      className={className}
    />
  );
});
