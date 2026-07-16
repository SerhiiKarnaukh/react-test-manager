export type AppName = 'taberna' | 'social' | 'apps-manager' | 'ai-lab'

export type AuthTokens = {
  access: string
  refresh: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  password: string
  passwordConfirm: string
  firstName?: string
  lastName?: string
}
