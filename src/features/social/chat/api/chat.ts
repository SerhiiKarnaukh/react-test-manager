import { api } from '@core/http/axios'

export async function getOrCreateChat(userSlug: string): Promise<unknown> {
  const { data } = await api.get(`/api/social-chat/${userSlug}/get-or-create/`)
  return data
}
