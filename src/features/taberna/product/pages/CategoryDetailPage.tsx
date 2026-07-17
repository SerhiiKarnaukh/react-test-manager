import { useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { ProductsGrid } from '@features/taberna/product/components/ProductsGrid'
import { useCategoryProducts } from '@features/taberna/product/hooks/useProducts'

export function CategoryDetailPage() {
  const { category_slug: categorySlug } = useParams()
  const { data, isPending } = useCategoryProducts(categorySlug)
  const products = data?.products ?? []

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1600, py: { xs: 4, md: 8 } }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        {data?.name ?? 'Category'}
      </Typography>

      <ProductsGrid products={products} isLoading={isPending} />

      {!isPending && products.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
          No products in this category yet.
        </Typography>
      ) : null}
    </Container>
  )
}
