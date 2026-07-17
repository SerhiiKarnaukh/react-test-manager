import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, vi } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import { MainTabernaLayout } from '@features/taberna/layouts/MainTabernaLayout'
import { sampleCart } from '@features/taberna/test/taberna-test-utils'

const server = setupServer(
  http.get('*/taberna-store/api/v1/product-categories/', () =>
    HttpResponse.json([{ name: 'Shirts', get_absolute_url: '/taberna-store/category/shirts' }]),
  ),
  http.get('*/taberna-cart/api/cart/', () => HttpResponse.json(sampleCart)),
)

function renderLayout(initialEntry = '/taberna') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<MainTabernaLayout />}>
            <Route path="/taberna" element={<div>Taberna content</div>} />
            <Route path="/taberna/search" element={<div>Search route</div>} />
            <Route path="/taberna/login" element={<div>Login route</div>} />
          </Route>
          <Route path="/" element={<div>Apps route</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MainTabernaLayout', () => {
  const originalMatchMedia = window.matchMedia

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => {
    localStorage.clear()
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    useAuthStore.setState({ access: null, refresh: null, activeApp: null })
    useCartStore.setState({ cart: sampleCart, cartId: 'guest-cart-1', isLoading: false })
  })
  afterEach(() => {
    server.resetHandlers()
    window.matchMedia = originalMatchMedia
  })
  afterAll(() => server.close())

  it('renders desktop nav, category menu and search dialog', async () => {
    const user = userEvent.setup()
    renderLayout()

    expect(screen.getByText('Taberna content')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/taberna/login')
    expect(screen.getByText('Cart')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /category/i }))
    expect(await screen.findByRole('menuitem', { name: 'Shirts' })).toBeInTheDocument()

    await user.click(screen.getByLabelText('Search'))
    await user.type(screen.getByRole('textbox'), 'boots')
    await user.click(screen.getAllByRole('button', { name: /search/i }).at(-1)!)
    expect(screen.getByText('Search route')).toBeInTheDocument()
  })

  it('renders mobile menu and logs out authenticated user', async () => {
    const user = userEvent.setup()
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    useAuthStore.setState({ access: 'access', refresh: 'refresh', activeApp: 'taberna' })

    renderLayout()

    await user.click(screen.getByLabelText('Open menu'))
    expect(screen.getByRole('menuitem', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /cart/i })).toHaveTextContent('Cart (2)')
    await user.click(screen.getByRole('menuitem', { name: /logout/i }))

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated()).toBe(false))
    expect(localStorage.getItem('cartId')).toBeNull()
  })
})
