import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AiHomePage } from '@features/ai-lab/pages/AiHomePage'
import { ImageGeneratorPage } from '@features/ai-lab/pages/ImageGeneratorPage'
import { VoiceGeneratorPage } from '@features/ai-lab/pages/VoiceGeneratorPage'
import {
  createAiLabRouteWrapper,
  createTestClient,
} from '@features/ai-lab/test/ai-lab-test-utils'

vi.mock('@features/ai-lab/hooks/useAiLabChat', () => ({
  useSendChatMessage: () => ({ isPending: true, mutateAsync: vi.fn() }),
  useUploadPromptImages: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useDeletePromptImage: () => ({ mutate: vi.fn() }),
}))

vi.mock('@features/ai-lab/hooks/useAiLabImage', () => ({
  useGenerateImage: () => ({ isPending: true, mutateAsync: vi.fn() }),
  useDownloadGeneratedImage: () => ({ isPending: false, mutate: vi.fn() }),
}))

vi.mock('@features/ai-lab/hooks/useAiLabVoice', () => ({
  useGenerateVoice: () => ({ isPending: true, mutateAsync: vi.fn() }),
}))

describe('ai lab pending page states', () => {
  it('AiHomePage shows typing indicator while chat is pending', () => {
    const client = createTestClient()
    render(<AiHomePage />, {
      wrapper: createAiLabRouteWrapper(client, '/ai-lab', <AiHomePage />, '/ai-lab'),
    })
    expect(screen.getByRole('status', { name: 'Loading response' })).toBeInTheDocument()
  })

  it('ImageGeneratorPage shows typing indicator while image is pending', () => {
    const client = createTestClient()
    render(<ImageGeneratorPage />, {
      wrapper: createAiLabRouteWrapper(
        client,
        '/ai-lab/image-generator',
        <ImageGeneratorPage />,
        '/ai-lab/image-generator',
      ),
    })
    expect(screen.getByRole('status', { name: 'Loading response' })).toBeInTheDocument()
  })

  it('VoiceGeneratorPage shows typing indicator while voice is pending', () => {
    const client = createTestClient()
    render(<VoiceGeneratorPage />, {
      wrapper: createAiLabRouteWrapper(
        client,
        '/ai-lab/voice-generator',
        <VoiceGeneratorPage />,
        '/ai-lab/voice-generator',
      ),
    })
    expect(screen.getByRole('status', { name: 'Loading response' })).toBeInTheDocument()
  })
})
