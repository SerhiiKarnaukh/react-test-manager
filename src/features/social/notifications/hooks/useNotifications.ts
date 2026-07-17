import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAlertStore } from '@core/alert/alert.store'
import { useAuthStore } from '@core/auth/auth.store'
import {
  fetchNotifications,
  markNotificationRead,
  type SocialNotification,
} from '@features/social/notifications/api/notifications'
import { useProfileStore } from '@features/social/profiles/store/profile.store'
import { getErrorMessage } from '@shared/utils/error'

export const notificationsKey = ['social', 'notifications'] as const

function useQueryErrorAlert(isError: boolean, error: Error | null, fallback: string) {
  const enqueue = useAlertStore((s) => s.enqueue)

  useEffect(() => {
    if (isError) {
      enqueue('error', getErrorMessage(error, fallback))
    }
  }, [isError, error, enqueue, fallback])
}

export function navigateAfterRead(
  notification: SocialNotification,
  userSlug: string | undefined,
): string | null {
  if (notification.type_of_notification === 'post_like' && notification.post_id) {
    return `/social/${notification.post_id}`
  }
  if (notification.type_of_notification === 'post_comment' && notification.post_id) {
    return `/social/${notification.post_id}`
  }
  if (notification.type_of_notification === 'chat_message') {
    return '/social/chat'
  }
  if (userSlug) {
    return `/social/profile/${userSlug}/friends`
  }
  return null
}

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  const query = useQuery({
    queryKey: notificationsKey,
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load notifications')

  return {
    ...query,
    unreadCount: query.data?.length ?? 0,
  }
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const enqueue = useAlertStore((s) => s.enqueue)
  const navigate = useNavigate()
  const userSlug = useProfileStore((s) => s.user?.slug)

  return useMutation({
    mutationFn: (notification: SocialNotification) => markNotificationRead(notification.id),
    onSuccess: (_data, notification) => {
      queryClient.setQueryData<SocialNotification[]>(notificationsKey, (old) =>
        (old ?? []).filter((item) => item.id !== notification.id),
      )
      const target = navigateAfterRead(notification, userSlug)
      if (target) {
        void navigate(target)
      }
    },
    onError: (error) => {
      enqueue('error', getErrorMessage(error, 'Failed to mark notification as read'))
    },
  })
}
