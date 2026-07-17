import { expect, vi } from 'vitest'

const loadStripeMock = vi.hoisted(() => vi.fn(async () => ({ id: 'stripe' })))

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: loadStripeMock,
}))

describe('stripe.service', () => {
  beforeEach(() => {
    loadStripeMock.mockClear()
    vi.unstubAllEnvs()
  })

  it('resolves session mode by default', async () => {
    vi.stubEnv('VITE_STRIPE_ACTION_TYPE', 'session')
    const service = await import('@features/taberna/orders/services/stripe.service')

    expect(service.getStripeActionType()).toBe('session')
    expect(service.isChargeMode()).toBe(false)
  })

  it('resolves charge mode and caches Stripe promise', async () => {
    vi.stubEnv('VITE_STRIPE_ACTION_TYPE', 'charge')
    vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_123')
    const service = await import('@features/taberna/orders/services/stripe.service')

    expect(service.getStripeActionType()).toBe('charge')
    expect(service.isChargeMode()).toBe(true)
    const first = service.getStripePromise()
    const second = service.getStripePromise()

    expect(first).toBe(second)
  })

  it('falls back to session for unknown modes', async () => {
    vi.stubEnv('VITE_STRIPE_ACTION_TYPE', 'unknown')
    const service = await import('@features/taberna/orders/services/stripe.service')

    expect(service.getStripeActionType()).toBe('session')
  })
})
