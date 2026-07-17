import { api } from '@core/http/axios'
import { getRegisterUrl } from '@core/auth/auth.endpoints'
import type { AppName, RegisterPayload } from '@core/auth/auth.types'

export async function register(app: AppName, payload: RegisterPayload): Promise<void> {
  const body: Record<string, string | undefined> = {
    email: payload.email,
    password: payload.password,
    password_confirm: payload.passwordConfirm,
    first_name: payload.firstName,
    last_name: payload.lastName,
    username: payload.email,
  }

  if (app === 'taberna') {
    body.registration_source = 'taberna'
  }

  if (app === 'social') {
    body.registration_source = 'social_network'
  }

  await api.post(getRegisterUrl(app), body)
}
