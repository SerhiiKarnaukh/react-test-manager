import { create } from 'zustand'
import type { RealtimeChatMessage } from '@features/ai-lab/api/ai-lab.models'

type AiLabState = {
  message: string | null
  imageUrl: string | null
  voiceMessage: string | null
  promptImages: string[]
  uploadingImages: boolean
  realtimeMessages: RealtimeChatMessage[]
  realtimeLoading: boolean
  setMessage: (message: string | null) => void
  setImageUrl: (url: string | null) => void
  setVoiceMessage: (url: string | null) => void
  setUploadingImages: (uploading: boolean) => void
  addPromptImages: (urls: string[]) => void
  removePromptImageAt: (index: number) => void
  appendRealtimeMessage: (sender: RealtimeChatMessage['sender'], message: string) => void
  setRealtimeLoading: (loading: boolean) => void
  resetRealtimeMessages: () => void
}

export const useAiLabStore = create<AiLabState>((set) => ({
  message: null,
  imageUrl: null,
  voiceMessage: null,
  promptImages: [],
  uploadingImages: false,
  realtimeMessages: [],
  realtimeLoading: false,
  setMessage: (message) => set({ message }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
  setVoiceMessage: (voiceMessage) => set({ voiceMessage }),
  setUploadingImages: (uploadingImages) => set({ uploadingImages }),
  addPromptImages: (urls) =>
    set((state) => ({ promptImages: [...state.promptImages, ...urls] })),
  removePromptImageAt: (index) =>
    set((state) => ({
      promptImages: state.promptImages.filter((_, itemIndex) => itemIndex !== index),
    })),
  appendRealtimeMessage: (sender, message) =>
    set((state) => ({
      realtimeMessages: [...state.realtimeMessages, { sender, message }],
      realtimeLoading: sender === 'chat' ? false : state.realtimeLoading,
    })),
  setRealtimeLoading: (realtimeLoading) => set({ realtimeLoading }),
  resetRealtimeMessages: () => set({ realtimeMessages: [], realtimeLoading: false }),
}))
