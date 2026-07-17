import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { expect, vi } from 'vitest'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import * as ordersApi from '@features/taberna/orders/api/orders'
import { useCheckout, useReportOrderStatus } from '@features/taberna/orders/hooks/useCheckout'

vi.mock('@features/taberna/orders/api/orders', async () => {
  const actual = await vi.importActual<typeof import('@features/taberna/orders/api/orders')>(
    '@features/taberna/orders/api/orders',
  )
  return {
    ...actual,
    placeStripeOrder: vi.fn(),
    reportOrderPaymentStatus: vi.fn(),
  }
})

const samplePayload = {
  first_name: 'Olivia',
  last_name: 'Thompson',
  email: 'olivia@example.com',
  phone: '1234567890',
  address_line_1: 'Main street',
  address_line_2: '',
  city: 'Boston',
  state: 'MA',
  country: 'USA',
  order_note: '',
  stripe_token: null,
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('useCheckout', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.mocked(ordersApi.placeStripeOrder).mockResolvedValue({})
    vi.mocked(ordersApi.reportOrderPaymentStatus).mockResolvedValue()
    useCartStore.setState({ loadCart: vi.fn(async () => undefined) })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('completes charge order placement and reloads cart', async () => {
    const { result } = renderHook(() => useCheckout(), { wrapper: createWrapper() })

    result.current.mutate({ payload: samplePayload, type: 'charge' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useCartStore.getState().loadCart).toHaveBeenCalledWith({ silent: true })
  })

  it('redirects to Stripe checkout in session mode', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    })
    vi.mocked(ordersApi.placeStripeOrder).mockResolvedValue({
      checkout_url: 'https://stripe.test/checkout',
    })
    const { result } = renderHook(() => useCheckout(), { wrapper: createWrapper() })

    result.current.mutate({ payload: samplePayload, type: 'session' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(window.location.href).toBe('https://stripe.test/checkout')
  })

  it('handles missing checkout URL and API failures', async () => {
    const { result } = renderHook(() => useCheckout(), { wrapper: createWrapper() })

    result.current.mutate({ payload: samplePayload, type: 'session' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    vi.mocked(ordersApi.placeStripeOrder).mockRejectedValueOnce(new Error('boom'))
    result.current.mutate({ payload: samplePayload, type: 'charge' })
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
  })

  it('reports order statuses', async () => {
    const { result } = renderHook(() => useReportOrderStatus(), { wrapper: createWrapper() })

    result.current.mutate({ status: 'success', stripeSessionId: 'sess_1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(ordersApi.reportOrderPaymentStatus).toHaveBeenCalledWith('success', 'sess_1')

    vi.mocked(ordersApi.reportOrderPaymentStatus).mockRejectedValueOnce(new Error('bad'))
    result.current.mutate({ status: 'failed', stripeSessionId: 'sess_2' })
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
  })
})
