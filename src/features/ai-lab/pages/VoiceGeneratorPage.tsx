import { useEffect } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { useColorScheme } from '@mui/material/styles'
import { AI_LAB_HERO_IMAGES } from '@features/ai-lab/ai-lab.assets'
import { AiLabPageLayout } from '@features/ai-lab/components/AiLabPageLayout'
import { PromptForm } from '@features/ai-lab/components/PromptForm'
import { TypingIndicator } from '@features/ai-lab/components/TypingIndicator'
import { aiLabTokens } from '@features/ai-lab/ai-lab.theme'
import { useGenerateVoice } from '@features/ai-lab/hooks/useAiLabVoice'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

export function VoiceGeneratorPage() {
  const { mode } = useColorScheme()
  const tokens = mode === 'dark' ? aiLabTokens.dark : aiLabTokens.light
  const voiceMessage = useAiLabStore((s) => s.voiceMessage)
  const generateVoice = useGenerateVoice()

  useEffect(() => {
    document.title = 'Voice Generator | AI Lab'
  }, [])

  const showResponse = generateVoice.isPending || Boolean(voiceMessage)

  return (
    <AiLabPageLayout title="Voice Generator" heroImage={AI_LAB_HERO_IMAGES.voice}>
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
              }}
            >
              {generateVoice.isPending ? (
                <TypingIndicator />
              ) : (
                <Box
                  component="audio"
                  src={voiceMessage ?? undefined}
                  controls
                  sx={{ width: '100%', minWidth: 280 }}
                />
              )}
            </Box>
          </Box>
        </Card>
      ) : null}

      <PromptForm />
    </AiLabPageLayout>
  )
}
