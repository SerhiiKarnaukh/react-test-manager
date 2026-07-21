import type { RouteObject } from 'react-router-dom'
import { MainAiLabLayout } from '@features/ai-lab/layouts/MainAiLabLayout'
import { AiHomePage } from '@features/ai-lab/pages/AiHomePage'
import { ImageGeneratorPage } from '@features/ai-lab/pages/ImageGeneratorPage'
import { RealtimeChatPage } from '@features/ai-lab/pages/RealtimeChatPage'
import { VoiceGeneratorPage } from '@features/ai-lab/pages/VoiceGeneratorPage'

export const aiLabRoutes: RouteObject[] = [
  {
    element: <MainAiLabLayout />,
    children: [
      { path: 'ai-lab', element: <AiHomePage /> },
      { path: 'ai-lab/image-generator', element: <ImageGeneratorPage /> },
      { path: 'ai-lab/voice-generator', element: <VoiceGeneratorPage /> },
      { path: 'ai-lab/realtime-chat', element: <RealtimeChatPage /> },
    ],
  },
]
