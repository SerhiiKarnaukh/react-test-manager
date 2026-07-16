import type { RouteObject } from 'react-router-dom'
import { MainAppsManagerLayout } from '@features/apps-manager/layouts/MainAppsManagerLayout'
import { HomePage } from '@features/apps-manager/pages/HomePage'
import { NotFoundPage } from '@features/apps-manager/pages/NotFoundPage'
import { SearchPage } from '@features/apps-manager/pages/SearchPage'

export const appsManagerRoutes: RouteObject[] = [
  {
    element: <MainAppsManagerLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/apps_manager/search', element: <SearchPage /> },
    ],
  },
]

export const appsManagerNotFoundRoute: RouteObject[] = [
  {
    element: <MainAppsManagerLayout />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
]
