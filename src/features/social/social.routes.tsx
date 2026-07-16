import type { RouteObject } from 'react-router-dom'
import { MainSocialLayout } from '@features/social/layouts/MainSocialLayout'
import { RequireAuth } from '@router/require-auth'
import { LoginPage } from '@shared/components/LoginPage'
import { SignupPage } from '@shared/components/SignupPage'
import { StubPage } from '@shared/ui/StubPage'

export const socialRoutes: RouteObject[] = [
  {
    element: <MainSocialLayout />,
    children: [
      { path: 'social/home', element: <StubPage title="Social — Feed" /> },
      {
        path: 'social/profile/edit',
        element: (
          <RequireAuth app="social">
            <StubPage title="Social — Edit Profile" />
          </RequireAuth>
        ),
      },
      {
        path: 'social/profile/:slug',
        element: <StubPage title="Social — Profile" />,
      },
      {
        path: 'social/profile/:slug/friends',
        element: (
          <RequireAuth app="social">
            <StubPage title="Social — Friends" />
          </RequireAuth>
        ),
      },
      { path: 'social/:id', element: <StubPage title="Social — Post" /> },
      { path: 'social/trends/:id', element: <StubPage title="Social — Trend" /> },
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
      { path: 'social/search', element: <StubPage title="Social — Search" /> },
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
    ],
  },
]
