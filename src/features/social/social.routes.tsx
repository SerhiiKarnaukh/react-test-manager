import type { RouteObject } from 'react-router-dom'
import { MainSocialLayout } from '@features/social/layouts/MainSocialLayout'
import { FeedHomePage } from '@features/social/posts/pages/FeedHomePage'
import { PostDetailPage } from '@features/social/posts/pages/PostDetailPage'
import { SearchPage } from '@features/social/posts/pages/SearchPage'
import { TrendPage } from '@features/social/posts/pages/TrendPage'
import { EditPasswordPage } from '@features/social/profiles/pages/EditPasswordPage'
import { EditProfilePage } from '@features/social/profiles/pages/EditProfilePage'
import { FriendsPage } from '@features/social/profiles/pages/FriendsPage'
import { ProfilePage } from '@features/social/profiles/pages/ProfilePage'
import { SocialLoginPage } from '@features/social/profiles/pages/SocialLoginPage'
import { RequireAuth } from '@router/require-auth'
import { SignupPage } from '@shared/components/SignupPage'
import { StubPage } from '@shared/ui/StubPage'

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
            <StubPage title="Social — Chat" />
          </RequireAuth>
        ),
      },
      {
        path: 'social/notifications',
        element: (
          <RequireAuth app="social">
            <StubPage title="Social — Notifications" />
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
