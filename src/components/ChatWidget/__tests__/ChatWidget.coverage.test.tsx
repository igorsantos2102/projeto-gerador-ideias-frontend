import { describe, expect, it, beforeEach, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ChatWidget } from "../ChatWidget"
import { chatService } from "@/services/chatService"

vi.mock("@/services/chatService", () => ({
  chatService: {
    startChat: vi.fn(),
    getIdeasSummary: vi.fn(),
    sendMessage: vi.fn(),
    getOlderMessages: vi.fn(),
  },
}))

const startChatMock = vi.mocked(chatService.startChat)
const getIdeasSummaryMock = vi.mocked(chatService.getIdeasSummary)
const sendMessageMock = vi.mocked(chatService.sendMessage)

beforeEach(() => {
  vi.resetAllMocks()
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: () => {},
  })
})

const makeSession = (overrides: Partial<any> = {}) => ({
  sessionId: overrides.sessionId ?? 1,
  chatType: overrides.chatType ?? "FREE",
  ideaId: overrides.ideaId ?? null,
  tokensRemaining: overrides.tokensRemaining ?? 1200,
  messages: overrides.messages ?? [],
  hasMoreMessages: overrides.hasMoreMessages ?? false,
  ideaSummary: null,
  tokensInput: 0,
  tokensOutput: 0,
  totalTokens: 0,
  lastResetAt: null,
})

describe("ChatWidget coverage extras", () => {
  it("mostra aviso de tokens baixos no chat livre", async () => {
    startChatMock.mockResolvedValueOnce(makeSession({ tokensRemaining: 500 }))

    render(<ChatWidget defaultOpen />)

    await waitFor(() => expect(startChatMock).toHaveBeenCalled())
    expect(screen.getByText(/Restam apenas/i)).toBeInTheDocument()
    expect(screen.getByText(/Cada chat possui um limite/i)).toBeInTheDocument()
  })

  it("remove mensagem otimista e mostra erro quando send falha", async () => {
    startChatMock.mockResolvedValueOnce(makeSession({ tokensRemaining: 2000 }))
    sendMessageMock.mockRejectedValueOnce(new Error("fail send"))

    render(<ChatWidget defaultOpen />)

    await waitFor(() => expect(startChatMock).toHaveBeenCalled())
    const textarea = await screen.findByPlaceholderText(/Escreva sua mensagem/i)
    await userEvent.type(textarea, "oi erro")
    await userEvent.click(screen.getByRole("button", { name: /Enviar mensagem/i }))

    await waitFor(() => expect(sendMessageMock).toHaveBeenCalled())
    expect(await screen.findByText(/fail send/i)).toBeInTheDocument()
  })

  it("exibe erro ao enviar mensagem em chat de ideia", async () => {
    startChatMock.mockImplementation((ideaId?: number) =>
      ideaId
        ? makeSession({ sessionId: 2, chatType: "IDEA_BASED", ideaId: String(ideaId), tokensRemaining: 800 })
        : makeSession({ tokensRemaining: 1500 })
    )
    getIdeasSummaryMock.mockResolvedValueOnce([{ ideaId: "42", title: "Ideia X", summary: "Resumo" }])
    sendMessageMock.mockRejectedValueOnce(new Error("erro ideia"))

    render(<ChatWidget defaultOpen />)

    await waitFor(() => expect(startChatMock).toHaveBeenCalledTimes(1))
    await userEvent.click(screen.getByRole("button", { name: /Chat Ideias/i }))

    const ideaButton = await screen.findByRole("button", { name: /Ideia X/i })
    await userEvent.click(ideaButton)
    await waitFor(() => expect(startChatMock).toHaveBeenCalledWith(42))

    const ideaTextarea = await screen.findByPlaceholderText(/Escreva sua pergunta/i)
    await userEvent.type(ideaTextarea, "falha")
    await userEvent.click(screen.getByRole("button", { name: /Enviar mensagem/i }))

    await waitFor(() => expect(sendMessageMock).toHaveBeenCalled())
    const errors = await screen.findAllByText(/erro ideia/i)
    expect(errors.length).toBeGreaterThan(0)
  })

  it("mostra aviso de tokens em chat de ideia selecionada", async () => {
    startChatMock.mockImplementation((ideaId?: number) =>
      ideaId
        ? makeSession({ sessionId: 2, chatType: "IDEA_BASED", ideaId: String(ideaId), tokensRemaining: 300 })
        : makeSession({ tokensRemaining: 1500 })
    )

    getIdeasSummaryMock.mockResolvedValueOnce([
      { ideaId: "42", title: "Ideia X", summary: "Resumo" },
    ])

    render(<ChatWidget defaultOpen />)

    await waitFor(() => expect(startChatMock).toHaveBeenCalledTimes(1))
    const ideasTab = screen.getByRole("button", { name: /Chat Ideias/i })
    await userEvent.click(ideasTab)

    const ideaButton = await screen.findByRole("button", { name: /Ideia X/i })
    await userEvent.click(ideaButton)

    await waitFor(() => expect(startChatMock).toHaveBeenCalledWith(42))
    expect(await screen.findByText(/Conversando sobre/i)).toBeInTheDocument()
    expect(screen.getByText(/Restam apenas/i)).toBeInTheDocument()
  })
})
