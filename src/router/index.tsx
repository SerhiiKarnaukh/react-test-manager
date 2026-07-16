import { createBrowserRouter } from 'react-router-dom'
import {
  appsManagerNotFoundRoute,
  appsManagerRoutes,
} from '@features/apps-manager/apps-manager.routes'
import { aiLabRoutes } from '@features/ai-lab/ai-lab.routes'
import { socialRoutes } from '@features/social/social.routes'
import { tabernaRoutes } from '@features/taberna/taberna.routes'

export const router = createBrowserRouter([
  ...appsManagerRoutes,
  ...tabernaRoutes,
  ...socialRoutes,
  ...aiLabRoutes,
  ...appsManagerNotFoundRoute,
])
