import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { isAuthTokenUrl } from '@core/auth/auth.endpoints'
import { useAuthStore } from '@core/auth/auth.store'
import { getLoginRoute } from '@router/get-login-route'

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string> | null = null

function redirectAfterLogout(): void {
  const activeApp = useAuthStore.getState().activeApp ?? 'apps-manager'
  const target = getLoginRoute(activeApp, window.location.pathname)
  if (window.location.pathname + window.location.search !== target) {
    window.location.assign(target)
  }
}

export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    const access = useAuthStore.getState().access
    if (access) {
      config.headers.Authorization = `Bearer ${access}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetryConfig | undefined
      if (!original || error.response?.status !== 401) {
        return Promise.reject(error)
      }

      if (isAuthTokenUrl(original.url) || original._retry) {
        return Promise.reject(error)
      }

      original._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = useAuthStore
            .getState()
            .refreshTokens()
            .finally(() => {
              refreshPromise = null
            })
        }
        const access = await refreshPromise
        original.headers.Authorization = `Bearer ${access}`
        return client(original)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        redirectAfterLogout()
        return Promise.reject(refreshError)
      }
    },
  )
}
