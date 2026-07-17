import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect, vi } from 'vitest'
import { EMPTY_TABERNA_CART } from '@features/taberna/cart/api/cart'
import { useCartStore } from '@features/taberna/cart/store/cart.store'

const CART_BASE = '/taberna-cart/api'

const sampleCart = {
  cart_items: [
    {
      id: 11,
      quantity: 2,
      product: {
        id: 7,
        name: 'Shirt',
        price: 40,
        image: 'https://example.com/shirt.jpg',
        get_absolute_url: '/taberna-store/category/shirts/shirt',
      },
      variations: [
        { id: 1, variation_category: 'color', variation_value: 'red' },
        { id: 2, variation_category: 'size', variation_value: 'M' },
      ],
    },
  ],
  quantity: 2,
  total: 80,
  tax: 8,
  grand_total: 88,
}

const server = setupServer(
  http.get(`*${CART_BASE}/cart/`, () => HttpResponse.json(sampleCart)),
  http.post(`*${CART_BASE}/add-to-cart/:productId/`, () =>
    HttpResponse.json({ cart_id: 'guest-cart-1' }),
  ),
  http.delete(`*${CART_BASE}/cart-remove/:productId/:cartItemId/`, () =>
    HttpResponse.json(null, { status: 204 }),
  ),
  http.delete(`*${CART_BASE}/cart-item-remove/:productId/:cartItemId/`, () =>
    HttpResponse.json(null, { status: 204 }),
  ),
)

function resetCartStore() {
  localStorage.clear()
  useCartStore.setState({
    cart: EMPTY_TABERNA_CART,
    cartId: null,
    isLoading: false,
  })
}

describe('taberna cart store', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    vi.restoreAllMocks()
    resetCartStore()
  })
  afterAll(() => server.close())

  it('loads cart into state', async () => {
    await useCartStore.getState().loadCart({ silent: true })

    expect(useCartStore.getState().cart.quantity).toBe(2)
    expect(useCartStore.getState().isLoading).toBe(false)
  })

  it('handles loadCart errors in silent and non-silent modes', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    server.use(
      http.get(`*${CART_BASE}/cart/`, () => HttpResponse.json({ detail: 'bad' }, { status: 500 })),
    )

    await useCartStore.getState().loadCart({ silent: true })
    expect(errorSpy).toHaveBeenCalled()

    await useCartStore.getState().loadCart()
    expect(useCartStore.getState().isLoading).toBe(false)
  })

  it('persists cart_id from addToCart response', async () => {
    await useCartStore.getState().addToCart(7, 'red', 'M')

    expect(useCartStore.getState().cartId).toBe('guest-cart-1')
    expect(localStorage.getItem('cartId')).toBe('guest-cart-1')
    expect(useCartStore.getState().cart.quantity).toBe(2)
  })

  it('keeps current cartId when addToCart response has no cart_id', async () => {
    server.use(http.post(`*${CART_BASE}/add-to-cart/:productId/`, () => HttpResponse.json({})))
    useCartStore.setState({ cartId: 'existing-cart' })

    await useCartStore.getState().addToCart(7, 'red', 'M')

    expect(useCartStore.getState().cartId).toBe('existing-cart')
  })

  it('surfaces addToCart errors', async () => {
    server.use(
      http.post(`*${CART_BASE}/add-to-cart/:productId/`, () =>
        HttpResponse.json({ detail: 'bad' }, { status: 500 }),
      ),
    )

    await expect(useCartStore.getState().addToCart(7, 'red', 'M')).rejects.toThrow()
    expect(useCartStore.getState().isLoading).toBe(false)
  })

  it('decrements a cart line and reloads cart', async () => {
    useCartStore.setState({ cartId: 'guest-cart-1' })
    await useCartStore.getState().decrementLine(7, 11)

    expect(useCartStore.getState().cart.quantity).toBe(2)
  })

  it('surfaces decrement errors', async () => {
    server.use(
      http.delete(`*${CART_BASE}/cart-remove/:productId/:cartItemId/`, () =>
        HttpResponse.json({ detail: 'bad' }, { status: 500 }),
      ),
    )

    await expect(useCartStore.getState().decrementLine(7, 11)).rejects.toThrow()
  })

  it('removes a cart line and reloads cart', async () => {
    useCartStore.setState({ cartId: 'guest-cart-1' })
    await useCartStore.getState().removeLine(7, 11)

    expect(useCartStore.getState().cart.quantity).toBe(2)
  })

  it('surfaces remove errors', async () => {
    server.use(
      http.delete(`*${CART_BASE}/cart-item-remove/:productId/:cartItemId/`, () =>
        HttpResponse.json({ detail: 'bad' }, { status: 500 }),
      ),
    )

    await expect(useCartStore.getState().removeLine(7, 11)).rejects.toThrow()
  })

  it('clears cartId from storage', () => {
    localStorage.setItem('cartId', 'guest-cart-1')
    useCartStore.setState({ cartId: 'guest-cart-1' })

    useCartStore.getState().clearCartId()

    expect(useCartStore.getState().cartId).toBeNull()
    expect(localStorage.getItem('cartId')).toBeNull()
  })
})
