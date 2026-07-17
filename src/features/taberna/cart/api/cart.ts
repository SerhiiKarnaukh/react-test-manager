import { api } from '@core/http/axios'

const CART_BASE = '/taberna-cart/api'

export type TabernaCartVariation = {
  id: number
  variation_category: string
  variation_value: string
}

export type TabernaCartProduct = {
  id: number
  name: string
  price: number
  image: string
  get_absolute_url: string
}

export type TabernaCartLineItem = {
  id: number
  quantity: number
  sub_total?: number
  product: TabernaCartProduct
  variations: TabernaCartVariation[]
}

export type TabernaCart = {
  cart_items: TabernaCartLineItem[]
  quantity: number
  total: number
  tax: number
  grand_total: number
}

export type TabernaAddToCartResponse = {
  cart_id?: string
}

export const EMPTY_TABERNA_CART: TabernaCart = {
  cart_items: [],
  quantity: 0,
  total: 0,
  tax: 0,
  grand_total: 0,
}

function cartIdParams(cartId: string | null) {
  return cartId ? { cart_id: cartId } : undefined
}

export async function fetchCart(cartId: string | null): Promise<TabernaCart> {
  const { data } = await api.get<TabernaCart>(`${CART_BASE}/cart/`, {
    params: cartIdParams(cartId),
  })
  return data
}

export async function addToCart(
  productId: number,
  color: string,
  size: string,
  cartId: string | null,
): Promise<TabernaAddToCartResponse> {
  const { data } = await api.post<TabernaAddToCartResponse>(
    `${CART_BASE}/add-to-cart/${productId}/`,
    {
      color,
      size,
      cart_id: cartId,
    },
  )
  return data
}

export async function removeCartLine(
  productId: number,
  cartItemId: number,
  cartId: string | null,
): Promise<void> {
  await api.delete(`${CART_BASE}/cart-remove/${productId}/${cartItemId}/`, {
    params: cartIdParams(cartId),
  })
}

export async function removeCartLineFully(
  productId: number,
  cartItemId: number,
  cartId: string | null,
): Promise<void> {
  await api.delete(`${CART_BASE}/cart-item-remove/${productId}/${cartItemId}/`, {
    params: cartIdParams(cartId),
  })
}
