import type { RouteObject } from 'react-router-dom'
import { MainSocialLayout } from '@features/social/layouts/MainSocialLayout'
import { ChatPage } from '@features/social/chat/pages/ChatPage'
import { FeedHomePage } from '@features/social/posts/pages/FeedHomePage'
import { PostDetailPage } from '@features/social/posts/pages/PostDetailPage'
import { SearchPage } from '@features/social/posts/pages/SearchPage'
import { TrendPage } from '@features/social/posts/pages/TrendPage'
import { NotificationsPage } from '@features/social/notifications/pages/NotificationsPage'
import { EditPasswordPage } from '@features/social/profiles/pages/EditPasswordPage'
import { EditProfilePage } from '@features/social/profiles/pages/EditProfilePage'
import { FriendsPage } from '@features/social/profiles/pages/FriendsPage'
import { ProfilePage } from '@features/social/profiles/pages/ProfilePage'
import { SocialLoginPage } from '@features/social/profiles/pages/SocialLoginPage'
import { RequireAuth } from '@router/require-auth'
import { SignupPage } from '@shared/components/SignupPage'

export const socialRoutes: RouteObject[] = [
  {
    element: <MainSocialLayout />,
    children: [
      { path: 'social/home', element: <FeedHomePage /> },
      {
        path: 'social/profile/edit',
        element: (
          <RequireAuth app="social">
            <EditProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: 'social/profile/:slug/friends',
        element: (
          <RequireAuth app="social">
            <FriendsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'social/profile/:slug',
        element: <ProfilePage />,
      },
      { path: 'social/trends/:id', element: <TrendPage /> },
      {
        path: 'social/chat',
        element: (
          <RequireAuth app="social">
            <ChatPage />
          </RequireAuth>
        ),
      },
      {
        path: 'social/notifications',
        element: (
          <RequireAuth app="social">
            <NotificationsPage />
          </RequireAuth>
        ),
      },
      { path: 'social/search', element: <SearchPage /> },
      {
        path: 'social/signup',
        element: <SignupPage app="social" loginPath="/social/login" />,
      },
      { path: 'social/login', element: <SocialLoginPage /> },
      {
        path: 'social/edit/password',
        element: (
          <RequireAuth app="social">
            <EditPasswordPage />
          </RequireAuth>
        ),
      },
      { path: 'social/:id', element: <PostDetailPage /> },
    ],
  },
]
