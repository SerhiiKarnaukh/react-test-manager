import { api } from '@core/http/axios'
import type { AiLabTextResponse } from '@features/ai-lab/api/ai-lab.models'

export async function generateImage(question: string): Promise<AiLabTextResponse> {
  const { data } = await api.post<AiLabTextResponse>('/ai-lab/image-generator/', { question })
  return data
}

export async function downloadImage(filename: string): Promise<Blob> {
  const { data } = await api.post<Blob>(
    '/ai-lab/download-image/',
    { filename },
    { responseType: 'blob' },
  )
  return data
}
