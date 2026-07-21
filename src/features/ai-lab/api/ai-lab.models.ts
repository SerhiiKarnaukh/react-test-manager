import { isAxiosError } from 'axios'

export type AiLabTextResponse = {
  message: string
}

export type AiLabUploadResponse = {
  uploaded_images: string[]
}

export type RealtimeTokenResponse = {
  client_secret: {
    value: string
  }
}

export type RealtimeChatMessage = {
  sender: 'me' | 'chat'
  message: string
}

export type PromptFormMode = 'chat' | 'image' | 'voice' | 'realtime'

export const REALTIME_WS_URL = 'wss://api.openai.com/v1/realtime?model=gpt-realtime'

export const PROMPT_MAX_LENGTH = 500
export const PROMPT_IMAGE_MAX_BYTES = 20 * 1024 * 1024
export const PROMPT_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'] as const

export const OPENAI_QUOTA_EXCEEDED_CODE = 'openai_quota_exceeded'

const ADMIN_CONTACT_SUFFIX =
  ' Please contact the site administrator if the issue persists.'

export type AiLabApiErrorBody = {
  message?: string
  error_code?: string
  details?: unknown
}

export function isOpenAiQuotaExceeded(
  status: number | undefined,
  errorCode: string | undefined,
): boolean {
  return status === 402 || errorCode === OPENAI_QUOTA_EXCEEDED_CODE
}

export function resolveAiLabApiErrorMessage(error: unknown): string | null {
  if (!isAxiosError(error)) {
    return null
  }

  const body =
    typeof error.response?.data === 'object' && error.response?.data !== null
      ? (error.response.data as AiLabApiErrorBody)
      : null
  const status = error.response?.status

  if (!body?.message) {
    return null
  }

  if (isOpenAiQuotaExceeded(status, body.error_code)) {
    return body.message
  }

  return `${body.message}${ADMIN_CONTACT_SUFFIX}`
}

export function parseRealtimeAssistantMessage(data: {
  type?: string
  response?: { output?: { content?: { transcript?: string; text?: string }[] }[] }
}): string | null {
  if (data.type !== 'response.done') {
    return null
  }

  const content = data.response?.output?.[0]?.content?.[0]
  return content?.transcript || content?.text || null
}

export function extractFilenameFromUrl(imageUrl: string): string {
  const encodedFilename = imageUrl.split('/').pop() || ''
  return decodeURIComponent(encodedFilename)
}

export function resolvePromptFormMode(pathname: string): PromptFormMode {
  if (pathname.includes('/image-generator')) return 'image'
  if (pathname.includes('/voice-generator')) return 'voice'
  if (pathname.includes('/realtime-chat')) return 'realtime'
  return 'chat'
}
