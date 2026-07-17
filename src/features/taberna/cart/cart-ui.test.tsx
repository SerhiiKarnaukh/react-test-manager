import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { EMPTY_TABERNA_CART } from '@features/taberna/cart/api/cart'
import { CartItem } from '@features/taberna/cart/components/CartItem'
import { CartPage } from '@features/taberna/cart/pages/CartPage'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import {
  createTabernaWrapper,
  sampleCart,
  sampleCartItem,
} from '@features/taberna/test/taberna-test-utils'

describe('Taberna cart UI', () => {
  beforeEach(() => {
    useCartStore.setState({
      cart: EMPTY_TABERNA_CART,
      cartId: null,
      isLoading: false,
      addToCart: vi.fn(async () => undefined),
      decrementLine: vi.fn(async () => undefined),
      removeLine: vi.fn(async () => undefined),
    })
  })

  it('renders loading, empty and populated cart page states', () => {
    const { rerender } = render(<CartPage />, { wrapper: createTabernaWrapper() })

    expect(screen.getByText("You don't have any products in your cart...")).toBeInTheDocument()

    useCartStore.setState({ isLoading: true })
    rerender(<CartPage />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    useCartStore.setState({ cart: sampleCart, isLoading: false })
    rerender(<CartPage />)

    expect(screen.getByText('Cart Summary')).toBeInTheDocument()
    expect(screen.getByText('$ 154')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /proceed to checkout/i })).toHaveAttribute(
      'href',
      '/taberna/cart/checkout',
    )
  })

  it('cart item increments, decrements and removes line', async () => {
    const user = userEvent.setup()
    const addToCart = vi.fn(async () => undefined)
    const decrementLine = vi.fn(async () => undefined)
    const removeLine = vi.fn(async () => undefined)
    useCartStore.setState({ addToCart, decrementLine, removeLine })

    render(
      <table>
        <tbody>
          <CartItem item={sampleCartItem} />
        </tbody>
      </table>,
      { wrapper: createTabernaWrapper() },
    )

    expect(screen.getByRole('link', { name: sampleCartItem.product.name })).toHaveAttribute(
      'href',
      sampleCartItem.product.get_absolute_url,
    )
    expect(screen.getByText('color: blue')).toBeInTheDocument()
    expect(screen.getByText('$140.00')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Decrease quantity'))
    await user.click(screen.getByLabelText('Increase quantity'))
    await user.click(screen.getByLabelText('Remove item'))

    expect(decrementLine).toHaveBeenCalledWith(7, 11)
    expect(addToCart).toHaveBeenCalledWith(7, 'blue', 'M')
    expect(removeLine).toHaveBeenCalledWith(7, 11)
  })

  it('cart item skips increment when variation is incomplete and disables buttons while loading', async () => {
    const user = userEvent.setup()
    const addToCart = vi.fn(async () => undefined)
    useCartStore.setState({ addToCart, isLoading: true })

    render(
      <table>
        <tbody>
          <CartItem item={{ ...sampleCartItem, variations: [] }} />
        </tbody>
      </table>,
      { wrapper: createTabernaWrapper() },
    )

    expect(screen.getByLabelText('Decrease quantity')).toBeDisabled()
    useCartStore.setState({ isLoading: false })
    await user.click(screen.getByLabelText('Increase quantity'))
    expect(addToCart).not.toHaveBeenCalled()
  })
})
