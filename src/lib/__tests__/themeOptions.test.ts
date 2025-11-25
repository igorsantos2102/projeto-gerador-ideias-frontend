import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Theme } from "@/services/themeService";
import { themeService } from "@/services/themeService";
import {
  FALLBACK_THEME_OPTIONS,
  buildThemeOptions,
  loadThemeOptions,
} from "../themeOptions";

vi.mock("@/services/themeService", () => ({
  themeService: {
    getAll: vi.fn(),
  },
}));

const themeServiceMock = vi.mocked(themeService);

describe("themeOptions utils", () => {
  beforeEach(() => {
    themeServiceMock.getAll.mockReset();
  });

  it("returns fallback options when running in test mode", async () => {
    const options = await loadThemeOptions({ mode: "test" });
    expect(options).toEqual(FALLBACK_THEME_OPTIONS);
    expect(themeServiceMock.getAll).not.toHaveBeenCalled();
  });

  it("builds options from remote themes and preserves identity", async () => {
    themeServiceMock.getAll.mockResolvedValue([
      { id: 1, name: "Tecnologia" },
      { id: 2, name: "Tecnologia" },
      { id: 3, name: "Gestão" },
      { id: 4, name: "gestão" },
      { id: 5, name: "" },
    ] satisfies Theme[]);

    const options = await loadThemeOptions({ mode: "production" });

    expect(themeServiceMock.getAll).toHaveBeenCalledOnce();
    expect(options).toEqual([
      { label: "Todas", value: "" },
      { label: "Tecnologia", value: "1" },
      { label: "Gestão", value: "3" },
      { label: "Tema 5", value: "5" },
    ]);
  });

  it("falls back when the service rejects", async () => {
    themeServiceMock.getAll.mockRejectedValueOnce(new Error("boom"));
    const options = await loadThemeOptions({ mode: "production" });
    expect(options).toEqual(FALLBACK_THEME_OPTIONS);
  });

  it("buildThemeOptions deduplicates normalized values", () => {
    const themes: Theme[] = [
      { id: 1, name: "Saúde" },
      { id: 2, name: "saúde" },
      { id: 3, name: "Educação" },
    ];

    const result = buildThemeOptions(themes);

    expect(result).toEqual([
      { label: "Saúde", value: "1" },
      { label: "Educação", value: "3" },
    ]);
  });
});
