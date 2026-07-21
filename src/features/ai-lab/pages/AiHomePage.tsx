import { useEffect } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { useColorScheme } from '@mui/material/styles'
import { AiLabPageLayout } from '@features/ai-lab/components/AiLabPageLayout'
import { PromptForm } from '@features/ai-lab/components/PromptForm'
import { TypingIndicator } from '@features/ai-lab/components/TypingIndicator'
import { AI_LAB_HERO_IMAGES } from '@features/ai-lab/ai-lab.assets'
import { aiLabTokens } from '@features/ai-lab/ai-lab.theme'
import { useSendChatMessage } from '@features/ai-lab/hooks/useAiLabChat'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

export function AiHomePage() {
  const { mode } = useColorScheme()
  const tokens = mode === 'dark' ? aiLabTokens.dark : aiLabTokens.light
  const message = useAiLabStore((s) => s.message)
  const sendChat = useSendChatMessage()

  useEffect(() => {
    document.title = 'Home | AI Lab'
  }, [])

  const showResponse = sendChat.isPending || Boolean(message)

  return (
    <AiLabPageLayout title="Funny Chat" heroImage={AI_LAB_HERO_IMAGES.chat}>
      {showResponse ? (
        <Card variant="outlined" sx={{ minHeight: 80 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }} aria-hidden>
              <SmartToyIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box
              sx={{
                maxWidth: '85%',
                px: 2,
                py: 1.5,
                borderRadius: '16px 16px 16px 4px',
                bgcolor: tokens.assistantBubble,
                color: 'text.primary',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {sendChat.isPending ? <TypingIndicator /> : message}
            </Box>
          </Box>
        </Card>
      ) : null}

      <PromptForm />
    </AiLabPageLayout>
  )
}
