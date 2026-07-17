import { useEffect } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAlertStore } from '@core/alert/alert.store'
import { useAuthStore } from '@core/auth/auth.store'
import {
  changePassword,
  fetchFriendSuggestions,
  fetchFriendsData,
  fetchMe,
  handleFriendRequest,
  sendFriendRequest,
  updateProfile,
} from '@features/social/profiles/api/profile'
import type { SocialUser } from '@features/social/profiles/api/profile.models'
import { useProfileStore } from '@features/social/profiles/store/profile.store'
import {
  fetchProfilePosts,
  type ProfilePostsPayload,
} from '@features/social/posts/api/posts'
import { getErrorMessage } from '@shared/utils/error'

export const meKey = ['social', 'profiles', 'me'] as const
const suggestionsKey = ['social', 'profiles', 'suggestions'] as const

function friendsKey(slug: string) {
  return ['social', 'profiles', 'friends', slug] as const
}

function profilePostsKey(slug: string) {
  return ['social', 'posts', 'profile', slug] as const
}

function useQueryErrorAlert(isError: boolean, error: Error | null, fallback: string) {
  const enqueue = useAlertStore((s) => s.enqueue)

  useEffect(() => {
    if (isError) {
      enqueue('error', getErrorMessage(error, fallback))
    }
  }, [isError, error, enqueue, fallback])
}

export function useCurrentSocialUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const setUserInfo = useProfileStore((s) => s.setUserInfo)
  const logout = useAuthStore((s) => s.logout)
  const clearUserState = useProfileStore((s) => s.clearUserState)
  const navigate = useNavigate()
  const enqueue = useAlertStore((s) => s.enqueue)

  const query = useQuery({
    queryKey: meKey,
    queryFn: fetchMe,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (query.data) {
      setUserInfo(query.data)
    }
  }, [query.data, setUserInfo])

  useEffect(() => {
    if (!query.isError) return
    if (isAxiosError(query.error) && query.error.response?.status === 404) {
      logout()
      clearUserState()
      const message = (query.error.response.data as { message?: string })?.message
      enqueue('error', message ?? 'User not found')
      void navigate('/social/login', { replace: true })
    }
  }, [query.isError, query.error, logout, clearUserState, enqueue, navigate])

  const storeUser = useProfileStore((s) => s.user)
  return {
    ...query,
    data: query.data ?? storeUser ?? undefined,
  }
}

export function useProfilePosts(profileSlug: string | undefined) {
  const query = useInfiniteQuery({
    queryKey: profilePostsKey(profileSlug ?? ''),
    queryFn: ({ pageParam }) => fetchProfilePosts(profileSlug ?? '', pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    enabled: Boolean(profileSlug),
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load profile posts')

  return query
}

export function useFriendsData(userSlug: string | undefined) {
  const query = useQuery({
    queryKey: friendsKey(userSlug ?? ''),
    queryFn: () => fetchFriendsData(userSlug ?? ''),
    enabled: Boolean(userSlug),
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load friends')

  return query
}

export function useFriendSuggestions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return useQuery({
    queryKey: suggestionsKey,
    queryFn: fetchFriendSuggestions,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

export function useSendFriendRequest(profileSlug: string) {
  const queryClient = useQueryClient()
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: () => sendFriendRequest(profileSlug),
    onSuccess: (response) => {
      if (response.message === 'request already sent') {
        enqueue('error', 'The request has already been sent!')
        return
      }
      enqueue('success', 'The request was sent!')
      queryClient.setQueriesData<InfiniteData<ProfilePostsPayload>>(
        { queryKey: ['social', 'posts', 'profile', profileSlug] },
        (old) => {
          if (!old?.pages?.length) return old
          const [first, ...rest] = old.pages
          return {
            ...old,
            pages: [
              {
                ...first,
                results: {
                  ...first.results,
                  can_send_friendship_request: false,
                },
              },
              ...rest,
            ],
          }
        },
      )
    },
    onError: () => {
      enqueue('error', 'You must be logged in!')
    },
  })
}

export function useHandleFriendRequest(currentUserSlug: string | undefined) {
  const queryClient = useQueryClient()
  const enqueue = useAlertStore((s) => s.enqueue)

  return useMutation({
    mutationFn: ({ slug, status }: { slug: string; status: 'accepted' | 'rejected' }) =>
      handleFriendRequest(slug, status),
    onSuccess: async () => {
      if (currentUserSlug) {
        await queryClient.invalidateQueries({ queryKey: friendsKey(currentUserSlug) })
      }
    },
    onError: (error) => {
      enqueue('error', getErrorMessage(error, 'Failed to update friend request'))
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUserInfo = useProfileStore((s) => s.setUserInfo)
  const enqueue = useAlertStore((s) => s.enqueue)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (response, formData) => {
      if (response.message !== 'Information updated successfully') {
        enqueue('error', response.message)
        return
      }

      enqueue('success', response.message)

      const currentUser = useProfileStore.getState().user
      if (!currentUser) return

      const updatedUser: SocialUser = {
        id: currentUser.id,
        username: String(formData.get('username') ?? currentUser.username),
        first_name: String(formData.get('first_name') ?? currentUser.first_name),
        last_name: String(formData.get('last_name') ?? currentUser.last_name),
        email: String(formData.get('email') ?? currentUser.email),
        slug: response.new_slug,
        full_name: `${String(formData.get('first_name'))} ${String(formData.get('last_name'))}`,
        avatar_url: response.new_avatar ?? currentUser.avatar_url,
      }

      setUserInfo(updatedUser)
      void queryClient.invalidateQueries({ queryKey: meKey })
      void navigate(`/social/profile/${response.new_slug}`)
    },
    onError: (error) => {
      enqueue('error', getErrorMessage(error, 'Failed to update profile'))
    },
  })
}

export function useChangePassword() {
  const enqueue = useAlertStore((s) => s.enqueue)
  const navigate = useNavigate()
  const userSlug = useProfileStore((s) => s.user?.slug)

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (response) => {
      if (response.message === 'success') {
        enqueue('success', 'The information was saved')
        if (userSlug) {
          void navigate(`/social/profile/${userSlug}`)
        }
        return
      }

      try {
        const data = JSON.parse(response.message) as Record<string, { message: string }[]>
        const messages = Object.values(data)
          .map((items) => items[0]?.message)
          .filter(Boolean)
        enqueue('error', messages.join(' ') || response.message)
      } catch {
        enqueue('error', response.message)
      }
    },
    onError: (error) => {
      enqueue('error', getErrorMessage(error, 'Failed to change password'))
    },
  })
}

export function flattenProfilePostPages(
  data: ReturnType<typeof useProfilePosts>['data'],
) {
  return data?.pages.flatMap((page) => page.results.posts) ?? []
}

export function profileFromPages(data: ReturnType<typeof useProfilePosts>['data']) {
  return data?.pages[0]?.results.profile ?? null
}

export function canSendFriendshipRequestFromPages(
  data: ReturnType<typeof useProfilePosts>['data'],
) {
  return data?.pages[0]?.results.can_send_friendship_request ?? false
}
