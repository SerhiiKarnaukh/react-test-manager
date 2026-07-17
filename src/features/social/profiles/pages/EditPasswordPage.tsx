import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { AuthPageShell } from '@shared/ui/AuthPageShell'
import {
  editPasswordSchema,
  type EditPasswordFormValues,
} from '@features/social/profiles/validation/profile.schemas'
import { useChangePassword } from '@features/social/profiles/hooks/useProfile'

export function EditPasswordPage() {
  const changePassword = useChangePassword()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditPasswordFormValues>({
    resolver: zodResolver(editPasswordSchema),
    defaultValues: { password: '', password1: '', password2: '' },
  })

  const onSubmit = (values: EditPasswordFormValues) => {
    changePassword.mutate({
      old_password: values.password,
      new_password1: values.password1,
      new_password2: values.password2,
    })
  }

  const passwordAdornment = (
    <InputAdornment position="end">
      <IconButton
        aria-label="Toggle password visibility"
        onClick={() => setShowPassword((value) => !value)}
        edge="end"
      >
        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
      </IconButton>
    </InputAdornment>
  )

  return (
    <AuthPageShell maxWidth={400}>
      <Card>
        <CardHeader title="Edit Password" />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Your old password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              slotProps={{ input: { endAdornment: passwordAdornment } }}
              {...register('password')}
            />
            <TextField
              label="Your new password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              autoComplete="new-password"
              error={Boolean(errors.password1)}
              helperText={errors.password1?.message}
              {...register('password1')}
            />
            <TextField
              label="Repeat password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              autoComplete="new-password"
              error={Boolean(errors.password2)}
              helperText={errors.password2?.message}
              {...register('password2')}
            />

            <Divider sx={{ my: 2 }} />

            <Button type="submit" variant="contained" disabled={changePassword.isPending}>
              Save changes
            </Button>
          </Box>
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}
