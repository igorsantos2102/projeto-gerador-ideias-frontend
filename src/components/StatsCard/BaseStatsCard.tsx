import { memo, type ReactNode } from "react";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import "./style.css";

type Delay = 0 | 100 | 200 | 300 | 400;

export type BaseStatsCardProps = {
  header?: ReactNode;
  value: ReactNode;
  footer?: ReactNode;
  delay?: Delay;
  elevated?: boolean;
  className?: string;
};

export default memo(function BaseStatsCard({
  header,
  value,
  footer,
  delay = 0,
  elevated = true,
  className,
}: BaseStatsCardProps) {
  const { darkMode } = useTheme();

  let delayCls = "";
  if (delay === 100) {
    delayCls = "animation-delay-100";
  } else if (delay === 200) {
    delayCls = "animation-delay-200";
  } else if (delay === 300) {
    delayCls = "animation-delay-300";
  } else if (delay === 400) {
    delayCls = "animation-delay-400";
  }

  return (
    <SectionContainer
      className={cn(
        "stats-card-scope rounded-2xl p-8 border",
        darkMode 
          ? "bg-slate-900 border-slate-800" 
          : "bg-white border-gray-200",
        "transition-all-smooth hover-lift hover-border-ring",
        elevated ? "shadow-md" : "shadow",
        "animate-fadeInUp",
        delayCls,
        className
      )}
    >
      {header ? <div className="mb-6">{header}</div> : null}
      <div>{value}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </SectionContainer>
  );
});
