import { createContext, useContext, type ReactNode } from 'react'
import { useRealtimeSocket } from '@features/ai-lab/hooks/useRealtimeSocket'

type RealtimeContextValue = ReturnType<typeof useRealtimeSocket>

const AiLabRealtimeContext = createContext<RealtimeContextValue | null>(null)

export function AiLabRealtimeProvider({ children }: { children: ReactNode }) {
  const value = useRealtimeSocket()
  return <AiLabRealtimeContext.Provider value={value}>{children}</AiLabRealtimeContext.Provider>
}

export function useAiLabRealtime() {
  const context = useContext(AiLabRealtimeContext)
  if (!context) {
    throw new Error('useAiLabRealtime must be used within AiLabRealtimeProvider')
  }
  return context
}
