import { beforeEach, describe, expect, it } from 'vitest'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

describe('useAiLabStore', () => {
  beforeEach(() => {
    useAiLabStore.setState({
      message: null,
      imageUrl: null,
      voiceMessage: null,
      promptImages: [],
      uploadingImages: false,
      realtimeMessages: [],
      realtimeLoading: false,
    })
  })

  it('updates chat, image, and voice state', () => {
    useAiLabStore.getState().setMessage('hello')
    useAiLabStore.getState().setImageUrl('https://img.test/a.png')
    useAiLabStore.getState().setVoiceMessage('https://audio.test/a.mp3')

    expect(useAiLabStore.getState().message).toBe('hello')
    expect(useAiLabStore.getState().imageUrl).toBe('https://img.test/a.png')
    expect(useAiLabStore.getState().voiceMessage).toBe('https://audio.test/a.mp3')
  })

  it('manages prompt image uploads', () => {
    useAiLabStore.getState().setUploadingImages(true)
    expect(useAiLabStore.getState().uploadingImages).toBe(true)

    useAiLabStore.getState().addPromptImages(['https://cdn.test/1.png'])
    useAiLabStore.getState().addPromptImages(['https://cdn.test/2.png'])
    expect(useAiLabStore.getState().promptImages).toEqual([
      'https://cdn.test/1.png',
      'https://cdn.test/2.png',
    ])

    useAiLabStore.getState().removePromptImageAt(0)
    expect(useAiLabStore.getState().promptImages).toEqual(['https://cdn.test/2.png'])
  })

  it('tracks realtime messages and loading flag', () => {
    useAiLabStore.getState().setRealtimeLoading(true)
    useAiLabStore.getState().appendRealtimeMessage('me', 'hi')
    useAiLabStore.getState().appendRealtimeMessage('chat', 'hello back')

    expect(useAiLabStore.getState().realtimeMessages).toEqual([
      { sender: 'me', message: 'hi' },
      { sender: 'chat', message: 'hello back' },
    ])
    expect(useAiLabStore.getState().realtimeLoading).toBe(false)

    useAiLabStore.getState().resetRealtimeMessages()
    expect(useAiLabStore.getState().realtimeMessages).toEqual([])
    expect(useAiLabStore.getState().realtimeLoading).toBe(false)
  })
})
