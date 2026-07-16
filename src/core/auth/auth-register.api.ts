import { api } from '@core/http/axios'
import { getRegisterUrl } from '@core/auth/auth.endpoints'
import type { AppName, RegisterPayload } from '@core/auth/auth.types'

export async function register(app: AppName, payload: RegisterPayload): Promise<void> {
  await api.post(getRegisterUrl(app), {
    email: payload.email,
    password: payload.password,
    password_confirm: payload.passwordConfirm,
    first_name: payload.firstName,
    last_name: payload.lastName,
  })
}
