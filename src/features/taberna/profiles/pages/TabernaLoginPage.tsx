import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useAlertStore } from '@core/alert/alert.store'
import { useAuthStore } from '@core/auth/auth.store'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import { AuthLoginForm } from '@shared/components/AuthLoginForm'
import { AuthPageShell } from '@shared/ui/AuthPageShell'
import type { LoginFormValues } from '@shared/validation/auth.schemas'
import { getErrorMessage } from '@shared/utils/error'

export function TabernaLoginPage() {
  const login = useAuthStore((s) => s.login)
  const cartId = useCartStore((s) => s.cartId)
  const loadCart = useCartStore((s) => s.loadCart)
  const clearCartId = useCartStore((s) => s.clearCartId)
  const enqueue = useAlertStore((s) => s.enqueue)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (searchParams.has('message')) {
      enqueue('warning', 'Please login')
    }
  }, [searchParams, enqueue])

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    try {
      await login('taberna', values, { cartId })
      await loadCart({ silent: true })
      clearCartId()
      enqueue('success', 'Logged in successfully')
      const redirect = searchParams.get('redirect') || '/taberna/dashboard'
      navigate(redirect, { replace: true })
    } catch (error) {
      enqueue('error', getErrorMessage(error, 'Login failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell maxWidth={400}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Login
          </Typography>
          {searchParams.get('message') === 'auth' ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Please sign in to continue.
            </Typography>
          ) : null}
          <AuthLoginForm
            onSubmit={onSubmit}
            onRegisterClick={() => navigate('/taberna/signup')}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}
