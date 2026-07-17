import { api } from '@core/http/axios'
import type {
  ChangePasswordResponse,
  EditProfileResponse,
  FriendRequestResponse,
  FriendsDataResponse,
  SocialFriendSuggestion,
  SocialUser,
} from '@features/social/profiles/api/profile.models'

const BASE_URL = '/api/social-profiles'
const FRIENDS_BASE_URL = '/api/social-profiles/friends'

export async function fetchMe(): Promise<SocialUser> {
  const { data } = await api.get<SocialUser>(`${BASE_URL}/me/`)
  return data
}

export async function updateProfile(formData: FormData): Promise<EditProfileResponse> {
  const { data } = await api.post<EditProfileResponse>(`${BASE_URL}/editprofile/`, formData, {
    headers: { 'Content-Type': undefined },
  })
  return data
}

export async function changePassword(payload: {
  old_password: string
  new_password1: string
  new_password2: string
}): Promise<ChangePasswordResponse> {
  const { data } = await api.post<ChangePasswordResponse>(`${BASE_URL}/editpassword/`, payload)
  return data
}

export async function sendFriendRequest(userSlug: string): Promise<FriendRequestResponse> {
  const { data } = await api.post<FriendRequestResponse>(
    `${FRIENDS_BASE_URL}/${userSlug}/request/`,
    {},
  )
  return data
}

export async function fetchFriendsData(userSlug: string): Promise<FriendsDataResponse> {
  const { data } = await api.get<FriendsDataResponse>(`${FRIENDS_BASE_URL}/${userSlug}/`)
  return data
}

export async function handleFriendRequest(
  slug: string,
  status: 'accepted' | 'rejected',
): Promise<unknown> {
  const { data } = await api.post(`${FRIENDS_BASE_URL}/${slug}/${status}/`, {})
  return data
}

export async function fetchFriendSuggestions(): Promise<SocialFriendSuggestion[]> {
  const { data } = await api.get<SocialFriendSuggestion[]>(`${FRIENDS_BASE_URL}/suggested/`)
  return data
}
