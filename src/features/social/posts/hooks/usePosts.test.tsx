import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { expect } from 'vitest'
import type { InfiniteData } from '@tanstack/react-query'
import type {
  PaginatedPostsPayload,
  SearchPostsPayload,
  SocialPostDetail,
} from '@features/social/posts/api/posts'
import {
  flattenPostPages,
  flattenSearchPosts,
  latestSearchProfiles,
  useAddComment,
  useCreatePost,
  useDeletePost,
  useLikePost,
  usePostDetail,
  usePostSearch,
  usePostsFeed,
  useReportPost,
  useTrendPosts,
  useTrends,
} from '@features/social/posts/hooks/usePosts'
import { useAlertStore } from '@core/alert/alert.store'

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
    if (url.searchParams.get('trend') === 'react') {
      return HttpResponse.json({
        results: { posts: [{ ...samplePost, id: 20, body: '#react' }] },
        next: `${url.origin}${baseUrl}/?trend=react&page=2`,
      })
    }
    if (url.searchParams.get('page') === '2') {
      return HttpResponse.json({
        results: { posts: [{ ...samplePost, id: 11, body: 'Second page' }] },
        next: null,
      })
    }
    return HttpResponse.json({
      results: { posts: [samplePost] },
      next: `${url.origin}${baseUrl}/?page=2`,
    })
  }),
  http.get(`*${baseUrl}/10/`, () =>
    HttpResponse.json({ post: { ...samplePost, comments: [] } }),
  ),
  http.get(`*${baseUrl}/trends/`, () =>
    HttpResponse.json([{ id: '1', hashtag: 'react', occurences: 4 }]),
  ),
  http.post(`*${baseUrl}/search/`, () =>
    HttpResponse.json({
      results: {
        posts: [samplePost],
        profiles: [
          {
            id: 2,
            slug: 'bob',
            first_name: 'Bob',
            last_name: 'Lee',
            avatar_url: null,
            friends_count: 1,
            posts_count: 2,
          },
        ],
      },
      next: 'https://example.com/api/social-posts/search/?page=2',
    }),
  ),
  http.get(`*${baseUrl}/search/`, () =>
    HttpResponse.json({
      results: {
        posts: [{ ...samplePost, id: 12 }],
        profiles: [
          {
            id: 3,
            slug: 'ann',
            first_name: 'Ann',
            last_name: 'Kay',
            avatar_url: null,
            friends_count: 0,
            posts_count: 0,
          },
        ],
      },
      next: null,
    }),
  ),
  http.post(`*${baseUrl}/create/`, async ({ request }) => {
    const form = await request.formData()
    return HttpResponse.json({
      ...samplePost,
      id: 99,
      body: String(form.get('body') ?? ''),
    })
  }),
  http.post(`*${baseUrl}/10/comment/`, async ({ request }) => {
    const body = (await request.json()) as { body?: string }
    return HttpResponse.json({
      id: 5,
      body: body.body ?? '',
      created_at_formatted: 'now',
      created_by: sampleAuthor,
    })
  }),
  http.post(`*${baseUrl}/10/like/`, () => HttpResponse.json({ message: 'like created' })),
  http.post(`*${baseUrl}/10/report/`, () => HttpResponse.json({})),
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
  beforeEach(() => {
    useAlertStore.setState({ queue: [] })
  })
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
  })

  it('useTrendPosts loads trend pages', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => useTrendPosts('react'), {
      wrapper: createWrapper(client),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(flattenPostPages(result.current.data)[0]?.id).toBe(20)
  })

  it('usePostSearch loads posts and profiles then next page', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => usePostSearch('hello'), {
      wrapper: createWrapper(client),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(flattenSearchPosts(result.current.data)).toHaveLength(1)
    expect(latestSearchProfiles(result.current.data)[0]?.slug).toBe('bob')

    await act(async () => {
      await result.current.fetchNextPage()
    })
    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false))
    expect(flattenSearchPosts(result.current.data).map((p) => p.id)).toEqual([10, 12])
    expect(latestSearchProfiles(result.current.data)[0]?.slug).toBe('ann')
  })

  it('usePostDetail loads a post', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => usePostDetail('10'), {
      wrapper: createWrapper(client),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.post.id).toBe(10)
  })

  it('useTrends loads trend list', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => useTrends(), {
      wrapper: createWrapper(client),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: '1', hashtag: 'react', occurences: 4 }])
  })

  it('useCreatePost prepends to empty and existing feed cache', async () => {
    const client = createTestClient()
    const wrapper = createWrapper(client)
    const create = renderHook(() => useCreatePost(), { wrapper })

    const formData = new FormData()
    formData.append('body', 'Fresh')
    formData.append('is_private', 'false')

    await act(async () => {
      await create.result.current.mutateAsync(formData)
    })
    expect(flattenPostPages(client.getQueryData(feedKey))[0]?.id).toBe(99)

    const feed = renderHook(() => usePostsFeed(), { wrapper })
    await waitFor(() => expect(feed.result.current.isSuccess).toBe(true))

    const formData2 = new FormData()
    formData2.append('body', 'Again')
    formData2.append('is_private', 'false')
    await act(async () => {
      await create.result.current.mutateAsync(formData2)
    })
    expect(flattenPostPages(client.getQueryData(feedKey))[0]?.id).toBe(99)
  })

  it('useAddComment appends comment to detail cache', async () => {
    const client = createTestClient()
    const wrapper = createWrapper(client)
    const detail = renderHook(() => usePostDetail('10'), { wrapper })
    await waitFor(() => expect(detail.result.current.isSuccess).toBe(true))

    const add = renderHook(() => useAddComment('10'), { wrapper })
    await act(async () => {
      await add.result.current.mutateAsync('Nice')
    })

    const cached = client.getQueryData<{ post: SocialPostDetail }>(['social', 'posts', 'detail', '10'])
    expect(cached?.post.comments).toHaveLength(1)
    expect(cached?.post.comments_count).toBe(2)
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

  it('useLikePost ignores non create responses', async () => {
    server.use(
      http.post(`*${baseUrl}/10/like/`, () => HttpResponse.json({ message: 'already liked' })),
    )
    const client = createTestClient()
    const wrapper = createWrapper(client)
    const feed = renderHook(() => usePostsFeed(), { wrapper })
    await waitFor(() => expect(feed.result.current.isSuccess).toBe(true))

    const like = renderHook(() => useLikePost(), { wrapper })
    await act(async () => {
      await like.result.current.mutateAsync(10)
    })
    expect(flattenPostPages(client.getQueryData(feedKey))[0]?.likes_count).toBe(3)
  })

  it('useReportPost enqueues success alert', async () => {
    const client = createTestClient()
    const report = renderHook(() => useReportPost(), { wrapper: createWrapper(client) })
    await act(async () => {
      await report.result.current.mutateAsync(10)
    })
    expect(useAlertStore.getState().queue[0]?.message).toBe('The post was reported')
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

    expect(flattenPostPages(client.getQueryData(feedKey))).toEqual([])
    expect(useAlertStore.getState().queue[0]?.message).toBe('The post was deleted')
  })

  it('useAddComment no-ops when detail cache is missing', async () => {
    const client = createTestClient()
    const add = renderHook(() => useAddComment('10'), { wrapper: createWrapper(client) })
    await act(async () => {
      await add.result.current.mutateAsync('Orphan')
    })
    expect(client.getQueryData(['social', 'posts', 'detail', '10'])).toBeUndefined()
  })

  it('like/delete updaters tolerate missing search and trend caches', async () => {
    const client = createTestClient()
    const wrapper = createWrapper(client)

    client.setQueryData(['social', 'posts', 'search', 'ghost'], {
      pages: [{ results: { posts: [samplePost], profiles: [] }, next: null }],
      pageParams: [null],
    })
    client.setQueryData(['social', 'posts', 'trend', 'ghost'], {
      pages: [{ results: { posts: [samplePost] }, next: null }],
      pageParams: [null],
    })

    for (const key of [
      ['social', 'posts', 'search', 'ghost'],
      ['social', 'posts', 'trend', 'ghost'],
    ] as const) {
      const query = client.getQueryCache().find({ queryKey: [...key] })
      query?.setState({ ...query.state, data: undefined })
    }

    const like = renderHook(() => useLikePost(), { wrapper })
    await act(async () => {
      await like.result.current.mutateAsync(10)
    })
    const del = renderHook(() => useDeletePost(), { wrapper })
    await act(async () => {
      await del.result.current.mutateAsync(10)
    })
  })

  it('query error alerts enqueue messages', async () => {
    server.use(
      http.get(`*${baseUrl}/`, () => HttpResponse.json({ detail: 'nope' }, { status: 500 })),
      http.get(`*${baseUrl}/trends/`, () => HttpResponse.json({ detail: 'nope' }, { status: 500 })),
      http.get(`*${baseUrl}/10/`, () => HttpResponse.json({ detail: 'nope' }, { status: 500 })),
      http.post(`*${baseUrl}/search/`, () =>
        HttpResponse.json({ detail: 'nope' }, { status: 500 }),
      ),
    )
    const client = createTestClient()
    const wrapper = createWrapper(client)

    renderHook(() => usePostsFeed(), { wrapper })
    renderHook(() => useTrends(), { wrapper })
    renderHook(() => usePostDetail('10'), { wrapper })
    renderHook(() => usePostSearch('q'), { wrapper })
    renderHook(() => useTrendPosts('react'), { wrapper })

    await waitFor(() => {
      expect(useAlertStore.getState().queue.length).toBeGreaterThanOrEqual(4)
    })
  })

  it('mutation error handlers enqueue alerts', async () => {
    server.use(
      http.post(`*${baseUrl}/create/`, () =>
        HttpResponse.json({ detail: 'fail' }, { status: 400 }),
      ),
      http.post(`*${baseUrl}/10/comment/`, () =>
        HttpResponse.json({ detail: 'fail' }, { status: 400 }),
      ),
      http.post(`*${baseUrl}/10/like/`, () =>
        HttpResponse.json({ detail: 'fail' }, { status: 401 }),
      ),
      http.post(`*${baseUrl}/10/report/`, () =>
        HttpResponse.json({ detail: 'fail' }, { status: 400 }),
      ),
      http.delete(`*${baseUrl}/10/delete/`, () =>
        HttpResponse.json({ detail: 'fail' }, { status: 400 }),
      ),
    )
    const client = createTestClient()
    const wrapper = createWrapper(client)

    const create = renderHook(() => useCreatePost(), { wrapper })
    await act(async () => {
      await create.result.current.mutateAsync(new FormData()).catch(() => undefined)
    })
    expect(useAlertStore.getState().queue.some((a) => a.severity === 'error')).toBe(true)

    useAlertStore.setState({ queue: [] })
    const add = renderHook(() => useAddComment('10'), { wrapper })
    await act(async () => {
      await add.result.current.mutateAsync('x').catch(() => undefined)
    })

    useAlertStore.setState({ queue: [] })
    const like = renderHook(() => useLikePost(), { wrapper })
    await act(async () => {
      await like.result.current.mutateAsync(10).catch(() => undefined)
    })
    expect(useAlertStore.getState().queue[0]?.message).toBe('You must be logged in!')

    useAlertStore.setState({ queue: [] })
    const report = renderHook(() => useReportPost(), { wrapper })
    await act(async () => {
      await report.result.current.mutateAsync(10).catch(() => undefined)
    })

    useAlertStore.setState({ queue: [] })
    const del = renderHook(() => useDeletePost(), { wrapper })
    await act(async () => {
      await del.result.current.mutateAsync(10).catch(() => undefined)
    })
    expect(useAlertStore.getState().queue[0]?.severity).toBe('error')
  })

  it('useLikePost and useDeletePost update search/trend/detail caches', async () => {
    const client = createTestClient()
    const wrapper = createWrapper(client)

    client.setQueryData<InfiniteData<SearchPostsPayload>>(['social', 'posts', 'search', 'hello'], {
      pages: [{ results: { posts: [samplePost], profiles: [] }, next: null }],
      pageParams: [null],
    })
    client.setQueryData<InfiniteData<PaginatedPostsPayload>>(
      ['social', 'posts', 'trend', 'react'],
      {
        pages: [{ results: { posts: [samplePost] }, next: null }],
        pageParams: [null],
      },
    )
    client.setQueryData<{ post: SocialPostDetail }>(['social', 'posts', 'detail', '10'], {
      post: { ...samplePost, comments: [] },
    })

    const like = renderHook(() => useLikePost(), { wrapper })
    await act(async () => {
      await like.result.current.mutateAsync(10)
    })

    expect(
      flattenSearchPosts(client.getQueryData(['social', 'posts', 'search', 'hello'])).find(
        (p) => p.id === 10,
      )?.likes_count,
    ).toBe(4)
    expect(
      flattenPostPages(client.getQueryData(['social', 'posts', 'trend', 'react'])).find(
        (p) => p.id === 10,
      )?.likes_count,
    ).toBe(4)

    const detailCached = client.getQueryData<{ post: SocialPostDetail }>([
      'social',
      'posts',
      'detail',
      '10',
    ])
    expect(detailCached?.post.likes_count).toBe(4)

    const del = renderHook(() => useDeletePost(), { wrapper })
    await act(async () => {
      await del.result.current.mutateAsync(10)
    })
    expect(
      flattenSearchPosts(client.getQueryData(['social', 'posts', 'search', 'hello'])).some(
        (p) => p.id === 10,
      ),
    ).toBe(false)
    expect(
      flattenPostPages(client.getQueryData(['social', 'posts', 'trend', 'react'])).some(
        (p) => p.id === 10,
      ),
    ).toBe(false)
    // setQueriesData updater returns undefined; TanStack Query keeps previous detail entry
    expect(
      client.getQueryData<{ post: SocialPostDetail }>(['social', 'posts', 'detail', '10'])?.post
        .id,
    ).toBe(10)
  })
})
