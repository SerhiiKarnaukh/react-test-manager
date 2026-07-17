import { useEffectEvent } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { EmptyState } from '@features/social/posts/components/EmptyState'
import { PostListSkeleton } from '@features/social/posts/components/PostListSkeleton'
import { SocialPageLayout } from '@features/social/posts/components/SocialPageLayout'
import { SocialPostCard } from '@features/social/posts/components/SocialPostCard'
import { Trends } from '@features/social/posts/components/Trends'
import { PeopleYouMayKnow } from '@features/social/profiles/components/PeopleYouMayKnow'
import { usePageBottomScroll } from '@features/social/posts/hooks/usePageBottomScroll'
import { flattenPostPages, useTrendPosts } from '@features/social/posts/hooks/usePosts'

export function TrendPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useTrendPosts(id)
  const posts = flattenPostPages(data)

  const onReachBottom = useEffectEvent(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  usePageBottomScroll(onReachBottom, Boolean(hasNextPage))

  return (
    <SocialPageLayout
      main={
        <>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
            Trend: #{id}
          </Typography>

          {isPending && !posts.length ? (
            <PostListSkeleton />
          ) : (
            <>
              {posts.map((post) => (
                <SocialPostCard key={post.id} post={post} />
              ))}
              {!isPending && !isFetchingNextPage && !posts.length ? (
                <EmptyState title="No posts for this trend yet." />
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
