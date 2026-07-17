import { useEffect, useEffectEvent, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { buildSocialWebSocketUrl } from '@features/social/data-access/social-websocket.utils'
import { notificationsKey } from '@features/social/notifications/hooks/useNotifications'

type NotificationSocketPayload = {
  message?: unknown
}

/**
 * Connects to the notification WebSocket while authenticated.
 * On any truthy message payload, invalidates the notifications query (full refetch).
 */
export function useNotificationSocket(userId: number | undefined, enabled: boolean) {
  const queryClient = useQueryClient()
  const socketRef = useRef<WebSocket | null>(null)

  const handleMessage = useEffectEvent((raw: string) => {
    try {
      const payload = JSON.parse(raw) as NotificationSocketPayload
      if (!payload.message) return
      void queryClient.invalidateQueries({ queryKey: notificationsKey })
    } catch {
      // Ignore malformed frames
    }
  })

  useEffect(() => {
    if (!enabled || !userId) return

    const url = buildSocialWebSocketUrl(`/ws/notification/${userId}/`)
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
  }, [enabled, userId])
}
