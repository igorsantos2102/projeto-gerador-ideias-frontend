import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-dom/client", () => {
  const render = vi.fn();
  const createRoot = vi.fn(() => ({ render }));
  return { default: { createRoot }, createRoot };
});

describe("main entrypoint", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.clearAllMocks();
  });

  it("cria a raiz e renderiza a árvore principal", async () => {
    const { createRoot } = await import("react-dom/client");

    await import("./main");

    expect(createRoot).toHaveBeenCalledTimes(1);
    const render = (createRoot as any).mock.results[0].value.render;
    expect(render).toHaveBeenCalledTimes(1);
  });
});
