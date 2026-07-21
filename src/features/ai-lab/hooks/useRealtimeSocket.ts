import { useCallback, useEffect, useRef } from 'react'
import { useAlertStore } from '@core/alert/alert.store'
import { fetchRealtimeToken } from '@features/ai-lab/api/realtime'
import { resolveAiLabApiErrorMessage } from '@features/ai-lab/api/ai-lab.models'
import { RealtimeSocket } from '@features/ai-lab/data-access/realtime-socket'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

/**
 * Manages the OpenAI Realtime WebSocket lifecycle.
 * MainAiLabLayout connects on mount; PromptForm sends messages through sendMessage.
 */
export function useRealtimeSocket() {
  const socketRef = useRef<RealtimeSocket | null>(null)
  const appendRealtimeMessage = useAiLabStore((s) => s.appendRealtimeMessage)
  const setRealtimeLoading = useAiLabStore((s) => s.setRealtimeLoading)
  const enqueue = useAlertStore((s) => s.enqueue)

  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = new RealtimeSocket()
    }
    return socketRef.current
  }, [])

  const connect = useCallback(async () => {
    const socket = getSocket()
    if (socket.isReady()) return

    try {
      const response = await fetchRealtimeToken()
      await socket.connect(response.client_secret.value, {
        onAssistantMessage: (message) => {
          appendRealtimeMessage('chat', message)
          setRealtimeLoading(false)
        },
      })
    } catch (error) {
      const apiMessage = resolveAiLabApiErrorMessage(error)
      enqueue('error', apiMessage ?? 'Failed to connect to realtime chat')
    }
  }, [appendRealtimeMessage, enqueue, getSocket, setRealtimeLoading])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
  }, [])

  const sendMessage = useCallback(
    (question: string) => {
      return getSocket().sendMessage(question)
    },
    [getSocket],
  )

  const isReady = useCallback(() => {
    return getSocket().isReady()
  }, [getSocket])

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [])

  return { connect, disconnect, sendMessage, isReady }
}
