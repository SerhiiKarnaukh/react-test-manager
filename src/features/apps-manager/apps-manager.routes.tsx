import type { RouteObject } from 'react-router-dom'
import { MainAppsManagerLayout } from '@features/apps-manager/layouts/MainAppsManagerLayout'
import { StubPage } from '@shared/ui/StubPage'

export const appsManagerRoutes: RouteObject[] = [
  {
    element: <MainAppsManagerLayout />,
    children: [
      { path: '/', element: <StubPage title="Apps Manager — Home" /> },
      {
        path: '/apps_manager/search',
        element: <StubPage title="Apps Manager — Search" />,
      },
    ],
  },
]

export const appsManagerNotFoundRoute: RouteObject[] = [
  {
    element: <MainAppsManagerLayout />,
    children: [
      { path: '*', element: <StubPage title="Page not found" /> },
    ],
  },
]
