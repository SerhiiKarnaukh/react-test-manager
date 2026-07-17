import { api } from '@core/http/axios'
import {
  getTokenObtainUrl,
  TOKEN_REFRESH_URL,
} from '@core/auth/auth.endpoints'
import type { AppName, AuthTokens, LoginCredentials } from '@core/auth/auth.types'

type TokenResponse = {
  access: string
  refresh: string
}

export type LoginOptions = {
  cartId?: string | null
}

export async function login(
  app: AppName,
  credentials: LoginCredentials,
  options?: LoginOptions,
): Promise<AuthTokens> {
  const payload: Record<string, string> = {
    email: credentials.email,
    password: credentials.password,
  }

  if (app === 'taberna') {
    payload.login_source = 'taberna'
    payload.activeApp = 'taberna'
    if (options?.cartId) {
      payload.cart_id = options.cartId
    }
  }

  if (app === 'social') {
    payload.login_source = 'social'
  }

  const { data } = await api.post<TokenResponse>(getTokenObtainUrl(app), payload)
  return { access: data.access, refresh: data.refresh }
}

export async function refreshToken(refresh: string): Promise<AuthTokens> {
  const { data } = await api.post<TokenResponse>(TOKEN_REFRESH_URL, { refresh })
  return {
    access: data.access,
    refresh: data.refresh ?? refresh,
  }
}

export function logout(): void {
  // Client-side logout only; JWT invalidate is handled by clearing tokens.
}
