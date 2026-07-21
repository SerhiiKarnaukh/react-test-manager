import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ImageGeneratorPage } from '@features/ai-lab/pages/ImageGeneratorPage'
import {
  createAiLabRouteWrapper,
  createTestClient,
} from '@features/ai-lab/test/ai-lab-test-utils'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

vi.mock('@features/ai-lab/hooks/useAiLabImage', () => ({
  useGenerateImage: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useDownloadGeneratedImage: () => ({ isPending: true, mutate: vi.fn() }),
}))

describe('ImageGeneratorPage download pending state', () => {
  it('disables download button while download mutation is pending', () => {
    useAiLabStore.setState({ imageUrl: 'https://img.test/generated.png' })
    const client = createTestClient()
    render(<ImageGeneratorPage />, {
      wrapper: createAiLabRouteWrapper(
        client,
        '/ai-lab/image-generator',
        <ImageGeneratorPage />,
        '/ai-lab/image-generator',
      ),
    })

    expect(screen.getByRole('button', { name: 'Download Image' })).toBeDisabled()
  })
})
