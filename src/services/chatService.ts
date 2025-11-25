import { apiFetch, API_BASE_URL } from "@/lib/api"
import type { ChatMessage, ChatSession, ChatIdeaSummary } from "@/types/chat"

export const chatService = {

  async startChat(ideaId?: number): Promise<ChatSession> {
    const response = await apiFetch('/api/chat/start', {
      method: 'POST',
      body: JSON.stringify({ ideaId: ideaId || null }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Erro ao iniciar chat')
    }

    const data = await response.json()
    return mapResponseToSession(data)
  },

  async sendMessage(sessionId: number, message: string): Promise<ChatMessage> {
    const response = await apiFetch(`/api/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      let errorMessage = 'Erro ao enviar mensagem'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        const text = await response.text().catch(() => '')
        errorMessage = text || errorMessage
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return mapResponseToMessage(data)
  },

  async getSession(sessionId: number): Promise<ChatSession> {
    const response = await apiFetch(`/api/chat/sessions/${sessionId}`)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Erro ao buscar sessão')
    }

    const data = await response.json()
    return mapResponseToSession(data)
  },

  async getOlderMessages(
    sessionId: number, 
    before: string, 
    limit: number = 20
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    const url = new URL(`/api/chat/sessions/${sessionId}/messages`, API_BASE_URL)
    url.searchParams.set('before', before)
    url.searchParams.set('limit', limit.toString())

    const response = await apiFetch(url.pathname + url.search)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Erro ao buscar mensagens antigas')
    }

    const data = await response.json()
    return {
      messages: (data.messages || []).map(mapResponseToMessage),
      hasMore: data.hasMore || false,
    }
  },

  async getIdeasSummary(): Promise<ChatIdeaSummary[]> {
    const response = await apiFetch('/api/chat/ideas/summary')

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Erro ao buscar ideias')
    }

    const data = await response.json()
    return data.map((item: any) => ({
      ideaId: String(item.id),
      title: item.theme || 'Ideia',
      summary: item.summary || '',
      createdAt: item.createdAt || null,
    }))
  },

  async getChatLogs(params?: {
    date?: string;
    page?: number;
    size?: number;
  }): Promise<{
    selectedDate: string;
    summary: {
      totalInteractions: number;
      totalTokensInput: number;
      totalTokensOutput: number;
      totalTokens: number;
      averageResponseTimeMs: number;
    };
    interactions: Array<{
      interactionId: number;
      timestamp: string;
      sessionId: number;
      chatType: string;
      ideaId: number | null;
      userMessage: string;
      assistantMessage: string;
      metrics: {
        tokensInput: number;
        tokensOutput: number;
        totalTokens: number;
        responseTimeMs: number;
      };
    }>;
    pagination: {
      totalElements: number;
      totalPages: number;
      currentPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    const url = new URL('/api/chat/logs', API_BASE_URL)
    if (params?.date) url.searchParams.set('date', params.date)
    if (params?.page) url.searchParams.set('page', params.page.toString())
    if (params?.size) url.searchParams.set('size', params.size.toString())

    const response = await apiFetch(url.pathname + url.search)

    if (!response.ok) {
      let errorMessage = 'Erro ao buscar logs'
      try {
        const errorText = await response.text()
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.message || errorJson.error || errorText
          } catch {
            errorMessage = errorText
          }
        }
      } catch (e) {
        errorMessage = `Erro ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    return await response.json()
  },

  async getAdminChatLogs(params?: {
    date?: string;
    userId?: number;
    page?: number;
    size?: number;
  }): Promise<{
    selectedDate: string;
    filteredUserId: number | null;
    summary: {
      totalInteractions: number;
      totalTokensInput: number;
      totalTokensOutput: number;
      totalTokens: number;
      averageResponseTimeMs: number;
    };
    interactions: Array<{
      interactionId: number;
      timestamp: string;
      sessionId: number;
      chatType: string;
      ideaId: number | null;
      userId: number;
      userName: string;
      userEmail: string;
      userIp: string;
      userMessage: string;
      assistantMessage: string;
      metrics: {
        tokensInput: number;
        tokensOutput: number;
        totalTokens: number;
        responseTimeMs: number;
      };
    }>;
    pagination: {
      totalElements: number;
      totalPages: number;
      currentPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    const url = new URL('/api/chat/admin/logs', API_BASE_URL)
    if (params?.date) url.searchParams.set('date', params.date)
    if (params?.userId) url.searchParams.set('userId', params.userId.toString())
    if (params?.page) url.searchParams.set('page', params.page.toString())
    if (params?.size) url.searchParams.set('size', params.size.toString())

    const response = await apiFetch(url.pathname + url.search)

    if (!response.ok) {
      let errorMessage = 'Erro ao buscar logs de administrador'
      try {
        const errorText = await response.text()
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.message || errorJson.error || errorText
          } catch {
            errorMessage = errorText
          }
        }
      } catch (e) {
        errorMessage = `Erro ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    return await response.json()
  },
}

function mapResponseToSession(data: any): ChatSession {
  return {
    sessionId: data.sessionId,
    chatType: data.chatType || 'FREE',
    ideaId: data.ideaId ? String(data.ideaId) : null,
    ideaSummary: data.ideaSummary || null,
    tokensInput: data.tokensInput || 0,
    tokensOutput: data.tokensOutput || 0,
    totalTokens: data.totalTokens || 0,
    tokensRemaining: data.tokensRemaining ?? 10000, 
    lastResetAt: data.lastResetAt || null,
    messages: (data.messages || []).map(mapResponseToMessage),
    hasMoreMessages: data.hasMoreMessages ?? false,
  }
}

function mapResponseToMessage(data: any): ChatMessage {
  return {
    id: String(data.id),
    role: data.role === 'user' ? 'user' : 'assistant',
    content: data.content || '',
    createdAt: data.createdAt || new Date().toISOString(),
    tokensInput: data.tokensInput || null,
    tokensOutput: data.tokensOutput || null,
    totalTokens: data.totalTokens || null,
    tokensRemaining: data.tokensRemaining ?? null,
  }
}