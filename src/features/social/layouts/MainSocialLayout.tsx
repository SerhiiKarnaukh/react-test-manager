import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@core/auth/auth.store'
import { AppShellLayout } from '@shared/ui/AppShellLayout'

export function MainSocialLayout() {
  const setActiveApp = useAuthStore((s) => s.setActiveApp)

  useEffect(() => {
    setActiveApp('social')
  }, [setActiveApp])

  return (
    <AppShellLayout title="Social">
      <Outlet />
    </AppShellLayout>
  )
}
