import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { EmptyState } from '@features/social/posts/components/EmptyState'
import { PostListSkeleton } from '@features/social/posts/components/PostListSkeleton'
import { SocialPageLayout } from '@features/social/posts/components/SocialPageLayout'
import { Trends } from '@features/social/posts/components/Trends'
import { PeopleYouMayKnow } from '@features/social/profiles/components/PeopleYouMayKnow'
import {
  useMarkNotificationRead,
  useNotifications,
} from '@features/social/notifications/hooks/useNotifications'

export function NotificationsPage() {
  const { data: notifications = [], isPending } = useNotifications()
  const markRead = useMarkNotificationRead()

  useEffect(() => {
    document.title = 'Notifications | Social Network'
  }, [])

  return (
    <SocialPageLayout
      main={
        isPending ? (
          <PostListSkeleton count={2} />
        ) : notifications.length ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.map((notification) => (
              <Card key={notification.id} variant="outlined">
                <CardContent
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Typography sx={{ flex: '1 1 200px' }}>{notification.body}</Typography>
                  <Button
                    variant="contained"
                    onClick={() => markRead.mutate(notification)}
                    disabled={markRead.isPending}
                  >
                    Read more
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <EmptyState title="You don't have any unread notifications!" />
        )
      }
      sidebar={
        <>
          <PeopleYouMayKnow />
          <Trends />
        </>
      }
    />
  )
}
