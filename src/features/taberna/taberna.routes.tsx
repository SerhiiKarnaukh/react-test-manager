import type { RouteObject } from 'react-router-dom'
import { CartPage } from '@features/taberna/cart/pages/CartPage'
import { MainTabernaLayout } from '@features/taberna/layouts/MainTabernaLayout'
import { CheckoutPage } from '@features/taberna/orders/pages/CheckoutPage'
import { FailedPage } from '@features/taberna/orders/pages/FailedPage'
import { SuccessPage } from '@features/taberna/orders/pages/SuccessPage'
import { DashboardPage } from '@features/taberna/profiles/pages/DashboardPage'
import { TabernaLoginPage } from '@features/taberna/profiles/pages/TabernaLoginPage'
import { CategoryDetailPage } from '@features/taberna/product/pages/CategoryDetailPage'
import { ProductDetailPage } from '@features/taberna/product/pages/ProductDetailPage'
import { ProductHomePage } from '@features/taberna/product/pages/ProductHomePage'
import { SearchPage } from '@features/taberna/product/pages/SearchPage'
import { RequireAuth } from '@router/require-auth'
import { SignupPage } from '@shared/components/SignupPage'

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
        element: <TabernaLoginPage />,
      },
      {
        path: 'taberna/dashboard',
        element: (
          <RequireAuth app="taberna">
            <DashboardPage />
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
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      {
        path: 'taberna/cart/success',
        element: <SuccessPage />,
      },
      {
        path: 'taberna/cart/failed',
        element: <FailedPage />,
      },
    ],
  },
]
