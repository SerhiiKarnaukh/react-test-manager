import { api } from '@core/http/axios'

const BASE_URL = '/api/social-posts'

export const SOCIAL_DEFAULT_AVATAR =
  'https://doodleipsum.com/700/avatar-4?i=be176fd7d38de78c85dbfba873eb723a'

export type SocialPostAuthor = {
  id: number
  slug: string
  first_name: string
  last_name: string
  avatar_url: string | null
}

export type SocialPostAttachment = {
  id: number
  image_url: string
}

export type SocialPost = {
  id: number
  body: string
  created_at_formatted: string
  likes_count: number
  comments_count: number
  is_private: boolean
  created_by: SocialPostAuthor
  attachments: SocialPostAttachment[]
}

export type SocialComment = {
  id: number
  body: string
  created_at_formatted: string
  created_by: SocialPostAuthor
}

export type SocialPostDetail = SocialPost & {
  comments: SocialComment[]
}

export type SocialTrend = {
  id: string
  hashtag: string
  occurences: number
}

export type SocialSearchProfile = {
  id: number
  slug: string
  first_name: string
  last_name: string
  avatar_url: string | null
  friends_count: number
  posts_count: number
}

export type PaginatedPostsPayload = {
  results: { posts: SocialPost[] }
  next: string | null
}

export type SocialViewedProfile = {
  id: number
  slug: string
  first_name: string
  last_name: string
  full_name?: string
  avatar_url: string | null
  friends_count: number
  posts_count: number
}

export type ProfilePostsPayload = {
  results: {
    posts: SocialPost[]
    profile: SocialViewedProfile
    can_send_friendship_request: boolean | string
  }
  next: string | null
}

export type SearchPostsPayload = {
  results: {
    posts: SocialPost[]
    profiles: SocialSearchProfile[]
  }
  next: string | null
}

export type PostDetailResponse = {
  post: SocialPostDetail
}

export type LikePostResponse = {
  message: string
}

export type SelectedPostImage = {
  url: string
  file: File
}

export const EMPTY_SOCIAL_POST_DETAIL: SocialPostDetail = {
  id: 0,
  body: '',
  created_at_formatted: '',
  likes_count: 0,
  comments_count: 0,
  is_private: false,
  created_by: {
    id: 0,
    slug: '',
    first_name: '',
    last_name: '',
    avatar_url: null,
  },
  attachments: [],
  comments: [],
}

/** Convert absolute pagination URL to path+search for same-origin axios calls. */
export function getPathAndSearch(url: string): string {
  const urlObject = new URL(url)
  return urlObject.pathname + urlObject.search
}

export async function fetchFeed(pageUrl?: string | null): Promise<PaginatedPostsPayload> {
  if (pageUrl) {
    const { data } = await api.get<PaginatedPostsPayload>(getPathAndSearch(pageUrl))
    return data
  }
  const { data } = await api.get<PaginatedPostsPayload>(`${BASE_URL}/`)
  return data
}

export async function fetchTrendPosts(
  trendId: string,
  pageUrl?: string | null,
): Promise<PaginatedPostsPayload> {
  if (pageUrl) {
    const { data } = await api.get<PaginatedPostsPayload>(getPathAndSearch(pageUrl))
    return data
  }
  const { data } = await api.get<PaginatedPostsPayload>(`${BASE_URL}/`, {
    params: { trend: trendId },
  })
  return data
}

export async function fetchProfilePosts(
  profileSlug: string,
  pageUrl?: string | null,
): Promise<ProfilePostsPayload> {
  if (pageUrl) {
    const { data } = await api.get<ProfilePostsPayload>(getPathAndSearch(pageUrl))
    return data
  }
  const { data } = await api.get<ProfilePostsPayload>(`${BASE_URL}/profile/${profileSlug}/`)
  return data
}

export async function fetchPost(postId: string): Promise<PostDetailResponse> {
  const { data } = await api.get<PostDetailResponse>(`${BASE_URL}/${postId}/`)
  return data
}

export async function createPost(formData: FormData): Promise<SocialPost> {
  const { data } = await api.post<SocialPost>(`${BASE_URL}/create/`, formData, {
    headers: { 'Content-Type': undefined },
  })
  return data
}

export async function addComment(postId: string, body: string): Promise<SocialComment> {
  const { data } = await api.post<SocialComment>(`${BASE_URL}/${postId}/comment/`, { body })
  return data
}

export async function searchPosts(query: string): Promise<SearchPostsPayload> {
  const { data } = await api.post<SearchPostsPayload>(`${BASE_URL}/search/`, { query })
  return data
}

export async function fetchSearchPage(
  pageUrl: string,
  query: string,
): Promise<SearchPostsPayload> {
  const urlObject = new URL(pageUrl, window.location.origin)
  const params = new URLSearchParams(urlObject.search)
  params.set('query', query)
  const { data } = await api.get<SearchPostsPayload>(
    `${urlObject.pathname}?${params.toString()}`,
  )
  return data
}

export async function fetchTrends(): Promise<SocialTrend[]> {
  const { data } = await api.get<SocialTrend[]>(`${BASE_URL}/trends/`)
  return data
}

export async function likePost(postId: number): Promise<LikePostResponse> {
  const { data } = await api.post<LikePostResponse>(`${BASE_URL}/${postId}/like/`, {})
  return data
}

export async function reportPost(postId: number): Promise<unknown> {
  const { data } = await api.post(`${BASE_URL}/${postId}/report/`, {})
  return data
}

export async function deletePost(postId: number): Promise<unknown> {
  const { data } = await api.delete(`${BASE_URL}/${postId}/delete/`)
  return data
}
