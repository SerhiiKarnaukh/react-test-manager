import { expect } from 'vitest'
import {
  appsManagerNotFoundRoute,
  appsManagerRoutes,
} from '@features/apps-manager/apps-manager.routes'

describe('apps-manager routes', () => {
  it('exposes home and search routes under the main layout', () => {
    const childPaths = appsManagerRoutes[0].children?.map((route) => route.path)
    expect(childPaths).toEqual(['/', '/apps_manager/search'])
  })

  it('exposes a catch-all not-found route', () => {
    expect(appsManagerNotFoundRoute[0].children?.[0].path).toBe('*')
  })
})
