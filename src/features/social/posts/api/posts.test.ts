import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import {
  addComment,
  createPost,
  deletePost,
  fetchFeed,
  fetchPost,
  fetchProfilePosts,
  fetchSearchPage,
  fetchTrendPosts,
  fetchTrends,
  getPathAndSearch,
  likePost,
  reportPost,
  searchPosts,
} from '@features/social/posts/api/posts'

const baseUrl = '/api/social-posts'

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
  http.get(`*${baseUrl}/profile/jane-doe/`, () =>
    HttpResponse.json({
      results: {
        posts: [samplePost],
        profile: {
          id: 1,
          slug: 'jane-doe',
          first_name: 'Jane',
          last_name: 'Doe',
          avatar_url: null,
          friends_count: 2,
          posts_count: 1,
        },
        can_send_friendship_request: true,
      },
      next: null,
    }),
  ),
  http.get(`*${baseUrl}/`, ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('trend') === 'react') {
      return HttpResponse.json({
        results: { posts: [{ ...samplePost, id: 11, body: '#react' }] },
        next: null,
      })
    }
    return HttpResponse.json({
      results: { posts: [samplePost] },
      next: 'https://example.com/api/social-posts/?page=2',
    })
  }),
  http.get(`*${baseUrl}/10/`, () =>
    HttpResponse.json({
      post: { ...samplePost, comments: [] },
    }),
  ),
  http.get(`*${baseUrl}/trends/`, () =>
    HttpResponse.json([{ id: '1', hashtag: 'react', occurences: 4 }]),
  ),
  http.post(`*${baseUrl}/search/`, async ({ request }) => {
    const body = (await request.json()) as { query?: string }
    return HttpResponse.json({
      results: {
        posts: body.query === 'hello' ? [samplePost] : [],
        profiles: [],
      },
      next: null,
    })
  }),
  http.post(`*${baseUrl}/create/`, async ({ request }) => {
    const form = await request.formData()
    return HttpResponse.json({
      ...samplePost,
      id: 99,
      body: String(form.get('body') ?? ''),
      is_private: form.get('is_private') === 'true',
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
  http.post(`*${baseUrl}/10/like/`, () =>
    HttpResponse.json({ message: 'like created' }),
  ),
  http.post(`*${baseUrl}/10/report/`, () => HttpResponse.json({})),
  http.delete(`*${baseUrl}/10/delete/`, () => HttpResponse.json({})),
)

describe('social posts api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('getPathAndSearch keeps pathname and search', () => {
    expect(getPathAndSearch('https://example.com/api/social-posts/?page=2')).toBe(
      '/api/social-posts/?page=2',
    )
  })

  it('fetchFeed returns posts and next page', async () => {
    await expect(fetchFeed()).resolves.toEqual({
      results: { posts: [samplePost] },
      next: 'https://example.com/api/social-posts/?page=2',
    })
  })

  it('fetchPost returns post detail', async () => {
    await expect(fetchPost('10')).resolves.toEqual({
      post: { ...samplePost, comments: [] },
    })
  })

  it('fetchTrends returns hashtags', async () => {
    await expect(fetchTrends()).resolves.toEqual([
      { id: '1', hashtag: 'react', occurences: 4 },
    ])
  })

  it('searchPosts posts query body', async () => {
    await expect(searchPosts('hello')).resolves.toEqual({
      results: { posts: [samplePost], profiles: [] },
      next: null,
    })
  })

  it('createPost sends multipart fields', async () => {
    const formData = new FormData()
    formData.append('body', 'New post')
    formData.append('is_private', 'false')

    await expect(createPost(formData)).resolves.toMatchObject({
      id: 99,
      body: 'New post',
      is_private: false,
    })
  })

  it('addComment / like / report / delete hit action endpoints', async () => {
    await expect(addComment('10', 'Nice')).resolves.toMatchObject({ body: 'Nice' })
    await expect(likePost(10)).resolves.toEqual({ message: 'like created' })
    await expect(reportPost(10)).resolves.toEqual({})
    await expect(deletePost(10)).resolves.toEqual({})
  })

  it('fetchFeed with pageUrl uses path+search', async () => {
    await expect(
      fetchFeed('https://example.com/api/social-posts/?page=2'),
    ).resolves.toMatchObject({ results: { posts: [samplePost] } })
  })

  it('fetchTrendPosts loads by trend id and by page url', async () => {
    await expect(fetchTrendPosts('react')).resolves.toMatchObject({
      results: { posts: [{ id: 11 }] },
    })
    await expect(
      fetchTrendPosts('react', 'https://example.com/api/social-posts/?page=2'),
    ).resolves.toMatchObject({ results: { posts: [samplePost] } })
  })

  it('fetchProfilePosts loads profile posts', async () => {
    const data = await fetchProfilePosts('jane-doe')
    expect(data.results.profile.slug).toBe('jane-doe')
    expect(data.results.posts).toHaveLength(1)
  })

  it('fetchProfilePosts with pageUrl uses path+search', async () => {
    await expect(
      fetchProfilePosts('jane-doe', 'https://example.com/api/social-posts/profile/jane-doe/'),
    ).resolves.toMatchObject({ results: { posts: [samplePost] } })
  })

  it('fetchSearchPage injects query param', async () => {
    server.use(
      http.get('*/api/social-posts/search/', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('query')).toBe('hello')
        return HttpResponse.json({
          results: { posts: [samplePost], profiles: [] },
          next: null,
        })
      }),
    )
    await expect(
      fetchSearchPage('https://example.com/api/social-posts/search/?page=2', 'hello'),
    ).resolves.toMatchObject({ results: { posts: [samplePost] } })
  })
})
