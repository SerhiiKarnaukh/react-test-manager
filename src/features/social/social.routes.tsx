import type { RouteObject } from 'react-router-dom'
import { MainSocialLayout } from '@features/social/layouts/MainSocialLayout'
import { FeedHomePage } from '@features/social/posts/pages/FeedHomePage'
import { PostDetailPage } from '@features/social/posts/pages/PostDetailPage'
import { SearchPage } from '@features/social/posts/pages/SearchPage'
import { TrendPage } from '@features/social/posts/pages/TrendPage'
import { RequireAuth } from '@router/require-auth'
import { LoginPage } from '@shared/components/LoginPage'
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
            <StubPage title="Social — Edit Profile" />
          </RequireAuth>
        ),
      },
      {
        path: 'social/profile/:slug/friends',
        element: (
          <RequireAuth app="social">
            <StubPage title="Social — Friends" />
          </RequireAuth>
        ),
      },
      {
        path: 'social/profile/:slug',
        element: <StubPage title="Social — Profile" />,
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
      {
        path: 'social/login',
        element: (
          <LoginPage
            app="social"
            signupPath="/social/signup"
            defaultRedirect="/social/home"
          />
        ),
      },
      {
        path: 'social/edit/password',
        element: (
          <RequireAuth app="social">
            <StubPage title="Social — Edit Password" />
          </RequireAuth>
        ),
      },
      // Must stay last so static paths like /social/search are not captured as :id
      { path: 'social/:id', element: <PostDetailPage /> },
    ],
  },
]
