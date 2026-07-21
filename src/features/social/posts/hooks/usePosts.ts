import { useEffect } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import { useAlertStore } from '@core/alert/alert.store'
import {
  addComment,
  createPost,
  deletePost,
  fetchFeed,
  fetchPost,
  fetchSearchPage,
  fetchTrendPosts,
  fetchTrends,
  likePost,
  reportPost,
  searchPosts,
  type PaginatedPostsPayload,
  type SearchPostsPayload,
  type SocialPost,
  type SocialPostDetail,
} from '@features/social/posts/api/posts'
import { getErrorMessage } from '@shared/utils/error'

const feedKey = ['social', 'posts', 'feed'] as const
const trendsKey = ['social', 'posts', 'trends'] as const

function postDetailKey(postId: string) {
  return ['social', 'posts', 'detail', postId] as const
}

function trendPostsKey(trendId: string) {
  return ['social', 'posts', 'trend', trendId] as const
}

function searchKey(query: string) {
  return ['social', 'posts', 'search', query] as const
}

function useQueryErrorAlert(isError: boolean, error: Error | null, fallback: string) {
  const enqueue = useAlertStore((s) => s.enqueue)

  useEffect(() => {
    if (isError) {
      enqueue('error', getErrorMessage(error, fallback))
    }
  }, [isError, error, enqueue, fallback])
}

function mapPostsInPages(
  data: InfiniteData<PaginatedPostsPayload> | undefined,
  mapper: (post: SocialPost) => SocialPost,
): InfiniteData<PaginatedPostsPayload> | undefined {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      results: {
        ...page.results,
        posts: page.results.posts.map(mapper),
      },
    })),
  }
}

function filterPostsInPages(
  data: InfiniteData<PaginatedPostsPayload> | undefined,
  postId: number,
): InfiniteData<PaginatedPostsPayload> | undefined {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      results: {
        ...page.results,
        posts: page.results.posts.filter((post) => post.id !== postId),
      },
    })),
  }
}

function mapSearchPages(
  data: InfiniteData<SearchPostsPayload> | undefined,
  mapper: (post: SocialPost) => SocialPost,
): InfiniteData<SearchPostsPayload> | undefined {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      results: {
        ...page.results,
        posts: page.results.posts.map(mapper),
      },
    })),
  }
}

function filterSearchPages(
  data: InfiniteData<SearchPostsPayload> | undefined,
  postId: number,
): InfiniteData<SearchPostsPayload> | undefined {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      results: {
        ...page.results,
        posts: page.results.posts.filter((post) => post.id !== postId),
      },
    })),
  }
}

export function usePostsFeed() {
  const query = useInfiniteQuery({
    queryKey: feedKey,
    queryFn: ({ pageParam }) => fetchFeed(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load feed')

  return query
}

export function useTrendPosts(trendId: string | undefined) {
  const query = useInfiniteQuery({
    queryKey: trendPostsKey(trendId ?? ''),
    queryFn: ({ pageParam }) => fetchTrendPosts(trendId!, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    enabled: Boolean(trendId),
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load trend posts')

  return query
}

export function usePostSearch(queryText: string) {
  const trimmedQuery = queryText.trim()
  const query = useInfiniteQuery({
    queryKey: searchKey(trimmedQuery),
    queryFn: ({ pageParam }) => {
      if (!pageParam) return searchPosts(trimmedQuery)
      return fetchSearchPage(pageParam, trimmedQuery)
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    enabled: Boolean(trimmedQuery),
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to search')

  return query
}

export function usePostDetail(postId: string | undefined) {
  const query = useQuery({
    queryKey: postDetailKey(postId ?? ''),
    queryFn: () => fetchPost(postId!),
    enabled: Boolean(postId),
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load post')

  return query
}

export function useTrends() {
  const query = useQuery({
    queryKey: trendsKey,
    queryFn: fetchTrends,
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load trends')

  return query
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.setQueryData<InfiniteData<PaginatedPostsPayload>>(feedKey, (old) => {
        if (!old?.pages.length) {
          return {
            pages: [{ results: { posts: [post] }, next: null }],
            pageParams: [null],
          }
        }
        const [first, ...rest] = old.pages
        return {
          ...old,
          pages: [
            {
              ...first,
              results: { ...first.results, posts: [post, ...first.results.posts] },
            },
            ...rest,
          ],
        }
      })
    },
    onError: (error) => {
      enqueue('error', getErrorMessage(error, 'Failed to create post'))
    },
  })
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient()
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: (body: string) => addComment(postId, body),
    onSuccess: (comment) => {
      queryClient.setQueryData<{ post: SocialPostDetail }>(postDetailKey(postId), (old) => {
        if (!old?.post) return old
        return {
          post: {
            ...old.post,
            comments: [...old.post.comments, comment],
            comments_count: old.post.comments_count + 1,
          },
        }
      })
    },
    onError: (error) => {
      enqueue('error', getErrorMessage(error, 'Failed to add comment'))
    },
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: likePost,
    onSuccess: (response, postId) => {
      if (response.message !== 'like created') return

      const bump = (post: SocialPost): SocialPost =>
        post.id === postId ? { ...post, likes_count: post.likes_count + 1 } : post

      queryClient.setQueryData<InfiniteData<PaginatedPostsPayload>>(feedKey, (old) =>
        mapPostsInPages(old, bump),
      )
      queryClient.setQueriesData<InfiniteData<PaginatedPostsPayload>>(
        { queryKey: ['social', 'posts', 'trend'] },
        (old) => mapPostsInPages(old, bump),
      )
      queryClient.setQueriesData<InfiniteData<SearchPostsPayload>>(
        { queryKey: ['social', 'posts', 'search'] },
        (old) => mapSearchPages(old, bump),
      )
      queryClient.setQueriesData<{ post: SocialPostDetail }>(
        { queryKey: ['social', 'posts', 'detail'] },
        (old) =>
          old?.post?.id === postId
            ? { post: { ...old.post, likes_count: old.post.likes_count + 1 } }
            : old,
      )
    },
    onError: () => {
      enqueue('error', 'You must be logged in!')
    },
  })
}

export function useReportPost() {
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: reportPost,
    onSuccess: () => {
      enqueue('success', 'The post was reported')
    },
    onError: (error) => {
      enqueue('error', getErrorMessage(error, 'Failed to report post'))
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['social', 'posts'] })

      queryClient.setQueryData<InfiniteData<PaginatedPostsPayload>>(feedKey, (old) =>
        filterPostsInPages(old, postId),
      )
      queryClient.setQueriesData<InfiniteData<PaginatedPostsPayload>>(
        { queryKey: ['social', 'posts', 'trend'] },
        (old) => filterPostsInPages(old, postId),
      )
      queryClient.setQueriesData<InfiniteData<SearchPostsPayload>>(
        { queryKey: ['social', 'posts', 'search'] },
        (old) => filterSearchPages(old, postId),
      )
      queryClient.setQueriesData<{ post: SocialPostDetail }>(
        { queryKey: ['social', 'posts', 'detail'] },
        (old) => (old?.post.id === postId ? undefined : old),
      )
    },
    onSuccess: () => {
      enqueue('success', 'The post was deleted')
    },
    onError: (error) => {
      enqueue('error', getErrorMessage(error, 'Failed to delete post'))
      void queryClient.invalidateQueries({ queryKey: ['social', 'posts'] })
    },
  })
}

/** Flatten infinite feed/trend pages into a single post list. */
export function flattenPostPages(
  data: InfiniteData<PaginatedPostsPayload> | undefined,
): SocialPost[] {
  return data?.pages.flatMap((page) => page.results.posts) ?? []
}

export function flattenSearchPosts(
  data: InfiniteData<SearchPostsPayload> | undefined,
): SocialPost[] {
  return data?.pages.flatMap((page) => page.results.posts) ?? []
}

/** Profiles from the latest search page (Angular overwrites on each page). */
export function latestSearchProfiles(data: InfiniteData<SearchPostsPayload> | undefined) {
  if (!data?.pages.length) return []
  return data.pages[data.pages.length - 1]?.results.profiles ?? []
}

export function resolvePostId(postId: string | undefined) {
  return postId ?? ''
}
