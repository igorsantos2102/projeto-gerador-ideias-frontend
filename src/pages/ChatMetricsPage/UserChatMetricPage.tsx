import { useMemo, useState } from "react";
import {
  MessageSquareText,
  Gauge,
  Clock,
  Cpu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import ChatKpiCard from "@/components/StatsCard/ChatKpiCard";
import { InteractionsByHourChart, TokensByHourChart, LatencyByHourChart } from "@/components/charts";
import type { ChatFilter, Interaction as TypedInteraction } from "@/types/chatMetrics";
import { SERIES_COLORS } from "@/types/chatMetrics";
import { formatMs, formatInt, todayLocal } from "@/utils/format";
import { buildHourlySeries, computeKpis } from "@/utils/chatbot_metrics";
import ChatMetricsFilters from "@/components/ChatMetricsFilters/ChatMetricsFilters";
import ChatMetricsTable from "@/components/ChatMetricsTable/ChatMetricsTable";
import { useChatMetrics } from "@/hooks/useChatMetrics";
import Pagination from "@/components/common/Pagination";

export function UserChatMetricsPage() {
  const { darkMode } = useTheme();
  const today = todayLocal();

  const [date, setDate] = useState<string>(today);
  const [chatFilter, setChatFilter] = useState<ChatFilter>("ALL");
  const [compare, setCompare] = useState(false);
  const [page, setPage] = useState(1);

  const { interactions: allInteractions, summary } = useChatMetrics({
    date: date,
    page: 1,
    size: 1000,
    enabled: true,
  });

  const { status, interactions, pagination } = useChatMetrics({
    date: date,
    page: page,
    size: 10,
    enabled: true,
  });

  const filteredForCharts = useMemo(() => {
    if (chatFilter === "ALL") return allInteractions;
    return allInteractions.filter((it) => {
      if (chatFilter === "FREE") return it.chatType === "FREE";
      if (chatFilter === "CONTEXT") return it.chatType === "CONTEXT";
      return true;
    });
  }, [allInteractions, chatFilter]);

  const filtered = useMemo(() => {
    if (chatFilter === "ALL") return interactions;
    return interactions.filter((it) => {
      if (chatFilter === "FREE") return it.chatType === "FREE";
      if (chatFilter === "CONTEXT") return it.chatType === "CONTEXT";
      return true;
    });
  }, [interactions, chatFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setPage(1);
  };

  const handleChatFilterChange = (newFilter: ChatFilter) => {
    setChatFilter(newFilter);
    setPage(1);
  };

  const typedForSeries = useMemo<TypedInteraction[]>(
    () =>
      filteredForCharts.map((it) => ({
        interactionId: it.interactionId,
        timestamp: it.timestamp,
        sessionId: it.sessionId,
        chatType: it.chatType,
        tokensInput: it.tokensInput,
        tokensOutput: it.tokensOutput,
        responseTimeMs: it.responseTimeMs,
        userMessage: it.userMessage,
        assistantMessage: it.assistantMessage,
        ideaId: it.ideaId ?? null,
      })),
    [filteredForCharts]
  );

  const series = useMemo(() => buildHourlySeries(typedForSeries), [typedForSeries]);
  const { p50, p95, avgTokensPerInteraction } = useMemo(
    () => computeKpis(typedForSeries),
    [typedForSeries]
  );

  const isError = status === "error";
  const isLoading = status === "loading";

  const theme = useMemo(
    () => ({
      pageBg: darkMode ? "bg-slate-950" : "bg-slate-50/40",
      textBase: darkMode ? "text-slate-100" : "text-gray-900",
      cardBase: darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200",
      muted: darkMode ? "text-slate-400" : "text-gray-500",
    }),
    [darkMode]
  );

  const showCompare = chatFilter === "ALL" && compare;

  const singleColor =
    chatFilter === "FREE" ? SERIES_COLORS.FREE :
    chatFilter === "CONTEXT" ? SERIES_COLORS.CONTEXT :
    SERIES_COLORS.ALL;

  const singleColorSecondary =
    chatFilter === "FREE" ? SERIES_COLORS.FREE_OUT :
    chatFilter === "CONTEXT" ? SERIES_COLORS.CTX_OUT :
    SERIES_COLORS.ALL_OUT;

  const tableItems = useMemo(() => {
    return filtered.map((it) => ({
      interactionId: it.interactionId,
      timestamp: it.timestamp,
      sessionId: it.sessionId,
      chatFilter: it.chatType === "FREE" ? "FREE" as ChatFilter : "CONTEXT" as ChatFilter,
      tokensInput: it.tokensInput,
      tokensOutput: it.tokensOutput,
      responseTimeMs: it.responseTimeMs,
      userMessage: it.userMessage,
      assistantMessage: it.assistantMessage,
      ideaId: it.ideaId ?? null,
    }));
  }, [filtered]);

  return (
    <main className={cn("min-h-screen", theme.pageBg, theme.textBase)}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <header className="mb-6">
          <p className={cn("text-sm uppercase tracking-wide", darkMode ? "text-slate-500" : "text-gray-400")}>
            Uso
          </p>
          <h1 className="text-2xl font-semibold">Minhas métricas de uso da Aiko Ai</h1>
          <p className={cn("mt-2 text-sm md:text-base", theme.muted)}>
            Veja o resumo das suas interações para o período selecionado, incluindo tokens, tempo de resposta e
            histórico de mensagens.
          </p>
        </header>

        {isError && (
          <div 
            className={cn(
              "mb-6 rounded-xl", darkMode
                ? "border border-red-900 bg-red-800 p-4 text-red-50"
                : "border border-red-300 bg-red-50 p-4 text-red-700"
            )}
          >
            Não foi possível carregar as métricas agora. Tente novamente mais tarde.
          </div>
        )}

        {isLoading && (
          <div className={cn("mb-6 animate-pulse rounded-xl border p-6", theme.cardBase, theme.muted)}>
            Carregando métricas…
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {!!filteredForCharts.length && (
              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ChatKpiCard title="Interações Totais" value={formatInt(summary.totalInteractions)} subtitle={date} icon={MessageSquareText} />
                <ChatKpiCard title="Tokens (Input → Output)" value={`${formatInt(summary.totalTokensInput)} → ${formatInt(summary.totalTokensOutput)}`} subtitle={`Total: ${formatInt(summary.totalTokensInput + summary.totalTokensOutput)}`} icon={Gauge} />
                <ChatKpiCard title="Tempo Médio de Respostas" value={formatMs(summary.averageResponseTimeMs)} subtitle={`p50: ${formatMs(p50)} • p95: ${formatMs(p95)}`} icon={Clock} />
                <ChatKpiCard title="Média de Tokens por Interação" value={formatInt(Math.round(avgTokensPerInteraction))} subtitle="entrada + saída por interação" icon={Cpu} />
              </section>
            )}

            {!!filteredForCharts.length && (
              <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className={cn("rounded-2xl border p-4", theme.cardBase)}>
                  <h3 className="mb-2 text-sm font-medium">Interações por Hora</h3>
                  <div className="h-64">
                    <InteractionsByHourChart 
                      data={series}
                      compare={showCompare}
                      dark={darkMode}
                      colors={SERIES_COLORS}
                      singleColor={singleColorSecondary}
                    />
                  </div>
                </div>

                <div className={cn("rounded-2xl border p-4", theme.cardBase)}>
                  <h3 className="mb-2 text-sm font-medium">Tokens por Hora</h3>
                  <div className="h-64">
                    <TokensByHourChart
                      data={series}
                      compare={compare}
                      dark={darkMode}
                      colors={SERIES_COLORS}
                      singleColor={singleColor}
                      singleColorSecondary={singleColorSecondary}
                    />
                  </div>
                </div>

                <div className={cn("rounded-2xl border p-4 lg:col-span-2", theme.cardBase)}>
                  <h3 className="mb-2 text-sm font-medium">Tempo Médio de Resposta (ms) Por Hora</h3>
                  <div className="h-64">
                    <LatencyByHourChart
                      data={series}
                      compare={showCompare}
                      dark={darkMode}
                      colors={SERIES_COLORS}
                      singleColor={singleColor}
                    />
                  </div>
                </div>
              </section>
            )}

            <div className="mb-3">
              <ChatMetricsFilters
                date={date}
                onDateChange={handleDateChange}
                chatFilter={chatFilter}
                onChatFilterChange={handleChatFilterChange}
                compare={compare}
                onToggleCompare={() => setCompare((v) => !v)}
                darkMode={darkMode}
              />
            </div>

            <section className={cn("rounded-2xl border", theme.cardBase)}>
              <ChatMetricsTable
                items={tableItems}
                dark={darkMode}
                scopeLabel={chatFilter === "ALL" ? "ALL" : chatFilter}
              />
            </section>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNext={pagination.hasNext}
                  hasPrevious={pagination.hasPrevious}
                  onPageChange={handlePageChange}
                  darkMode={darkMode}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
