import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import {
  placeStripeOrder,
  reportOrderPaymentStatus,
  toPlaceOrderPayload,
} from '@features/taberna/orders/api/orders'

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
  stripe_token: null as string | null,
}

const server = setupServer(
  http.post(`*${ORDERS_BASE}/place_order_stripe_session/`, () =>
    HttpResponse.json({ checkout_url: 'https://stripe.test/checkout' }),
  ),
  http.post(`*${ORDERS_BASE}/place_order_stripe_charge/`, () => HttpResponse.json({})),
  http.post(`*${ORDERS_BASE}/order_payment_success/`, () => HttpResponse.json(null)),
  http.post(`*${ORDERS_BASE}/order_payment_failed/`, () => HttpResponse.json(null)),
)

describe('taberna orders api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('placeStripeOrder uses session endpoint', async () => {
    const response = await placeStripeOrder(samplePayload, 'session')
    expect(response).toEqual({ checkout_url: 'https://stripe.test/checkout' })
  })

  it('placeStripeOrder uses charge endpoint', async () => {
    const response = await placeStripeOrder(
      { ...samplePayload, stripe_token: 'tok_123' },
      'charge',
    )
    expect(response).toEqual({})
  })

  it('reportOrderPaymentStatus posts success session id', async () => {
    await expect(reportOrderPaymentStatus('success', 'sess_123')).resolves.toBeUndefined()
  })

  it('reportOrderPaymentStatus posts failed session id', async () => {
    await expect(reportOrderPaymentStatus('failed', 'sess_456')).resolves.toBeUndefined()
  })

  it('toPlaceOrderPayload maps billing form fields', () => {
    expect(
      toPlaceOrderPayload(
        {
          first_name: 'Olivia',
          last_name: 'Thompson',
          email: 'olivia@example.com',
          phone: '1234567890',
          address1: 'Main street',
          address2: 'Apt 2',
          city: 'Boston',
          state: 'MA',
          country: 'USA',
          order_notes: 'Leave at door',
        },
        'tok_123',
      ),
    ).toEqual({
      first_name: 'Olivia',
      last_name: 'Thompson',
      email: 'olivia@example.com',
      phone: '1234567890',
      address_line_1: 'Main street',
      address_line_2: 'Apt 2',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      order_note: 'Leave at door',
      stripe_token: 'tok_123',
    })
  })
})
