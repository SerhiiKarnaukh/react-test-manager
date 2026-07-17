import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'
import { useProfileStore } from '@features/social/profiles/store/profile.store'
import {
  canSendFriendshipRequestFromPages,
  flattenProfilePostPages,
  profileFromPages,
  useFriendSuggestions,
  useFriendsData,
  useHandleFriendRequest,
  useProfilePosts,
  useSendFriendRequest,
} from '@features/social/profiles/hooks/useProfile'

const postsBase = '/api/social-posts'
const profilesBase = '/api/social-profiles'

const author = {
  id: 1,
  slug: 'john',
  first_name: 'John',
  last_name: 'Doe',
  avatar_url: null,
}

const post = {
  id: 10,
  body: 'Hello',
  created_at_formatted: '1 minute',
  likes_count: 0,
  comments_count: 0,
  is_private: false,
  created_by: author,
  attachments: [],
}

const viewedProfile = {
  id: 1,
  slug: 'john',
  first_name: 'John',
  last_name: 'Doe',
  full_name: 'John Doe',
  avatar_url: null,
  friends_count: 2,
  posts_count: 1,
}

const friendUser = {
  id: 2,
  slug: 'jane',
  first_name: 'Jane',
  last_name: 'Roe',
  avatar_url: null,
  friends_count: 5,
  posts_count: 3,
}

let friendsCallCount = 0

const server = setupServer(
  http.get(`*${postsBase}/profile/john/`, ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('page') === '2') {
      return HttpResponse.json({
        results: {
          posts: [{ ...post, id: 11 }],
          profile: viewedProfile,
          can_send_friendship_request: true,
        },
        next: null,
      })
    }
    return HttpResponse.json({
      results: {
        posts: [post],
        profile: viewedProfile,
        can_send_friendship_request: true,
      },
      next: `${url.origin}${postsBase}/profile/john/?page=2`,
    })
  }),
  http.post(`*${profilesBase}/friends/:slug/request/`, () =>
    HttpResponse.json({ message: 'sent' }),
  ),
  http.get(`*${profilesBase}/friends/john/`, () => {
    friendsCallCount += 1
    return HttpResponse.json({
      requests: friendsCallCount > 1 ? [] : [{ id: 20, created_by: friendUser }],
      friends: [friendUser],
      user: viewedProfile,
    })
  }),
  http.post(`*${profilesBase}/friends/jane/accepted/`, () => HttpResponse.json({})),
  http.get(`*${profilesBase}/friends/suggested/`, () =>
    HttpResponse.json([{ id: 3, slug: 'sam', full_name: 'Sam Smith', avatar_url: null }]),
  ),
)

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

describe('social profile hooks', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => {
    friendsCallCount = 0
    localStorage.clear()
    useAuthStore.setState({ access: 'token', refresh: 'r', activeApp: 'social' })
    useProfileStore.setState({ user: { ...viewedProfile, username: 'john', email: 'j@e.com' } })
  })
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('useProfilePosts paginates profile posts and exposes profile + flag', async () => {
    const client = createClient()
    const { result } = renderHook(() => useProfilePosts('john'), {
      wrapper: createWrapper(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(flattenProfilePostPages(result.current.data)).toHaveLength(1)
    expect(profileFromPages(result.current.data)?.slug).toBe('john')
    expect(canSendFriendshipRequestFromPages(result.current.data)).toBe(true)
    expect(result.current.hasNextPage).toBe(true)

    await act(async () => {
      await result.current.fetchNextPage()
    })

    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false))
    expect(flattenProfilePostPages(result.current.data).map((p) => p.id)).toEqual([10, 11])
  })

  it('useSendFriendRequest flips can_send flag in cached profile posts', async () => {
    const client = createClient()
    const wrapper = createWrapper(client)
    const posts = renderHook(() => useProfilePosts('john'), { wrapper })
    await waitFor(() => expect(posts.result.current.isSuccess).toBe(true))

    const send = renderHook(() => useSendFriendRequest('john'), { wrapper })
    await act(async () => {
      await send.result.current.mutateAsync()
    })

    const cached = client.getQueryData(['social', 'posts', 'profile', 'john'])
    expect(canSendFriendshipRequestFromPages(cached as never)).toBe(false)
  })

  it('useFriendsData loads requests and friends', async () => {
    const client = createClient()
    const { result } = renderHook(() => useFriendsData('john'), {
      wrapper: createWrapper(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.friends).toHaveLength(1)
    expect(result.current.data?.requests).toHaveLength(1)
  })

  it('useHandleFriendRequest reloads current user friends after action', async () => {
    const client = createClient()
    const wrapper = createWrapper(client)
    const friends = renderHook(() => useFriendsData('john'), { wrapper })
    await waitFor(() => expect(friends.result.current.isSuccess).toBe(true))
    expect(friends.result.current.data?.requests).toHaveLength(1)

    const handle = renderHook(() => useHandleFriendRequest('john'), { wrapper })
    await act(async () => {
      await handle.result.current.mutateAsync({ slug: 'jane', status: 'accepted' })
    })

    await waitFor(() => expect(friends.result.current.data?.requests).toHaveLength(0))
  })

  it('useFriendSuggestions loads suggestions when authenticated', async () => {
    const client = createClient()
    const { result } = renderHook(() => useFriendSuggestions(), {
      wrapper: createWrapper(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0]?.slug).toBe('sam')
  })
})
