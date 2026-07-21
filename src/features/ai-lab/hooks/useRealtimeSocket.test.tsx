import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useAlertStore } from '@core/alert/alert.store'
import { useRealtimeSocket } from '@features/ai-lab/hooks/useRealtimeSocket'
import { createTestClient } from '@features/ai-lab/test/ai-lab-test-utils'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const connectMock = vi.fn()
const disconnectMock = vi.fn()
const sendMessageMock = vi.fn()
const isReadyMock = vi.fn()

vi.mock('@features/ai-lab/data-access/realtime-socket', () => ({
  RealtimeSocket: class {
    connect = connectMock
    disconnect = disconnectMock
    sendMessage = sendMessageMock
    isReady = isReadyMock
  },
}))

const server = setupServer(
  http.post('*/ai-lab/realtime-token/', () =>
    HttpResponse.json({ client_secret: { value: 'ephemeral-key' } }),
  ),
)

function createWrapper(client = createTestClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('useRealtimeSocket', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => {
    connectMock.mockReset()
    disconnectMock.mockReset()
    sendMessageMock.mockReset()
    isReadyMock.mockReset()
    isReadyMock.mockReturnValue(false)
    connectMock.mockImplementation(async (_key, callbacks) => {
      callbacks.onAssistantMessage('hello back')
    })
    sendMessageMock.mockReturnValue(true)
    useAlertStore.getState().clear()
    useAiLabStore.setState({ realtimeMessages: [], realtimeLoading: false })
  })
  afterEach(() => {
    server.resetHandlers()
  })
  afterAll(() => server.close())

  it('connects and forwards assistant messages through socket callbacks', async () => {
    const { result } = renderHook(() => useRealtimeSocket(), { wrapper: createWrapper() })

    await result.current.connect()

    expect(connectMock).toHaveBeenCalledWith(
      'ephemeral-key',
      expect.objectContaining({ onAssistantMessage: expect.any(Function) }),
    )
    expect(useAiLabStore.getState().realtimeMessages).toEqual([
      { sender: 'chat', message: 'hello back' },
    ])
  })

  it('skips connect when socket is already ready', async () => {
    isReadyMock.mockReturnValue(true)
    const { result } = renderHook(() => useRealtimeSocket(), { wrapper: createWrapper() })

    await result.current.connect()

    expect(connectMock).not.toHaveBeenCalled()
  })

  it('delegates sendMessage and isReady to socket', () => {
    isReadyMock.mockReturnValue(true)
    const { result } = renderHook(() => useRealtimeSocket(), { wrapper: createWrapper() })

    expect(result.current.sendMessage('hello')).toBe(true)
    expect(sendMessageMock).toHaveBeenCalledWith('hello')
    expect(result.current.isReady()).toBe(true)
  })

  it('enqueues alert when token fetch fails', async () => {
    server.use(
      http.post('*/ai-lab/realtime-token/', () => new HttpResponse(null, { status: 500 })),
    )
    const { result } = renderHook(() => useRealtimeSocket(), { wrapper: createWrapper() })

    await result.current.connect()

    await waitFor(() => {
      expect(useAlertStore.getState().queue.length).toBeGreaterThan(0)
    })
  })

  it('disconnects on unmount', async () => {
    const { result, unmount } = renderHook(() => useRealtimeSocket(), { wrapper: createWrapper() })
    await result.current.connect()
    unmount()
    expect(disconnectMock).toHaveBeenCalled()
  })
})
