import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect } from 'vitest'
import { theme } from '@app/theme'
import { MainAppsManagerLayout } from '@features/apps-manager/layouts/MainAppsManagerLayout'
import { stubMatchMedia } from '@features/apps-manager/test/apps-manager-test-utils'

const server = setupServer(
  http.get('*/api/v1/topbar-links/', () => HttpResponse.json([])),
)

const originalMatchMedia = window.matchMedia

describe('MainAppsManagerLayout', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => stubMatchMedia(() => false))
  afterEach(() => {
    server.resetHandlers()
    window.matchMedia = originalMatchMedia
  })
  afterAll(() => server.close())

  it('renders navbar, footer and the routed outlet content', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={client}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route element={<MainAppsManagerLayout />}>
                <Route path="/" element={<div>Outlet content</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>,
    )

    expect(screen.getByText('Outlet content')).toBeInTheDocument()
    expect(screen.getByText('Portfolio launcher')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'React Apps' })).toHaveAttribute('href', '/')
  })
})
