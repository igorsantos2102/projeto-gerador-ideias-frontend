import type { Interaction } from "@/types/chatMetrics";

export type HourSlot = {
  hour: string;              // "00".."23"
  countAll: number;
  countFree: number;
  countContext: number;
  tokensInAll: number;
  tokensOutAll: number;
  tokensInFree: number;
  tokensOutFree: number;
  tokensInContext: number;
  tokensOutContext: number;
  avgRtAll: number;
  avgRtFree: number;
  avgRtContext: number;
};

export const buildHourlySeries = (items: Interaction[]): HourSlot[] => {
  const base: HourSlot[] = Array.from({ length: 24 }, (_, h) => ({
    hour: String(h).padStart(2, "0"),
    countAll: 0, countFree: 0, countContext: 0,
    tokensInAll: 0, tokensOutAll: 0,
    tokensInFree: 0, tokensOutFree: 0,
    tokensInContext: 0, tokensOutContext: 0,
    avgRtAll: 0, avgRtFree: 0, avgRtContext: 0,
  }));

  const accRt = base.map(() => ({ all: 0, free: 0, ctx: 0 }));

  for (const it of items) {
    const h = new Date(it.timestamp).getHours();
    const slot = base[h];
    const rt = accRt[h];

    slot.countAll += 1;
    slot.tokensInAll += it.tokensInput;
    slot.tokensOutAll += it.tokensOutput;
    rt.all += it.responseTimeMs;

    if (it.chatType === "FREE") {
      slot.countFree += 1;
      slot.tokensInFree += it.tokensInput;
      slot.tokensOutFree += it.tokensOutput;
      rt.free += it.responseTimeMs;
    } else {
      slot.countContext += 1;
      slot.tokensInContext += it.tokensInput;
      slot.tokensOutContext += it.tokensOutput;
      rt.ctx += it.responseTimeMs;
    }
  }

  for (let i = 0; i < base.length; i++) {
    const b = base[i], r = accRt[i];
    b.avgRtAll = b.countAll ? Math.round(r.all / b.countAll) : 0;
    b.avgRtFree = b.countFree ? Math.round(r.free / b.countFree) : 0;
    b.avgRtContext = b.countContext ? Math.round(r.ctx / b.countContext) : 0;
  }

  return base;
};

export const percentile = (values: number[], p: number) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a,b)=>a-b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const w = idx - lo;
  return sorted[lo] * (1 - w) + sorted[hi] * w;
};

export const computeKpis = (items: Interaction[]) => {
  const totalInput  = items.reduce((s,i)=>s+i.tokensInput,0);
  const totalOutput = items.reduce((s,i)=>s+i.tokensOutput,0);
  const totalAll    = totalInput + totalOutput;
  const avgRt = items.length ? items.reduce((s,i)=>s+i.responseTimeMs,0)/items.length : 0;
  const avgTokensPerInteraction = items.length ? totalAll / items.length : 0;
  const rts = items.map(i=>i.responseTimeMs);
  return {
    totalInput, totalOutput, totalAll,
    avgRt, p50: percentile(rts,50), p95: percentile(rts,95),
    avgTokensPerInteraction
  };
};
