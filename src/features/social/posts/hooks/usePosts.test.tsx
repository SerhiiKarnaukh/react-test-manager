import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { expect } from 'vitest'
import type { InfiniteData } from '@tanstack/react-query'
import type { PaginatedPostsPayload } from '@features/social/posts/api/posts'
import {
  flattenPostPages,
  useDeletePost,
  useLikePost,
  usePostsFeed,
  useTrends,
} from '@features/social/posts/hooks/usePosts'

const baseUrl = '/api/social-posts'
const feedKey = ['social', 'posts', 'feed'] as const

const sampleAuthor = {
  id: 1,
  slug: 'jane-doe',
  first_name: 'Jane',
  last_name: 'Doe',
  avatar_url: null,
}

const samplePost = {
  id: 10,
  body: 'Hello feed',
  created_at_formatted: '2 minutes',
  likes_count: 3,
  comments_count: 1,
  is_private: false,
  created_by: sampleAuthor,
  attachments: [],
}

const server = setupServer(
  http.get(`*${baseUrl}/`, ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('page') === '2') {
      return HttpResponse.json({
        results: {
          posts: [{ ...samplePost, id: 11, body: 'Second page' }],
        },
        next: null,
      })
    }
    return HttpResponse.json({
      results: { posts: [samplePost] },
      next: `${url.origin}${baseUrl}/?page=2`,
    })
  }),
  http.get(`*${baseUrl}/trends/`, () =>
    HttpResponse.json([{ id: '1', hashtag: 'react', occurences: 4 }]),
  ),
  http.post(`*${baseUrl}/10/like/`, () =>
    HttpResponse.json({ message: 'like created' }),
  ),
  http.delete(`*${baseUrl}/10/delete/`, () => HttpResponse.json({})),
)

function createTestClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('social posts query hooks', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('usePostsFeed loads first page and can fetch next page', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => usePostsFeed(), {
      wrapper: createWrapper(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(flattenPostPages(result.current.data)).toEqual([samplePost])
    expect(result.current.hasNextPage).toBe(true)

    await act(async () => {
      await result.current.fetchNextPage()
    })

    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false))
    expect(flattenPostPages(result.current.data).map((post) => post.id)).toEqual([10, 11])
    expect(result.current.hasNextPage).toBe(false)
  })

  it('useTrends loads trend list', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => useTrends(), {
      wrapper: createWrapper(client),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: '1', hashtag: 'react', occurences: 4 }])
  })

  it('useLikePost increments likes when like created', async () => {
    const client = createTestClient()
    const wrapper = createWrapper(client)
    const feed = renderHook(() => usePostsFeed(), { wrapper })
    await waitFor(() => expect(feed.result.current.isSuccess).toBe(true))

    const like = renderHook(() => useLikePost(), { wrapper })
    await act(async () => {
      await like.result.current.mutateAsync(10)
    })

    const cached = client.getQueryData<InfiniteData<PaginatedPostsPayload>>(feedKey)
    expect(flattenPostPages(cached)[0]?.likes_count).toBe(4)
  })

  it('useDeletePost removes post from feed cache', async () => {
    const client = createTestClient()
    const wrapper = createWrapper(client)
    const feed = renderHook(() => usePostsFeed(), { wrapper })
    await waitFor(() => expect(feed.result.current.isSuccess).toBe(true))

    const del = renderHook(() => useDeletePost(), { wrapper })
    await act(async () => {
      await del.result.current.mutateAsync(10)
    })

    const cached = client.getQueryData<InfiniteData<PaginatedPostsPayload>>(feedKey)
    expect(flattenPostPages(cached)).toEqual([])
  })
})
