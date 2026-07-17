import { useEffect, useEffectEvent, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { buildSocialWebSocketUrl } from '@features/social/data-access/social-websocket.utils'
import type { SocialChatMessage } from '@features/social/chat/api/chat'
import { conversationKey } from '@features/social/chat/hooks/useChat'

type ChatSocketPayload = {
  message?: SocialChatMessage | null
}

/**
 * Connects to the chat WebSocket for the active conversation.
 * Disconnects on conversation switch / unmount (useEffect cleanup).
 */
export function useChatSocket(conversationId: number | null, userId: number | undefined) {
  const queryClient = useQueryClient()
  const socketRef = useRef<WebSocket | null>(null)

  const handleMessage = useEffectEvent((raw: string) => {
    if (!conversationId) return
    try {
      const payload = JSON.parse(raw) as ChatSocketPayload
      if (!payload.message) return

      queryClient.setQueryData(conversationKey(conversationId), (old: unknown) => {
        const current = old as { id: number; messages: SocialChatMessage[] } | undefined
        if (!current) {
          return { id: conversationId, messages: [payload.message!] }
        }
        if (current.messages.some((m) => m.id === payload.message!.id)) {
          return current
        }
        return {
          ...current,
          messages: [...current.messages, payload.message!],
        }
      })
    } catch {
      // Ignore malformed frames
    }
  })

  useEffect(() => {
    if (!conversationId || !userId) return

    const url = buildSocialWebSocketUrl(`/ws/social-chat/${conversationId}/${userId}/`)
    const socket = new WebSocket(url)
    socketRef.current = socket

    socket.onmessage = (event) => {
      handleMessage(String(event.data))
    }

    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close()
      }
      if (socketRef.current === socket) {
        socketRef.current = null
      }
    }
  }, [conversationId, userId, handleMessage])
}
