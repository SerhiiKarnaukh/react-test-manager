import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  AiLabRealtimeProvider,
  useAiLabRealtime,
} from '@features/ai-lab/hooks/AiLabRealtimeContext'

vi.mock('@features/ai-lab/hooks/useRealtimeSocket', () => ({
  useRealtimeSocket: () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    sendMessage: vi.fn(() => true),
    isReady: vi.fn(() => true),
  }),
}))

describe('AiLabRealtimeContext', () => {
  it('provides realtime socket helpers inside provider', () => {
    const { result } = renderHook(() => useAiLabRealtime(), {
      wrapper: ({ children }) => (
        <AiLabRealtimeProvider>{children}</AiLabRealtimeProvider>
      ),
    })

    expect(result.current.isReady()).toBe(true)
    expect(result.current.sendMessage('hello')).toBe(true)
  })

  it('throws outside provider', () => {
    expect(() => renderHook(() => useAiLabRealtime())).toThrow(
      'useAiLabRealtime must be used within AiLabRealtimeProvider',
    )
  })
})
