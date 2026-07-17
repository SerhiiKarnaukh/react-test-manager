import { expect } from 'vitest'
import {
  editPasswordSchema,
  editProfileSchema,
} from '@features/social/profiles/validation/profile.schemas'

describe('profile schemas', () => {
  it('editProfileSchema requires fields', () => {
    expect(editProfileSchema.safeParse({}).success).toBe(false)
    expect(
      editProfileSchema.safeParse({
        username: 'john',
        first_name: 'John',
        last_name: 'Doe',
        email: 'j@e.com',
      }).success,
    ).toBe(true)
  })

  it('editPasswordSchema validates matching passwords', () => {
    expect(
      editPasswordSchema.safeParse({
        password: 'oldpass12',
        password1: 'newpass12',
        password2: 'mismatch',
      }).success,
    ).toBe(false)
    expect(
      editPasswordSchema.safeParse({
        password: 'oldpass12',
        password1: 'newpass12',
        password2: 'newpass12',
      }).success,
    ).toBe(true)
  })
})
