import { createContext } from 'react'
import type { useRealtimeSocket } from '@features/ai-lab/hooks/useRealtimeSocket'

export type AiLabRealtimeContextValue = ReturnType<typeof useRealtimeSocket>

export const AiLabRealtimeContext = createContext<AiLabRealtimeContextValue | null>(null)
