import { expect } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'

vi.mock('@core/auth/auth.api', () => ({
  login: vi.fn(async () => ({
    access: 'access-token',
    refresh: 'refresh-token',
  })),
  refreshToken: vi.fn(async () => ({
    access: 'new-access',
    refresh: 'new-refresh',
  })),
  logout: vi.fn(),
}))

describe('auth.store', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({
      access: null,
      refresh: null,
      activeApp: null,
    })
  })

  it('persists tokens to Vue-compatible localStorage keys on login', async () => {
    await useAuthStore.getState().login('taberna', {
      email: 'a@b.com',
      password: 'secret1',
    })

    expect(localStorage.getItem('access')).toBe('access-token')
    expect(localStorage.getItem('refresh')).toBe('refresh-token')
    expect(localStorage.getItem('active_app')).toBe('taberna')
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it('clears tokens on logout', async () => {
    await useAuthStore.getState().login('social', {
      email: 'a@b.com',
      password: 'secret1',
    })
    useAuthStore.getState().logout()

    expect(localStorage.getItem('access')).toBeNull()
    expect(localStorage.getItem('refresh')).toBeNull()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })
})
