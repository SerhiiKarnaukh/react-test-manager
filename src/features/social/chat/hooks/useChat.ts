import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAlertStore } from '@core/alert/alert.store'
import {
  fetchConversation,
  fetchConversations,
  sendChatMessage,
} from '@features/social/chat/api/chat'
import { getErrorMessage } from '@shared/utils/error'

export const conversationsKey = ['social', 'chat', 'conversations'] as const

export function conversationKey(conversationId: number) {
  return ['social', 'chat', 'conversation', conversationId] as const
}

function useQueryErrorAlert(isError: boolean, error: Error | null, fallback: string) {
  const enqueue = useAlertStore((s) => s.enqueue)

  useEffect(() => {
    if (isError) {
      enqueue('error', getErrorMessage(error, fallback))
    }
  }, [isError, error, enqueue, fallback])
}

export function useConversations(enabled = true) {
  const query = useQuery({
    queryKey: conversationsKey,
    queryFn: fetchConversations,
    enabled,
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load conversations')

  return query
}

export function useConversation(conversationId: number | null) {
  const query = useQuery({
    queryKey: conversationKey(conversationId ?? 0),
    queryFn: () => fetchConversation(conversationId!),
    enabled: Boolean(conversationId),
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load messages')

  return query
}

export function useSendChatMessage(conversationId: number | null) {
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: (body: string) => {
      if (!conversationId) {
        throw new Error('No active conversation')
      }
      return sendChatMessage(conversationId, body)
    },
    onError: (error) => {
      enqueue('error', getErrorMessage(error, 'Failed to send message'))
    },
  })
}
