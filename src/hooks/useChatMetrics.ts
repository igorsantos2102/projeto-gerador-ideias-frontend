import { useState, useEffect, useCallback } from 'react'
import { chatService } from '@/services/chatService'
import type { Interaction, DataStatus } from '@/types/chatMetrics'

type UseChatMetricsParams = {
  date?: string
  page?: number
  size?: number
  enabled?: boolean
}

type UseChatMetricsResult = {
  status: DataStatus
  interactions: Interaction[]
  summary: {
    totalInteractions: number
    totalTokensInput: number
    totalTokensOutput: number
    averageResponseTimeMs: number
  }
  pagination: {
    totalElements: number
    totalPages: number
    currentPage: number
    hasNext: boolean
    hasPrevious: boolean
  } | null
  refetch: () => Promise<void>
}

export function useChatMetrics(params: UseChatMetricsParams = {}): UseChatMetricsResult {
  const { date, page = 1, size = 100, enabled = true } = params
  const [status, setStatus] = useState<DataStatus>('loading')
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [summary, setSummary] = useState({
    totalInteractions: 0,
    totalTokensInput: 0,
    totalTokensOutput: 0,
    averageResponseTimeMs: 0,
  })
  const [pagination, setPagination] = useState<UseChatMetricsResult['pagination']>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setStatus('ready')
      return
    }

    setStatus('loading')
    try {
      const data = await chatService.getChatLogs({ date, page, size })

      const mappedInteractions: Interaction[] = data.interactions.map((it) => ({
        interactionId: it.interactionId,
        timestamp: it.timestamp,
        sessionId: it.sessionId,
        chatType: (it.chatType === 'IDEA_BASED' ? 'CONTEXT' : 'FREE') as 'FREE' | 'CONTEXT',
        tokensInput: it.metrics.tokensInput,
        tokensOutput: it.metrics.tokensOutput,
        responseTimeMs: it.metrics.responseTimeMs,
        userMessage: it.userMessage,
        assistantMessage: it.assistantMessage,
        ideaId: it.ideaId,
      }))

      setInteractions(mappedInteractions)
      setSummary({
        totalInteractions: data.summary.totalInteractions,
        totalTokensInput: data.summary.totalTokensInput,
        totalTokensOutput: data.summary.totalTokensOutput,
        averageResponseTimeMs: data.summary.averageResponseTimeMs,
      })
      setPagination(data.pagination)
      setStatus(mappedInteractions.length === 0 ? 'empty' : 'ready')
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Detalhes do erro:', errorMessage)
      setStatus('error')
      setInteractions([])
      setSummary({
        totalInteractions: 0,
        totalTokensInput: 0,
        totalTokensOutput: 0,
        averageResponseTimeMs: 0,
      })
      setPagination(null)
    }
  }, [date, page, size, enabled])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return {
    status,
    interactions,
    summary,
    pagination,
    refetch: fetchData,
  }
}

type UseAdminChatMetricsParams = {
  date?: string
  userId?: number
  page?: number
  size?: number
  enabled?: boolean
}

type AdminInteraction = Interaction & {
  userId: number
  userName: string
  userEmail: string
  userIp?: string
}

type UseAdminChatMetricsResult = {
  status: DataStatus
  interactions: AdminInteraction[]
  summary: {
    totalInteractions: number
    totalTokensInput: number
    totalTokensOutput: number
    averageResponseTimeMs: number
  }
  pagination: {
    totalElements: number
    totalPages: number
    currentPage: number
    hasNext: boolean
    hasPrevious: boolean
  } | null
  filteredUserId: number | null
  refetch: () => Promise<void>
}

export function useAdminChatMetrics(params: UseAdminChatMetricsParams = {}): UseAdminChatMetricsResult {
  const { date, userId, page = 1, size = 100, enabled = true } = params
  const [status, setStatus] = useState<DataStatus>('loading')
  const [interactions, setInteractions] = useState<AdminInteraction[]>([])
  const [summary, setSummary] = useState({
    totalInteractions: 0,
    totalTokensInput: 0,
    totalTokensOutput: 0,
    averageResponseTimeMs: 0,
  })
  const [pagination, setPagination] = useState<UseAdminChatMetricsResult['pagination']>(null)
  const [filteredUserId, setFilteredUserId] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setStatus('ready')
      return
    }

    setStatus('loading')
    try {
      const data = await chatService.getAdminChatLogs({ date, userId, page, size })

      const mappedInteractions: AdminInteraction[] = data.interactions.map((it) => ({
        interactionId: it.interactionId,
        timestamp: it.timestamp,
        sessionId: it.sessionId,
        chatType: (it.chatType === 'IDEA_BASED' ? 'CONTEXT' : 'FREE') as 'FREE' | 'CONTEXT',
        tokensInput: it.metrics.tokensInput,
        tokensOutput: it.metrics.tokensOutput,
        responseTimeMs: it.metrics.responseTimeMs,
        userMessage: it.userMessage,
        assistantMessage: it.assistantMessage,
        ideaId: it.ideaId,
        userId: it.userId,
        userName: it.userName,
        userEmail: it.userEmail,
        userIp: it.userIp,
      }))

      setInteractions(mappedInteractions)
      setSummary({
        totalInteractions: data.summary.totalInteractions,
        totalTokensInput: data.summary.totalTokensInput,
        totalTokensOutput: data.summary.totalTokensOutput,
        averageResponseTimeMs: data.summary.averageResponseTimeMs,
      })
      setPagination(data.pagination)
      setFilteredUserId(data.filteredUserId)
      setStatus(mappedInteractions.length === 0 ? 'empty' : 'ready')
    } catch (error) {
      console.error('Erro ao buscar logs de admin:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Detalhes do erro:', errorMessage)
      setStatus('error')
      setInteractions([])
      setSummary({
        totalInteractions: 0,
        totalTokensInput: 0,
        totalTokensOutput: 0,
        averageResponseTimeMs: 0,
      })
      setPagination(null)
      setFilteredUserId(null)
    }
  }, [date, userId, page, size, enabled])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return {
    status,
    interactions,
    summary,
    pagination,
    filteredUserId,
    refetch: fetchData,
  }
}