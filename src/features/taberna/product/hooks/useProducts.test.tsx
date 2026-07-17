import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import { expect } from 'vitest'
import {
  useCategoryProducts,
  useLatestProducts,
  useProductCategories,
  useProductDetail,
  useProductSearch,
} from '@features/taberna/product/hooks/useProducts'

const baseUrl = '/taberna-store/api/v1'

const sampleProduct = {
  id: 1,
  name: 'Arabica',
  description: 'Fresh coffee beans',
  price: '12.00',
  image: 'https://example.com/coffee.jpg',
  get_absolute_url: '/taberna-store/category/coffee/arabica',
}

const server = setupServer(
  http.get(`*${baseUrl}/latest-products/`, () => HttpResponse.json([sampleProduct])),
  http.get(`*${baseUrl}/products/coffee/`, () =>
    HttpResponse.json({ name: 'Coffee', products: [sampleProduct] }),
  ),
  http.get(`*${baseUrl}/products/coffee/arabica`, () =>
    HttpResponse.json({
      product: { ...sampleProduct, productgallery: [] },
      variations: { colors: [], sizes: [] },
    }),
  ),
  http.get(`*${baseUrl}/product-categories/`, () =>
    HttpResponse.json([{ name: 'Coffee', get_absolute_url: '/taberna-store/category/coffee' }]),
  ),
  http.post(`*${baseUrl}/products/search/`, () => HttpResponse.json([sampleProduct])),
)

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe('taberna product query hooks', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('useLatestProducts loads latest products', async () => {
    const { result } = renderHook(() => useLatestProducts(), { wrapper: createWrapper() })

    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([sampleProduct])
  })

  it('useProductCategories loads category nav items', async () => {
    const { result } = renderHook(() => useProductCategories(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([
      { name: 'Coffee', get_absolute_url: '/taberna-store/category/coffee' },
    ])
  })

  it('useCategoryProducts loads products when category slug exists', async () => {
    const { result } = renderHook(() => useCategoryProducts('coffee'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.products).toEqual([sampleProduct])
  })

  it('useProductDetail loads product detail when both slugs exist', async () => {
    const { result } = renderHook(() => useProductDetail('coffee', 'arabica'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.product.name).toBe('Arabica')
  })

  it('useProductSearch stays idle when query is empty', () => {
    const { result } = renderHook(() => useProductSearch(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.isFetching).toBe(false)
  })

  it('useProductSearch fetches when query is set', async () => {
    const { result } = renderHook(() => useProductSearch('coffee'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([sampleProduct])
  })
})
