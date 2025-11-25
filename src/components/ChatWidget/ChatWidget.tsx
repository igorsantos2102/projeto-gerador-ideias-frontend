import { useCallback, useEffect, useMemo, useState } from "react"
import { MessageSquare, X, Sparkles, MessageCircle, Clock } from "lucide-react"
import { Chat } from "./Chat"
import { TokenNotification } from "./TokenNotification"
import type { ChatMessage, ChatSession, ChatIdeaSummary } from "@/types/chat"
import { chatService } from "@/services/chatService"

type ChatWidgetProps = {
  readonly defaultOpen?: boolean
}

type TabKey = "free" | "ideas"

export function ChatWidget({ defaultOpen = false }: ChatWidgetProps) {
  const state = useChatWidgetState(defaultOpen)

  return (
    <>
      <ChatNotifications state={state} />
      <ChatBackdrop open={state.open} onClose={() => state.setOpen(false)} />
      <ChatContainer open={state.open} activeTab={state.activeTab} state={state} />
    </>
  )
}

type ChatContainerProps = {
  readonly open: boolean
  readonly activeTab: TabKey
  readonly state: ReturnType<typeof useChatWidgetState>
}

function ChatContainer({ open, activeTab, state }: ChatContainerProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex w-full flex-col items-end gap-3 px-4 md:px-0 ${
        open && activeTab === "ideas" ? "max-w-[900px]" : "max-w-[800px]"
      }`}
    >
      {open && <ChatWindow activeTab={activeTab} state={state} />}
      {!open && <ChatLabel />}
      <ChatToggleButton open={open} onToggle={() => state.setOpen((prev) => !prev)} />
    </div>
  )
}

type ChatNotificationsProps = {
  readonly state: ReturnType<typeof useChatWidgetState>
}

function ChatNotifications({ state }: ChatNotificationsProps) {
  return (
    <>
      {state.freeTokensRemaining !== null && state.activeTab === "free" && state.open && (
        <TokenNotification tokensRemaining={state.freeTokensRemaining} />
      )}
      {state.ideaTokensRemaining !== null && state.activeTab === "ideas" && state.open && (
        <TokenNotification tokensRemaining={state.ideaTokensRemaining} />
      )}
    </>
  )
}

type ChatBackdropProps = {
  open: boolean
  onClose: () => void
}

function ChatBackdrop({ open, onClose }: Readonly<ChatBackdropProps>) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:bg-transparent"
      onClick={onClose}
      aria-hidden="true"
    />
  )
}

function ChatLabel() {
  return (
    <div className="mb-2 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
      <span className="text-sm font-medium text-slate-700">Fale com Aiko AI</span>
    </div>
  )
}

type ChatToggleButtonProps = {
  open: boolean
  onToggle: () => void
}

function ChatToggleButton({ open, onToggle }: ChatToggleButtonProps) {
  return (
    <button
      type="button"
      aria-label={open ? "Fechar chat" : "Abrir chat"}
      aria-expanded={open}
      onClick={onToggle}
      className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white shadow-[0_16px_40px_rgba(99,102,241,0.35)] transition-all duration-300 hover:scale-110 hover:shadow-[0_20px_44px_rgba(99,102,241,0.42)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a855f7]"
    >
      {open ? (
        <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
      ) : (
        <MessageSquare className="h-6 w-6" />
      )}
    </button>
  )
}

type ChatWindowProps = {
  activeTab: TabKey
  state: ReturnType<typeof useChatWidgetState>
}

function ChatWindow({ activeTab, state }: ChatWindowProps) {
  return (
    <div className="flex h-[700px] w-full flex-col overflow-hidden rounded-[32px] border border-[#d9d4ff] bg-white shadow-[0_28px_70px_rgba(99,102,241,0.2)]">
      <ChatHeader activeTab={activeTab} state={state} />
      <ChatContent activeTab={activeTab} state={state} />
    </div>
  )
}

type ChatHeaderProps = {
  activeTab: TabKey
  state: ReturnType<typeof useChatWidgetState>
}

function ChatHeader({ activeTab, state }: ChatHeaderProps) {
  return (
    <header className="border-b border-[#eceafd]">
      <ChatHeaderTop onClose={() => state.setOpen(false)} />
      <ChatTabs activeTab={activeTab} onTabChange={state.handleTabChange} />
    </header>
  )
}

function ChatHeaderTop({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 pb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white font-bold">
          <span className="text-xs">AI</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Aiko AI</p>
          <p className="text-xs text-slate-500">Assistente Inteligente</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar chat"
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

type ChatTabsProps = {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

function ChatTabs({ activeTab, onTabChange }: ChatTabsProps) {
  return (
    <div className="flex px-5">
      <TabButton
        isActive={activeTab === "free"}
        onClick={() => onTabChange("free")}
        icon={<MessageCircle className="h-4 w-4" />}
        label="Chat Livre"
      />
      <TabButton
        isActive={activeTab === "ideas"}
        onClick={() => onTabChange("ideas")}
        icon={<Sparkles className="h-4 w-4" />}
        label="Chat Ideias"
      />
    </div>
  )
}

type TabButtonProps = {
  isActive: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function TabButton({ isActive, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all ${
        isActive
          ? "border-purple-600 text-purple-600"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

type ChatContentProps = {
  activeTab: TabKey
  state: ReturnType<typeof useChatWidgetState>
}

function ChatContent({ activeTab, state }: ChatContentProps) {
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {activeTab === "ideas" && <IdeasSidebar state={state} />}
      <ChatArea activeTab={activeTab} state={state} />
    </div>
  )
}

type IdeasSidebarProps = {
  state: ReturnType<typeof useChatWidgetState>
}

function IdeasSidebar({ state }: IdeasSidebarProps) {
  return (
    <aside className="flex-shrink-0 flex flex-col border-r border-[#eceafd] bg-gray-50 text-slate-700 transition-all duration-300 ease-in-out overflow-hidden w-64">
      <div className="px-4 py-3.5 bg-white">
        <h3 className="font-semibold text-slate-800 text-sm">Suas Ideias</h3>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <IdeasList
          ideas={state.ideasList}
          isLoading={state.isLoadingIdeas}
          error={state.ideaError}
          selectedIdeaId={state.selectedIdeaId}
          onRetry={state.loadIdeas}
          onSelect={state.handleIdeaSelect}
        />
      </div>
    </aside>
  )
}

type ChatAreaProps = {
  activeTab: TabKey
  state: ReturnType<typeof useChatWidgetState>
}

function ChatArea({ activeTab, state }: ChatAreaProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white overflow-hidden">
      {activeTab === "ideas" && state.selectedIdea && <IdeaHeader selectedIdea={state.selectedIdea} />}
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        {activeTab === "free" ? (
          <FreeChatArea state={state} />
        ) : (
          <IdeaChatArea state={state} />
        )}
      </div>
    </div>
  )
}

type IdeaHeaderProps = {
  selectedIdea: ChatIdeaSummary
}

function IdeaHeader({ selectedIdea }: IdeaHeaderProps) {
  return (
    <div className="px-5 py-3 bg-purple-50 border-b border-[#eceafd] flex items-center gap-2 text-sm">
      <Sparkles className="h-4 w-4 text-purple-600" />
      <span className="text-slate-600">Conversando sobre:</span>
      <span className="font-semibold text-purple-600">{selectedIdea.title}</span>
    </div>
  )
}

type FreeChatAreaProps = {
  state: ReturnType<typeof useChatWidgetState>
}

function FreeChatArea({ state }: FreeChatAreaProps) {
  return (
    <div className="flex-1 min-h-0">
      <Chat
        messages={state.freeMessages}
        disabled={state.isSendingFree || state.isLoadingFree}
        error={state.freeError}
        isLoading={state.isLoadingFree}
        isSending={state.isSendingFree}
        showTyping={state.isSendingFree}
        notice={
          state.freeTokensRemaining !== null && state.freeTokensRemaining < 1000
            ? `Atenção: Restam apenas ${formatTokensRemaining(state.freeTokensRemaining)} tokens.`
            : null
        }
        onLoadOlderMessages={state.loadOlderFreeMessages}
        onSend={state.handleFreeSend}
        placeholder="Escreva sua mensagem..."
        hasMoreMessages={state.hasMoreFreeMessages}
        isLoadingOlder={state.isLoadingOlderFree}
        tokensRemaining={state.freeTokensRemaining}
        chatType="free"
      />
    </div>
  )
}

type IdeaChatAreaProps = {
  state: ReturnType<typeof useChatWidgetState>
}

function IdeaChatArea({ state }: IdeaChatAreaProps) {
  const tokenWarning =
    state.ideaTokensRemaining !== null && state.ideaTokensRemaining < 1000
      ? `Restam apenas ${formatTokensRemaining(state.ideaTokensRemaining)} tokens.`
      : null

  const ideaNotice = state.selectedIdea ? tokenWarning : "Selecione uma ideia na coluna ao lado para liberar o chat."

  return (
    <div className="flex-1 min-h-0">
      <Chat
        messages={state.selectedIdea ? state.ideaMessages : []}
        disabled={!state.selectedIdea || state.isSendingIdea || state.isLoadingIdea}
        error={state.ideaError}
        isLoading={state.isLoadingIdea}
        isSending={state.isSendingIdea}
        showTyping={state.isSendingIdea}
        notice={ideaNotice}
        onLoadOlderMessages={state.loadOlderIdeaMessages}
        onSend={state.handleIdeaSend}
        placeholder={
          state.selectedIdea
            ? `Escreva sua pergunta sobre "${state.selectedIdea.title || "a ideia"}"...`
            : "Selecione uma ideia para conversar..."
        }
        hasMoreMessages={state.hasMoreIdeaMessages}
        isLoadingOlder={state.isLoadingOlderIdea}
        tokensRemaining={state.ideaTokensRemaining}
        chatType="ideas"
      />
    </div>
  )
}

function useChatWidgetState(defaultOpen: boolean) {
  const [open, setOpen] = useState(defaultOpen)
  const [activeTab, setActiveTab] = useState<TabKey>("free")
  const [freeSession, setFreeSession] = useState<ChatSession | null>(null)
  const [freeMessages, setFreeMessages] = useState<ChatMessage[]>([])
  const [isLoadingFree, setIsLoadingFree] = useState(false)
  const [isSendingFree, setIsSendingFree] = useState(false)
  const [freeError, setFreeError] = useState<string | null>(null)
  const [freeTokensRemaining, setFreeTokensRemaining] = useState<number | null>(null)
  const [isLoadingOlderFree, setIsLoadingOlderFree] = useState(false)
  const [hasMoreFreeMessages, setHasMoreFreeMessages] = useState(true)
  const [ideaSession, setIdeaSession] = useState<ChatSession | null>(null)
  const [ideaMessages, setIdeaMessages] = useState<ChatMessage[]>([])
  const [isLoadingIdea, setIsLoadingIdea] = useState(false)
  const [isSendingIdea, setIsSendingIdea] = useState(false)
  const [ideaError, setIdeaError] = useState<string | null>(null)
  const [ideaTokensRemaining, setIdeaTokensRemaining] = useState<number | null>(null)
  const [ideasList, setIdeasList] = useState<ChatIdeaSummary[]>([])
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false)
  const [isLoadingOlderIdea, setIsLoadingOlderIdea] = useState(false)
  const [hasMoreIdeaMessages, setHasMoreIdeaMessages] = useState(true)
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)

  const selectedIdea = useMemo(
    () => ideasList.find((idea) => idea.ideaId === selectedIdeaId) ?? null,
    [ideasList, selectedIdeaId]
  )

  const loadIdeas = useCallback(async () => {
    setIsLoadingIdeas(true)
    setIdeaError(null)
    try {
      const ideas = await chatService.getIdeasSummary()
      setIdeasList(ideas)
    } catch (error) {
      console.error("Erro ao carregar ideias:", error)
      setIdeaError(error instanceof Error ? error.message : "Erro ao carregar ideias")
    } finally {
      setIsLoadingIdeas(false)
    }
  }, [])

  const loadFreeChat = useCallback(async () => {
    setIsLoadingFree(true)
    setFreeError(null)
    try {
      const session = await chatService.startChat()
      setFreeSession(session)
      setFreeMessages(session.messages || [])
      setFreeTokensRemaining(session.tokensRemaining)
      setHasMoreFreeMessages(session.hasMoreMessages ?? false)
    } catch (error) {
      console.error("Erro ao carregar chat livre:", error)
      setFreeError(error instanceof Error ? error.message : "Erro ao carregar chat")
    } finally {
      setIsLoadingFree(false)
    }
  }, [])

  const loadIdeaChat = useCallback(async (ideaId: number) => {
    setIsLoadingIdea(true)
    setIdeaError(null)
    try {
      const session = await chatService.startChat(ideaId)
      setIdeaSession(session)
      setIdeaMessages(session.messages || [])
      setIdeaTokensRemaining(session.tokensRemaining)
      setHasMoreIdeaMessages(session.hasMoreMessages ?? false)
    } catch (error) {
      console.error("Erro ao carregar chat de ideia:", error)
      setIdeaError(error instanceof Error ? error.message : "Erro ao carregar chat")
    } finally {
      setIsLoadingIdea(false)
    }
  }, [])

  const loadOlderFreeMessages = useCallback(async () => {
    if (!freeSession || isLoadingOlderFree || !hasMoreFreeMessages) return

    const oldestMessage = freeMessages[0]
    if (!oldestMessage?.createdAt) {
      setHasMoreFreeMessages(false)
      return
    }

    setIsLoadingOlderFree(true)
    try {
      const result = await chatService.getOlderMessages(
        freeSession.sessionId,
        typeof oldestMessage.createdAt === "string"
          ? oldestMessage.createdAt
          : new Date(oldestMessage.createdAt).toISOString(),
        20
      )

      if (result.messages.length === 0) {
        setHasMoreFreeMessages(false)
      } else {
        setFreeMessages((prev) => [...result.messages, ...prev])
        setHasMoreFreeMessages(result.hasMore)
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens antigas:", error)
      setHasMoreFreeMessages(false)
    } finally {
      setIsLoadingOlderFree(false)
    }
  }, [freeSession, freeMessages, hasMoreFreeMessages, isLoadingOlderFree])

  const loadOlderIdeaMessages = useCallback(async () => {
    if (!ideaSession || isLoadingOlderIdea || !hasMoreIdeaMessages) return

    const oldestMessage = ideaMessages[0]
    if (!oldestMessage?.createdAt) {
      setHasMoreIdeaMessages(false)
      return
    }

    setIsLoadingOlderIdea(true)
    try {
      const result = await chatService.getOlderMessages(
        ideaSession.sessionId,
        typeof oldestMessage.createdAt === "string"
          ? oldestMessage.createdAt
          : new Date(oldestMessage.createdAt).toISOString(),
        20
      )

      if (result.messages.length === 0) {
        setHasMoreIdeaMessages(false)
      } else {
        setIdeaMessages((prev) => [...result.messages, ...prev])
        setHasMoreIdeaMessages(result.hasMore)
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens antigas:", error)
      setHasMoreIdeaMessages(false)
    } finally {
      setIsLoadingOlderIdea(false)
    }
  }, [ideaSession, ideaMessages, hasMoreIdeaMessages, isLoadingOlderIdea])

  const handleFreeSend = useCallback(
    async (message: string) => {
      if (!freeSession) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      }
      setFreeMessages((prev) => [...prev, userMessage])
      setIsSendingFree(true)
      setFreeError(null)

      try {
        const response = await chatService.sendMessage(freeSession.sessionId, message)
        setFreeMessages((prev) => [...prev, response])

        if (response.tokensRemaining !== null && response.tokensRemaining !== undefined) {
          setFreeTokensRemaining(response.tokensRemaining)
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error)
        setFreeError(error instanceof Error ? error.message : "Erro ao enviar mensagem")
        setFreeMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
      } finally {
        setIsSendingFree(false)
      }
    },
    [freeSession]
  )

  const handleIdeaSend = useCallback(
    async (message: string) => {
      if (!ideaSession || !selectedIdeaId) return

      const userMessage: ChatMessage = {
        id: `idea-user-${Date.now()}`,
        role: "user",
        content: message,
      }
      setIdeaMessages((prev) => [...prev, userMessage])
      setIsSendingIdea(true)
      setIdeaError(null)

      try {
        const response = await chatService.sendMessage(ideaSession.sessionId, message)
        setIdeaMessages((prev) => [...prev, response])

        if (response.tokensRemaining !== null && response.tokensRemaining !== undefined) {
          setIdeaTokensRemaining(response.tokensRemaining)
        }
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error)
        setIdeaError(error instanceof Error ? error.message : "Erro ao enviar mensagem")
        setIdeaMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
      } finally {
        setIsSendingIdea(false)
      }
    },
    [ideaSession, selectedIdeaId]
  )

  const handleIdeaSelect = useCallback(
    async (idea: ChatIdeaSummary) => {
      setSelectedIdeaId(idea.ideaId)
      setIdeaSession(null)
      setIdeaMessages([])
      setIdeaTokensRemaining(null)
      await loadIdeaChat(Number(idea.ideaId))
    },
    [loadIdeaChat]
  )

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab)
    setFreeError(null)
    setIdeaError(null)
  }, [])

  useEffect(() => {
    if (open && activeTab === "ideas") {
      loadIdeas()
    }
  }, [open, activeTab, loadIdeas])

  useEffect(() => {
    if (open && activeTab === "free" && !freeSession) {
      loadFreeChat()
    }
  }, [open, activeTab, freeSession, loadFreeChat])

  useEffect(() => {
    if (open && activeTab === "ideas" && selectedIdeaId && !ideaSession) {
      loadIdeaChat(Number(selectedIdeaId))
    }
  }, [open, activeTab, selectedIdeaId, ideaSession, loadIdeaChat])

  return {
    activeTab,
    freeMessages,
    freeError,
    freeTokensRemaining,
    hasMoreFreeMessages,
    handleFreeSend,
    handleIdeaSend,
    handleIdeaSelect,
    handleTabChange,
    ideaError,
    ideaMessages,
    ideaTokensRemaining,
    ideasList,
    isLoadingFree,
    isLoadingIdeas,
    isLoadingIdea,
    isLoadingOlderFree,
    isLoadingOlderIdea,
    isLoadingIdeasSidebar: isLoadingIdeas,
    isSendingFree,
    isSendingIdea,
    loadIdeas,
    loadOlderFreeMessages,
    loadOlderIdeaMessages,
    open,
    selectedIdea,
    selectedIdeaId,
    setOpen,
    hasMoreIdeaMessages,
  }
}

type IdeasListProps = {
  ideas: ChatIdeaSummary[]
  isLoading: boolean
  error: string | null
  selectedIdeaId: string | null
  onSelect: (idea: ChatIdeaSummary) => void
  onRetry: () => Promise<void>
}

function IdeasList({ ideas, isLoading, error, selectedIdeaId, onSelect, onRetry }: IdeasListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center px-4 py-8">
        <p className="text-xs text-slate-500">Carregando ideias...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-4">
        <p className="text-xs text-rose-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-xs text-slate-600 underline hover:text-slate-900"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (ideas.length === 0) {
    return <p className="px-4 py-4 text-xs text-slate-500">Gere uma ideia para vê-la por aqui.</p>
  }

  return (
    <>
      {ideas.map((idea) => (
        <button
          key={idea.ideaId}
          type="button"
          onClick={() => onSelect(idea)}
          className={`w-full px-4 py-3 text-left transition-all ${
            selectedIdeaId === idea.ideaId ? "bg-white border-l-4 border-l-[#6366f1]" : "hover:bg-white/60"
          }`}
        >
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm font-semibold text-slate-800 line-clamp-1 flex-1">{idea.title || "Ideia"}</p>
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 mb-1">{idea.summary || "Sem resumo"}</p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Recente</span>
          </div>
        </button>
      ))}
    </>
  )
}

function formatTokensRemaining(tokens: number | null) {
  if (tokens === null) return null
  return tokens.toLocaleString("pt-BR")
}
