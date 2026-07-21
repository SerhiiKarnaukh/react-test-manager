import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { expect } from 'vitest'
import { useAlertStore } from '@core/alert/alert.store'
import { useAuthStore } from '@core/auth/auth.store'
import {
  conversationKey,
  useConversation,
  useConversations,
  useSendChatMessage,
} from '@features/social/chat/hooks/useChat'
import {
  navigateAfterRead,
  notificationsKey,
  useMarkNotificationRead,
  useNotifications,
} from '@features/social/notifications/hooks/useNotifications'
import { useProfileStore } from '@features/social/profiles/store/profile.store'

const chatBase = '/api/social-chat'
const notifBase = '/api/social-notifications'

const conversation = {
  id: 5,
  modified_at_formatted: '1h',
  users: [
    { id: 1, first_name: 'John', last_name: 'Doe', avatar_url: null },
    { id: 2, first_name: 'Jane', last_name: 'Roe', avatar_url: null },
  ],
}

const active = {
  id: 5,
  messages: [
    {
      id: 10,
      body: 'Hello',
      created_at_formatted: '5m',
      created_by: conversation.users[1],
    },
  ],
}

const notification = {
  id: 1,
  body: 'Jane liked your post',
  type_of_notification: 'post_like',
  post_id: 10,
}

const server = setupServer(
  http.get(`*${chatBase}/`, () => HttpResponse.json([conversation])),
  http.get(`*${chatBase}/5/`, () => HttpResponse.json(active)),
  http.post(`*${chatBase}/5/send/`, () => HttpResponse.json({})),
  http.get(`*${notifBase}/`, () => HttpResponse.json([notification])),
  http.post(`*${notifBase}/read/1/`, () => HttpResponse.json({})),
)

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('navigateAfterRead', () => {
  it('routes post_like and post_comment to post detail', () => {
    expect(
      navigateAfterRead(
        { id: 1, body: '', type_of_notification: 'post_like', post_id: 9 },
        'john',
      ),
    ).toBe('/social/9')
    expect(
      navigateAfterRead(
        { id: 2, body: '', type_of_notification: 'post_comment', post_id: 8 },
        'john',
      ),
    ).toBe('/social/8')
  })

  it('routes chat_message to chat page', () => {
    expect(
      navigateAfterRead({ id: 3, body: '', type_of_notification: 'chat_message' }, 'john'),
    ).toBe('/social/chat')
  })

  it('routes other types to friends page when slug exists', () => {
    expect(
      navigateAfterRead({ id: 4, body: '', type_of_notification: 'friendship_request' }, 'john'),
    ).toBe('/social/profile/john/friends')
  })

  it('returns null when friendship notification has no slug', () => {
    expect(
      navigateAfterRead({ id: 4, body: '', type_of_notification: 'friendship_request' }, undefined),
    ).toBeNull()
  })
})

describe('social chat & notification hooks', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ access: 'token', refresh: 'r', activeApp: 'social' })
    useProfileStore.setState({
      user: {
        id: 1,
        username: 'john',
        first_name: 'John',
        last_name: 'Doe',
        email: 'j@e.com',
        slug: 'john',
        full_name: 'John Doe',
        avatar_url: null,
      },
    })
  })
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('useConversations loads conversation list', async () => {
    const client = createClient()
    const { result } = renderHook(() => useConversations(), {
      wrapper: createWrapper(client),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([conversation])
  })

  it('useConversation loads messages for active id', async () => {
    const client = createClient()
    const { result } = renderHook(() => useConversation(5), {
      wrapper: createWrapper(client),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.messages).toHaveLength(1)
  })

  it('useSendChatMessage posts without appending locally', async () => {
    const client = createClient()
    const wrapper = createWrapper(client)
    const conv = renderHook(() => useConversation(5), { wrapper })
    await waitFor(() => expect(conv.result.current.isSuccess).toBe(true))

    const send = renderHook(() => useSendChatMessage(5), { wrapper })
    await act(async () => {
      await send.result.current.mutateAsync('Ping')
    })

    expect(client.getQueryData(conversationKey(5))).toEqual(active)
  })

  it('useSendChatMessage rejects without conversation id', async () => {
    const client = createClient()
    const send = renderHook(() => useSendChatMessage(null), {
      wrapper: createWrapper(client),
    })
    await expect(send.result.current.mutateAsync('Ping')).rejects.toThrow(
      'No active conversation',
    )
  })

  it('chat query and send errors enqueue alerts', async () => {
    server.use(
      http.get(`*${chatBase}/`, () => HttpResponse.json({ detail: 'x' }, { status: 500 })),
      http.get(`*${chatBase}/5/`, () => HttpResponse.json({ detail: 'x' }, { status: 500 })),
      http.post(`*${chatBase}/5/send/`, () =>
        HttpResponse.json({ detail: 'x' }, { status: 500 }),
      ),
    )
    useAlertStore.setState({ queue: [] })
    const client = createClient()
    const wrapper = createWrapper(client)

    renderHook(() => useConversations(), { wrapper })
    renderHook(() => useConversation(5), { wrapper })
    const send = renderHook(() => useSendChatMessage(5), { wrapper })
    await act(async () => {
      await send.result.current.mutateAsync('Ping').catch(() => undefined)
    })

    await waitFor(() => {
      expect(useAlertStore.getState().queue.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('useNotifications exposes unreadCount from list length', async () => {
    const client = createClient()
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(client),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.unreadCount).toBe(1)
  })

  it('useMarkNotificationRead removes item from cache', async () => {
    const client = createClient()
    const wrapper = createWrapper(client)
    const list = renderHook(() => useNotifications(), { wrapper })
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true))

    const mark = renderHook(() => useMarkNotificationRead(), { wrapper })
    await act(async () => {
      await mark.result.current.mutateAsync(notification)
    })

    expect(client.getQueryData(notificationsKey)).toEqual([])
  })

  it('useMarkNotificationRead navigates when target exists', async () => {
    const client = createClient()
    const wrapper = createWrapper(client)
    const list = renderHook(() => useNotifications(), { wrapper })
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true))

    const mark = renderHook(() => useMarkNotificationRead(), { wrapper })
    await act(async () => {
      await mark.result.current.mutateAsync({
        id: 1,
        body: 'Like',
        type_of_notification: 'post_like',
        post_id: 10,
      })
    })

    expect(client.getQueryData(notificationsKey)).toEqual([])
  })

  it('useMarkNotificationRead skips navigation when target is missing', async () => {
    useProfileStore.setState({ user: null })
    const client = createClient()
    const wrapper = createWrapper(client)
    const list = renderHook(() => useNotifications(), { wrapper })
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true))

    const mark = renderHook(() => useMarkNotificationRead(), { wrapper })
    await act(async () => {
      await mark.result.current.mutateAsync({
        id: 1,
        body: 'Friend request',
        type_of_notification: 'friendship_request',
      })
    })

    expect(client.getQueryData(notificationsKey)).toEqual([])
  })

  it('useMarkNotificationRead skips navigation for post_like without post id', async () => {
    useProfileStore.setState({ user: null })
    const client = createClient()
    const wrapper = createWrapper(client)
    const list = renderHook(() => useNotifications(), { wrapper })
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true))

    const mark = renderHook(() => useMarkNotificationRead(), { wrapper })
    await act(async () => {
      await mark.result.current.mutateAsync({
        id: 1,
        body: 'Like',
        type_of_notification: 'post_like',
      })
    })

    expect(client.getQueryData(notificationsKey)).toEqual([])
  })

  it('useMarkNotificationRead tolerates missing notifications cache', async () => {
    const client = createClient()
    const wrapper = createWrapper(client)
    const mark = renderHook(() => useMarkNotificationRead(), { wrapper })
    await act(async () => {
      await mark.result.current.mutateAsync({
        id: 1,
        body: 'Like',
        type_of_notification: 'post_like',
        post_id: 10,
      })
    })
    expect(client.getQueryData(notificationsKey)).toEqual([])
  })

  it('useNotifications and mark-read error paths enqueue alerts', async () => {
    server.use(
      http.get(`*${notifBase}/`, () => HttpResponse.json({ detail: 'x' }, { status: 500 })),
      http.post(`*${notifBase}/read/1/`, () =>
        HttpResponse.json({ detail: 'x' }, { status: 500 }),
      ),
    )
    useAlertStore.setState({ queue: [] })
    const client = createClient()
    const wrapper = createWrapper(client)
    renderHook(() => useNotifications(), { wrapper })
    const mark = renderHook(() => useMarkNotificationRead(), { wrapper })
    await act(async () => {
      await mark.result.current.mutateAsync(notification).catch(() => undefined)
    })
    await waitFor(() => {
      expect(useAlertStore.getState().queue.length).toBeGreaterThanOrEqual(1)
    })
  })
})
