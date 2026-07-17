import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { socialTheme } from '@features/social/social.theme'

export const sampleAuthor = {
  id: 1,
  slug: 'jane-doe',
  first_name: 'Jane',
  last_name: 'Doe',
  avatar_url: null as string | null,
}

export const samplePost = {
  id: 10,
  body: 'Hello feed',
  created_at_formatted: '2 minutes',
  likes_count: 3,
  comments_count: 1,
  is_private: false,
  created_by: sampleAuthor,
  attachments: [] as { id: number; image_url: string }[],
}

export function createTestClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

export function createSocialWrapper(
  client: QueryClient,
  initialEntries: string[] = ['/social/home'],
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}

export function createSocialRouteWrapper(
  client: QueryClient,
  path: string,
  element: ReactNode,
  initialEntry?: string,
) {
  return function Wrapper() {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider theme={socialTheme}>
          <MemoryRouter initialEntries={[initialEntry ?? path]}>
            <Routes>
              <Route path={path} element={element} />
              <Route path="/social/login" element={<div>Login</div>} />
              <Route path="/social/chat" element={<div>Chat</div>} />
              <Route path="/social/profile/:slug" element={<div>Profile</div>} />
              <Route path="/social/profile/:slug/friends" element={<div>Friends</div>} />
              <Route path="/social/:id" element={<div>Post</div>} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}
