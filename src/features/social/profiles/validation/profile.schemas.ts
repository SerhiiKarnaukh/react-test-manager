import { z } from 'zod'

export const editProfileSchema = z.object({
  username: z.string().min(3, 'Min 3 characters').max(50, 'Max 50 characters'),
  first_name: z.string().min(3, 'Min 3 characters').max(50, 'Max 50 characters'),
  last_name: z.string().min(3, 'Min 3 characters').max(50, 'Max 50 characters'),
  email: z.string().email('Enter a valid email').max(100, 'Max 100 characters'),
})

export type EditProfileFormValues = z.infer<typeof editProfileSchema>

export const editPasswordSchema = z
  .object({
    password: z.string().min(8, 'Min 8 characters'),
    password1: z.string().min(8, 'Min 8 characters'),
    password2: z.string().min(8, 'Min 8 characters'),
  })
  .refine((data) => data.password1 === data.password2, {
    message: 'The password does not match',
    path: ['password2'],
  })

export type EditPasswordFormValues = z.infer<typeof editPasswordSchema>
