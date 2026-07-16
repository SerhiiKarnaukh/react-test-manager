import type { AppName } from '@core/auth/auth.types'

export function getLoginRoute(app: AppName, redirectPath?: string): string {
  if (app === 'taberna') {
    const params = new URLSearchParams({ message: 'auth' })
    if (redirectPath) params.set('redirect', redirectPath)
    return `/taberna/login?${params.toString()}`
  }
  if (app === 'social') {
    return '/social/login?message=auth'
  }
  return '/'
}
