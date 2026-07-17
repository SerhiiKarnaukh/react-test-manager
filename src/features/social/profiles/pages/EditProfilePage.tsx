import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import { AuthPageShell } from '@shared/ui/AuthPageShell'
import {
  editProfileSchema,
  type EditProfileFormValues,
} from '@features/social/profiles/validation/profile.schemas'
import {
  useCurrentSocialUser,
  useUpdateProfile,
} from '@features/social/profiles/hooks/useProfile'

export function EditProfilePage() {
  const { data: user, isPending } = useCurrentSocialUser()
  const updateProfile = useUpdateProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      })
    }
  }, [user, reset])

  const onSubmit = (values: EditProfileFormValues) => {
    const formData = new FormData()
    formData.append('username', values.username)
    formData.append('first_name', values.first_name)
    formData.append('last_name', values.last_name)
    formData.append('email', values.email)
    if (avatarFile) {
      formData.append('avatar', avatarFile)
    }
    updateProfile.mutate(formData)
  }

  return (
    <AuthPageShell maxWidth={700}>
      <Card>
        <CardHeader title="Edit Profile" />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
              {...register('username')}
            />
            <TextField
              label="First Name"
              fullWidth
              margin="normal"
              error={Boolean(errors.first_name)}
              helperText={errors.first_name?.message}
              {...register('first_name')}
            />
            <TextField
              label="Last Name"
              fullWidth
              margin="normal"
              error={Boolean(errors.last_name)}
              helperText={errors.last_name?.message}
              {...register('last_name')}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email')}
            />

            <Box sx={{ mt: 2 }}>
              <TypographyFieldLabel />
              <input
                ref={fileInputRef}
                id="avatarUpload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <Button component={RouterLink} to="/social/edit/password" variant="outlined">
                Edit Password
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updateProfile.isPending || isPending}
              >
                Save changes
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}

function TypographyFieldLabel() {
  return (
    <Box component="label" htmlFor="avatarUpload" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
      Avatar
    </Box>
  )
}
