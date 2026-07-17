import { useEffectEvent } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuthStore } from '@core/auth/auth.store'
import { CreatePostForm } from '@features/social/posts/components/CreatePostForm'
import { EmptyState } from '@features/social/posts/components/EmptyState'
import { PostListSkeleton } from '@features/social/posts/components/PostListSkeleton'
import { SocialPageLayout } from '@features/social/posts/components/SocialPageLayout'
import { SocialPostCard } from '@features/social/posts/components/SocialPostCard'
import { Trends } from '@features/social/posts/components/Trends'
import { usePageBottomScroll } from '@features/social/posts/hooks/usePageBottomScroll'
import { flattenPostPages, usePostsFeed } from '@features/social/posts/hooks/usePosts'

export function FeedHomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = usePostsFeed()
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
          {isAuthenticated ? <CreatePostForm /> : null}

          {isPending && !posts.length ? (
            <PostListSkeleton />
          ) : (
            <>
              {posts.map((post) => (
                <SocialPostCard key={post.id} post={post} />
              ))}
              {!isPending && !isFetchingNextPage && !posts.length ? (
                <EmptyState
                  title="No posts yet."
                  message="Be the first to share something!"
                />
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
      sidebar={<Trends />}
    />
  )
}
