import type { RouteObject } from 'react-router-dom'
import { MainAiLabLayout } from '@features/ai-lab/layouts/MainAiLabLayout'
import { StubPage } from '@shared/ui/StubPage'

export const aiLabRoutes: RouteObject[] = [
  {
    element: <MainAiLabLayout />,
    children: [
      { path: 'ai-lab', element: <StubPage title="AI Lab — Funny Chat" /> },
      {
        path: 'ai-lab/image-generator',
        element: <StubPage title="AI Lab — Image Generator" />,
      },
      {
        path: 'ai-lab/voice-generator',
        element: <StubPage title="AI Lab — Voice Generator" />,
      },
      {
        path: 'ai-lab/realtime-chat',
        element: <StubPage title="AI Lab — Realtime Chat" />,
      },
    ],
  },
]
