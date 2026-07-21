import { useContext } from 'react'
import { AiLabRealtimeContext } from '@features/ai-lab/hooks/ai-lab-realtime.context'

export function useAiLabRealtime() {
  const context = useContext(AiLabRealtimeContext)
  if (!context) {
    throw new Error('useAiLabRealtime must be used within AiLabRealtimeProvider')
  }
  return context
}
