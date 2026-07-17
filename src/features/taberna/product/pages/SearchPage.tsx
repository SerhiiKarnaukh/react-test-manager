import { useSearchParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { ProductsGrid } from '@features/taberna/product/components/ProductsGrid'
import { useProductSearch } from '@features/taberna/product/hooks/useProducts'

export function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('query') ?? ''
  const { data: products = [], isPending, isFetching } = useProductSearch(query)
  const loading = Boolean(query.trim()) && (isPending || isFetching)

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1600, py: { xs: 4, md: 8 } }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        {query ? `Search term: "${query}"` : 'Search products'}
      </Typography>

      {!query ? (
        <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
          Enter a product name from the navbar search.
        </Typography>
      ) : loading ? (
        <ProductsGrid products={[]} isLoading />
      ) : products.length > 0 ? (
        <ProductsGrid products={products} />
      ) : (
        <Typography align="center" sx={{ mt: 4 }}>
          Nothing was found.
        </Typography>
      )}
    </Container>
  )
}
