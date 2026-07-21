import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { REALTIME_WS_URL } from '@features/ai-lab/api/ai-lab.models'
import { RealtimeSocket } from '@features/ai-lab/data-access/realtime-socket'

describe('RealtimeSocket', () => {
  let lastUrl: string | undefined
  let lastProtocols: string[] | undefined

  beforeEach(() => {
    class MockWebSocket {
      static readonly OPEN = 1

      onopen: (() => void) | null = null
      onmessage: ((event: MessageEvent<string>) => void) | null = null
      onerror: ((event: Event) => void) | null = null
      onclose: (() => void) | null = null
      send = vi.fn()
      close = vi.fn()
      readyState = MockWebSocket.OPEN

      constructor(url: string, protocols: string[]) {
        lastUrl = url
        lastProtocols = protocols
      }
    }

    vi.stubGlobal('WebSocket', MockWebSocket)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function getSocket(instance: RealtimeSocket) {
    return (instance as unknown as { socket: {
      onmessage: ((event: MessageEvent<string>) => void) | null
      send: ReturnType<typeof vi.fn>
      close: ReturnType<typeof vi.fn>
    } }).socket
  }

  it('connects with ephemeral key protocol', async () => {
    const socket = new RealtimeSocket()
    const onAssistantMessage = vi.fn()
    const connectPromise = socket.connect('ephemeral-key', { onAssistantMessage })

    getSocket(socket).onmessage?.({
      data: JSON.stringify({ type: 'session.created' }),
    } as MessageEvent<string>)

    await connectPromise

    expect(lastUrl).toBe(REALTIME_WS_URL)
    expect(lastProtocols).toContain('openai-insecure-api-key.ephemeral-key')
    expect(socket.isReady()).toBe(true)
  })

  it('forwards assistant transcript messages', async () => {
    const socket = new RealtimeSocket()
    const onAssistantMessage = vi.fn()
    const connectPromise = socket.connect('ephemeral-key', { onAssistantMessage })

    getSocket(socket).onmessage?.({
      data: JSON.stringify({ type: 'session.created' }),
    } as MessageEvent<string>)
    await connectPromise

    getSocket(socket).onmessage?.({
      data: JSON.stringify({
        type: 'response.done',
        response: { output: [{ content: [{ transcript: 'hello back' }] }] },
      }),
    } as MessageEvent<string>)

    expect(onAssistantMessage).toHaveBeenCalledWith('hello back')
  })

  it('sendMessage emits conversation and response events', async () => {
    const socket = new RealtimeSocket()
    const connectPromise = socket.connect('ephemeral-key', { onAssistantMessage: vi.fn() })

    getSocket(socket).onmessage?.({
      data: JSON.stringify({ type: 'session.created' }),
    } as MessageEvent<string>)
    await connectPromise

    const sent = socket.sendMessage('hello')

    expect(sent).toBe(true)
    expect(getSocket(socket).send).toHaveBeenCalledTimes(2)
  })

  it('sendMessage returns false when socket is not ready', () => {
    const socket = new RealtimeSocket()
    expect(socket.sendMessage('hello')).toBe(false)
  })

  it('disconnect closes open socket', async () => {
    const socket = new RealtimeSocket()
    const connectPromise = socket.connect('ephemeral-key', { onAssistantMessage: vi.fn() })

    getSocket(socket).onmessage?.({
      data: JSON.stringify({ type: 'session.created' }),
    } as MessageEvent<string>)
    await connectPromise

    const ws = getSocket(socket)
    socket.disconnect()

    expect(ws.close).toHaveBeenCalled()
    expect(socket.isReady()).toBe(false)
  })
})
