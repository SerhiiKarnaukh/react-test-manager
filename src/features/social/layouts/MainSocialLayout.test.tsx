import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, vi } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'
import { MainSocialLayout } from '@features/social/layouts/MainSocialLayout'
import { socialTheme } from '@features/social/social.theme'
import { useProfileStore } from '@features/social/profiles/store/profile.store'
import { socialRoutes } from '@features/social/social.routes'

const server = setupServer(
  http.get('*/api/social-profiles/me/', () =>
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
  http.get('*/api/social-notifications/', () =>
    HttpResponse.json([
      { id: 1, body: 'n1', type_of_notification: 'chat_message' },
      { id: 2, body: 'n2', type_of_notification: 'chat_message' },
    ]),
  ),
  http.get('*/api/social-posts/', () =>
    HttpResponse.json({ results: { posts: [] }, next: null }),
  ),
  http.get('*/api/social-posts/trends/', () => HttpResponse.json([])),
  http.get('*/api/social-profiles/friends/suggested/', () => HttpResponse.json([])),
)

describe('MainSocialLayout', () => {
  const OriginalWebSocket = globalThis.WebSocket
  const originalMatchMedia = window.matchMedia

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
    class MockWebSocket {
      static OPEN = 1
      static CONNECTING = 0
      readyState = 1
      onmessage: ((event: { data: string }) => void) | null = null
      close = vi.fn()
      url: string

      constructor(url: string) {
        this.url = url
      }
    }
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket)
  })
  beforeEach(() => {
    localStorage.clear()
    window.matchMedia = originalMatchMedia
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
  afterEach(() => {
    server.resetHandlers()
    window.matchMedia = originalMatchMedia
  })
  afterAll(() => {
    server.close()
    vi.stubGlobal('WebSocket', OriginalWebSocket)
  })

  it('shows unread notification badge count', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    expect(screen.getByText('Home content')).toBeInTheDocument()
    expect(await screen.findByText('(2)')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Social Network/i })).toBeInTheDocument()
  })

  it('toggles color scheme and opens apps menu', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.stubEnv('VITE_REMOTE_HOST', 'http://apps.example')

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: /Dark mode|Light mode/i }))
    await user.click(screen.getByRole('button', { name: 'Apps Manager' }))
    expect((await screen.findAllByText('All Apps')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('React Apps').length).toBeGreaterThan(0)
  })

  it('shows guest login/signup when logged out', async () => {
    useAuthStore.setState({ access: null, refresh: null, activeApp: 'social' })
    useProfileStore.setState({ user: null })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    expect(screen.getAllByRole('link', { name: 'Login' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Signup' }).length).toBeGreaterThan(0)
  })

  it('opens mobile navigation menu', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    await user.click(screen.getByLabelText('Open menu'))
    expect(await screen.findByText('Chat')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
    await user.click(screen.getByText('Theme'))
  })

  it('opens mobile navigation menu with All Apps link when remote host is set', async () => {
    useAuthStore.setState({ access: null, refresh: null, activeApp: 'social' })
    useProfileStore.setState({ user: null })
    vi.stubEnv('VITE_REMOTE_HOST', 'http://apps.example')
    const user = userEvent.setup()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    await user.click(screen.getByLabelText('Open menu'))
    expect(await screen.findByRole('menuitem', { name: 'All Apps' })).toBeInTheDocument()
  })

  it('opens mobile profile link for authenticated users', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    await user.click(screen.getByLabelText('Open menu'))
    expect(await screen.findByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
  })

  it('opens mobile navigation menu for guests', async () => {
    useAuthStore.setState({ access: null, refresh: null, activeApp: 'social' })
    useProfileStore.setState({ user: null })
    const user = userEvent.setup()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    await user.click(screen.getByLabelText('Open menu'))
    expect(await screen.findByRole('menuitem', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Signup' })).toBeInTheDocument()
  })

  it('hides remote All Apps links when env is unset', async () => {
    vi.stubEnv('VITE_REMOTE_HOST', '')
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    expect(screen.queryByText('All Apps')).not.toBeInTheDocument()
  })

  it('hides mobile profile link when authenticated user has no slug', async () => {
    server.use(
      http.get('*/api/social-profiles/me/', () =>
        HttpResponse.json({
          id: 1,
          username: 'john',
          first_name: 'John',
          last_name: 'Doe',
          email: 'j@e.com',
          slug: '',
          full_name: 'John Doe',
          avatar_url: null,
        }),
      ),
    )
    useProfileStore.setState({
      user: {
        id: 1,
        username: 'john',
        first_name: 'John',
        last_name: 'Doe',
        email: 'j@e.com',
        slug: '',
        full_name: 'John Doe',
        avatar_url: null,
      },
    })
    const user = userEvent.setup()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    await user.click(screen.getByLabelText('Open menu'))
    expect(await screen.findByRole('menuitem', { name: /Notifications/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()
  })

  it('hides profile avatar when authenticated user has no slug', async () => {
    server.use(
      http.get('*/api/social-profiles/me/', () =>
        HttpResponse.json({
          id: 1,
          username: 'john',
          first_name: 'John',
          last_name: 'Doe',
          email: 'j@e.com',
          slug: '',
          full_name: 'John Doe',
          avatar_url: null,
        }),
      ),
    )
    useProfileStore.setState({
      user: {
        id: 1,
        username: 'john',
        first_name: 'John',
        last_name: 'Doe',
        email: 'j@e.com',
        slug: '',
        full_name: 'John Doe',
        avatar_url: null,
      },
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    expect(screen.queryByLabelText('Profile')).not.toBeInTheDocument()
  })

  it('logout clears profile and navigates to login', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={['/social/home']}>
            <Routes>
              <Route element={<MainSocialLayout />}>
                <Route path="/social/home" element={<div>Home content</div>} />
              </Route>
              <Route path="/social/login" element={<div>Login page</div>} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    await user.click(await screen.findByRole('button', { name: 'Logout' }))
    expect(await screen.findByText('Login page')).toBeInTheDocument()
    expect(useProfileStore.getState().user).toBeNull()
  })

  it('exports social routes array', () => {
    expect(socialRoutes.length).toBeGreaterThan(0)
  })
})
