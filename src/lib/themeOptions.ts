import type { FilterHistoryOption } from "@/components/FilterHistory";
import { themeService, type Theme } from "@/services/themeService";

export const FALLBACK_THEME_OPTIONS: FilterHistoryOption[] = [
  { label: "Todas", value: "" },
];

export async function loadThemeOptions(options?: { mode?: string }): Promise<FilterHistoryOption[]> {
  const mode = options?.mode ?? import.meta.env.MODE;
  if (mode === "test") {
    return FALLBACK_THEME_OPTIONS;
  }

  try {
    const remoteThemes = await themeService.getAll();
    if (Array.isArray(remoteThemes) && remoteThemes.length > 0) {
      const normalized = buildThemeOptions(remoteThemes);
      return [{ label: "Todas", value: "" }, ...normalized];
    }
  } catch (error) {
    console.error("Erro ao carregar temas:", error);
  }

  return FALLBACK_THEME_OPTIONS;
}

export function buildThemeOptions(themes: Theme[]): FilterHistoryOption[] {
  const seen = new Set<string>();
  const normalized: FilterHistoryOption[] = [];

  for (const theme of themes) {
    const option = toThemeOption(theme);
    const key = option.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(option);
  }

  return normalized;
}

function toThemeOption(theme: Theme): FilterHistoryOption {
  const fallbackLabel =
    typeof theme.id === "number" ? `Tema ${theme.id}` : "Tema personalizado";
  const label = theme.name?.trim() || fallbackLabel;
  const value =
    theme.id !== undefined && theme.id !== null
      ? String(theme.id)
      : label.toLowerCase();

  return { label, value };
}
