import type { AppName } from '@core/auth/auth.types'

const TOKEN_OBTAIN: Record<AppName, string> = {
  taberna: '/taberna-profiles/api/v1/token/',
  social: '/api/social-profiles/api/v1/token/',
  'apps-manager': '/api/v1/token/',
  'ai-lab': '/api/v1/token/',
}

const TOKEN_REGISTER: Record<AppName, string> = {
  taberna: '/taberna-profiles/api/register/',
  social: '/api/social-profiles/register/',
  'apps-manager': '/api/v1/authusers/',
  'ai-lab': '/api/v1/authusers/',
}

export const TOKEN_REFRESH_URL = '/api/v1/token/refresh/'

export function getTokenObtainUrl(app: AppName): string {
  return TOKEN_OBTAIN[app]
}

export function getRegisterUrl(app: AppName): string {
  return TOKEN_REGISTER[app]
}

export function isAuthTokenUrl(url: string | undefined): boolean {
  if (!url) return false
  return (
    url.includes('/token/') ||
    url.includes('/token/refresh/') ||
    Object.values(TOKEN_OBTAIN).some((path) => url.includes(path))
  )
}
