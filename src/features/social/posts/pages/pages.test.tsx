import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'
import { FeedHomePage } from '@features/social/posts/pages/FeedHomePage'
import { PostDetailPage } from '@features/social/posts/pages/PostDetailPage'
import { SearchPage } from '@features/social/posts/pages/SearchPage'
import { TrendPage } from '@features/social/posts/pages/TrendPage'
import {
  createSocialRouteWrapper,
  createTestClient,
  samplePost,
} from '@features/social/test/social-test-utils'
import { useProfileStore } from '@features/social/profiles/store/profile.store'

const sampleAuthor = samplePost.created_by

const server = setupServer(
  http.get('*/api/social-posts/', ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('trend') === 'react') {
      return HttpResponse.json({
        results: { posts: [{ ...samplePost, body: '#react rocks' }] },
        next: null,
      })
    }
    return HttpResponse.json({ results: { posts: [samplePost] }, next: null })
  }),
  http.get('*/api/social-posts/10/', () =>
    HttpResponse.json({
      post: {
        ...samplePost,
        comments: [
          {
            id: 1,
            body: 'First comment',
            created_at_formatted: '1m',
            created_by: sampleAuthor,
          },
        ],
      },
    }),
  ),
  http.get('*/api/social-posts/trends/', () =>
    HttpResponse.json([{ id: '1', hashtag: 'react', occurences: 4 }]),
  ),
  http.get('*/api/social-profiles/friends/suggested/', () => HttpResponse.json([])),
  http.get('*/api/social-profiles/me/', () =>
    HttpResponse.json({
      id: 1,
      username: 'jane',
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'j@e.com',
      slug: 'jane-doe',
      full_name: 'Jane Doe',
      avatar_url: null,
    }),
  ),
  http.post('*/api/social-posts/search/', () =>
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
      next: null,
    }),
  ),
  http.post('*/api/social-posts/10/comment/', async ({ request }) => {
    const body = (await request.json()) as { body?: string }
    return HttpResponse.json({
      id: 9,
      body: body.body ?? '',
      created_at_formatted: 'now',
      created_by: sampleAuthor,
    })
  }),
)

describe('social post pages', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ access: 'token', refresh: 'r', activeApp: 'social' })
    useProfileStore.setState({
      user: {
        id: 1,
        username: 'jane',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'j@e.com',
        slug: 'jane-doe',
        full_name: 'Jane Doe',
        avatar_url: null,
      },
    })
  })
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('FeedHomePage shows posts and create form when authenticated', async () => {
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/home', <FeedHomePage />)
    render(<Page />)
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()
    expect(screen.getByLabelText('What are you thinking about?')).toBeInTheDocument()
  })

  it('PostDetailPage shows comments and comment form', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/:id',
      <PostDetailPage />,
      '/social/10',
    )
    const { container } = render(<Page />)
    expect(await screen.findByText('First comment')).toBeInTheDocument()
    const commentField = screen.getByRole('textbox', { name: /What do you think/i })
    fireEvent.submit(container.querySelector('form')!)
    await user.type(commentField, 'Second')
    await user.click(screen.getByRole('button', { name: 'Comment' }))
    expect(await screen.findByText('Second')).toBeInTheDocument()
  })

  it('FeedHomePage hides create form and suggestions for guests', async () => {
    useAuthStore.setState({ access: null, refresh: null, activeApp: 'social' })
    useProfileStore.setState({ user: null })
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/home', <FeedHomePage />)
    render(<Page />)
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()
    expect(screen.queryByLabelText('What are you thinking about?')).not.toBeInTheDocument()
    expect(screen.queryByText('People you may know')).not.toBeInTheDocument()
  })

  it('PostDetailPage hides comment form for guests', async () => {
    useAuthStore.setState({ access: null, refresh: null, activeApp: 'social' })
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/:id',
      <PostDetailPage />,
      '/social/10',
    )
    render(<Page />)
    expect(await screen.findByText('First comment')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /What do you think/i })).not.toBeInTheDocument()
  })

  it('FeedHomePage ignores scroll when there is no next page', async () => {
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/home', <FeedHomePage />)
    render(<Page />)
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()

    Object.defineProperty(document.body, 'offsetHeight', { configurable: true, value: 200 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    expect(screen.queryByText('Second page')).not.toBeInTheDocument()
  })

  it('TrendPage shows empty state for trends without posts', async () => {
    server.use(
      http.get('*/api/social-posts/', ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('trend') === 'react') {
          return HttpResponse.json({ results: { posts: [] }, next: null })
        }
        return HttpResponse.json({ results: { posts: [samplePost] }, next: null })
      }),
    )
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/trends/:id',
      <TrendPage />,
      '/social/trends/react',
    )
    render(<Page />)
    expect(await screen.findByText('No posts for this trend yet.')).toBeInTheDocument()
  })

  it('SearchPage searches profiles and posts', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/search', <SearchPage />)
    render(<Page />)
    await user.type(screen.getByLabelText('What are you looking for?'), 'hello')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(await screen.findByText('Bob Lee')).toBeInTheDocument()
    expect(screen.getByText('Hello feed')).toBeInTheDocument()
  })

  it('TrendPage shows trend header and posts', async () => {
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/trends/:id',
      <TrendPage />,
      '/social/trends/react',
    )
    render(<Page />)
    expect(await screen.findByText('Trend: #react')).toBeInTheDocument()
    expect(await screen.findByText('#react rocks')).toBeInTheDocument()
  })

  it('FeedHomePage shows empty state when no posts', async () => {
    server.use(
      http.get('*/api/social-posts/', () =>
        HttpResponse.json({ results: { posts: [] }, next: null }),
      ),
    )
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/home', <FeedHomePage />)
    render(<Page />)
    expect(await screen.findByText('No posts yet.')).toBeInTheDocument()
  })

  it('FeedHomePage fetches next page on scroll to bottom', async () => {
    server.use(
      http.get('*/api/social-posts/', ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('page') === '2') {
          return HttpResponse.json({
            results: { posts: [{ ...samplePost, id: 11, body: 'Second page' }] },
            next: null,
          })
        }
        return HttpResponse.json({
          results: { posts: [samplePost] },
          next: `${url.origin}/api/social-posts/?page=2`,
        })
      }),
    )
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/home', <FeedHomePage />)
    render(<Page />)
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    expect(await screen.findByText('Second page')).toBeInTheDocument()
  })

  it('SearchPage shows nothing found', async () => {
    server.use(
      http.post('*/api/social-posts/search/', () =>
        HttpResponse.json({ results: { posts: [], profiles: [] }, next: null }),
      ),
    )
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/search', <SearchPage />)
    render(<Page />)
    await user.type(screen.getByLabelText('What are you looking for?'), 'zzz')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(screen.getByText('Nothing was found.')).toBeInTheDocument())
  })

  it('SearchPage loads next page on scroll', async () => {
    server.use(
      http.post('*/api/social-posts/search/', () =>
        HttpResponse.json({
          results: {
            posts: [samplePost],
            profiles: [],
          },
          next: 'https://example.com/api/social-posts/search/?page=2',
        }),
      ),
      http.get('*/api/social-posts/search/', () =>
        HttpResponse.json({
          results: {
            posts: [{ ...samplePost, id: 12, body: 'Paged result' }],
            profiles: [],
          },
          next: null,
        }),
      ),
    )
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/search', <SearchPage />)
    render(<Page />)
    await user.type(screen.getByLabelText('What are you looking for?'), 'hello')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    expect(await screen.findByText('Paged result')).toBeInTheDocument()
  })

  it('PostDetailPage shows loading spinner before post loads', async () => {
    server.use(
      http.get('*/api/social-posts/10/', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json({
          post: {
            ...samplePost,
            comments: [],
          },
        })
      }),
    )
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/:id',
      <PostDetailPage />,
      '/social/10',
    )
    render(<Page />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()
  })

  it('FeedHomePage shows progress while fetching next page', async () => {
    server.use(
      http.get('*/api/social-posts/', ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('page') === '2') {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(
                HttpResponse.json({
                  results: { posts: [{ ...samplePost, id: 11, body: 'Second page' }] },
                  next: null,
                }),
              )
            }, 100)
          })
        }
        return HttpResponse.json({
          results: { posts: [samplePost] },
          next: `${url.origin}/api/social-posts/?page=2`,
        })
      }),
    )
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/home', <FeedHomePage />)
    render(<Page />)
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
    expect(await screen.findByText('Second page')).toBeInTheDocument()
  })

  it('SearchPage shows skeleton while first search loads', async () => {
    server.use(
      http.post('*/api/social-posts/search/', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json({
          results: { posts: [samplePost], profiles: [] },
          next: null,
        })
      }),
    )
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/search', <SearchPage />)
    render(<Page />)
    await user.type(screen.getByLabelText('What are you looking for?'), 'hello')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()
  })

  it('FeedHomePage ignores scroll while next page is loading', async () => {
    let resolvePage2: (value: Response) => void
    server.use(
      http.get('*/api/social-posts/', ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('page') === '2') {
          return new Promise((resolve) => {
            resolvePage2 = resolve
          })
        }
        return HttpResponse.json({
          results: { posts: [samplePost] },
          next: `${url.origin}/api/social-posts/?page=2`,
        })
      }),
    )
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/home', <FeedHomePage />)
    render(<Page />)
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    expect(await screen.findByRole('progressbar')).toBeInTheDocument()

    window.dispatchEvent(new Event('scroll'))
    resolvePage2!(
      HttpResponse.json({
        results: { posts: [{ ...samplePost, id: 11, body: 'Second page' }] },
        next: null,
      }),
    )
    expect(await screen.findByText('Second page')).toBeInTheDocument()
  })

  it('SearchPage shows progress while fetching next page', async () => {
    server.use(
      http.post('*/api/social-posts/search/', () =>
        HttpResponse.json({
          results: { posts: [samplePost], profiles: [] },
          next: 'https://example.com/api/social-posts/search/?page=2',
        }),
      ),
      http.get('*/api/social-posts/search/', () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(
              HttpResponse.json({
                results: { posts: [{ ...samplePost, id: 12, body: 'Paged result' }] },
                next: null,
              }),
            )
          }, 100)
        }),
      ),
    )
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/search', <SearchPage />)
    render(<Page />)
    await user.type(screen.getByLabelText('What are you looking for?'), 'hello')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
    expect(await screen.findByText('Paged result')).toBeInTheDocument()
  })

  it('TrendPage ignores scroll while next page is loading', async () => {
    let resolvePage2: (value: Response) => void
    server.use(
      http.get('*/api/social-posts/', ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('trend') === 'react' && url.searchParams.get('page') === '2') {
          return new Promise((resolve) => {
            resolvePage2 = resolve
          })
        }
        if (url.searchParams.get('trend') === 'react') {
          return HttpResponse.json({
            results: { posts: [{ ...samplePost, body: '#react rocks' }] },
            next: `${url.origin}/api/social-posts/?trend=react&page=2`,
          })
        }
        return HttpResponse.json({ results: { posts: [samplePost] }, next: null })
      }),
    )
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/trends/:id',
      <TrendPage />,
      '/social/trends/react',
    )
    render(<Page />)
    expect(await screen.findByText('#react rocks')).toBeInTheDocument()

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
    window.dispatchEvent(new Event('scroll'))
    resolvePage2!(
      HttpResponse.json({
        results: { posts: [{ ...samplePost, id: 21, body: 'Trend page 2' }] },
        next: null,
      }),
    )
    expect(await screen.findByText('Trend page 2')).toBeInTheDocument()
  })

  it('SearchPage ignores scroll while next page is loading', async () => {
    let resolvePage2: (value: Response) => void
    server.use(
      http.post('*/api/social-posts/search/', () =>
        HttpResponse.json({
          results: { posts: [samplePost], profiles: [] },
          next: 'https://example.com/api/social-posts/search/?page=2',
        }),
      ),
      http.get('*/api/social-posts/search/', () =>
        new Promise((resolve) => {
          resolvePage2 = resolve
        }),
      ),
    )
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/search', <SearchPage />)
    render(<Page />)
    await user.type(screen.getByLabelText('What are you looking for?'), 'hello')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(await screen.findByText('Hello feed')).toBeInTheDocument()

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
    window.dispatchEvent(new Event('scroll'))
    resolvePage2!(
      HttpResponse.json({
        results: { posts: [{ ...samplePost, id: 12, body: 'Paged result' }] },
        next: null,
      }),
    )
    expect(await screen.findByText('Paged result')).toBeInTheDocument()
  })

  it('TrendPage shows progress while fetching next page', async () => {
    server.use(
      http.get('*/api/social-posts/', ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('trend') === 'react') {
          if (url.searchParams.get('page') === '2') {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(
                  HttpResponse.json({
                    results: { posts: [{ ...samplePost, id: 21, body: 'Trend page 2' }] },
                    next: null,
                  }),
                )
              }, 100)
            })
          }
          return HttpResponse.json({
            results: { posts: [{ ...samplePost, body: '#react rocks' }] },
            next: `${url.origin}/api/social-posts/?trend=react&page=2`,
          })
        }
        return HttpResponse.json({ results: { posts: [samplePost] }, next: null })
      }),
    )
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/trends/:id',
      <TrendPage />,
      '/social/trends/react',
    )
    render(<Page />)
    expect(await screen.findByText('#react rocks')).toBeInTheDocument()

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
    expect(await screen.findByText('Trend page 2')).toBeInTheDocument()
  })
})
