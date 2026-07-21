import { type ReactNode } from 'react'
import { AiLabRealtimeContext } from '@features/ai-lab/hooks/ai-lab-realtime.context'
import { useRealtimeSocket } from '@features/ai-lab/hooks/useRealtimeSocket'

export function AiLabRealtimeProvider({ children }: { children: ReactNode }) {
  const value = useRealtimeSocket()
  return <AiLabRealtimeContext.Provider value={value}>{children}</AiLabRealtimeContext.Provider>
}
