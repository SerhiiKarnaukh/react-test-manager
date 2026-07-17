import { beforeEach, expect } from 'vitest'
import {
  clearSocialUserStorage,
  persistSocialUser,
  restoreSocialUser,
} from '@features/social/profiles/persistence/social-profile.persistence'
import type { SocialUser } from '@features/social/profiles/api/profile.models'

const sampleUser: SocialUser = {
  id: 1,
  username: 'john',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  slug: 'john',
  full_name: 'John Doe',
  avatar_url: null,
}

describe('social profile persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists and restores social user fields when access token exists', () => {
    localStorage.setItem('access', 'token')
    persistSocialUser(sampleUser)

    const restored = restoreSocialUser()
    expect(restored).toEqual(sampleUser)
  })

  it('returns null without an access token', () => {
    persistSocialUser(sampleUser)
    expect(restoreSocialUser()).toBeNull()
  })

  it('returns null when some fields are missing', () => {
    localStorage.setItem('access', 'token')
    persistSocialUser(sampleUser)
    localStorage.removeItem('user.slug')

    expect(restoreSocialUser()).toBeNull()
  })

  it('clears encrypted user storage but keeps access token', () => {
    localStorage.setItem('access', 'token')
    persistSocialUser(sampleUser)

    clearSocialUserStorage()

    expect(restoreSocialUser()).toBeNull()
    expect(localStorage.getItem('access')).toBe('token')
  })

  it('stores values encrypted, not in plain text', () => {
    localStorage.setItem('access', 'token')
    persistSocialUser(sampleUser)

    expect(localStorage.getItem('user.email')).not.toContain('john@example.com')
  })
})
