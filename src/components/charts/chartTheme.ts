export const getChartTheme = (dark: boolean) => ({
  tooltip: {
    contentStyle: {
      background: dark ? "#1e293b" : "#ffffff",
      border: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
      borderRadius: 8,
    },
    labelStyle: { color: dark ? "#e2e8f0" : "#0f172a" },
    itemStyle: { color: dark ? "#e2e8f0" : "#0f172a" },
  },
  cursorFill: dark ? "rgba(20,28,45,.35)" : "rgba(226,232,240,.4)",
});
