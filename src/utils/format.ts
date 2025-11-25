export const hhmm = (iso: string, locale = "pt-BR") =>
  new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

export const formatMs = (ms?: number | null) => {
  if (ms == null) return "-";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
};

export const formatInt = (n: number) => Math.round(n).toLocaleString("pt-BR");

export const todayLocal = () => new Date().toLocaleDateString("en-CA");
