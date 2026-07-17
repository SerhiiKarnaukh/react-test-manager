import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import {
  addToCart,
  fetchCart,
  removeCartLine,
  removeCartLineFully,
} from '@features/taberna/cart/api/cart'

const CART_BASE = '/taberna-cart/api'

const emptyCart = {
  cart_items: [],
  quantity: 0,
  total: 0,
  tax: 0,
  grand_total: 0,
}

const server = setupServer(
  http.get(`*${CART_BASE}/cart/`, ({ request }) => {
    const url = new URL(request.url)
    const cartId = url.searchParams.get('cart_id')
    return HttpResponse.json({
      ...emptyCart,
      quantity: cartId ? 2 : 0,
    })
  }),
  http.post(`*${CART_BASE}/add-to-cart/:productId/`, async ({ request }) => {
    const body = (await request.json()) as { color?: string; size?: string; cart_id?: string }
    expect(body.color).toBe('red')
    expect(body.size).toBe('M')
    return HttpResponse.json({ cart_id: body.cart_id ?? 'guest-cart-1' })
  }),
  http.delete(`*${CART_BASE}/cart-remove/:productId/:cartItemId/`, () =>
    HttpResponse.json(null, { status: 204 }),
  ),
  http.delete(`*${CART_BASE}/cart-item-remove/:productId/:cartItemId/`, () =>
    HttpResponse.json(null, { status: 204 }),
  ),
)

describe('taberna cart api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('fetchCart GETs cart without cart_id for anonymous users', async () => {
    const cart = await fetchCart(null)
    expect(cart.quantity).toBe(0)
  })

  it('fetchCart passes cart_id query param when present', async () => {
    const cart = await fetchCart('cart-42')
    expect(cart.quantity).toBe(2)
  })

  it('addToCart POSTs color, size and cart_id', async () => {
    const response = await addToCart(7, 'red', 'M', 'cart-1')
    expect(response.cart_id).toBe('cart-1')
  })

  it('removeCartLine DELETEs one quantity', async () => {
    await expect(removeCartLine(3, 11, 'cart-1')).resolves.toBeUndefined()
  })

  it('removeCartLineFully DELETEs the entire line', async () => {
    await expect(removeCartLineFully(3, 11, null)).resolves.toBeUndefined()
  })
})
