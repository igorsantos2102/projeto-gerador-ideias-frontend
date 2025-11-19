// pages/DashboardPage/DashboardPage.tsx
import { useMemo, useState, useEffect, useCallback } from "react";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import StatsKPI from "@/components/StatsCard/StatsKPI";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";
import { useTheme } from "@/hooks/useTheme";
import { statsService, type DashboardStats } from "@/services/statsService";
import { subscribeHistoryRefresh } from "@/events/historyEvents";

export type Idea = {
  id: string;
  theme: string;
  context: string;
  content: string;
  timestamp: Date;
  isFavorite: boolean;
  responseTime?: number;
};

export type DashboardPageProps = {
  ideas?: Idea[];
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ ideas = [] }) => {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = useCallback(async (options?: { silent?: boolean }) => {
    // Não mostra o indicador de "carregando" para atualizações silenciosas em segundo plano
    if (!options?.silent) {
      setIsLoading(true);
    }
    try {
      const dashboardStats = await statsService.getStats();
      setStats(dashboardStats);
    } catch (e: unknown) {
      console.error("Falha ao buscar estatísticas do dashboard:", e);
      // Em caso de erro, mantém os dados antigos se existirem, para não zerar a tela.
      if (!stats) {
        setStats({ totalIdeas: 0, totalFavorites: 0, averageResponseTime: 0 });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
    // Atualiza silenciosamente quando um evento de refresh é recebido
    const unsubscribe = subscribeHistoryRefresh(() => fetchDashboardStats({ silent: true }));

    return () => unsubscribe();
  }, [fetchDashboardStats]);

  useEffect(() => {
    // Atualiza silenciosamente quando o usuário volta para a aba
    const handleFocus = () => fetchDashboardStats({ silent: true });
    window.addEventListener('focus', handleFocus);

    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchDashboardStats]);

  const byTheme = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of ideas) m.set(i.theme, (m.get(i.theme) ?? 0) + 1);
    return Array.from(m.entries()).map(([tema, quantidade]) => ({
      tema,
      quantidade,
    }));
  }, [ideas]);

  const palette = ["#a855f7", "#818cf8", "#3b82f6", "#8b5cf6", "#6366f1"];

  const headingColorClass = darkMode ? "text-white" : "text-gray-900"
  const headingClass = cn("text-3xl font-light mb-8", headingColorClass)
  const themeStyles = getThemeStyles(darkMode)
  const {
    metaClass,
    sectionClass,
    sectionTitleClass,
    tooltipBorder,
    tooltipTextColor,
    tooltipBackground,
    cursorFill,
    activeBarFill,
    axisStroke,
    gridStroke,
  } = themeStyles

  const safeStats: DashboardStats = stats ?? {
    totalIdeas: 0,
    totalFavorites: 0,
    averageResponseTime: 0,
  }
  const totalIdeasValue = isLoading ? "..." : safeStats.totalIdeas
  const favoritesValue = isLoading ? "..." : safeStats.totalFavorites
  const averageResponseValue = isLoading ? "..." : Math.round(safeStats.averageResponseTime)

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h2 className={headingClass}>
        Dashboard
      </h2>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsKPI
          title="Total de Ideias"
          value={totalIdeasValue}
          className="animate-fadeInUp"
        />
        <StatsKPI
          title="Favoritos"
          value={favoritesValue}
          className="animate-fadeInUp animation-delay-100"
        />
        <StatsKPI
          title="Tempo Médio"
          value={
            <span>
              {averageResponseValue}
              <span
                className={metaClass}
              >
                ms
              </span>
            </span>
          }
          className="animate-fadeInUp animation-delay-200"
        />
      </div>

      {/* Ideas by Theme */}
      {ideas.length > 0 && (
        <SectionContainer className={sectionClass}>
          <p className={sectionTitleClass}>Ideias por Tema</p>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTheme}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="tema" stroke={axisStroke} />
                <YAxis stroke={axisStroke} />
                <Tooltip
                  contentStyle={{
                    background: tooltipBackground,
                    border: tooltipBorder,
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: tooltipTextColor }}
                  itemStyle={{ color: tooltipTextColor }}
                  cursor={{
                    fill: cursorFill,
                  }}
                />
                <Bar
                  dataKey="quantidade"
                  radius={[8, 8, 0, 0]}
                  activeBar={{
                    fill: activeBarFill,
                  }}
                >
                  {byTheme.map(({ tema }, i) => (
                    <Cell key={tema} fill={palette[i % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionContainer>
      )}
    </div>
  );
};

function getThemeStyles(darkMode: boolean) {
  return {
    metaClass: cn(
      "text-sm ml-1 font-light",
      darkMode ? "text-slate-300" : "text-gray-500"
    ),
    sectionClass: cn(
      "rounded-2xl p-8 mt-8 animate-fadeInUp animation-delay-300 border",
      darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
    ),
    sectionTitleClass: cn(
      "text-lg font-light mb-6",
      darkMode ? "text-slate-100" : "text-gray-700"
    ),
    tooltipBorder: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
    tooltipTextColor: darkMode ? "#e2e8f0" : "#0f172a",
    tooltipBackground: darkMode ? "#1e293b" : "white",
    cursorFill: darkMode ? "rgba(20, 28, 45, 0.35)" : "rgba(226, 232, 240, 0.4)",
    activeBarFill: darkMode ? "rgba(61, 64, 241, 0.35)" : "rgba(59, 130, 246, 0.15)",
    axisStroke: darkMode ? "#cbd5e1" : "#6b7280",
    gridStroke: darkMode ? "#475569" : "#e5e7eb",
  }
}

export default DashboardPage;
