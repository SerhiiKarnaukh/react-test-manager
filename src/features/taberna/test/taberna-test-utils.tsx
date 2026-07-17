import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { tabernaTheme } from '@features/taberna/taberna.theme'
import type { TabernaCart, TabernaCartLineItem } from '@features/taberna/cart/api/cart'
import type { TabernaProduct } from '@features/taberna/product/api/products'

export const sampleProduct: TabernaProduct = {
  id: 7,
  name: 'Oversized Shirt',
  description: 'Comfortable shirt',
  price: '70.00',
  image: 'https://example.com/shirt.jpg',
  get_absolute_url: '/taberna-store/category/shirts/oversized-shirt',
}

export const sampleCartItem: TabernaCartLineItem = {
  id: 11,
  quantity: 2,
  product: {
    id: 7,
    name: 'Oversized Shirt',
    price: 70,
    image: 'https://example.com/shirt.jpg',
    get_absolute_url: '/taberna-store/category/shirts/oversized-shirt',
  },
  variations: [
    { id: 1, variation_category: 'color', variation_value: 'blue' },
    { id: 2, variation_category: 'size', variation_value: 'M' },
  ],
}

export const sampleCart: TabernaCart = {
  cart_items: [sampleCartItem],
  quantity: 2,
  total: 140,
  tax: 14,
  grand_total: 154,
}

export function createTestClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function createTabernaWrapper(
  client = createTestClient(),
  initialEntries: string[] = ['/taberna'],
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider theme={tabernaTheme}>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}

export function createTabernaRouteWrapper(
  path: string,
  element: ReactNode,
  initialEntry = path,
  client = createTestClient(),
) {
  return function Wrapper() {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider theme={tabernaTheme}>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route path={path} element={element} />
              <Route path="/taberna/cart/checkout" element={<div>Checkout route</div>} />
              <Route path="/taberna/signup" element={<div>Signup route</div>} />
              <Route path="/taberna/login" element={<div>Login route</div>} />
              <Route path="/taberna/dashboard" element={<div>Dashboard route</div>} />
              <Route path="/taberna-store/category/:category_slug/:product_slug" element={<div>Product route</div>} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}
