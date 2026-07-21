import { useEffect, useRef } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import ForumIcon from '@mui/icons-material/Forum'
import PersonIcon from '@mui/icons-material/Person'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { useColorScheme } from '@mui/material/styles'
import { TypingIndicator } from '@features/ai-lab/components/TypingIndicator'
import { aiLabTokens } from '@features/ai-lab/ai-lab.theme'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

type RealtimeChatProps = {
  isLoading?: boolean
}

export function RealtimeChat({ isLoading = false }: RealtimeChatProps) {
  const { mode } = useColorScheme()
  const tokens = mode === 'dark' ? aiLabTokens.dark : aiLabTokens.light
  const messages = useAiLabStore((s) => s.realtimeMessages)
  const chatAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const area = chatAreaRef.current
    if (area) {
      area.scrollTop = area.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <Card variant="outlined" sx={{ minHeight: 200 }}>
      {messages.length === 0 && !isLoading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            py: 6,
            px: 2,
            color: 'text.secondary',
          }}
        >
          <ForumIcon sx={{ fontSize: 40, opacity: 0.6 }} />
          <Typography variant="body1">Start a conversation</Typography>
        </Box>
      ) : (
        <Box
          ref={chatAreaRef}
          sx={{ maxHeight: 500, overflowY: 'auto', p: 2 }}
        >
          {messages.map((message, index) => {
            const isSender = message.sender === 'me'
            return (
              <Box
                key={`${message.sender}-${index}-${message.message.slice(0, 12)}`}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 1,
                  mb: 1.5,
                  justifyContent: isSender ? 'flex-end' : 'flex-start',
                }}
              >
                {!isSender ? (
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                    aria-hidden
                  >
                    <SmartToyIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                ) : null}

                <Box
                  sx={{
                    maxWidth: '70%',
                    px: 2,
                    py: 1.5,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    borderRadius: isSender ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    bgcolor: isSender ? tokens.userBubble : tokens.assistantBubble,
                    color: isSender ? '#fff' : 'text.primary',
                  }}
                >
                  {message.message}
                </Box>

                {isSender ? (
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                    aria-hidden
                  >
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                ) : null}
              </Box>
            )
          })}

          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }} aria-hidden>
                <SmartToyIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box
                sx={{
                  borderRadius: '16px 16px 16px 4px',
                  bgcolor: tokens.assistantBubble,
                }}
              >
                <TypingIndicator />
              </Box>
            </Box>
          ) : null}
        </Box>
      )}
    </Card>
  )
}
