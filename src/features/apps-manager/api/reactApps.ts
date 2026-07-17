import { api } from '@core/http/axios'

export const APPS_BASE = '/api/v1/react-apps'

export type AppItem = {
  id: number | string
  title: string
  photo: string
  url: string
  view_url: string
  github_url?: string
}

type AppsSearchResponse = AppItem[] | { projects: AppItem[] }

/** Empty search → `{ projects: [] }`; matches → plain array. */
export function normalizeAppsSearchResponse(data: AppsSearchResponse): AppItem[] {
  if (Array.isArray(data)) return data
  return data.projects ?? []
}

export async function fetchApps(): Promise<AppItem[]> {
  const { data } = await api.get<AppItem[]>(`${APPS_BASE}/`)
  return data
}

export async function searchApps(query: string): Promise<AppItem[]> {
  const { data } = await api.post<AppsSearchResponse>(`${APPS_BASE}/search/`, {
    query,
  })
  return normalizeAppsSearchResponse(data)
}
