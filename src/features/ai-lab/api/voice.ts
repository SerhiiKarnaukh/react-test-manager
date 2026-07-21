import { api } from '@core/http/axios'
import type { AiLabTextResponse } from '@features/ai-lab/api/ai-lab.models'

export async function generateVoice(question: string): Promise<AiLabTextResponse> {
  const { data } = await api.post<AiLabTextResponse>('/ai-lab/voice-generator/', { question })
  return data
}
