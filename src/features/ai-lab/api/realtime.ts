import { api } from '@core/http/axios'
import type { RealtimeTokenResponse } from '@features/ai-lab/api/ai-lab.models'

export async function fetchRealtimeToken(): Promise<RealtimeTokenResponse> {
  const { data } = await api.post<RealtimeTokenResponse>('/ai-lab/realtime-token/', {})
  return data
}
