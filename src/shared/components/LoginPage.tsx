import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useAlertStore } from '@core/alert/alert.store'
import { useAuthStore } from '@core/auth/auth.store'
import type { AppName } from '@core/auth/auth.types'
import { AuthLoginForm } from '@shared/components/AuthLoginForm'
import { AuthPageShell } from '@shared/ui/AuthPageShell'
import type { LoginFormValues } from '@shared/validation/auth.schemas'
import { getErrorMessage } from '@shared/utils/error'

type LoginPageProps = {
  app: Extract<AppName, 'taberna' | 'social'>
  signupPath: string
  defaultRedirect: string
  onLoginSuccess?: () => Promise<void> | void
}

export function LoginPage({
  app,
  signupPath,
  defaultRedirect,
  onLoginSuccess,
}: LoginPageProps) {
  const login = useAuthStore((s) => s.login)
  const enqueue = useAlertStore((s) => s.enqueue)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    try {
      await login(app, values)
      await onLoginSuccess?.()
      enqueue('success', 'Logged in successfully')
      const redirect = searchParams.get('redirect') || defaultRedirect
      navigate(redirect, { replace: true })
    } catch (error) {
      enqueue('error', getErrorMessage(error, 'Login failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell maxWidth={400}>
      <Card>
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
            onRegisterClick={() => navigate(signupPath)}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}
