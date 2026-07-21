import { useEffect } from 'react'
import { AI_LAB_HERO_IMAGES } from '@features/ai-lab/ai-lab.assets'
import { AiLabPageLayout } from '@features/ai-lab/components/AiLabPageLayout'
import { PromptForm } from '@features/ai-lab/components/PromptForm'
import { RealtimeChat } from '@features/ai-lab/components/RealtimeChat'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

export function RealtimeChatPage() {
  const realtimeLoading = useAiLabStore((s) => s.realtimeLoading)

  useEffect(() => {
    document.title = 'Realtime Chat | AI Lab'
  }, [])

  return (
    <AiLabPageLayout title="Realtime Chat" heroImage={AI_LAB_HERO_IMAGES.realtime}>
      <RealtimeChat isLoading={realtimeLoading} />
      <PromptForm />
    </AiLabPageLayout>
  )
}
