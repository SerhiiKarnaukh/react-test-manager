import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { theme } from '@app/theme'
import type { AppItem } from '@features/apps-manager/api/reactApps'
import type { TopbarLink } from '@features/apps-manager/api/topbarLinks'

export const sampleApp: AppItem = {
  id: 1,
  title: 'Taberna Store',
  photo: 'https://example.com/taberna.jpg',
  url: 'https://example.com/description',
  view_url: 'https://example.com/app',
}

export const sampleTopbarLinks: TopbarLink[] = [
  {
    key: 'github',
    url: 'https://github.com/example',
    title: 'GitHub',
    icon_class: 'fa-brands fa-github',
    ordering: 2,
  },
  {
    key: 'cv',
    url: 'https://example.com/cv.pdf',
    title: 'CV',
    icon_class: 'fa-solid fa-file',
    ordering: 1,
  },
]

export function createTestClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function createAppsManagerWrapper(
  client = createTestClient(),
  initialEntries: string[] = ['/'],
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}

/** Stub window.matchMedia; `matches` decides the result per media query. */
export function stubMatchMedia(matches: (query: string) => boolean) {
  const noop = () => {}
  window.matchMedia = ((query: string) => ({
    matches: matches(query),
    media: query,
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
