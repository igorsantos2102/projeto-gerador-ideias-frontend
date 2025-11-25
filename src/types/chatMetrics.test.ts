import { describe, expect, it } from "vitest";
import {
  CHAT_FILTER_BADGE_LABELS,
  CHAT_FILTER_LABELS,
  SERIES_COLORS,
} from "@/types/chatMetrics";

describe("chat metrics constants", () => {
  it("exposes readable filter labels", () => {
    expect(CHAT_FILTER_LABELS.ALL).toBe("Todos os tipos");
    expect(CHAT_FILTER_LABELS.FREE).toBe("Chat livre");
    expect(CHAT_FILTER_LABELS.CONTEXT).toBe("Chat com contexto");
  });

  it("exposes badge labels", () => {
    expect(CHAT_FILTER_BADGE_LABELS.ALL).toBe("Todos");
    expect(CHAT_FILTER_BADGE_LABELS.FREE).toBe("Livre");
    expect(CHAT_FILTER_BADGE_LABELS.CONTEXT).toBe("Contexto");
  });

  it("defines colors for the series", () => {
    expect(SERIES_COLORS.ALL).toContain("#");
    expect(SERIES_COLORS.CONTEXT).toContain("#");
    expect(SERIES_COLORS.FREE).toContain("#");
  });
});
