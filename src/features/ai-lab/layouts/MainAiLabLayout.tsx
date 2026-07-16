import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@core/auth/auth.store'
import { AppShellLayout } from '@shared/ui/AppShellLayout'

export function MainAiLabLayout() {
  const setActiveApp = useAuthStore((s) => s.setActiveApp)

  useEffect(() => {
    setActiveApp('ai-lab')
  }, [setActiveApp])

  return (
    <AppShellLayout title="AI Lab">
      <Outlet />
    </AppShellLayout>
  )
}
