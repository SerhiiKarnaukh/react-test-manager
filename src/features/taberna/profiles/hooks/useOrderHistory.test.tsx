import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { expect } from 'vitest'
import { useOrderHistory } from '@features/taberna/profiles/hooks/useOrderHistory'

const PROFILES_BASE = '/taberna-profiles/api/v1'

const sampleOrders = [
  {
    id: 1,
    order_number: 'ORD-001',
    created_at: '2026-07-17',
    tax: 10,
    order_total: 110,
    order_products: [],
  },
]

const server = setupServer(
  http.get(`*${PROFILES_BASE}/orders/`, () => HttpResponse.json(sampleOrders)),
)

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('useOrderHistory', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('loads user orders', async () => {
    const { result } = renderHook(() => useOrderHistory(), { wrapper: createWrapper() })

    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(sampleOrders)
  })
})
