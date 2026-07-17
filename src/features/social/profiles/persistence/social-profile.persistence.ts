import { decryptData, encryptData } from '@shared/utils/crypto'
import {
  SOCIAL_USER_STORAGE_KEYS,
  type SocialUser,
} from '@features/social/profiles/api/profile.models'

const STORAGE_PREFIX = 'user.'

function readUserField<K extends keyof SocialUser>(key: K): SocialUser[K] | null {
  const encrypted = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
  if (!encrypted) return null
  return decryptData<SocialUser[K]>(encrypted)
}

export function persistSocialUser(user: SocialUser): void {
  SOCIAL_USER_STORAGE_KEYS.forEach((key) => {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, encryptData(user[key]))
  })
}

export function restoreSocialUser(): SocialUser | null {
  if (!localStorage.getItem('access')) return null

  const hasStoredUser = SOCIAL_USER_STORAGE_KEYS.every(
    (key) => localStorage.getItem(`${STORAGE_PREFIX}${key}`) !== null,
  )
  if (!hasStoredUser) return null

  return {
    id: readUserField('id') as number,
    username: readUserField('username') as string,
    first_name: readUserField('first_name') as string,
    last_name: readUserField('last_name') as string,
    email: readUserField('email') as string,
    slug: readUserField('slug') as string,
    full_name: readUserField('full_name') as string,
    avatar_url: readUserField('avatar_url'),
  }
}

export function clearSocialUserStorage(): void {
  SOCIAL_USER_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
  })
}
