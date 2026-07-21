import { expect } from 'vitest'
import { resolveProfileSlug } from '@features/social/profiles/profile-chat.utils'

describe('profile chat utils', () => {
  it('resolveProfileSlug falls back to empty string', () => {
    expect(resolveProfileSlug('john')).toBe('john')
    expect(resolveProfileSlug(undefined)).toBe('')
  })
})
