import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { loginSchema, type LoginFormValues } from '@shared/validation/auth.schemas'

type AuthLoginFormProps = {
  onSubmit: (values: LoginFormValues) => Promise<void> | void
  onRegisterClick?: () => void
  submitLabel?: string
  isSubmitting?: boolean
}

export function AuthLoginForm({
  onSubmit,
  onRegisterClick,
  submitLabel = 'Login',
  isSubmitting = false,
}: AuthLoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={1.5} sx={{ pt: 1 }}>
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
          autoComplete="current-password"
          fullWidth
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register('password')}
        />
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button variant="outlined" onClick={onRegisterClick} disabled={!onRegisterClick}>
          Register
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </Box>
    </Box>
  )
}
