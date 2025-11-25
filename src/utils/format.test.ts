import { describe, expect, it, vi } from "vitest";
import { formatInt, formatMs, hhmm, todayLocal } from "@/utils/format";

describe("format helpers", () => {
  it("formats ISO time strings into hh:mm", () => {
    const iso = "2025-01-01T03:07:00Z";
    const expected = new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    expect(hhmm(iso)).toBe(expected);
  });

  it("formats milliseconds into readable strings", () => {
    expect(formatMs()).toBe("-");
    expect(formatMs(999)).toBe("999 ms");
    expect(formatMs(1500)).toBe("1.5 s");
  });

  it("rounds and localizes integers", () => {
    expect(formatInt(1234.6)).toBe("1.235");
    expect(formatInt(5000)).toBe("5.000");
  });
});

describe("todayLocal helper", () => {
  it("returns the current date in en-CA format", () => {
    vi.useFakeTimers();
    try {
      const target = new Date("2025-12-31T23:59:59Z");
      vi.setSystemTime(target);

      expect(todayLocal()).toBe("2025-12-31");
    } finally {
      vi.useRealTimers();
    }
  });
});
