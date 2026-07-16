import axios, { type AxiosInstance } from 'axios'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'
import { setupInterceptors } from '@core/http/interceptors'

const server = setupServer()

describe('axios interceptors', () => {
  let client: AxiosInstance

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    localStorage.clear()
    useAuthStore.setState({
      access: null,
      refresh: null,
      activeApp: null,
    })
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  beforeEach(() => {
    client = axios.create({ baseURL: 'http://localhost' })
    setupInterceptors(client)
  })

  it('refreshes once on 401 and retries the original request', async () => {
    let protectedCalls = 0
    const refreshTokens = vi.fn(async () => {
      useAuthStore.setState({ access: 'fresh-access' })
      return 'fresh-access'
    })

    useAuthStore.setState({
      access: 'old-access',
      refresh: 'refresh-token',
      activeApp: 'taberna',
      refreshTokens,
    })

    server.use(
      http.get('http://localhost/api/protected/', () => {
        protectedCalls += 1
        if (protectedCalls === 1) {
          return HttpResponse.json({ detail: 'expired' }, { status: 401 })
        }
        return HttpResponse.json({ ok: true })
      }),
    )

    const response = await client.get('/api/protected/')
    expect(response.data).toEqual({ ok: true })
    expect(protectedCalls).toBe(2)
    expect(refreshTokens).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().access).toBe('fresh-access')
  })

  it('logs out when refresh fails', async () => {
    const assign = vi.fn()
    vi.stubGlobal('location', {
      pathname: '/taberna/dashboard',
      search: '',
      assign,
    })

    const logout = vi.fn(() => {
      useAuthStore.setState({ access: null, refresh: null })
    })
    const refreshTokens = vi.fn(async () => {
      throw new Error('refresh failed')
    })

    useAuthStore.setState({
      access: 'old-access',
      refresh: 'refresh-token',
      activeApp: 'taberna',
      refreshTokens,
      logout,
    })

    server.use(
      http.get('http://localhost/api/protected/', () =>
        HttpResponse.json({ detail: 'expired' }, { status: 401 }),
      ),
    )

    await expect(client.get('/api/protected/')).rejects.toBeTruthy()
    expect(logout).toHaveBeenCalled()
    expect(assign).toHaveBeenCalled()
  })
})
