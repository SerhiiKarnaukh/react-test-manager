import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@core/auth/auth.store'
import { AppShellLayout } from '@shared/ui/AppShellLayout'

export function MainTabernaLayout() {
  const setActiveApp = useAuthStore((s) => s.setActiveApp)

  useEffect(() => {
    setActiveApp('taberna')
  }, [setActiveApp])

  return (
    <AppShellLayout title="Taberna">
      <Outlet />
    </AppShellLayout>
  )
}
