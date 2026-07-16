import type { RouteObject } from 'react-router-dom'
import { MainTabernaLayout } from '@features/taberna/layouts/MainTabernaLayout'
import { RequireAuth } from '@router/require-auth'
import { LoginPage } from '@shared/components/LoginPage'
import { SignupPage } from '@shared/components/SignupPage'
import { StubPage } from '@shared/ui/StubPage'

export const tabernaRoutes: RouteObject[] = [
  {
    element: <MainTabernaLayout />,
    children: [
      { path: 'taberna', element: <StubPage title="Taberna — Products" /> },
      {
        path: 'taberna/signup',
        element: <SignupPage app="taberna" loginPath="/taberna/login" />,
      },
      {
        path: 'taberna/login',
        element: (
          <LoginPage
            app="taberna"
            signupPath="/taberna/signup"
            defaultRedirect="/taberna/dashboard"
          />
        ),
      },
      {
        path: 'taberna/dashboard',
        element: (
          <RequireAuth app="taberna">
            <StubPage title="Taberna — Dashboard" />
          </RequireAuth>
        ),
      },
      {
        path: 'taberna-store/category/:category_slug',
        element: <StubPage title="Taberna — Category" />,
      },
      {
        path: 'taberna-store/category/:category_slug/:product_slug',
        element: <StubPage title="Taberna — Product" />,
      },
      { path: 'taberna/search', element: <StubPage title="Taberna — Search" /> },
      { path: 'taberna/cart', element: <StubPage title="Taberna — Cart" /> },
      {
        path: 'taberna/cart/checkout',
        element: (
          <RequireAuth app="taberna">
            <StubPage title="Taberna — Checkout" />
          </RequireAuth>
        ),
      },
      {
        path: 'taberna/cart/success',
        element: <StubPage title="Taberna — Order Success" />,
      },
      {
        path: 'taberna/cart/failed',
        element: <StubPage title="Taberna — Order Failed" />,
      },
    ],
  },
]
