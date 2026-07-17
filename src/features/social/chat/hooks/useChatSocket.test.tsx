import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { expect, vi } from 'vitest'
import { conversationKey } from '@features/social/chat/hooks/useChat'
import { useChatSocket } from '@features/social/chat/hooks/useChatSocket'
import { notificationsKey } from '@features/social/notifications/hooks/useNotifications'
import { useNotificationSocket } from '@features/social/notifications/hooks/useNotificationSocket'

type FakeSocket = {
  readyState: number
  onmessage: ((event: { data: string }) => void) | null
  close: ReturnType<typeof vi.fn>
  url: string
}

let sockets: FakeSocket[] = []

class MockWebSocket {
  static OPEN = 1
  static CONNECTING = 0
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  onmessage: FakeSocket['onmessage'] = null
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED
  })
  url: string

  constructor(url: string) {
    this.url = url
    this.readyState = MockWebSocket.OPEN
    sockets.push(this)
  }
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('social websocket hooks', () => {
  const OriginalWebSocket = globalThis.WebSocket

  beforeEach(() => {
    sockets = []
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket)
    vi.stubEnv('VITE_REMOTE_HOST', 'http://127.0.0.1:8000')
  })

  afterEach(() => {
    vi.stubGlobal('WebSocket', OriginalWebSocket)
  })

  it('useChatSocket connects with conversation and user ids and cleans up on unmount', () => {
    const client = new QueryClient()
    client.setQueryData(conversationKey(5), { id: 5, messages: [] })

    const { unmount } = renderHook(() => useChatSocket(5, 42), {
      wrapper: createWrapper(client),
    })

    expect(sockets).toHaveLength(1)
    expect(sockets[0]?.url).toBe('ws://127.0.0.1:8000/ws/social-chat/5/42/')

    unmount()
    expect(sockets[0]?.close).toHaveBeenCalled()
  })

  it('useChatSocket appends inbound messages to conversation cache', async () => {
    const client = new QueryClient()
    client.setQueryData(conversationKey(5), { id: 5, messages: [] })

    renderHook(() => useChatSocket(5, 42), { wrapper: createWrapper(client) })

    act(() => {
      sockets[0]?.onmessage?.({
        data: JSON.stringify({
          message: {
            id: 99,
            body: 'Live hi',
            created_at_formatted: 'now',
            created_by: {
              id: 2,
              first_name: 'Jane',
              last_name: 'Roe',
              avatar_url: null,
            },
          },
        }),
      })
    })

    await waitFor(() => {
      const cached = client.getQueryData(conversationKey(5)) as {
        messages: { id: number; body: string }[]
      }
      expect(cached.messages).toEqual([
        expect.objectContaining({ id: 99, body: 'Live hi' }),
      ])
    })
  })

  it('useChatSocket seeds cache when conversation was empty and ignores duplicates/malformed', () => {
    const client = new QueryClient()
    renderHook(() => useChatSocket(5, 42), { wrapper: createWrapper(client) })

    const message = {
      id: 1,
      body: 'First',
      created_at_formatted: 'now',
      created_by: { id: 2, first_name: 'Jane', last_name: 'Roe', avatar_url: null },
    }

    act(() => {
      sockets[0]?.onmessage?.({ data: JSON.stringify({ message }) })
    })
    expect(client.getQueryData(conversationKey(5))).toEqual({
      id: 5,
      messages: [message],
    })

    act(() => {
      sockets[0]?.onmessage?.({ data: JSON.stringify({ message }) })
    })
    expect(
      (client.getQueryData(conversationKey(5)) as { messages: unknown[] }).messages,
    ).toHaveLength(1)

    act(() => {
      sockets[0]?.onmessage?.({ data: 'not-json' })
    })
  })

  it('useChatSocket ignores frames without message', () => {
    const client = new QueryClient()
    client.setQueryData(conversationKey(5), { id: 5, messages: [] })

    renderHook(() => useChatSocket(5, 42), { wrapper: createWrapper(client) })

    act(() => {
      sockets[0]?.onmessage?.({ data: JSON.stringify({ message: null }) })
    })

    expect(client.getQueryData(conversationKey(5))).toEqual({ id: 5, messages: [] })
  })

  it('useChatSocket handleMessage no-ops without conversation id', () => {
    const client = new QueryClient()
    const { rerender } = renderHook(
      ({ conversationId }: { conversationId: number | null }) =>
        useChatSocket(conversationId, 42),
      {
        wrapper: createWrapper(client),
        initialProps: { conversationId: 5 as number | null },
      },
    )

    const handler = sockets[0]?.onmessage
    rerender({ conversationId: null })
    act(() => {
      handler?.({
        data: JSON.stringify({
          message: {
            id: 1,
            body: 'x',
            created_at_formatted: 'now',
            created_by: { id: 2, first_name: 'A', last_name: 'B', avatar_url: null },
          },
        }),
      })
    })
  })

  it('useNotificationSocket ignores empty message payloads and malformed frames', () => {
    const client = new QueryClient()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')

    renderHook(() => useNotificationSocket(7, true), {
      wrapper: createWrapper(client),
    })

    act(() => {
      sockets[0]?.onmessage?.({ data: JSON.stringify({ message: null }) })
      sockets[0]?.onmessage?.({ data: 'not-json' })
    })
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('useChatSocket reconnects when conversation id changes', () => {
    const client = new QueryClient()
    const { rerender } = renderHook(
      ({ conversationId }: { conversationId: number | null }) =>
        useChatSocket(conversationId, 42),
      {
        wrapper: createWrapper(client),
        initialProps: { conversationId: 5 as number | null },
      },
    )

    expect(sockets[0]?.url).toContain('/ws/social-chat/5/42/')

    rerender({ conversationId: 8 })
    expect(sockets[0]?.close).toHaveBeenCalled()
    expect(sockets[1]?.url).toBe('ws://127.0.0.1:8000/ws/social-chat/8/42/')
  })

  it('useNotificationSocket connects and invalidates notifications on message', async () => {
    const client = new QueryClient()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')

    const { unmount } = renderHook(() => useNotificationSocket(7, true), {
      wrapper: createWrapper(client),
    })

    expect(sockets[0]?.url).toBe('ws://127.0.0.1:8000/ws/notification/7/')

    act(() => {
      sockets[0]?.onmessage?.({ data: JSON.stringify({ message: { id: 1 } }) })
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: notificationsKey })
    })

    unmount()
    expect(sockets[0]?.close).toHaveBeenCalled()
  })

  it('useNotificationSocket does not connect when disabled', () => {
    const client = new QueryClient()
    renderHook(() => useNotificationSocket(7, false), {
      wrapper: createWrapper(client),
    })
    expect(sockets).toHaveLength(0)
  })
})
