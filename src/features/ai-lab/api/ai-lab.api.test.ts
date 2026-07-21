import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { api } from '@core/http/axios'
import { sendChatMessage, uploadVisionImages, deleteVisionImage } from '@features/ai-lab/api/chat'
import { downloadImage, generateImage } from '@features/ai-lab/api/image'
import { generateVoice } from '@features/ai-lab/api/voice'
import { fetchRealtimeToken } from '@features/ai-lab/api/realtime'

const server = setupServer(
  http.post('*/ai-lab/', async ({ request }) => {
    const body = (await request.json()) as { question?: string; prompt_images?: string[] }
    return HttpResponse.json({ message: `reply:${body.question}` })
  }),
  http.post('*/ai-lab/image-generator/', async ({ request }) => {
    const body = (await request.json()) as { question?: string }
    return HttpResponse.json({ message: `https://img.test/${body.question}.png` })
  }),
  http.post('*/ai-lab/voice-generator/', async ({ request }) => {
    const body = (await request.json()) as { question?: string }
    return HttpResponse.json({ message: `https://audio.test/${body.question}.mp3` })
  }),
  http.delete('*/ai-lab/delete-vision-image/', () => HttpResponse.json({ ok: true })),
  http.post('*/ai-lab/upload-vision-images/', () =>
    HttpResponse.json({ uploaded_images: ['https://cdn.test/new.png'] }),
  ),
  http.post('*/ai-lab/realtime-token/', () =>
    HttpResponse.json({ client_secret: { value: 'ephemeral-key' } }),
  ),
)

describe('ai lab api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => {
    server.resetHandlers()
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('sendChatMessage posts question and prompt images', async () => {
    await expect(sendChatMessage('hello', ['img.png'])).resolves.toEqual({
      message: 'reply:hello',
    })
  })

  it('generateImage posts prompt to image endpoint', async () => {
    await expect(generateImage('draw cat')).resolves.toEqual({
      message: 'https://img.test/draw cat.png',
    })
  })

  it('generateVoice posts prompt to voice endpoint', async () => {
    await expect(generateVoice('say hi')).resolves.toEqual({
      message: 'https://audio.test/say hi.mp3',
    })
  })

  it('downloadImage returns blob response', async () => {
    const blob = new Blob(['image-bytes'], { type: 'application/octet-stream' })
    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: blob,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    })

    await expect(downloadImage('cat.png')).resolves.toBe(blob)
    expect(postSpy).toHaveBeenCalledWith(
      '/ai-lab/download-image/',
      { filename: 'cat.png' },
      { responseType: 'blob' },
    )
  })

  it('deleteVisionImage sends filename in request body', async () => {
    await expect(deleteVisionImage('cat.png')).resolves.toEqual({ ok: true })
  })

  it('uploadVisionImages posts multipart form data', async () => {
    const formData = new FormData()
    await expect(uploadVisionImages(formData)).resolves.toEqual({
      uploaded_images: ['https://cdn.test/new.png'],
    })
  })

  it('fetchRealtimeToken posts to realtime-token endpoint', async () => {
    await expect(fetchRealtimeToken()).resolves.toEqual({
      client_secret: { value: 'ephemeral-key' },
    })
  })
})
