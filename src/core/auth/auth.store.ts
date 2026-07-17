import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import * as authApi from '@core/auth/auth.api'
import type { AppName, LoginCredentials } from '@core/auth/auth.types'

const ACCESS_KEY = 'access'
const REFRESH_KEY = 'refresh'
const ACTIVE_APP_KEY = 'active_app'

type AuthState = {
  access: string | null
  refresh: string | null
  activeApp: AppName | null
  login: (app: AppName, credentials: LoginCredentials, options?: authApi.LoginOptions) => Promise<void>
  logout: () => void
  refreshTokens: () => Promise<string>
  setActiveApp: (app: AppName) => void
  isAuthenticated: () => boolean
}

/**
 * Maps Zustand persist blob onto Vue-compatible localStorage keys
 * (`access`, `refresh`, `active_app`) instead of a single JSON key.
 */
const vueCompatibleStorage: StateStorage = {
  getItem: (): string | null => {
    const access = localStorage.getItem(ACCESS_KEY)
    const refresh = localStorage.getItem(REFRESH_KEY)
    const activeApp = localStorage.getItem(ACTIVE_APP_KEY)
    if (!access && !refresh && !activeApp) return null
    return JSON.stringify({
      state: {
        access,
        refresh,
        activeApp: (activeApp as AppName | null) ?? null,
      },
      version: 0,
    })
  },
  setItem: (_name: string, value: string): void => {
    const parsed = JSON.parse(value) as {
      state: { access: string | null; refresh: string | null; activeApp: AppName | null }
    }
    const { access, refresh, activeApp } = parsed.state
    if (access) localStorage.setItem(ACCESS_KEY, access)
    else localStorage.removeItem(ACCESS_KEY)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
    else localStorage.removeItem(REFRESH_KEY)
    if (activeApp) localStorage.setItem(ACTIVE_APP_KEY, activeApp)
    else localStorage.removeItem(ACTIVE_APP_KEY)
  },
  removeItem: (): void => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(ACTIVE_APP_KEY)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access: null,
      refresh: null,
      activeApp: null,

      isAuthenticated: () => Boolean(get().access),

      setActiveApp: (app) => set({ activeApp: app }),

      login: async (app, credentials, options) => {
        const tokens = await authApi.login(app, credentials, options)
        set({
          access: tokens.access,
          refresh: tokens.refresh,
          activeApp: app,
        })
      },

      logout: () => {
        authApi.logout()
        set({ access: null, refresh: null })
      },

      refreshTokens: async () => {
        const currentRefresh = get().refresh
        if (!currentRefresh) {
          get().logout()
          throw new Error('No refresh token')
        }
        const tokens = await authApi.refreshToken(currentRefresh)
        set({ access: tokens.access, refresh: tokens.refresh })
        return tokens.access
      },
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => vueCompatibleStorage),
      partialize: (state) => ({
        access: state.access,
        refresh: state.refresh,
        activeApp: state.activeApp,
      }),
    },
  ),
)
