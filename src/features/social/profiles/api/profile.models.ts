export const SOCIAL_DEFAULT_AVATAR =
  'https://doodleipsum.com/700/avatar-4?i=be176fd7d38de78c85dbfba873eb723a'

export type SocialUser = {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  slug: string
  full_name: string
  avatar_url: string | null
}

export type SocialViewedProfile = {
  id: number
  slug: string
  first_name: string
  last_name: string
  full_name?: string
  avatar_url: string | null
  friends_count: number
  posts_count: number
}

export type SocialFriendUser = {
  id: number
  slug: string
  first_name: string
  last_name: string
  avatar_url: string | null
  friends_count: number
  posts_count: number
}

export type SocialFriendSuggestion = {
  id: number
  slug: string
  full_name: string
  avatar_url: string | null
}

export type FriendshipRequest = {
  id: number
  created_by: SocialFriendUser
}

export type FriendsDataResponse = {
  requests: FriendshipRequest[]
  friends: SocialFriendUser[]
  user: SocialViewedProfile
}

export type EditProfileResponse = {
  message: string
  new_slug: string
  new_avatar: string | null
}

export type ChangePasswordResponse = {
  message: string
}

export type FriendRequestResponse = {
  message: string
}

export const SOCIAL_USER_STORAGE_KEYS: (keyof SocialUser)[] = [
  'id',
  'username',
  'first_name',
  'last_name',
  'email',
  'slug',
  'full_name',
  'avatar_url',
]

export const EMPTY_SOCIAL_USER: SocialUser = {
  id: 0,
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  slug: '',
  full_name: '',
  avatar_url: null,
}
