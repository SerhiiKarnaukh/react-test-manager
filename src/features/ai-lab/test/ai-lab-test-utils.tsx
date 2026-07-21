import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, useColorScheme } from '@mui/material/styles'
import { useEffect, type ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { aiLabTheme } from '@features/ai-lab/ai-lab.theme'
import { AiLabRealtimeProvider } from '@features/ai-lab/hooks/AiLabRealtimeContext'

function DarkColorScheme({ children }: { children: ReactNode }) {
  const { setMode } = useColorScheme()

  useEffect(() => {
    setMode('dark')
  }, [setMode])

  return children
}

export function createTestClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

export function createAiLabWrapper(
  client: QueryClient,
  initialEntries: string[] = ['/ai-lab'],
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider theme={aiLabTheme}>
          <CssBaseline />
          <MemoryRouter initialEntries={initialEntries}>
            <AiLabRealtimeProvider>{children}</AiLabRealtimeProvider>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}

export function createDarkAiLabWrapper(
  client: QueryClient,
  initialEntries: string[] = ['/ai-lab'],
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider theme={aiLabTheme} defaultMode="dark">
          <CssBaseline />
          <MemoryRouter initialEntries={initialEntries}>
            <AiLabRealtimeProvider>
              <DarkColorScheme>{children}</DarkColorScheme>
            </AiLabRealtimeProvider>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}

export function createAiLabRouteWrapper(
  client: QueryClient,
  path: string,
  element: ReactNode,
  initialEntry?: string,
) {
  return function Wrapper() {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider theme={aiLabTheme}>
          <CssBaseline />
          <MemoryRouter initialEntries={[initialEntry ?? path]}>
            <AiLabRealtimeProvider>
              <Routes>
                <Route path="/ai-lab" element={element} />
                <Route path="/ai-lab/image-generator" element={element} />
                <Route path="/ai-lab/voice-generator" element={element} />
                <Route path="/ai-lab/realtime-chat" element={element} />
                <Route path="/" element={<div>Apps</div>} />
              </Routes>
            </AiLabRealtimeProvider>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}
