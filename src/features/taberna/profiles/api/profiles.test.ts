import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import { fetchUserOrders } from '@features/taberna/profiles/api/profiles'

const PROFILES_BASE = '/taberna-profiles/api/v1'

const sampleOrders = [
  {
    id: 1,
    order_number: 'ORD-001',
    created_at: '2026-07-17',
    tax: 10,
    order_total: 110,
    payment: { status: 'paid', payment_method: 'stripe' },
    order_products: [
      {
        id: 1,
        quantity: 1,
        product_price: 100,
        product: {
          id: 7,
          name: 'Shirt',
          price: 100,
          image: 'https://example.com/shirt.jpg',
          get_absolute_url: '/taberna-store/category/shirts/shirt',
        },
        variations: [],
      },
    ],
  },
]

const server = setupServer(
  http.get(`*${PROFILES_BASE}/orders/`, () => HttpResponse.json(sampleOrders)),
)

describe('taberna profiles api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('fetchUserOrders GETs order history', async () => {
    const orders = await fetchUserOrders()
    expect(orders).toEqual(sampleOrders)
  })
})
