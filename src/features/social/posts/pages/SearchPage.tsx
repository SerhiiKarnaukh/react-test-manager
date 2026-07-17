import { useEffectEvent, useState, type FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { SOCIAL_DEFAULT_AVATAR } from '@features/social/posts/api/posts'
import { EmptyState } from '@features/social/posts/components/EmptyState'
import { PostListSkeleton } from '@features/social/posts/components/PostListSkeleton'
import { SocialPageLayout } from '@features/social/posts/components/SocialPageLayout'
import { SocialPostCard } from '@features/social/posts/components/SocialPostCard'
import { Trends } from '@features/social/posts/components/Trends'
import { PeopleYouMayKnow } from '@features/social/profiles/components/PeopleYouMayKnow'
import { usePageBottomScroll } from '@features/social/posts/hooks/usePageBottomScroll'
import {
  flattenSearchPosts,
  latestSearchProfiles,
  usePostSearch,
} from '@features/social/posts/hooks/usePosts'

export function SearchPage() {
  const [inputQuery, setInputQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isFetching,
  } = usePostSearch(submittedQuery)

  const posts = flattenSearchPosts(data)
  const profiles = latestSearchProfiles(data)
  const hasSearched = submittedQuery.length > 0
  const showSkeleton = hasSearched && isPending && !data

  const onReachBottom = useEffectEvent(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  usePageBottomScroll(onReachBottom, Boolean(hasNextPage))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubmittedQuery(inputQuery.trim())
  }

  return (
    <SocialPageLayout
      main={
        <>
          <Card variant="outlined">
            <CardContent>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <TextField
                  label="What are you looking for?"
                  type="search"
                  value={inputQuery}
                  onChange={(event) => setInputQuery(event.target.value)}
                  sx={{ flex: '1 1 240px' }}
                />
                <Button variant="contained" type="submit" disabled={isFetching && !isFetchingNextPage}>
                  Search
                </Button>
              </Box>
            </CardContent>
          </Card>

          {showSkeleton ? (
            <PostListSkeleton />
          ) : (
            <>
              {profiles.length > 0 ? (
                <Card variant="outlined">
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
                      {profiles.map((profile) => (
                        <Card key={profile.id} variant="outlined">
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Avatar
                              src={profile.avatar_url ?? SOCIAL_DEFAULT_AVATAR}
                              alt={profile.first_name}
                              sx={{ width: 72, height: 72, mx: 'auto', mb: 1 }}
                            />
                            <Typography
                              component={RouterLink}
                              to={`/social/profile/${profile.slug}`}
                              sx={{
                                color: 'info.main',
                                textDecoration: 'none',
                                fontWeight: 700,
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              {profile.first_name} {profile.last_name}
                            </Typography>
                            <Box
                              sx={{
                                mt: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 2,
                                color: 'text.secondary',
                              }}
                            >
                              <Typography variant="body2">
                                {profile.friends_count} friends
                              </Typography>
                              <Typography variant="body2">
                                {profile.posts_count} posts
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ) : null}

              {posts.map((post) => (
                <SocialPostCard key={post.id} post={post} />
              ))}

              {hasSearched && !profiles.length && !posts.length && !isPending ? (
                <EmptyState title="Nothing was found." />
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
      sidebar={
        <>
          <PeopleYouMayKnow />
          <Trends />
        </>
      }
    />
  )
}
