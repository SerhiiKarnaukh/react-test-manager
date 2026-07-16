import { api } from '@core/http/axios'

/** Same shape as vue-apps / react-apps collections. Switch path when backend adds react-apps. */
export const APPS_BASE = '/api/v1/vue-apps'

export type AppItem = {
  id: number | string
  title: string
  photo: string
  url: string
  view_url: string
}

export async function fetchApps(): Promise<AppItem[]> {
  const { data } = await api.get<AppItem[]>(`${APPS_BASE}/`)
  return data
}

export async function searchApps(query: string): Promise<AppItem[]> {
  const { data } = await api.post<AppItem[]>(`${APPS_BASE}/search/`, { query })
  return data
}
