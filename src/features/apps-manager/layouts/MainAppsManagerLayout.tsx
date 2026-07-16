import { Outlet } from 'react-router-dom'
import { AppShellLayout } from '@shared/ui/AppShellLayout'

export function MainAppsManagerLayout() {
  return (
    <AppShellLayout title="Apps Manager">
      <Outlet />
    </AppShellLayout>
  )
}
