import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { expect, vi } from 'vitest'
import { CheckoutOrderSummary } from '@features/taberna/orders/components/CheckoutOrderSummary'
import { CheckoutPage } from '@features/taberna/orders/pages/CheckoutPage'
import { FailedPage } from '@features/taberna/orders/pages/FailedPage'
import { SuccessPage } from '@features/taberna/orders/pages/SuccessPage'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import {
  createTabernaWrapper,
  sampleCart,
} from '@features/taberna/test/taberna-test-utils'

const checkoutMocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  reportMutate: vi.fn(),
  isPending: false,
  chargeMode: false,
  tokenError: false,
  noCard: false,
  noStripe: false,
}))

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () =>
    checkoutMocks.noStripe
      ? null
      : {
          createToken: vi.fn(async () =>
            checkoutMocks.tokenError
              ? { error: { message: 'Card declined' } }
              : { token: { id: 'tok_123' } },
          ),
        },
  useElements: () => ({
    getElement: vi.fn(() => (checkoutMocks.noCard ? null : { id: 'card' })),
  }),
}))

vi.mock('@features/taberna/orders/hooks/useCheckout', () => ({
  useCheckout: () => ({
    mutate: checkoutMocks.mutate,
    isPending: checkoutMocks.isPending,
  }),
  useReportOrderStatus: () => ({
    mutate: checkoutMocks.reportMutate,
  }),
}))

vi.mock('@features/taberna/orders/services/stripe.service', () => ({
  getStripeActionType: () => (checkoutMocks.chargeMode ? 'charge' : 'session'),
  getStripePromise: () => Promise.resolve(null),
  isChargeMode: () => checkoutMocks.chargeMode,
}))


async function fillCheckoutForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/first name/i), 'Olivia')
  await user.type(screen.getByLabelText(/last name/i), 'Thompson')
  await user.type(screen.getByLabelText(/e-mail/i), 'olivia@example.com')
  await user.type(screen.getByLabelText(/phone/i), '1234567')
  await user.type(screen.getByLabelText(/address line 1/i), 'Main street')
  await user.type(screen.getByLabelText(/city/i), 'Boston')
  await user.type(screen.getByLabelText(/state/i), 'Massachusetts')
  await user.type(screen.getByLabelText(/country/i), 'USA')
}

describe('Taberna orders UI', () => {
  beforeEach(() => {
    checkoutMocks.mutate.mockReset()
    checkoutMocks.reportMutate.mockReset()
    checkoutMocks.isPending = false
    checkoutMocks.chargeMode = false
    checkoutMocks.tokenError = false
    checkoutMocks.noCard = false
    checkoutMocks.noStripe = false
    useCartStore.setState({ cart: sampleCart, isLoading: false })
  })

  it('renders checkout order summary and emits pay', async () => {
    const user = userEvent.setup()
    const onPay = vi.fn()

    render(
      <CheckoutOrderSummary
        cart={sampleCart}
        isChargeMode={false}
        isSubmitting={false}
        canPay
        onPay={onPay}
      />,
      { wrapper: createTabernaWrapper() },
    )

    expect(screen.getByText('Order Summary')).toBeInTheDocument()
    expect(screen.getByText('color: blue')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /pay with stripe/i }))
    expect(onPay).toHaveBeenCalled()
  })

  it('hides payment controls when payment is not allowed', () => {
    render(
      <CheckoutOrderSummary
        cart={{ ...sampleCart, cart_items: [] }}
        isChargeMode={false}
        isSubmitting={false}
        canPay={false}
        onPay={vi.fn()}
      />,
      { wrapper: createTabernaWrapper() },
    )

    expect(screen.queryByRole('button', { name: /pay with stripe/i })).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-element')).not.toBeInTheDocument()
  })

  it('submits checkout form in session mode', async () => {
    const user = userEvent.setup()

    render(<CheckoutPage />, { wrapper: createTabernaWrapper() })

    await fillCheckoutForm(user)
    await user.click(screen.getByRole('button', { name: /pay with stripe/i }))

    await waitFor(() => expect(checkoutMocks.mutate).toHaveBeenCalled())
    expect(checkoutMocks.mutate.mock.calls[0][0]).toMatchObject({
      type: 'session',
      payload: {
        first_name: 'Olivia',
        stripe_token: null,
      },
    })
  })



  it('renders success and failed pages and reports session status', () => {
    render(
      <Routes>
        <Route path="/taberna/cart/success" element={<SuccessPage />} />
        <Route path="/taberna/cart/failed" element={<FailedPage />} />
      </Routes>,
      { wrapper: createTabernaWrapper(undefined, ['/taberna/cart/success?session_id=sess_1']) },
    )

    expect(screen.getByText('Thank You!')).toBeInTheDocument()
    expect(checkoutMocks.reportMutate).toHaveBeenCalledWith({
      status: 'success',
      stripeSessionId: 'sess_1',
    })
  })

  it('renders success page without session id and does not report', () => {
    render(
      <Routes>
        <Route path="/taberna/cart/success" element={<SuccessPage />} />
      </Routes>,
      { wrapper: createTabernaWrapper(undefined, ['/taberna/cart/success']) },
    )

    expect(screen.getByText('Thank You!')).toBeInTheDocument()
    expect(checkoutMocks.reportMutate).not.toHaveBeenCalled()
  })

  it('renders failed page with session id and reports failed status', () => {
    render(
      <Routes>
        <Route path="/taberna/cart/failed" element={<FailedPage />} />
      </Routes>,
      { wrapper: createTabernaWrapper(undefined, ['/taberna/cart/failed?session_id=sess_2']) },
    )

    expect(screen.getByText('Payment failed')).toBeInTheDocument()
    expect(checkoutMocks.reportMutate).toHaveBeenCalledWith({
      status: 'failed',
      stripeSessionId: 'sess_2',
    })
  })

  it('renders failed page without session id and does not report', () => {
    render(
      <Routes>
        <Route path="/taberna/cart/failed" element={<FailedPage />} />
      </Routes>,
      { wrapper: createTabernaWrapper(undefined, ['/taberna/cart/failed']) },
    )

    expect(screen.getByText('Payment failed')).toBeInTheDocument()
    expect(checkoutMocks.reportMutate).not.toHaveBeenCalled()
  })
})
