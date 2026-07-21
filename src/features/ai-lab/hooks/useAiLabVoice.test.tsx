import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useAlertStore } from '@core/alert/alert.store'
import { useGenerateVoice } from '@features/ai-lab/hooks/useAiLabVoice'
import { createAiLabWrapper, createTestClient } from '@features/ai-lab/test/ai-lab-test-utils'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

const server = setupServer(
  http.post('*/ai-lab/voice-generator/', () =>
    HttpResponse.json({ message: 'https://audio.test/voice.mp3' }),
  ),
)

describe('useGenerateVoice', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    useAlertStore.getState().clear()
    useAiLabStore.setState({ voiceMessage: null })
  })
  afterAll(() => server.close())

  it('stores generated voice url', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => useGenerateVoice(), {
      wrapper: createAiLabWrapper(client),
    })

    await result.current.mutateAsync('say hello')

    await waitFor(() => {
      expect(useAiLabStore.getState().voiceMessage).toBe('https://audio.test/voice.mp3')
    })
  })

  it('enqueues alert on failure', async () => {
    server.use(
      http.post('*/ai-lab/voice-generator/', () => new HttpResponse(null, { status: 500 })),
    )
    const client = createTestClient()
    const { result } = renderHook(() => useGenerateVoice(), {
      wrapper: createAiLabWrapper(client),
    })

    await expect(result.current.mutateAsync('fail')).rejects.toThrow()
    await waitFor(() => {
      expect(useAlertStore.getState().queue.length).toBeGreaterThan(0)
    })
  })
})
