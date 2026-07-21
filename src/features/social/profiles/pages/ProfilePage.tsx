import { useCallback, useEffect } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useAuthStore } from '@core/auth/auth.store'
import { CreatePostForm } from '@features/social/posts/components/CreatePostForm'
import { EmptyState } from '@features/social/posts/components/EmptyState'
import { PostListSkeleton } from '@features/social/posts/components/PostListSkeleton'
import { SocialPostCard } from '@features/social/posts/components/SocialPostCard'
import { Trends } from '@features/social/posts/components/Trends'
import { usePageBottomScroll } from '@features/social/posts/hooks/usePageBottomScroll'
import { SOCIAL_DEFAULT_AVATAR } from '@features/social/profiles/api/profile.models'
import { PeopleYouMayKnow } from '@features/social/profiles/components/PeopleYouMayKnow'
import { ProfilePageLayout } from '@features/social/profiles/components/ProfilePageLayout'
import { openChatForProfileSlug, resolveProfileSlug } from '@features/social/profiles/profile-chat.utils'
import {
  canSendFriendshipRequestFromPages,
  flattenProfilePostPages,
  profileFromPages,
  useCurrentSocialUser,
  useProfilePosts,
  useSendFriendRequest,
} from '@features/social/profiles/hooks/useProfile'

export function ProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { data: currentUser } = useCurrentSocialUser()
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useProfilePosts(slug)
  const sendFriendRequest = useSendFriendRequest(resolveProfileSlug(slug))

  const posts = flattenProfilePostPages(data)
  const profile = profileFromPages(data)
  const canSendFriendshipRequest = canSendFriendshipRequestFromPages(data)
  const isOwnProfile = Boolean(currentUser && profile && currentUser.id === profile.id)
  const profileName = profile
    ? profile.full_name || `${profile.first_name} ${profile.last_name}`
    : ''

  useEffect(() => {
    if (profileName) {
      document.title = `${profileName} | Social Network`
    }
  }, [profileName])

  const onReachBottom = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  usePageBottomScroll(onReachBottom, Boolean(hasNextPage))

  const handleSendMessage = () => {
    void openChatForProfileSlug(slug, (path) => {
      void navigate(path)
    })
  }

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
                sx={{
                  width: { xs: 96, sm: 120 },
                  height: { xs: 96, sm: 120 },
                  mx: 'auto',
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {profileName}
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
                {profile.slug ? (
                  <Typography
                    component={RouterLink}
                    to={`/social/profile/${profile.slug}/friends`}
                    variant="body2"
                    sx={{ color: 'info.main', textDecoration: 'none' }}
                  >
                    {profile.friends_count} friends
                  </Typography>
                ) : null}
                <Typography variant="body2">{profile.posts_count} posts</Typography>
              </Box>

              {canSendFriendshipRequest === 'rejected' ? (
                <Typography variant="body2" color="text.secondary">
                  The friend request was rejected. Please try again later...
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {!isOwnProfile && canSendFriendshipRequest ? (
                    <Button
                      variant="contained"
                      onClick={() => sendFriendRequest.mutate()}
                      disabled={sendFriendRequest.isPending}
                    >
                      Add as Friend
                    </Button>
                  ) : null}
                  {!isOwnProfile ? (
                    <Button variant="outlined" onClick={handleSendMessage}>
                      Send Message
                    </Button>
                  ) : null}
                  {isOwnProfile ? (
                    <Button
                      component={RouterLink}
                      to="/social/profile/edit"
                      variant="contained"
                    >
                      Edit Profile
                    </Button>
                  ) : null}
                </Box>
              )}
            </CardContent>
          </Card>
        ) : null
      }
      main={
        <>
          {isOwnProfile ? <CreatePostForm /> : null}

          {isPending && !posts.length ? (
            <PostListSkeleton />
          ) : (
            <>
              {posts.map((post) => (
                <SocialPostCard key={post.id} post={post} />
              ))}
              {!isPending && !isFetchingNextPage && !posts.length && profile ? (
                <EmptyState title="No posts yet." />
              ) : null}
            </>
          )}

          {isFetchingNextPage ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={40} />
            </Box>
          ) : null}
        </>
      }
      widgets={
        <>
          {isAuthenticated ? <PeopleYouMayKnow /> : null}
          <Trends />
        </>
      }
    />
  )
}
