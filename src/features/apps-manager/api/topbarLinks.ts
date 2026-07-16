import { api } from '@core/http/axios'

export type TopbarLinkKey = 'cv' | 'github' | 'linkedin'

export type TopbarLink = {
  key: TopbarLinkKey
  url: string
  title: string
  icon_class: string
  ordering: number
}

const TOPBAR_LINK_LABELS: Record<TopbarLinkKey, string> = {
  cv: 'CV',
  github: 'GitHub',
  linkedin: 'LinkedIn',
}

const BASE_URL = '/api/v1/topbar-links'

export async function fetchTopbarLinks(): Promise<TopbarLink[]> {
  const { data } = await api.get<TopbarLink[]>(`${BASE_URL}/`)
  return data
    .map((link) => ({
      ...link,
      title: TOPBAR_LINK_LABELS[link.key] ?? link.title,
    }))
    .sort((a, b) => a.ordering - b.ordering)
}
