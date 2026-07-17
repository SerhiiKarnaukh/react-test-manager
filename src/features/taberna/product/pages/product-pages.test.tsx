import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect, vi } from 'vitest'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import { CategoryDetailPage } from '@features/taberna/product/pages/CategoryDetailPage'
import { ProductDetailPage } from '@features/taberna/product/pages/ProductDetailPage'
import { ProductHomePage } from '@features/taberna/product/pages/ProductHomePage'
import { SearchPage } from '@features/taberna/product/pages/SearchPage'
import {
  createTabernaRouteWrapper,
  createTabernaWrapper,
  sampleProduct,
} from '@features/taberna/test/taberna-test-utils'

const server = setupServer(
  http.get('*/taberna-store/api/v1/latest-products/', () => HttpResponse.json([sampleProduct])),
  http.get('*/taberna-store/api/v1/products/shirts/', () =>
    HttpResponse.json({ name: 'Shirts', products: [sampleProduct] }),
  ),
  http.get('*/taberna-store/api/v1/products/empty/', () =>
    HttpResponse.json({ name: 'Empty', products: [] }),
  ),
  http.get('*/taberna-store/api/v1/products/shirts/oversized-shirt', () =>
    HttpResponse.json({
      product: {
        ...sampleProduct,
        productgallery: [{ image: 'https://example.com/shirt-2.jpg' }],
      },
      variations: {
        colors: [{ item: null, variation_value: 'blue' }],
        sizes: [{ item: null, variation_value: 'M' }],
      },
    }),
  ),
  http.post('*/taberna-store/api/v1/products/search/', async ({ request }) => {
    const body = (await request.json()) as { query?: string }
    return HttpResponse.json(body.query === 'missing' ? [] : [sampleProduct])
  }),
)

describe('Taberna product pages', () => {
  const originalMatchMedia = window.matchMedia

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 1
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
    localStorage.clear()
    useCartStore.setState({ isLoading: false })
  })
  afterEach(() => {
    server.resetHandlers()
    vi.restoreAllMocks()
    window.matchMedia = originalMatchMedia
  })
  afterAll(() => server.close())

  it('renders home page products and applies parallax on scroll', async () => {
    render(<ProductHomePage />, { wrapper: createTabernaWrapper() })

    expect(screen.getByRole('heading', { name: 'Taberna' })).toBeInTheDocument()
    await screen.findByRole('heading', { name: sampleProduct.name })

    fireEvent.scroll(window)
    expect(window.requestAnimationFrame).toHaveBeenCalled()
  })

  it('skips parallax when reduced motion is enabled', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() })

    render(<ProductHomePage />, { wrapper: createTabernaWrapper() })

    await screen.findByRole('heading', { name: sampleProduct.name })
    fireEvent.scroll(window)
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('renders category products and empty state', async () => {
    const { unmount } = render(
      createTabernaRouteWrapper(
        '/taberna-store/category/:category_slug',
        <CategoryDetailPage />,
        '/taberna-store/category/shirts',
      )(),
    )

    await screen.findByRole('heading', { name: 'Shirts' })
    expect(screen.getByRole('heading', { name: sampleProduct.name })).toBeInTheDocument()

    unmount()

    render(
      createTabernaRouteWrapper(
        '/taberna-store/category/:category_slug',
        <CategoryDetailPage />,
        '/taberna-store/category/empty',
      )(),
    )

    await screen.findByText('No products in this category yet.')
  })

  it('renders search idle, results and empty states', async () => {
    const { unmount } = render(
      createTabernaRouteWrapper('/taberna/search', <SearchPage />, '/taberna/search')(),
    )

    expect(screen.getByText('Enter a product name from the navbar search.')).toBeInTheDocument()

    unmount()

    render(
      createTabernaRouteWrapper(
        '/taberna/search',
        <SearchPage />,
        '/taberna/search?query=shirt',
      )(),
    )

    await screen.findByRole('heading', { name: sampleProduct.name })

    unmount()

    render(
      createTabernaRouteWrapper(
        '/taberna/search',
        <SearchPage />,
        '/taberna/search?query=missing',
      )(),
    )

    await screen.findByText('Nothing was found.')
  })

  it('validates and adds product detail to cart', async () => {
    const user = userEvent.setup()
    const addToCart = vi.fn(async () => undefined)
    useCartStore.setState({ addToCart })

    render(
      createTabernaRouteWrapper(
        '/taberna-store/category/:category_slug/:product_slug',
        <ProductDetailPage />,
        '/taberna-store/category/shirts/oversized-shirt',
      )(),
    )

    await screen.findByRole('heading', { name: sampleProduct.name })
    await user.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(screen.getByText('Please select a color')).toBeInTheDocument()
    expect(screen.getByText('Please select a size')).toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: /select color/i }))
    await user.click(screen.getByRole('option', { name: 'blue' }))
    await user.click(screen.getByRole('combobox', { name: /select size/i }))
    await user.click(screen.getByRole('option', { name: 'M' }))
    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(addToCart).toHaveBeenCalledWith(7, 'blue', 'M')
  })

  it('handles gallery navigation and add-to-cart failures', async () => {
    const user = userEvent.setup()
    useCartStore.setState({
      addToCart: vi.fn(async () => {
        throw new Error('fail')
      }),
    })

    render(
      createTabernaRouteWrapper(
        '/taberna-store/category/:category_slug/:product_slug',
        <ProductDetailPage />,
        '/taberna-store/category/shirts/oversized-shirt',
      )(),
    )

    await screen.findByRole('heading', { name: sampleProduct.name })
    await user.click(screen.getByLabelText('Next image'))
    await user.click(screen.getByLabelText('Previous image'))
    await user.click(screen.getByRole('combobox', { name: /select color/i }))
    await user.click(screen.getByRole('option', { name: 'blue' }))
    await user.click(screen.getByRole('combobox', { name: /select size/i }))
    await user.click(screen.getByRole('option', { name: 'M' }))
    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    await waitFor(() => expect(useCartStore.getState().addToCart).toHaveBeenCalled())
  })
})
