import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useAlertStore } from '@core/alert/alert.store'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import { toPlaceOrderPayload } from '@features/taberna/orders/api/orders'
import { CheckoutOrderSummary } from '@features/taberna/orders/components/CheckoutOrderSummary'
import { useCheckout } from '@features/taberna/orders/hooks/useCheckout'
import {
  getStripeActionType,
  getStripePromise,
  isChargeMode,
} from '@features/taberna/orders/services/stripe.service'
import {
  checkoutSchema,
  type CheckoutFormValues,
} from '@shared/validation/checkout.schemas'

function CheckoutPageContent() {
  const cart = useCartStore((s) => s.cart)
  const hasItems = cart.cart_items.length > 0
  const checkout = useCheckout()
  const enqueue = useAlertStore((s) => s.enqueue)
  const stripe = useStripe()
  const elements = useElements()
  const chargeMode = isChargeMode()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      country: '',
      order_notes: '',
    },
  })

  const resolveStripeToken = async (): Promise<string | null | undefined> => {
    if (!chargeMode) return null

    if (!stripe || !elements) return undefined

    const card = elements.getElement(CardElement)
    if (!card) return undefined

    const result = await stripe.createToken(card)
    if (result.error || !result.token) {
      enqueue('error', result.error?.message ?? 'Unable to create Stripe token')
      return undefined
    }

    return result.token.id
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!hasItems) return

    const stripeToken = await resolveStripeToken()
    if (stripeToken === undefined) return

    const payload = toPlaceOrderPayload(values, stripeToken)
    checkout.mutate({ payload, type: getStripeActionType() })
  }

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 3, pb: 6 }}>
      {checkout.isPending ? <LinearProgress sx={{ mb: 2 }} /> : null}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          maxWidth: 1200,
          mx: 'auto',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          alignItems: 'start',
        }}
      >
        <Card sx={{ boxShadow: 3 }}>
          <CardHeader title="Billing Details" />
          <CardContent>
            <Box
              component="form"
              id="taberna-checkout-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <Stack spacing={1.5}>
                <TextField
                  label="First name"
                  autoComplete="given-name"
                  fullWidth
                  error={Boolean(errors.first_name)}
                  helperText={errors.first_name?.message}
                  {...register('first_name')}
                />
                <TextField
                  label="Last name"
                  autoComplete="family-name"
                  fullWidth
                  error={Boolean(errors.last_name)}
                  helperText={errors.last_name?.message}
                  {...register('last_name')}
                />
                <TextField
                  label="E-mail"
                  type="email"
                  autoComplete="email"
                  fullWidth
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  {...register('email')}
                />
                <TextField
                  label="Phone"
                  autoComplete="tel"
                  fullWidth
                  error={Boolean(errors.phone)}
                  helperText={errors.phone?.message}
                  {...register('phone')}
                />
                <TextField
                  label="Address Line 1"
                  autoComplete="address-line1"
                  fullWidth
                  error={Boolean(errors.address1)}
                  helperText={errors.address1?.message}
                  {...register('address1')}
                />
                <TextField
                  label="Address Line 2"
                  autoComplete="address-line2"
                  fullWidth
                  error={Boolean(errors.address2)}
                  helperText={errors.address2?.message}
                  {...register('address2')}
                />
                <TextField
                  label="City"
                  autoComplete="address-level2"
                  fullWidth
                  error={Boolean(errors.city)}
                  helperText={errors.city?.message}
                  {...register('city')}
                />
                <TextField
                  label="State"
                  autoComplete="address-level1"
                  fullWidth
                  error={Boolean(errors.state)}
                  helperText={errors.state?.message}
                  {...register('state')}
                />
                <TextField
                  label="Country"
                  autoComplete="country-name"
                  fullWidth
                  error={Boolean(errors.country)}
                  helperText={errors.country?.message}
                  {...register('country')}
                />
                <TextField
                  label="Order Notes"
                  multiline
                  rows={4}
                  placeholder="Enter any additional details or instructions here."
                  fullWidth
                  {...register('order_notes')}
                />
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <CheckoutOrderSummary
          cart={cart}
          isChargeMode={chargeMode}
          isSubmitting={checkout.isPending}
          canPay={hasItems}
          onPay={() => void handleSubmit(onSubmit)()}
        />
      </Box>
    </Box>
  )
}

export function CheckoutPage() {
  return (
    <Elements stripe={getStripePromise()}>
      <CheckoutPageContent />
    </Elements>
  )
}
