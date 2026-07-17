import { loadStripe, type Stripe } from '@stripe/stripe-js'
import type { StripeActionType } from '@features/taberna/orders/api/orders'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripeActionType(): StripeActionType {
  return import.meta.env.VITE_STRIPE_ACTION_TYPE === 'charge' ? 'charge' : 'session'
}

export function isChargeMode(): boolean {
  return getStripeActionType() === 'charge'
}

export function getStripePromise(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  }
  return stripePromise
}
