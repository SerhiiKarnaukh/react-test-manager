import { z } from 'zod'

const nameField = z
  .string()
  .min(1, 'Value is required')
  .min(3, 'Minimum length is 3')
  .max(50, 'Maximum length is 50')

export const checkoutSchema = z.object({
  first_name: nameField,
  last_name: nameField,
  email: z
    .string()
    .min(1, 'Value is required')
    .email('Value must be a valid email')
    .max(100, 'Maximum length is 100'),
  phone: z
    .string()
    .min(1, 'Value is required')
    .min(6, 'Minimum length is 6')
    .max(10, 'Maximum length is 10'),
  address1: nameField,
  address2: z
    .string()
    .max(50, 'Maximum length is 50')
    .refine((value) => value.trim().length === 0 || value.trim().length >= 3, {
      message: 'Minimum length is 3',
    }),
  city: nameField,
  state: nameField,
  country: nameField,
  order_notes: z.string(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
