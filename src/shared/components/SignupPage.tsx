import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { register } from '@core/auth/auth-register.api'
import { useAlertStore } from '@core/alert/alert.store'
import type { AppName } from '@core/auth/auth.types'
import { AuthSignupForm } from '@shared/components/AuthSignupForm'
import { AuthPageShell } from '@shared/ui/AuthPageShell'
import type { SignupFormValues } from '@shared/validation/auth.schemas'
import { getErrorMessage } from '@shared/utils/error'

type SignupPageProps = {
  app: Extract<AppName, 'taberna' | 'social'>
  loginPath: string
}

export function SignupPage({ app, loginPath }: SignupPageProps) {
  const enqueue = useAlertStore((s) => s.enqueue)
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true)
    try {
      await register(app, values)
      enqueue('success', 'Account created. Please log in.')
      navigate(loginPath, { replace: true })
    } catch (error) {
      enqueue('error', getErrorMessage(error, 'Signup failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell maxWidth={700}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Sign up
          </Typography>
          <AuthSignupForm
            onSubmit={onSubmit}
            onLoginClick={() => navigate(loginPath)}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}
