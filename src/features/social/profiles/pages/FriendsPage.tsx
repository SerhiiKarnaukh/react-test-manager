import { useEffect } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { EmptyState } from '@features/social/posts/components/EmptyState'
import { PostListSkeleton } from '@features/social/posts/components/PostListSkeleton'
import { Trends } from '@features/social/posts/components/Trends'
import { SOCIAL_DEFAULT_AVATAR } from '@features/social/profiles/api/profile.models'
import { PeopleYouMayKnow } from '@features/social/profiles/components/PeopleYouMayKnow'
import { ProfilePageLayout } from '@features/social/profiles/components/ProfilePageLayout'
import {
  useCurrentSocialUser,
  useFriendsData,
  useHandleFriendRequest,
} from '@features/social/profiles/hooks/useProfile'

export function FriendsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: currentUser } = useCurrentSocialUser()
  const { data, isPending } = useFriendsData(slug)
  const handleRequest = useHandleFriendRequest(currentUser?.slug)

  const profile = data?.user
  const friends = data?.friends ?? []
  const requests = data?.requests ?? []
  const profileName = profile
    ? profile.full_name || `${profile.first_name} ${profile.last_name}`
    : ''

  useEffect(() => {
    document.title = 'Friends | Social Network'
  }, [])

  return (
    <ProfilePageLayout
      sidebar={
        isPending && !profile ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : profile ? (
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={profile.avatar_url ?? SOCIAL_DEFAULT_AVATAR}
                alt={profileName}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {profileName}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, color: 'text.secondary' }}>
                <Typography variant="body2">{profile.friends_count} friends</Typography>
                <Typography variant="body2">{profile.posts_count} posts</Typography>
              </Box>
            </CardContent>
          </Card>
        ) : null
      }
      main={
        isPending ? (
          <PostListSkeleton count={2} />
        ) : (
          <>
            {requests.length > 0 ? (
              <Card variant="outlined">
                <CardHeader title="Friendship requests" />
                <CardContent>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                      },
                      gap: 2,
                    }}
                  >
                    {requests.map((request) => (
                      <Card key={request.id} variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Avatar
                            src={request.created_by.avatar_url ?? SOCIAL_DEFAULT_AVATAR}
                            alt={request.created_by.first_name}
                            sx={{ width: 96, height: 96, mx: 'auto', mb: 1 }}
                          />
                          <Typography
                            component={RouterLink}
                            to={`/social/profile/${request.created_by.slug}`}
                            sx={{
                              color: 'info.main',
                              textDecoration: 'none',
                              fontWeight: 700,
                              display: 'block',
                              mb: 1,
                            }}
                          >
                            {request.created_by.first_name} {request.created_by.last_name}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: 2,
                              mb: 2,
                              color: 'text.secondary',
                            }}
                          >
                            <Typography variant="body2">
                              {request.created_by.friends_count} friends
                            </Typography>
                            <Typography variant="body2">
                              {request.created_by.posts_count} posts
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() =>
                                handleRequest.mutate({
                                  slug: request.created_by.slug,
                                  status: 'accepted',
                                })
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleRequest.mutate({
                                  slug: request.created_by.slug,
                                  status: 'rejected',
                                })
                              }
                            >
                              Reject
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ) : null}

            {friends.length > 0 ? (
              <Card variant="outlined">
                <CardHeader title="Friends" />
                <CardContent>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                      },
                      gap: 2,
                    }}
                  >
                    {friends.map((user) => (
                      <Card key={user.id} variant="outlined">
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Avatar
                            src={user.avatar_url ?? SOCIAL_DEFAULT_AVATAR}
                            alt={user.first_name}
                            sx={{ width: 96, height: 96, mx: 'auto', mb: 1 }}
                          />
                          <Typography
                            component={RouterLink}
                            to={`/social/profile/${user.slug}`}
                            sx={{
                              color: 'info.main',
                              textDecoration: 'none',
                              fontWeight: 700,
                              display: 'block',
                              mb: 1,
                            }}
                          >
                            {user.first_name} {user.last_name}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: 2,
                              color: 'text.secondary',
                            }}
                          >
                            <Typography variant="body2">{user.friends_count} friends</Typography>
                            <Typography variant="body2">{user.posts_count} posts</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ) : null}

            {!requests.length && !friends.length ? (
              <EmptyState
                title="No friends yet."
                message="Connect with people you may know."
              />
            ) : null}
          </>
        )
      }
      widgets={
        <>
          <PeopleYouMayKnow />
          <Trends />
        </>
      }
    />
  )
}
