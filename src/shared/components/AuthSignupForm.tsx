import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { signupSchema, type SignupFormValues } from '@shared/validation/auth.schemas'

type AuthSignupFormProps = {
  onSubmit: (values: SignupFormValues) => Promise<void> | void
  onLoginClick?: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

export function AuthSignupForm({
  onSubmit,
  onLoginClick,
  submitLabel = 'Sign up',
  isSubmitting = false,
}: AuthSignupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      firstName: '',
      lastName: '',
    },
  })

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={1.5} sx={{ pt: 1 }}>
        <TextField
          label="First name"
          fullWidth
          {...register('firstName')}
        />
        <TextField
          label="Last name"
          fullWidth
          {...register('lastName')}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          fullWidth
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          fullWidth
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          fullWidth
          error={Boolean(errors.passwordConfirm)}
          helperText={errors.passwordConfirm?.message}
          {...register('passwordConfirm')}
        />
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button variant="outlined" onClick={onLoginClick} disabled={!onLoginClick}>
          Login
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </Box>
    </Box>
  )
}
