import { create } from 'zustand'
import type { SocialUser } from '@features/social/profiles/api/profile.models'
import {
  clearSocialUserStorage,
  persistSocialUser,
  restoreSocialUser,
} from '@features/social/profiles/persistence/social-profile.persistence'

type ProfileState = {
  user: SocialUser | null
  initFromStorage: () => void
  setUserInfo: (user: SocialUser) => void
  clearUserState: () => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,

  initFromStorage: () => {
    const restored = restoreSocialUser()
    if (restored) {
      set({ user: restored })
    }
  },

  setUserInfo: (user) => {
    persistSocialUser(user)
    set({ user })
  },

  clearUserState: () => {
    clearSocialUserStorage()
    set({ user: null })
  },
}))
