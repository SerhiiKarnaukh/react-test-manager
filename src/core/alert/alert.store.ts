import { create } from 'zustand'

export type AlertSeverity = 'error' | 'success' | 'warning' | 'info'

export type AlertItem = {
  id: string
  severity: AlertSeverity
  message: string
}

type AlertState = {
  queue: AlertItem[]
  enqueue: (severity: AlertSeverity, message: string) => void
  dequeue: () => void
  clear: () => void
}

let alertSeq = 0

export const useAlertStore = create<AlertState>((set) => ({
  queue: [],
  enqueue: (severity, message) =>
    set((state) => ({
      queue: [
        ...state.queue,
        { id: `alert-${++alertSeq}`, severity, message },
      ],
    })),
  dequeue: () =>
    set((state) => ({
      queue: state.queue.slice(1),
    })),
  clear: () => set({ queue: [] }),
}))
