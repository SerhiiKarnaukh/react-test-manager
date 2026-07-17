import { api } from '@core/http/axios'

export type SocialNotification = {
  id: number
  body: string
  type_of_notification: string
  post_id?: number
}

const BASE_URL = '/api/social-notifications'

export async function fetchNotifications(): Promise<SocialNotification[]> {
  const { data } = await api.get<SocialNotification[]>(`${BASE_URL}/`)
  return data
}

export async function markNotificationRead(notificationId: number): Promise<unknown> {
  const { data } = await api.post(`${BASE_URL}/read/${notificationId}/`, {})
  return data
}
