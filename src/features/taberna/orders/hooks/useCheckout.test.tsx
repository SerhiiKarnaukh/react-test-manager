import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { expect } from 'vitest'
import { useCheckout } from '@features/taberna/orders/hooks/useCheckout'

const ORDERS_BASE = '/taberna-orders/api/v1'

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

const server = setupServer(
  http.post(`*${ORDERS_BASE}/place_order_stripe_charge/`, () => HttpResponse.json({})),
  http.get('*/taberna-cart/api/cart/', () =>
    HttpResponse.json({
      cart_items: [],
      quantity: 0,
      total: 0,
      tax: 0,
      grand_total: 0,
    }),
  ),
)

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
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('completes charge order placement', async () => {
    const { result } = renderHook(() => useCheckout(), { wrapper: createWrapper() })

    result.current.mutate({ payload: samplePayload, type: 'charge' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
