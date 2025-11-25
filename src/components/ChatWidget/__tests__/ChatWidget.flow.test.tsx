import { describe, expect, it, vi, beforeEach, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChatWidget } from "../ChatWidget";
import { chatService } from "@/services/chatService";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/services/chatService", () => ({
  chatService: {
    startChat: vi.fn(),
    getIdeasSummary: vi.fn(),
    sendMessage: vi.fn(),
    getOlderMessages: vi.fn(),
  },
}));

const startChatMock = vi.mocked(chatService.startChat);
const getIdeasSummaryMock = vi.mocked(chatService.getIdeasSummary);

const defaultFreeSession = {
  sessionId: 1,
  tokensRemaining: 900,
  messages: [],
  hasMoreMessages: false,
  chatType: "FREE" as const,
};

const ideaSummary = {
  ideaId: "42",
  title: "Teste",
  summary: "Resumo",
  createdAt: null,
};

const scrollIntoViewMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoViewMock,
  });
});

afterAll(() => {
  scrollIntoViewMock.mockRestore?.();
});

beforeEach(() => {
  vi.clearAllMocks();
  scrollIntoViewMock.mockClear();
});

afterEach(() => {
  scrollIntoViewMock.mockClear();
});

describe("ChatWidget flows", () => {
  it("opens chat, loads free session and shows token notice", async () => {
    startChatMock.mockResolvedValueOnce(defaultFreeSession as any);
    getIdeasSummaryMock.mockResolvedValue([]);

    renderWithProviders(<ChatWidget />);

    const openButton = screen.getByRole("button", { name: /abrir chat/i });
    await userEvent.click(openButton);

    await waitFor(() => expect(startChatMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/Chat Livre/i)).toBeInTheDocument();
    expect(screen.getByText(/Atenção:/i)).toBeInTheDocument();
  });

  it("switches to ideas tab, loads ideas and selects one", async () => {
    startChatMock.mockResolvedValue(defaultFreeSession as any);
    getIdeasSummaryMock.mockResolvedValue([ideaSummary as any]);

    renderWithProviders(<ChatWidget />);
    const openButton = screen.getByRole("button", { name: /abrir chat/i });
    await userEvent.click(openButton);

    const ideasTab = screen.getByRole("button", { name: /chat ideias/i });
    await userEvent.click(ideasTab);

    await waitFor(() =>
      expect(screen.getByText(ideaSummary.title)).toBeInTheDocument()
    );

    const ideaButton = screen.getByRole("button", { name: /Teste/i });
    startChatMock.mockResolvedValueOnce({
      ...defaultFreeSession,
      sessionId: 2,
      chatType: "IDEA_BASED",
    } as any);

    await userEvent.click(ideaButton);

    await waitFor(() =>
      expect(startChatMock).toHaveBeenCalledWith(42)
    );
  });
});
