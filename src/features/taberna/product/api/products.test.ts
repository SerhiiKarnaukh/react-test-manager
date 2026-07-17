import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import {
  fetchCategoryProducts,
  fetchLatestProducts,
  fetchProductCategories,
  fetchProductDetail,
  searchProducts,
} from '@features/taberna/product/api/products'

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
      product: { ...sampleProduct, productgallery: [{ image: 'https://example.com/2.jpg' }] },
      variations: {
        colors: [{ item: null, variation_value: 'Brown' }],
        sizes: [{ item: null, variation_value: 'M' }],
      },
    }),
  ),
  http.get(`*${baseUrl}/product-categories/`, () =>
    HttpResponse.json([{ name: 'Coffee', get_absolute_url: '/taberna-store/category/coffee' }]),
  ),
  http.post(`*${baseUrl}/products/search/`, async ({ request }) => {
    const body = (await request.json()) as { query?: string }
    return HttpResponse.json(body.query === 'coffee' ? [sampleProduct] : [])
  }),
)

describe('taberna products api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('fetchLatestProducts GETs latest products', async () => {
    await expect(fetchLatestProducts()).resolves.toEqual([sampleProduct])
  })

  it('fetchCategoryProducts GETs products by category slug', async () => {
    await expect(fetchCategoryProducts('coffee')).resolves.toEqual({
      name: 'Coffee',
      products: [sampleProduct],
    })
  })

  it('fetchProductDetail GETs product detail by category and product slug', async () => {
    const data = await fetchProductDetail('coffee', 'arabica')

    expect(data.product.name).toBe('Arabica')
    expect(data.variations.colors).toHaveLength(1)
  })

  it('fetchProductCategories GETs navbar categories', async () => {
    await expect(fetchProductCategories()).resolves.toEqual([
      { name: 'Coffee', get_absolute_url: '/taberna-store/category/coffee' },
    ])
  })

  it('searchProducts POSTs query and returns products', async () => {
    await expect(searchProducts('coffee')).resolves.toEqual([sampleProduct])
  })
})
