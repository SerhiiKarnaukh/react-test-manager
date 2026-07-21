import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest'
import { useAlertStore } from '@core/alert/alert.store'
import {
  useDeletePromptImage,
  useSendChatMessage,
  useUploadPromptImages,
} from '@features/ai-lab/hooks/useAiLabChat'
import { createAiLabWrapper, createTestClient } from '@features/ai-lab/test/ai-lab-test-utils'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

const server = setupServer(
  http.post('*/ai-lab/', () => HttpResponse.json({ message: 'funny reply' })),
  http.post('*/ai-lab/upload-vision-images/', () =>
    HttpResponse.json({ uploaded_images: ['https://cdn.test/new.png'] }),
  ),
  http.delete('*/ai-lab/delete-vision-image/', () => HttpResponse.json({ ok: true })),
)

describe('useAiLabChat hooks', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    useAlertStore.getState().clear()
    useAiLabStore.setState({
      message: null,
      promptImages: [],
      uploadingImages: false,
    })
  })
  afterAll(() => server.close())

  it('useSendChatMessage stores API response', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => useSendChatMessage(), {
      wrapper: createAiLabWrapper(client),
    })

    await result.current.mutateAsync('Hello AI')

    await waitFor(() => {
      expect(useAiLabStore.getState().message).toBe('funny reply')
    })
  })

  it('useSendChatMessage enqueues alert on failure', async () => {
    server.use(http.post('*/ai-lab/', () => new HttpResponse(null, { status: 500 })))
    const client = createTestClient()
    const { result } = renderHook(() => useSendChatMessage(), {
      wrapper: createAiLabWrapper(client),
    })

    await expect(result.current.mutateAsync('fail')).rejects.toThrow()
    await waitFor(() => {
      expect(useAlertStore.getState().queue.length).toBeGreaterThan(0)
    })
  })

  it('useUploadPromptImages updates promptImages and uploading flag', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => useUploadPromptImages(), {
      wrapper: createAiLabWrapper(client),
    })

    const file = new File(['x'], 'pic.png', { type: 'image/png' })
    await result.current.mutateAsync([file])

    await waitFor(() => {
      expect(useAiLabStore.getState().promptImages).toEqual(['https://cdn.test/new.png'])
      expect(useAiLabStore.getState().uploadingImages).toBe(false)
    })
  })

  it('useUploadPromptImages enqueues alert on failure', async () => {
    server.use(
      http.post('*/ai-lab/upload-vision-images/', () => new HttpResponse(null, { status: 500 })),
    )
    const client = createTestClient()
    const { result } = renderHook(() => useUploadPromptImages(), {
      wrapper: createAiLabWrapper(client),
    })

    const file = new File(['x'], 'pic.png', { type: 'image/png' })
    await expect(result.current.mutateAsync([file])).rejects.toThrow()
    await waitFor(() => {
      expect(useAlertStore.getState().queue.length).toBeGreaterThan(0)
    })
  })

  it('useDeletePromptImage removes image from store', async () => {
    useAiLabStore.setState({ promptImages: ['https://cdn.test/cat%20pic.png'] })
    const client = createTestClient()
    const { result } = renderHook(() => useDeletePromptImage(), {
      wrapper: createAiLabWrapper(client),
    })

    await result.current.mutateAsync({
      index: 0,
      imageUrl: 'https://cdn.test/cat%20pic.png',
    })

    await waitFor(() => {
      expect(useAiLabStore.getState().promptImages).toEqual([])
    })
  })

  it('useDeletePromptImage enqueues alert on failure', async () => {
    server.use(
      http.delete('*/ai-lab/delete-vision-image/', () => new HttpResponse(null, { status: 500 })),
    )
    const client = createTestClient()
    const { result } = renderHook(() => useDeletePromptImage(), {
      wrapper: createAiLabWrapper(client),
    })

    await expect(
      result.current.mutateAsync({ index: 0, imageUrl: 'https://cdn.test/a.png' }),
    ).rejects.toThrow()
    await waitFor(() => {
      expect(useAlertStore.getState().queue.length).toBeGreaterThan(0)
    })
  })
})

describe('resolveAiLabApiErrorMessage edge cases', () => {
  it('returns null for non-axios errors', async () => {
    const { resolveAiLabApiErrorMessage } = await import('@features/ai-lab/api/ai-lab.models')
    expect(resolveAiLabApiErrorMessage(new Error('nope'))).toBeNull()
  })

  it('returns quota message when error_code matches', async () => {
    const { resolveAiLabApiErrorMessage, OPENAI_QUOTA_EXCEEDED_CODE } = await import(
      '@features/ai-lab/api/ai-lab.models'
    )
    const error = new AxiosError('err', '500', undefined, undefined, {
      status: 500,
      statusText: 'Error',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: {
        message: 'OpenAI API credits have been exhausted.',
        error_code: OPENAI_QUOTA_EXCEEDED_CODE,
      },
    })
    expect(resolveAiLabApiErrorMessage(error)).toBe('OpenAI API credits have been exhausted.')
  })
})
