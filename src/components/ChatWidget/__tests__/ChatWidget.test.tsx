import { describe, expect, vi, beforeEach, it } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ChatWidget } from "../ChatWidget"
import { chatService } from "@/services/chatService"

vi.mock("@/services/chatService", () => ({
  chatService: {
    getIdeasSummary: vi.fn(),
    startChat: vi.fn(),
    sendMessage: vi.fn(),
    getOlderMessages: vi.fn(),
  },
}))

try {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: () => {},
  })
} catch {
  // ignore if property not configurable
}

const getIdeasSummaryMock = vi.mocked(chatService.getIdeasSummary)
const startChatMock = vi.mocked(chatService.startChat)
const sendMessageMock = vi.mocked(chatService.sendMessage)
const getOlderMessagesMock = vi.mocked(chatService.getOlderMessages)

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    getIdeasSummaryMock.mockResolvedValue([
      { ideaId: "42", title: "Test Idea", summary: "Resumo da ideia" },
    ])
    startChatMock.mockImplementation(async (ideaId?: number) => ({
      sessionId: ideaId ?? 1,
      chatType: ideaId ? "IDEA_BASED" : "FREE",
      ideaId: ideaId ? String(ideaId) : null,
      ideaSummary: null,
      tokensInput: 0,
      tokensOutput: 0,
      totalTokens: 0,
      tokensRemaining: 1500,
      lastResetAt: null,
      messages: [],
      hasMoreMessages: false,
    }))
    sendMessageMock.mockResolvedValue({
      id: "msg",
      role: "assistant",
      content: "ok",
    })
    getOlderMessagesMock.mockResolvedValue({ messages: [], hasMore: false })
  })
  it("opens the chat, loads the free session, and shows token warning", async () => {
    render(<ChatWidget />)

    const toggle = screen.getByRole("button", { name: /Abrir chat/i })
    fireEvent.click(toggle)

    await waitFor(() => {
      expect(startChatMock).toHaveBeenCalled()
    })

    expect(screen.getByText(/Chat Livre/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Escreva sua mensagem/i)).toBeInTheDocument()
    expect(await screen.findByRole("alert")).toBeInTheDocument()
  })

  it("loads ideas when switching tabs and opens the idea chat", async () => {
    render(<ChatWidget />)

    fireEvent.click(screen.getByRole("button", { name: /Abrir chat/i }))
    await waitFor(() => expect(startChatMock).toHaveBeenCalled())

    const ideaTabs = screen.getAllByRole("button", { name: /Chat Ideias/i })
    fireEvent.click(ideaTabs[0])
    await waitFor(() => expect(getIdeasSummaryMock).toHaveBeenCalled())

    expect(screen.getByText(/Suas Ideias/i)).toBeInTheDocument()
    expect(screen.getByText(/Selecione uma ideia/)).toBeInTheDocument()

    const ideaButton = await screen.findByRole("button", { name: /Test Idea/i })
    fireEvent.click(ideaButton)

    await waitFor(() => expect(startChatMock).toHaveBeenCalledWith(42))
    expect(await screen.findByText(/Conversando sobre:/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Escreva sua pergunta/i)).toBeInTheDocument()
  })

  it("shows an error banner when ideas fail to load and retries successfully", async () => {
    getIdeasSummaryMock
      .mockRejectedValueOnce(new Error("falha"))
      .mockResolvedValue([{ ideaId: "99", title: "Nova ideia", summary: "Resumo" }])

    render(<ChatWidget />)

    fireEvent.click(screen.getByRole("button", { name: /Abrir chat/i }))
    const ideaTabs = screen.getAllByRole("button", { name: /Chat Ideias/i })
    fireEvent.click(ideaTabs[0])

    const errorNodes = await screen.findAllByText("falha")
    expect(errorNodes[0]).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Tentar novamente/i }))
    await waitFor(() => expect(getIdeasSummaryMock).toHaveBeenCalledTimes(2))
  })
})
