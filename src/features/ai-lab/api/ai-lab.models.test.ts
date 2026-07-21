import { describe, expect, it } from 'vitest'
import {
  extractFilenameFromUrl,
  isOpenAiQuotaExceeded,
  OPENAI_QUOTA_EXCEEDED_CODE,
  parseRealtimeAssistantMessage,
  resolveAiLabApiErrorMessage,
  resolvePromptFormMode,
} from '@features/ai-lab/api/ai-lab.models'
import { AxiosError, AxiosHeaders } from 'axios'

describe('resolveAiLabApiErrorMessage', () => {
  it('returns quota message as-is for HTTP 402', () => {
    const error = new AxiosError(
      'Payment Required',
      '402',
      undefined,
      undefined,
      {
        status: 402,
        statusText: 'Payment Required',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          message: 'OpenAI API credits have been exhausted.',
          error_code: OPENAI_QUOTA_EXCEEDED_CODE,
        },
      },
    )

    expect(resolveAiLabApiErrorMessage(error)).toBe('OpenAI API credits have been exhausted.')
  })

  it('appends admin contact suffix for regular API errors', () => {
    const error = new AxiosError(
      'Server Error',
      '500',
      undefined,
      undefined,
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: { message: 'Error: upstream failed' },
      },
    )

    expect(resolveAiLabApiErrorMessage(error)).toBe(
      'Error: upstream failed Please contact the site administrator if the issue persists.',
    )
  })

  it('returns null when response has no message', () => {
    const error = new AxiosError(
      'Server Error',
      '500',
      undefined,
      undefined,
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {},
      },
    )

    expect(resolveAiLabApiErrorMessage(error)).toBeNull()
  })
})

describe('isOpenAiQuotaExceeded', () => {
  it('detects quota by status or error code', () => {
    expect(isOpenAiQuotaExceeded(402, undefined)).toBe(true)
    expect(isOpenAiQuotaExceeded(500, OPENAI_QUOTA_EXCEEDED_CODE)).toBe(true)
    expect(isOpenAiQuotaExceeded(500, undefined)).toBe(false)
  })
})

describe('parseRealtimeAssistantMessage', () => {
  it('returns null for non response.done events', () => {
    expect(parseRealtimeAssistantMessage({ type: 'session.created' })).toBeNull()
  })

  it('returns transcript from response.done payload', () => {
    expect(
      parseRealtimeAssistantMessage({
        type: 'response.done',
        response: { output: [{ content: [{ transcript: 'hello back' }] }] },
      }),
    ).toBe('hello back')
  })

  it('returns text fallback from response.done payload', () => {
    expect(
      parseRealtimeAssistantMessage({
        type: 'response.done',
        response: { output: [{ content: [{ text: 'text reply' }] }] },
      }),
    ).toBe('text reply')
  })
})

describe('extractFilenameFromUrl', () => {
  it('extracts and decodes filename from url path', () => {
    expect(extractFilenameFromUrl('https://cdn.test/uploads/cat%20pic.png')).toBe('cat pic.png')
  })
})

describe('resolvePromptFormMode', () => {
  it('maps routes to prompt form modes', () => {
    expect(resolvePromptFormMode('/ai-lab')).toBe('chat')
    expect(resolvePromptFormMode('/ai-lab/image-generator')).toBe('image')
    expect(resolvePromptFormMode('/ai-lab/voice-generator')).toBe('voice')
    expect(resolvePromptFormMode('/ai-lab/realtime-chat')).toBe('realtime')
  })
})
