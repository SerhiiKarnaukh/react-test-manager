import {
  parseRealtimeAssistantMessage,
  REALTIME_WS_URL,
} from '@features/ai-lab/api/ai-lab.models'

export type RealtimeSocketCallbacks = {
  onAssistantMessage: (message: string) => void
  onError?: (event: Event) => void
}

export class RealtimeSocket {
  private socket: WebSocket | null = null
  private sessionReady = false

  connect(ephemeralKey: string, callbacks: RealtimeSocketCallbacks): Promise<void> {
    return new Promise((resolve, reject) => {
      let resolved = false
      this.disconnect()

      const ws = new WebSocket(REALTIME_WS_URL, [
        'realtime',
        `openai-insecure-api-key.${ephemeralKey}`,
      ])
      this.socket = ws

      ws.onerror = (event) => {
        callbacks.onError?.(event)
        if (!resolved) {
          resolved = true
          reject(event)
        }
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(String(event.data)) as {
          type?: string
          response?: { output?: { content?: { transcript?: string; text?: string }[] }[] }
        }

        if (data.type === 'session.created' || data.type === 'session.updated') {
          this.sessionReady = true
          if (!resolved) {
            resolved = true
            resolve()
          }
          return
        }

        if (data.type === 'error') {
          console.error('Realtime error:', data)
          return
        }

        const message = parseRealtimeAssistantMessage(data)
        if (message) {
          callbacks.onAssistantMessage(message)
        }
      }

      ws.onclose = () => {
        this.socket = null
        this.sessionReady = false
      }
    })
  }

  sendMessage(question: string): boolean {
    if (!this.isReady()) {
      return false
    }

    const createEvent = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: question }],
      },
    }

    this.socket?.send(JSON.stringify(createEvent))
    this.socket?.send(JSON.stringify({ type: 'response.create' }))
    return true
  }

  isReady(): boolean {
    return this.socket?.readyState === WebSocket.OPEN && this.sessionReady
  }

  disconnect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.close()
    }

    this.socket = null
    this.sessionReady = false
  }
}
