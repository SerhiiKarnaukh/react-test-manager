import type { RouteObject } from 'react-router-dom'
import { CartPage } from '@features/taberna/cart/pages/CartPage'
import { MainTabernaLayout } from '@features/taberna/layouts/MainTabernaLayout'
import { CategoryDetailPage } from '@features/taberna/product/pages/CategoryDetailPage'
import { ProductDetailPage } from '@features/taberna/product/pages/ProductDetailPage'
import { ProductHomePage } from '@features/taberna/product/pages/ProductHomePage'
import { SearchPage } from '@features/taberna/product/pages/SearchPage'
import { RequireAuth } from '@router/require-auth'
import { LoginPage } from '@shared/components/LoginPage'
import { SignupPage } from '@shared/components/SignupPage'
import { StubPage } from '@shared/ui/StubPage'

export const tabernaRoutes: RouteObject[] = [
  {
    element: <MainTabernaLayout />,
    children: [
      { path: 'taberna', element: <ProductHomePage /> },
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
        element: <CategoryDetailPage />,
      },
      {
        path: 'taberna-store/category/:category_slug/:product_slug',
        element: <ProductDetailPage />,
      },
      { path: 'taberna/search', element: <SearchPage /> },
      { path: 'taberna/cart', element: <CartPage /> },
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
