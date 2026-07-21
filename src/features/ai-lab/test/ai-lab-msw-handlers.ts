import { http, HttpResponse } from 'msw'

export const DOWNLOAD_IMAGE_MOCK_BYTES = 'image-bytes'

export const downloadImageHandler = http.post('*/ai-lab/download-image/', () => {
  return new HttpResponse(
    new Blob([DOWNLOAD_IMAGE_MOCK_BYTES], { type: 'application/octet-stream' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    },
  )
})
