import { fireEvent, render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import { APPS_BASE } from '@features/apps-manager/api/reactApps'
import { HomePage } from '@features/apps-manager/pages/HomePage'
import { NotFoundPage } from '@features/apps-manager/pages/NotFoundPage'
import { SearchPage } from '@features/apps-manager/pages/SearchPage'
import {
  createAppsManagerWrapper,
  sampleApp,
  stubMatchMedia,
} from '@features/apps-manager/test/apps-manager-test-utils'

const server = setupServer(
  http.get(`*${APPS_BASE}/`, () => HttpResponse.json([sampleApp])),
  http.post(`*${APPS_BASE}/search/`, async ({ request }) => {
    const body = (await request.json()) as { query?: string }
    return HttpResponse.json(body.query === 'taberna' ? [sampleApp] : [])
  }),
)

const originalMatchMedia = window.matchMedia

describe('apps-manager pages', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    window.matchMedia = originalMatchMedia
  })
  afterAll(() => server.close())

  describe('HomePage', () => {
    it('shows loading skeletons then renders the applications grid', async () => {
      stubMatchMedia(() => false)
      render(<HomePage />, { wrapper: createAppsManagerWrapper() })

      expect(screen.getByRole('heading', { name: 'React Applications Manager' })).toBeInTheDocument()
      expect(document.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)

      expect(
        await screen.findByRole('heading', { name: sampleApp.title }),
      ).toBeInTheDocument()

      fireEvent.scroll(window, { target: { scrollY: 120 } })
    })

    it('skips the parallax listener when reduced motion is preferred', async () => {
      stubMatchMedia((query) => query.includes('reduce'))
      render(<HomePage />, { wrapper: createAppsManagerWrapper() })

      expect(
        await screen.findByRole('heading', { name: sampleApp.title }),
      ).toBeInTheDocument()
    })
  })

  describe('SearchPage', () => {
    it('prompts for a term when no query is present', () => {
      render(<SearchPage />, {
        wrapper: createAppsManagerWrapper(undefined, ['/apps_manager/search']),
      })

      expect(screen.getByText('Enter a search term from the navbar.')).toBeInTheDocument()
    })

    it('renders results for a matching query', async () => {
      render(<SearchPage />, {
        wrapper: createAppsManagerWrapper(undefined, [
          '/apps_manager/search?query=taberna',
        ]),
      })

      expect(screen.getByText('Search term: "taberna"')).toBeInTheDocument()
      expect(document.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
      expect(
        await screen.findByRole('heading', { name: sampleApp.title }),
      ).toBeInTheDocument()
    })

    it('shows the empty state when nothing is found', async () => {
      render(<SearchPage />, {
        wrapper: createAppsManagerWrapper(undefined, [
          '/apps_manager/search?query=missing',
        ]),
      })

      expect(await screen.findByText('Nothing was found.')).toBeInTheDocument()
    })
  })

  describe('NotFoundPage', () => {
    it('renders the not-found message', () => {
      render(<NotFoundPage />, { wrapper: createAppsManagerWrapper() })

      expect(screen.getByRole('heading', { name: 'Page not found!' })).toBeInTheDocument()
    })
  })
})
