import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@core/auth/auth.store'
import type { AppName } from '@core/auth/auth.types'
import { getLoginRoute } from '@router/get-login-route'

type RequireAuthProps = {
  app: AppName
  children: ReactNode
}

export function RequireAuth({ app, children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={getLoginRoute(app, location.pathname)} replace />
  }

  return <>{children}</>
}
