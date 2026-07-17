import { useEffect, useState, type FormEvent } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { SOCIAL_DEFAULT_AVATAR } from '@features/social/profiles/api/profile.models'
import { useCurrentSocialUser } from '@features/social/profiles/hooks/useProfile'
import {
  useConversation,
  useConversations,
  useSendChatMessage,
} from '@features/social/chat/hooks/useChat'
import { useChatSocket } from '@features/social/chat/hooks/useChatSocket'
import type { SocialChatUser, SocialConversationListItem } from '@features/social/chat/api/chat'

function otherUsers(conversation: SocialConversationListItem, currentUserId: number | undefined) {
  return conversation.users.filter((user) => user.id !== currentUserId)
}

function otherUserName(user: SocialChatUser) {
  return `${user.first_name} ${user.last_name}`
}

const fullWidthCardSx = {
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
} as const

export function ChatPage() {
  const { data: currentUser } = useCurrentSocialUser()
  const { data: conversations = [], isPending } = useConversations(Boolean(currentUser?.id))
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messageBody, setMessageBody] = useState('')

  useEffect(() => {
    document.title = 'Chat | Social Network'
  }, [])

  useEffect(() => {
    if (!conversations.length) {
      setActiveId(null)
      return
    }
    setActiveId((current) => {
      if (current && conversations.some((c) => c.id === current)) return current
      return conversations[0]?.id ?? null
    })
  }, [conversations])

  const { data: activeConversation } = useConversation(activeId)
  const sendMessage = useSendChatMessage(activeId)
  useChatSocket(activeId, currentUser?.id)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = messageBody.trim()
    if (!trimmed || !activeId) return
    sendMessage.mutate(trimmed, {
      onSuccess: () => setMessageBody(''),
    })
  }

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={40} />
      </Box>
    )
  }

  if (!conversations.length) {
    return (
      <Box sx={{ maxWidth: 1600, width: '100%', mx: 'auto', px: 2, py: 3 }}>
        <Card variant="outlined" sx={fullWidthCardSx}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5">You have no active conversations!</Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  const messages = activeConversation?.messages ?? []

  return (
    <Box
      sx={{
        maxWidth: 1600,
        width: '100%',
        mx: 'auto',
        px: { xs: 1.5, sm: 2 },
        py: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          width: '100%',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(280px, 1fr) minmax(0, 2fr)',
          },
          alignItems: 'stretch',
        }}
      >
        <Box
          component="aside"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            width: '100%',
            minWidth: 0,
          }}
        >
          {conversations.map((conversation) => {
            const peers = otherUsers(conversation, currentUser?.id)
            const isActive = conversation.id === activeId
            return (
              <Card
                key={conversation.id}
                variant="outlined"
                onClick={() => setActiveId(conversation.id)}
                sx={{
                  ...fullWidthCardSx,
                  cursor: 'pointer',
                  outline: isActive ? '2px solid' : 'none',
                  outlineColor: 'primary.main',
                }}
              >
                <CardContent>
                  {peers.map((user) => (
                    <Box
                      key={user.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '50px 1fr',
                        gap: 1.5,
                        alignItems: 'center',
                      }}
                    >
                      <Avatar
                        src={user.avatar_url ?? SOCIAL_DEFAULT_AVATAR}
                        alt={otherUserName(user)}
                        sx={{ width: 50, height: 50 }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700 }}>{otherUserName(user)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {conversation.modified_at_formatted} ago
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </Box>

        <Box
          component="section"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            width: '100%',
            minWidth: 0,
          }}
        >
          {messages.length > 0 ? (
            <Card variant="outlined" sx={fullWidthCardSx}>
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {messages.map((message) => {
                  const isSender = message.created_by.id === currentUser?.id
                  return (
                    <Box
                      key={message.id}
                      sx={{
                        alignSelf: isSender ? 'flex-end' : 'flex-start',
                        width: '70%',
                        maxWidth: '70%',
                        boxSizing: 'border-box',
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: isSender ? 'primary.light' : 'action.hover',
                        color: isSender ? 'primary.contrastText' : 'text.primary',
                        textAlign: isSender ? 'right' : 'left',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                          justifyContent: isSender ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Avatar
                          src={message.created_by.avatar_url ?? SOCIAL_DEFAULT_AVATAR}
                          alt={message.created_by.first_name}
                          sx={{ width: 40, height: 40 }}
                        />
                        <Typography sx={{ fontWeight: 700 }}>
                          {message.created_by.first_name}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                          mb: 1,
                        }}
                      >
                        {message.body}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {message.created_at_formatted} ago
                      </Typography>
                    </Box>
                  )
                })}
              </CardContent>
            </Card>
          ) : null}

          <Card variant="outlined" sx={fullWidthCardSx}>
            <Box component="form" onSubmit={handleSubmit}>
              <CardContent>
                <TextField
                  label="What do you want to say?"
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  required
                />
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!messageBody.trim() || sendMessage.isPending}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
