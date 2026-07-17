import { expect } from 'vitest'
import { useProfileStore } from '@features/social/profiles/store/profile.store'
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

describe('profile store', () => {
  beforeEach(() => {
    localStorage.clear()
    useProfileStore.setState({ user: null })
  })

  it('setUserInfo stores user in state and localStorage', () => {
    localStorage.setItem('access', 'token')
    useProfileStore.getState().setUserInfo(sampleUser)

    expect(useProfileStore.getState().user).toEqual(sampleUser)
    expect(localStorage.getItem('user.slug')).not.toBeNull()
  })

  it('initFromStorage restores persisted user', () => {
    localStorage.setItem('access', 'token')
    useProfileStore.getState().setUserInfo(sampleUser)
    useProfileStore.setState({ user: null })

    useProfileStore.getState().initFromStorage()
    expect(useProfileStore.getState().user).toEqual(sampleUser)
  })

  it('clearUserState resets state and storage', () => {
    localStorage.setItem('access', 'token')
    useProfileStore.getState().setUserInfo(sampleUser)

    useProfileStore.getState().clearUserState()
    expect(useProfileStore.getState().user).toBeNull()
    expect(localStorage.getItem('user.slug')).toBeNull()
  })
})
