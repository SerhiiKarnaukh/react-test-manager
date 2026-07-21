import { api } from '@core/http/axios'
import type { AiLabTextResponse, AiLabUploadResponse } from '@features/ai-lab/api/ai-lab.models'

export async function sendChatMessage(
  question: string,
  promptImages: string[],
): Promise<AiLabTextResponse> {
  const { data } = await api.post<AiLabTextResponse>('/ai-lab/', {
    question,
    prompt_images: promptImages,
  })
  return data
}

export async function uploadVisionImages(formData: FormData): Promise<AiLabUploadResponse> {
  const { data } = await api.post<AiLabUploadResponse>('/ai-lab/upload-vision-images/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteVisionImage(filename: string): Promise<unknown> {
  const { data } = await api.delete('/ai-lab/delete-vision-image/', {
    data: { filename },
  })
  return data
}
