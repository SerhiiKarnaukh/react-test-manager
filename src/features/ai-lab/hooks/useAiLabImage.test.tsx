import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useAlertStore } from '@core/alert/alert.store'
import { downloadImage } from '@features/ai-lab/api/image'
import { useDownloadGeneratedImage, useGenerateImage } from '@features/ai-lab/hooks/useAiLabImage'
import { createAiLabWrapper, createTestClient } from '@features/ai-lab/test/ai-lab-test-utils'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

vi.mock('@features/ai-lab/api/image', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@features/ai-lab/api/image')>()
  const { vi: vitest } = await import('vitest')
  return {
    ...actual,
    downloadImage: vitest.fn(async () =>
      new Blob(['image-bytes'], { type: 'application/octet-stream' }),
    ),
  }
})

const server = setupServer(
  http.post('*/ai-lab/image-generator/', () =>
    HttpResponse.json({ message: 'https://img.test/generated.png' }),
  ),
)

describe('useAiLabImage hooks', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    useAlertStore.getState().clear()
    useAiLabStore.setState({ imageUrl: null })
    vi.mocked(downloadImage).mockReset()
    vi.mocked(downloadImage).mockImplementation(async () =>
      new Blob(['image-bytes'], { type: 'application/octet-stream' }),
    )
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('useGenerateImage stores image url', async () => {
    const client = createTestClient()
    const { result } = renderHook(() => useGenerateImage(), {
      wrapper: createAiLabWrapper(client),
    })

    await result.current.mutateAsync('draw cat')

    await waitFor(() => {
      expect(useAiLabStore.getState().imageUrl).toBe('https://img.test/generated.png')
    })
  })

  it('useGenerateImage enqueues alert on failure', async () => {
    server.use(
      http.post('*/ai-lab/image-generator/', () => new HttpResponse(null, { status: 500 })),
    )
    const client = createTestClient()
    const { result } = renderHook(() => useGenerateImage(), {
      wrapper: createAiLabWrapper(client),
    })

    await expect(result.current.mutateAsync('fail')).rejects.toThrow()
    await waitFor(() => {
      expect(useAlertStore.getState().queue.length).toBeGreaterThan(0)
    })
  })

  it('useDownloadGeneratedImage triggers blob download', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    const client = createTestClient()
    const { result } = renderHook(() => useDownloadGeneratedImage(), {
      wrapper: createAiLabWrapper(client),
    })

    await result.current.mutateAsync('https://cdn.test/generated.png')

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalled()
  })

  it('useDownloadGeneratedImage enqueues alert on failure', async () => {
    vi.mocked(downloadImage).mockRejectedValueOnce(new Error('download failed'))
    const client = createTestClient()
    const { result } = renderHook(() => useDownloadGeneratedImage(), {
      wrapper: createAiLabWrapper(client),
    })

    await expect(result.current.mutateAsync('https://cdn.test/a.png')).rejects.toThrow()
    await waitFor(() => {
      expect(useAlertStore.getState().queue.length).toBeGreaterThan(0)
    })
  })
})
