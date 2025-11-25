// src/components/Footer/AppFooter.tsx
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type AppFooterProps = {
  forceLightMode?:boolean;
};

export function AppFooter({ forceLightMode = false }: Readonly<AppFooterProps>) {
  const { darkMode } = useTheme();
  const isDark = !forceLightMode && darkMode;

  return (
    <footer
      className={cn(
        "w-full border-t py-6 px-8",
        isDark
          ? "bg-slate-950 border-slate-800 text-gray-400"
          : "bg-background border-gray-200 text-secondary"
      )}
    >
      <div className="max-w-7xl mx-auto text-center text-xs font-light">
        © 2025 Montreal · AceleraMaker
        <br />
        Gerador de Ideias Criativas com IA
      </div>
    </footer>
  );
}
