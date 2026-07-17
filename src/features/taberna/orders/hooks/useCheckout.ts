import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAlertStore } from '@core/alert/alert.store'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import {
  placeStripeOrder,
  reportOrderPaymentStatus,
  type OrderPaymentStatus,
  type PlaceOrderPayload,
  type PlaceOrderSessionResponse,
  type StripeActionType,
} from '@features/taberna/orders/api/orders'
import { getErrorMessage } from '@shared/utils/error'

type CheckoutVariables = {
  payload: PlaceOrderPayload
  type: StripeActionType
}

export function useCheckout() {
  const enqueue = useAlertStore((s) => s.enqueue)
  const loadCart = useCartStore((s) => s.loadCart)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ payload, type }: CheckoutVariables) => {
      const response = await placeStripeOrder(payload, type)

      if (type === 'session') {
        const checkoutUrl = (response as PlaceOrderSessionResponse).checkout_url
        if (!checkoutUrl) {
          throw new Error('Missing checkout URL')
        }
        window.location.href = checkoutUrl
        return
      }

      await loadCart({ silent: true })
      await navigate('/taberna/cart/success')
    },
    onError: (error) => {
      enqueue('error', getErrorMessage(error, 'Something went wrong. Please try again'))
    },
  })
}

export function useReportOrderStatus() {
  const loadCart = useCartStore((s) => s.loadCart)

  return useMutation({
    mutationFn: async ({
      status,
      stripeSessionId,
    }: {
      status: OrderPaymentStatus
      stripeSessionId: string
    }) => {
      await reportOrderPaymentStatus(status, stripeSessionId)
      await loadCart({ silent: true })
    },
    onError: (error) => {
      console.error(error)
    },
  })
}
