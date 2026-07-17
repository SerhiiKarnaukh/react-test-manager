import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { expect } from 'vitest'
import { useAlertStore } from '@core/alert/alert.store'
import { APPS_BASE } from '@features/apps-manager/api/reactApps'
import { useApps } from '@features/apps-manager/hooks/useApps'
import { useAppSearch } from '@features/apps-manager/hooks/useAppSearch'
import { useTopbarLinks } from '@features/apps-manager/hooks/useTopbarLinks'

const sampleApps = [
  {
    id: 1,
    title: 'Taberna',
    photo: 'https://example.com/t.jpg',
    url: 'https://example.com',
    view_url: '/taberna',
  },
]

const server = setupServer(
  http.get(`*${APPS_BASE}/`, () => HttpResponse.json(sampleApps)),
  http.post(`*${APPS_BASE}/search/`, () => HttpResponse.json(sampleApps)),
  http.get('*/api/v1/topbar-links/', () =>
    HttpResponse.json([
      { key: 'cv', url: 'https://e/cv', title: 'raw', icon_class: 'fa', ordering: 1 },
    ]),
  ),
)

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('apps manager query hooks', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('useApps loads apps list', async () => {
    const { result } = renderHook(() => useApps(), { wrapper: createWrapper() })

    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(sampleApps)
  })

  it('useApps enqueues an alert when loading fails', async () => {
    server.use(
      http.get(`*${APPS_BASE}/`, () => new HttpResponse(null, { status: 500 })),
    )
    useAlertStore.getState().clear()

    const { result } = renderHook(() => useApps(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    await waitFor(() =>
      expect(useAlertStore.getState().queue).toEqual([
        expect.objectContaining({ severity: 'error' }),
      ]),
    )
  })

  it('useAppSearch stays idle when query is empty', () => {
    const { result } = renderHook(() => useAppSearch(''), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.isFetching).toBe(false)
  })

  it('useAppSearch fetches when query is set', async () => {
    const { result } = renderHook(() => useAppSearch('taberna'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(sampleApps)
  })

  it('useAppSearch enqueues an alert when the request fails', async () => {
    server.use(
      http.post(`*${APPS_BASE}/search/`, () => new HttpResponse(null, { status: 500 })),
    )
    useAlertStore.getState().clear()

    const { result } = renderHook(() => useAppSearch('taberna'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    await waitFor(() =>
      expect(useAlertStore.getState().queue).toEqual([
        expect.objectContaining({ severity: 'error' }),
      ]),
    )
  })

  it('useTopbarLinks loads and normalizes links', async () => {
    const { result } = renderHook(() => useTopbarLinks(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([
      expect.objectContaining({ key: 'cv', title: 'CV' }),
    ])
  })
})
