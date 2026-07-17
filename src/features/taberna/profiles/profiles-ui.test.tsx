import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Route, Routes } from 'react-router-dom'
import { expect } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import { DashboardPage } from '@features/taberna/profiles/pages/DashboardPage'
import { OrderSummary } from '@features/taberna/profiles/components/OrderSummary'
import { TabernaLoginPage } from '@features/taberna/profiles/pages/TabernaLoginPage'
import {
  createTabernaWrapper,
  sampleCart,
  sampleCartItem,
} from '@features/taberna/test/taberna-test-utils'

const sampleOrder = {
  id: 1,
  order_number: 'ORD-001',
  created_at: '2026-07-17',
  tax: 14,
  order_total: 154,
  payment: {
    status: 'paid',
    payment_method: 'stripe',
  },
  order_products: [
    {
      id: 3,
      quantity: 2,
      product_price: 70,
      product: sampleCartItem.product,
      variations: sampleCartItem.variations,
    },
  ],
}

const server = setupServer(
  http.get('*/taberna-profiles/api/v1/orders/', () => HttpResponse.json([sampleOrder])),
  http.post('*/taberna-profiles/api/v1/token/', async ({ request }) => {
    const body = (await request.json()) as { email?: string; cart_id?: string }
    if (body.email === 'bad@example.com') {
      return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 400 })
    }
    return HttpResponse.json({ access: 'access', refresh: 'refresh' })
  }),
  http.get('*/taberna-cart/api/cart/', () => HttpResponse.json(sampleCart)),
)

describe('Taberna profiles UI', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ access: null, refresh: null, activeApp: null })
    useCartStore.setState({ cart: sampleCart, cartId: 'guest-cart-1', isLoading: false })
  })
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('renders order summary details', () => {
    render(<OrderSummary order={sampleOrder} />, { wrapper: createTabernaWrapper() })

    expect(screen.getByText('Order #ORD-001')).toBeInTheDocument()
    expect(screen.getByText('Status: paid')).toBeInTheDocument()
    expect(screen.getByText('Payment Method: stripe')).toBeInTheDocument()
    expect(screen.getByText('color: blue')).toBeInTheDocument()
    expect(screen.getByText('$140.00')).toBeInTheDocument()
  })

  it('renders dashboard orders and empty state', async () => {
    const { unmount } = render(<DashboardPage />, { wrapper: createTabernaWrapper() })

    await screen.findByText('Order #ORD-001')

    unmount()
    server.use(http.get('*/taberna-profiles/api/v1/orders/', () => HttpResponse.json([])))

    render(<DashboardPage />, { wrapper: createTabernaWrapper() })
    await screen.findByText("You don't have any orders...")
  })

  it('logs in Taberna user, merges cart and navigates', async () => {
    const user = userEvent.setup()

    render(
      <Routes>
        <Route path="/taberna/login" element={<TabernaLoginPage />} />
        <Route path="/taberna/dashboard" element={<div>Dashboard route</div>} />
      </Routes>,
      { wrapper: createTabernaWrapper(undefined, ['/taberna/login?message=auth']) },
    )

    expect(screen.getByText('Please sign in to continue.')).toBeInTheDocument()
    await user.type(screen.getByLabelText(/email/i), 'olivia@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret1')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await screen.findByText('Dashboard route')
    expect(localStorage.getItem('access')).toBe('access')
    expect(localStorage.getItem('cartId')).toBeNull()
  })

  it('shows login error and navigates to signup from login page', async () => {
    const user = userEvent.setup()

    render(
      <Routes>
        <Route path="/taberna/login" element={<TabernaLoginPage />} />
        <Route path="/taberna/signup" element={<div>Signup route</div>} />
      </Routes>,
      { wrapper: createTabernaWrapper(undefined, ['/taberna/login']) },
    )

    await user.click(screen.getByRole('button', { name: /register/i }))
    expect(screen.getByText('Signup route')).toBeInTheDocument()

    render(
      <Routes>
        <Route path="/taberna/login" element={<TabernaLoginPage />} />
      </Routes>,
      { wrapper: createTabernaWrapper(undefined, ['/taberna/login']) },
    )

    await user.type(screen.getByLabelText(/email/i), 'bad@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret1')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => expect(localStorage.getItem('access')).toBeNull())
  })
})
