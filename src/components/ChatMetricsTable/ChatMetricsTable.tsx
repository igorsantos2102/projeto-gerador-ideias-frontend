import React, { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMs, hhmm } from "@/utils/format";
import type { ChatFilter } from "@/types/chatMetrics";
import { CHAT_FILTER_BADGE_LABELS } from "@/types/chatMetrics";

type Row = {
  interactionId: number;
  timestamp: string;
  sessionId: number;
  chatFilter: ChatFilter;
  tokensInput: number;
  tokensOutput: number;
  responseTimeMs: number;
  userMessage: string;
  assistantMessage: string;
  ideaId?: number | null;

  userName?: string | null;
  userEmail?: string | null;
};

export type ChatMetricsTableProps = Readonly<{
  items: Row[];
  dark: boolean;
  scopeLabel?: string;
  showUserColumns?: boolean;
  showIds?: boolean;
}>;

export default function ChatMetricsTable({
  items,
  dark,
  scopeLabel,
  showUserColumns = false,
  showIds = true,
}: Readonly<ChatMetricsTableProps>) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  const theme = useMemo(
    () => ({
      cardBase: dark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200",
      muted: dark ? "text-slate-400" : "text-gray-500",
      headerBg: dark ? "bg-slate-900" : "bg-white",
      rowBorder: dark ? "border-slate-800" : "border-gray-200",
      detailsBg: dark ? "bg-slate-900/60" : "bg-gray-50",
      textStrong: dark ? "text-slate-100" : "text-gray-900",
      btnBase: dark
        ? "border-slate-700 bg-slate-900 hover:bg-slate-800"
        : "border-gray-200 bg-white hover:bg-gray-50",
    }),
    [dark]
  );

  const toggle = useCallback((id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const totalColumns = 6 + (showUserColumns ? 2 : 0) + (showIds ? 1 : 0);

  // 🔵 Tradução do filtro selecionado
  const scopeLabelPt = getScopeLabelPt(scopeLabel);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <h3 className="text-sm font-medium">Interações ({items.length})</h3>

        <div className={cn("text-xs", theme.muted)}>
          Mostrando: {scopeLabelPt}
        </div>
      </div>

      <div className="max-h-[560px] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className={cn("sticky top-0 z-10", theme.headerBg, theme.muted)}>
            <tr>
              <th className="px-4 py-3">Hora</th>

              {showUserColumns && (
                <>
                  <th className="px-4 py-3">Usuário</th>
                  <th className="px-4 py-3">E-mail</th>
                </>
              )}

              {showIds && <th className="px-4 py-3">IDs</th>}

              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Tokens (entrada/saída/total)</th>
              <th className="px-4 py-3">Tempo de resposta</th>
              <th className="px-4 py-3">Prévia</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it) => {
              const isOpen = expanded.has(it.interactionId);
              const totalTokens = it.tokensInput + it.tokensOutput;
              const detailsId = `interaction-details-${it.interactionId}`;

              return (
                <React.Fragment key={it.interactionId}>
                  <tr className={cn("align-top border-t", theme.rowBorder)}>
                    <td className={cn("px-4 py-3 font-mono text-xs", theme.textStrong)}>
                      {hhmm(it.timestamp)}
                    </td>

                    {showUserColumns && (
                      <>
                        <td className="px-4 py-3 text-xs font-medium">
                          {it.userName ?? "—"}
                        </td>
                        <td className={cn("px-4 py-3 text-xs", theme.muted)}>
                          {it.userEmail ?? "—"}
                        </td>
                      </>
                    )}

                    {showIds && (
                      <td className="px-4 py-3 text-xs">
                        <div>interação: {it.interactionId}</div>
                        <div className={theme.muted}>sessão: {it.sessionId}</div>
                        {it.ideaId != null && (
                          <div className={theme.muted}>ideia: {it.ideaId}</div>
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs",
                          getBadgeClasses(it.chatFilter, dark)
                        )}
                      >
                        {CHAT_FILTER_BADGE_LABELS[it.chatFilter]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {it.tokensInput} / {it.tokensOutput} /{" "}
                      <span className="font-medium">{totalTokens}</span>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {formatMs(it.responseTimeMs)}
                    </td>

                    <td className="max-w-[420px] px-4 py-3 text-xs">
                      <div className="line-clamp-2">
                        <span className="font-medium">U:</span> {it.userMessage}
                      </div>

                      <div className={cn("line-clamp-2", theme.muted)}>
                        <span className="font-medium">A:</span> {it.assistantMessage}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(it.interactionId)}
                        aria-expanded={isOpen}
                        aria-controls={detailsId}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs",
                          theme.btnBase
                        )}
                      >
                        {isOpen ? (
                          <>
                            Ocultar <ChevronUp className="h-3 w-3" />
                          </>
                        ) : (
                          <>
                            Ver <ChevronDown className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className={cn("border-t", theme.rowBorder)}>
                      <td
                        id={detailsId}
                        colSpan={totalColumns}
                        className={cn("p-4", theme.detailsBg)}
                      >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className={cn("rounded-xl border p-3", theme.cardBase)}>
                            <div className={cn("mb-1 text-xs font-medium", theme.muted)}>
                              Mensagem do Usuário
                            </div>
                            <pre
                              className={cn(
                                "whitespace-pre-wrap wrap-break-word text-xs",
                                theme.textStrong
                              )}
                            >
                              {it.userMessage}
                            </pre>
                          </div>

                          <div className={cn("rounded-xl border p-3", theme.cardBase)}>
                            <div className={cn("mb-1 text-xs font-medium", theme.muted)}>
                              Mensagem da Assistente
                            </div>
                            <pre
                              className={cn(
                                "whitespace-pre-wrap wrap-break-word text-xs",
                                theme.textStrong
                              )}
                            >
                              {it.assistantMessage}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {!items.length && (
              <tr>
                <td colSpan={totalColumns} className={cn("px-4 py-12 text-center", theme.muted)}>
                  Nenhuma interação foi encontrada nesse período
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function getScopeLabelPt(scopeLabel?: string) {
  switch (scopeLabel) {
    case "ALL":
      return "Todos";
    case "FREE":
      return "Livres";
    case "CONTEXT":
      return "Com contexto";
    default:
      return "—";
  }
}

function getBadgeClasses(filter: ChatFilter, dark: boolean) {
  if (filter === "FREE") {
    return dark ? "bg-blue-500/20 text-blue-100" : "bg-blue-100/60 text-blue-700";
  }

  return dark ? "bg-emerald-500/20 text-emerald-100" : "bg-emerald-100/60 text-emerald-700";
}
