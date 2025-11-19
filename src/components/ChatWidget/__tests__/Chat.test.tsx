import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Chat } from "../Chat"

const baseMessage = (overrides: Partial<Parameters<typeof Chat>[0]["messages"][number]>) => ({
  id: "msg-1",
  role: "assistant" as const,
  content: "Olá do assistente",
  ...overrides,
})

const scrollIntoViewMock = vi.fn()
const originalScrollIntoView = HTMLElement.prototype.scrollIntoView

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: scrollIntoViewMock,
  })
})

afterEach(() => {
  if (originalScrollIntoView) {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: originalScrollIntoView,
    })
  } else {
    delete (HTMLElement.prototype as any).scrollIntoView
  }
  scrollIntoViewMock.mockReset()
})

describe("Chat", () => {
  it("shows a loader when fetching a conversation with no messages", () => {
    render(
      <Chat
        messages={[]}
        isLoading
        onSend={vi.fn()}
        placeholder="Escreva algo"
      />
    )

    expect(screen.getByText(/Carregando conversa/i)).toBeInTheDocument()
  })

  it("renders messages, notice, token info, and typing dots", async () => {
    const { container } = render(
      <Chat
        messages={[
          baseMessage({ role: "assistant", content: "Respondendo" }),
          baseMessage({ id: "msg-2", role: "user", content: "Pergunta do usuário" }),
        ]}
        notice="Atenção: Restam apenas 50 tokens."
        showTyping
        tokensRemaining={50}
        onSend={vi.fn()}
        placeholder="Digite aqui"
        chatType="free"
      />
    )

    expect(screen.getByText("Respondendo")).toBeInTheDocument()
    expect(screen.getByText("Pergunta do usuário")).toBeInTheDocument()
    expect(screen.getByText("Atenção: Restam apenas 50 tokens.")).toBeInTheDocument()
    expect(screen.getByText(/Cada chat possui um limite/i)).toBeInTheDocument()

    const typingDots = container.querySelectorAll('span[style*="chat-typing"]')
    expect(typingDots).toHaveLength(3)
  })

  it("renders an error message when provided", () => {
    render(
      <Chat
        messages={[]}
        error="Ops, falha!"
        onSend={vi.fn()}
        placeholder="Escreva algo"
      />
    )

    expect(screen.getByText("Ops, falha!")).toBeInTheDocument()
  })

  it("prevents sending while disabled or empty", async () => {
    const onSend = vi.fn()
    render(
      <Chat
        messages={[]}
        disabled
        onSend={onSend}
        placeholder="Escreva algo"
      />
    )

    const sendButton = screen.getByRole("button", { name: /Enviar mensagem/i })
    expect(sendButton).toBeDisabled()

    const textarea = screen.getByPlaceholderText("Escreva algo")
    fireEvent.change(textarea, { target: { value: "oi" } })
    fireEvent.click(sendButton)
    expect(onSend).not.toHaveBeenCalled()
  })

  it("triggers onSend when clicking the send button with content", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(
      <Chat
        messages={[]}
        onSend={onSend}
        placeholder="Escreva algo"
      />
    )

    const textarea = screen.getByPlaceholderText("Escreva algo")
    fireEvent.change(textarea, { target: { value: "oi" } })
    const sendButton = screen.getByRole("button", { name: /Enviar mensagem/i })
    fireEvent.click(sendButton)

    await waitFor(() => expect(onSend).toHaveBeenCalledWith("oi"))
    expect(textarea).toHaveValue("")
  })

  it("submits the message when Enter is pressed", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined)
    render(
      <Chat
        messages={[]}
        onSend={onSend}
        placeholder="Escreva algo"
      />
    )

    const textarea = screen.getByPlaceholderText("Escreva algo")
    fireEvent.change(textarea, { target: { value: "teste" } })
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false })
    await waitFor(() => expect(onSend).toHaveBeenCalledWith("teste"))
  })

  it("loads older messages when scrolling near the top", async () => {
    const loadOlder = vi.fn().mockResolvedValue(undefined)
    const { container } = render(
      <Chat
        messages={[baseMessage({})]}
        onSend={vi.fn()}
        placeholder="Escreva algo"
        onLoadOlderMessages={loadOlder}
        hasMoreMessages
      />
    )

    const scrollContainer = container.querySelector(".overflow-y-auto")
    if (!scrollContainer) throw new Error("scroll container not found")
    scrollContainer.scrollTop = 0
    Object.defineProperty(scrollContainer, "scrollHeight", {
      configurable: true,
      get: () => 1000,
    })
    Object.defineProperty(scrollContainer, "clientHeight", {
      configurable: true,
      get: () => 500,
    })

    fireEvent.scroll(scrollContainer, { target: { scrollTop: 0 } })
    await waitFor(() => expect(loadOlder).toHaveBeenCalled())
  })
})
