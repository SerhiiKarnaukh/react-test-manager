import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { expect, vi } from 'vitest'
import { ProductCard } from '@features/taberna/product/components/ProductCard'
import { ProductsGrid } from '@features/taberna/product/components/ProductsGrid'
import { TabernaSearchDialog } from '@features/taberna/product/components/TabernaSearchDialog'
import {
  createTabernaWrapper,
  sampleProduct,
} from '@features/taberna/test/taberna-test-utils'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

describe('Taberna product components', () => {
  it('renders product card with details link', () => {
    render(<ProductCard product={sampleProduct} />, {
      wrapper: createTabernaWrapper(),
    })

    expect(screen.getByRole('heading', { name: sampleProduct.name })).toBeInTheDocument()
    expect(screen.getByText('$70.00')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /details/i })).toHaveAttribute(
      'href',
      sampleProduct.get_absolute_url,
    )
  })

  it('renders grid skeletons while loading and products when loaded', () => {
    const { rerender } = render(<ProductsGrid products={[]} isLoading />, {
      wrapper: createTabernaWrapper(),
    })

    expect(document.querySelectorAll('.MuiSkeleton-root')).toHaveLength(18)

    rerender(<ProductsGrid products={[sampleProduct]} />)

    expect(screen.getByRole('heading', { name: sampleProduct.name })).toBeInTheDocument()
  })

  it('search dialog closes, navigates and resets query', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <>
        <TabernaSearchDialog open onClose={onClose} />
        <Routes>
          <Route path="*" element={<LocationDisplay />} />
        </Routes>
      </>,
      { wrapper: createTabernaWrapper(undefined, ['/taberna']) },
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'boots')
    await user.click(screen.getAllByRole('button', { name: /search/i }).at(-1)!)

    expect(onClose).toHaveBeenCalled()
    expect(screen.getByTestId('location')).toHaveTextContent('/taberna/search?query=boots')
    expect(input).toHaveValue('')
  })

  it('search dialog ignores empty searches and supports Enter', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <>
        <TabernaSearchDialog open onClose={onClose} />
        <Routes>
          <Route path="*" element={<LocationDisplay />} />
        </Routes>
      </>,
      { wrapper: createTabernaWrapper(undefined, ['/taberna']) },
    )

    expect(screen.getAllByRole('button', { name: /search/i }).at(-1)).toBeDisabled()

    await user.type(screen.getByRole('textbox'), 'shirts{Enter}')
    expect(onClose).toHaveBeenCalled()
    expect(screen.getByTestId('location')).toHaveTextContent('/taberna/search?query=shirts')
  })
})
