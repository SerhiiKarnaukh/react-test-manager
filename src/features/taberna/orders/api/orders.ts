import { api } from '@core/http/axios'

const ORDERS_BASE = '/taberna-orders/api/v1'

export type StripeActionType = 'session' | 'charge'

export type OrderPaymentStatus = 'success' | 'failed'

export type PlaceOrderPayload = {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  country: string
  order_note: string
  stripe_token: string | null
}

export type PlaceOrderSessionResponse = {
  checkout_url: string
}

export type CheckoutBillingFormValues = {
  first_name: string
  last_name: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  country: string
  order_notes: string
}

export function toPlaceOrderPayload(
  form: CheckoutBillingFormValues,
  stripeToken: string | null,
): PlaceOrderPayload {
  return {
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    phone: form.phone,
    address_line_1: form.address1,
    address_line_2: form.address2,
    city: form.city,
    state: form.state,
    country: form.country,
    order_note: form.order_notes,
    stripe_token: stripeToken,
  }
}

export async function placeStripeOrder(
  payload: PlaceOrderPayload,
  type: StripeActionType,
): Promise<PlaceOrderSessionResponse | Record<string, never>> {
  const url =
    type === 'session'
      ? `${ORDERS_BASE}/place_order_stripe_session/`
      : `${ORDERS_BASE}/place_order_stripe_charge/`

  const { data } = await api.post<PlaceOrderSessionResponse | Record<string, never>>(url, payload)
  return data
}

export async function reportOrderPaymentStatus(
  status: OrderPaymentStatus,
  stripeSessionId: string,
): Promise<void> {
  const url =
    status === 'success'
      ? `${ORDERS_BASE}/order_payment_success/`
      : `${ORDERS_BASE}/order_payment_failed/`

  await api.post(url, { stripe_session_id: stripeSessionId })
}
