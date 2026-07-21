import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { expect } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'
import { useProfileStore } from '@features/social/profiles/store/profile.store'
import {
  canSendFriendshipRequestFromPages,
  flattenProfilePostPages,
  profileFromPages,
  useChangePassword,
  useCurrentSocialUser,
  useFriendSuggestions,
  useFriendsData,
  useHandleFriendRequest,
  useProfilePosts,
  useSendFriendRequest,
  useUpdateProfile,
} from '@features/social/profiles/hooks/useProfile'
import { useAlertStore } from '@core/alert/alert.store'

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
  http.get(`*${profilesBase}/me/`, () =>
    HttpResponse.json({
      id: 1,
      username: 'john',
      first_name: 'John',
      last_name: 'Doe',
      email: 'j@e.com',
      slug: 'john',
      full_name: 'John Doe',
      avatar_url: null,
    }),
  ),
  http.post(`*${profilesBase}/editprofile/`, () =>
    HttpResponse.json({
      message: 'Information updated successfully',
      new_slug: 'john-new',
      new_avatar: 'https://example.com/a.jpg',
    }),
  ),
  http.post(`*${profilesBase}/editpassword/`, async ({ request }) => {
    const body = (await request.json()) as { new_password1?: string }
    if (body.new_password1 === 'bad') {
      return HttpResponse.json({ message: 'plain error' })
    }
    if (body.new_password1 === 'jsonerr') {
      return HttpResponse.json({
        message: JSON.stringify({
          old_password: [{ message: 'Wrong password' }],
        }),
      })
    }
    return HttpResponse.json({ message: 'success' })
  }),
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
    useProfileStore.setState({
      user: {
        ...viewedProfile,
        username: 'john',
        email: 'j@e.com',
        full_name: 'John Doe',
      },
    })
    useAlertStore.setState({ queue: [] })
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

  it('useCurrentSocialUser loads me and syncs store', async () => {
    const client = createClient()
    const { result } = renderHook(() => useCurrentSocialUser(), {
      wrapper: createWrapper(client),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.slug).toBe('john')
    expect(useProfileStore.getState().user?.email).toBe('j@e.com')
  })

  it('useSendFriendRequest shows error when already sent', async () => {
    server.use(
      http.post(`*${profilesBase}/friends/:slug/request/`, () =>
        HttpResponse.json({ message: 'request already sent' }),
      ),
    )
    const client = createClient()
    const send = renderHook(() => useSendFriendRequest('jane'), {
      wrapper: createWrapper(client),
    })
    await act(async () => {
      await send.result.current.mutateAsync()
    })
    expect(useAlertStore.getState().queue[0]?.message).toBe('The request has already been sent!')
  })

  it('useUpdateProfile updates user and navigates on success', async () => {
    const client = createClient()
    const update = renderHook(() => useUpdateProfile(), { wrapper: createWrapper(client) })
    const formData = new FormData()
    formData.append('username', 'john-new')
    formData.append('first_name', 'John')
    formData.append('last_name', 'Doe')
    formData.append('email', 'j@e.com')

    await act(async () => {
      await update.result.current.mutateAsync(formData)
    })

    expect(useProfileStore.getState().user?.slug).toBe('john-new')
    expect(useAlertStore.getState().queue[0]?.severity).toBe('success')
  })

  it('useUpdateProfile shows error when backend message is not success', async () => {
    server.use(
      http.post(`*${profilesBase}/editprofile/`, () =>
        HttpResponse.json({ message: 'Invalid data', new_slug: 'x', new_avatar: null }),
      ),
    )
    const client = createClient()
    const update = renderHook(() => useUpdateProfile(), { wrapper: createWrapper(client) })
    await act(async () => {
      await update.result.current.mutateAsync(new FormData())
    })
    expect(useAlertStore.getState().queue[0]?.message).toBe('Invalid data')
  })

  it('useChangePassword handles success and structured errors', async () => {
    const client = createClient()
    const change = renderHook(() => useChangePassword(), { wrapper: createWrapper(client) })

    await act(async () => {
      await change.result.current.mutateAsync({
        old_password: 'oldpass12',
        new_password1: 'newpass12',
        new_password2: 'newpass12',
      })
    })
    expect(useAlertStore.getState().queue[0]?.message).toBe('The information was saved')

    useAlertStore.setState({ queue: [] })
    await act(async () => {
      await change.result.current.mutateAsync({
        old_password: 'x',
        new_password1: 'jsonerr',
        new_password2: 'jsonerr',
      })
    })
    expect(useAlertStore.getState().queue[0]?.message).toContain('Wrong password')

    useAlertStore.setState({ queue: [] })
    await act(async () => {
      await change.result.current.mutateAsync({
        old_password: 'x',
        new_password1: 'bad',
        new_password2: 'bad',
      })
    })
    expect(useAlertStore.getState().queue[0]?.message).toBe('plain error')
  })

  it('helpers return defaults for empty profile pages', () => {
    expect(flattenProfilePostPages(undefined)).toEqual([])
    expect(profileFromPages(undefined)).toBeNull()
    expect(canSendFriendshipRequestFromPages(undefined)).toBe(false)
  })

  it('useCurrentSocialUser logs out on 404 me', async () => {
    server.use(
      http.get(`*${profilesBase}/me/`, () =>
        HttpResponse.json({ message: 'gone' }, { status: 404 }),
      ),
    )
    const client = createClient()
    renderHook(() => useCurrentSocialUser(), { wrapper: createWrapper(client) })
    await waitFor(() => expect(useAuthStore.getState().access).toBeNull())
    expect(useProfileStore.getState().user).toBeNull()
  })

  it('useSendFriendRequest onError requires login message', async () => {
    server.use(
      http.post(`*${profilesBase}/friends/:slug/request/`, () =>
        HttpResponse.json({ detail: 'auth' }, { status: 401 }),
      ),
    )
    const client = createClient()
    const send = renderHook(() => useSendFriendRequest('jane'), {
      wrapper: createWrapper(client),
    })
    await act(async () => {
      await send.result.current.mutateAsync().catch(() => undefined)
    })
    expect(useAlertStore.getState().queue[0]?.message).toBe('You must be logged in!')
  })

  it('useHandleFriendRequest and profile mutations surface network errors', async () => {
    server.use(
      http.post(`*${profilesBase}/friends/:slug/:status/`, () =>
        HttpResponse.json({ detail: 'fail' }, { status: 500 }),
      ),
      http.post(`*${profilesBase}/editprofile/`, () =>
        HttpResponse.json({ detail: 'fail' }, { status: 500 }),
      ),
      http.post(`*${profilesBase}/editpassword/`, () =>
        HttpResponse.json({ detail: 'fail' }, { status: 500 }),
      ),
    )
    const client = createClient()
    const wrapper = createWrapper(client)

    const handle = renderHook(() => useHandleFriendRequest('john'), { wrapper })
    await act(async () => {
      await handle.result.current
        .mutateAsync({ slug: 'jane', status: 'accepted' })
        .catch(() => undefined)
    })
    expect(useAlertStore.getState().queue[0]?.severity).toBe('error')

    useAlertStore.setState({ queue: [] })
    const update = renderHook(() => useUpdateProfile(), { wrapper })
    await act(async () => {
      await update.result.current.mutateAsync(new FormData()).catch(() => undefined)
    })
    expect(useAlertStore.getState().queue[0]?.severity).toBe('error')

    useAlertStore.setState({ queue: [] })
    const change = renderHook(() => useChangePassword(), { wrapper })
    await act(async () => {
      await change.result.current
        .mutateAsync({
          old_password: 'oldpass12',
          new_password1: 'newpass12',
          new_password2: 'newpass12',
        })
        .catch(() => undefined)
    })
    expect(useAlertStore.getState().queue[0]?.severity).toBe('error')
  })

  it('useProfilePosts error alert and friend request with empty cache', async () => {
    server.use(
      http.get(`*${postsBase}/profile/john/`, () =>
        HttpResponse.json({ detail: 'fail' }, { status: 500 }),
      ),
    )
    const client = createClient()
    const wrapper = createWrapper(client)
    renderHook(() => useProfilePosts('john'), { wrapper })
    await waitFor(() => {
      expect(useAlertStore.getState().queue.some((a) => a.severity === 'error')).toBe(true)
    })

    useAlertStore.setState({ queue: [] })
    useProfileStore.setState({ user: null })
    server.use(
      http.post(`*${profilesBase}/editprofile/`, () =>
        HttpResponse.json({
          message: 'Information updated successfully',
          new_slug: 'x',
          new_avatar: null,
        }),
      ),
    )
    const update = renderHook(() => useUpdateProfile(), { wrapper })
    await act(async () => {
      await update.result.current.mutateAsync(new FormData())
    })

    client.setQueryData(['social', 'posts', 'profile', 'ghost'], {
      pages: [],
      pageParams: [],
    })
    const send = renderHook(() => useSendFriendRequest('ghost'), { wrapper })
    await act(async () => {
      await send.result.current.mutateAsync()
    })
  })

  it('useCurrentSocialUser keeps session on non-404 me errors', async () => {
    server.use(
      http.get(`*${profilesBase}/me/`, () =>
        HttpResponse.json({ detail: 'fail' }, { status: 500 }),
      ),
    )
    const client = createClient()
    const { result } = renderHook(() => useCurrentSocialUser(), {
      wrapper: createWrapper(client),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(useAuthStore.getState().access).toBe('token')
    expect(useAlertStore.getState().queue).toHaveLength(0)
  })

  it('useCurrentSocialUser uses fallback alert on 404 without message', async () => {
    server.use(http.get(`*${profilesBase}/me/`, () => HttpResponse.json({}, { status: 404 })))
    const client = createClient()
    renderHook(() => useCurrentSocialUser(), { wrapper: createWrapper(client) })
    await waitFor(() => expect(useAuthStore.getState().access).toBeNull())
    expect(useAlertStore.getState().queue[0]?.message).toBe('User not found')
  })

  it('profile hooks stay disabled without slug param', async () => {
    const client = createClient()
    const wrapper = createWrapper(client)
    const posts = renderHook(() => useProfilePosts(undefined), { wrapper })
    const friends = renderHook(() => useFriendsData(undefined), { wrapper })
    expect(posts.result.current.fetchStatus).toBe('idle')
    expect(friends.result.current.fetchStatus).toBe('idle')
  })

  it('useHandleFriendRequest succeeds without current user slug', async () => {
    const client = createClient()
    const handle = renderHook(() => useHandleFriendRequest(undefined), {
      wrapper: createWrapper(client),
    })
    await act(async () => {
      await handle.result.current.mutateAsync({ slug: 'jane', status: 'accepted' })
    })
  })

  it('useUpdateProfile keeps existing user fields when form data is empty', async () => {
    const client = createClient()
    const wrapper = createWrapper(client)
    const update = renderHook(() => useUpdateProfile(), { wrapper })
    await act(async () => {
      await update.result.current.mutateAsync(new FormData())
    })
    expect(useProfileStore.getState().user?.username).toBe('john')
  })

  it('useChangePassword succeeds without navigating when slug is missing', async () => {
    useProfileStore.setState({ user: null })
    const client = createClient()
    const change = renderHook(() => useChangePassword(), { wrapper: createWrapper(client) })
    await act(async () => {
      await change.result.current.mutateAsync({
        old_password: 'oldpass12',
        new_password1: 'newpass12',
        new_password2: 'newpass12',
      })
    })
    expect(useAlertStore.getState().queue[0]?.message).toBe('The information was saved')
  })

  it('useChangePassword parses structured json error messages', async () => {
    server.use(
      http.post(`*${profilesBase}/editpassword/`, () =>
        HttpResponse.json({
          message: JSON.stringify({
            old_password: [{ message: 'Wrong password' }],
          }),
        }),
      ),
    )
    const client = createClient()
    const change = renderHook(() => useChangePassword(), { wrapper: createWrapper(client) })
    await act(async () => {
      await change.result.current.mutateAsync({
        old_password: 'x',
        new_password1: 'newpass12',
        new_password2: 'newpass12',
      })
    })
    expect(useAlertStore.getState().queue[0]?.message).toContain('Wrong password')
  })

  it('useChangePassword falls back to raw message when json has no messages', async () => {
    server.use(
      http.post(`*${profilesBase}/editpassword/`, () =>
        HttpResponse.json({
          message: JSON.stringify({
            old_password: [],
          }),
        }),
      ),
    )
    const client = createClient()
    const change = renderHook(() => useChangePassword(), { wrapper: createWrapper(client) })
    await act(async () => {
      await change.result.current.mutateAsync({
        old_password: 'x',
        new_password1: 'newpass12',
        new_password2: 'newpass12',
      })
    })
    expect(useAlertStore.getState().queue[0]?.message).toContain('old_password')
  })
})
