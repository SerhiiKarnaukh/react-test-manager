import { create } from 'zustand'
import { useAlertStore } from '@core/alert/alert.store'
import {
  addToCart as addToCartRequest,
  EMPTY_TABERNA_CART,
  fetchCart,
  removeCartLine,
  removeCartLineFully,
  type TabernaCart,
} from '@features/taberna/cart/api/cart'
import { getErrorMessage } from '@shared/utils/error'

const CART_ID_KEY = 'cartId'

type CartState = {
  cart: TabernaCart
  cartId: string | null
  isLoading: boolean
  loadCart: (options?: { silent?: boolean }) => Promise<void>
  addToCart: (productId: number, color: string, size: string) => Promise<void>
  decrementLine: (productId: number, cartItemId: number) => Promise<void>
  removeLine: (productId: number, cartItemId: number) => Promise<void>
  clearCartId: () => void
}

function readCartId(): string | null {
  return localStorage.getItem(CART_ID_KEY)
}

function writeCartId(cartId: string | null) {
  if (cartId) {
    localStorage.setItem(CART_ID_KEY, cartId)
  } else {
    localStorage.removeItem(CART_ID_KEY)
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: EMPTY_TABERNA_CART,
  cartId: typeof localStorage === 'undefined' ? null : readCartId(),
  isLoading: false,

  clearCartId: () => {
    writeCartId(null)
    set({ cartId: null })
  },

  loadCart: async (options = {}) => {
    set({ isLoading: true })
    try {
      const cart = await fetchCart(get().cartId)
      set({ cart })
    } catch (error) {
      if (!options.silent) {
        useAlertStore
          .getState()
          .enqueue('error', getErrorMessage(error, 'Failed to load cart'))
      } else {
        console.error(error)
      }
    } finally {
      set({ isLoading: false })
    }
  },

  addToCart: async (productId, color, size) => {
    set({ isLoading: true })
    try {
      const response = await addToCartRequest(productId, color, size, get().cartId)
      if (response.cart_id) {
        writeCartId(response.cart_id)
        set({ cartId: response.cart_id })
      }
      const cart = await fetchCart(get().cartId)
      set({ cart })
    } catch (error) {
      useAlertStore
        .getState()
        .enqueue('error', getErrorMessage(error, 'Failed to add product to cart'))
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  decrementLine: async (productId, cartItemId) => {
    set({ isLoading: true })
    try {
      await removeCartLine(productId, cartItemId, get().cartId)
      const cart = await fetchCart(get().cartId)
      set({ cart })
    } catch (error) {
      useAlertStore
        .getState()
        .enqueue('error', getErrorMessage(error, 'Failed to update cart'))
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  removeLine: async (productId, cartItemId) => {
    set({ isLoading: true })
    try {
      await removeCartLineFully(productId, cartItemId, get().cartId)
      const cart = await fetchCart(get().cartId)
      set({ cart })
    } catch (error) {
      useAlertStore
        .getState()
        .enqueue('error', getErrorMessage(error, 'Failed to remove cart item'))
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))
