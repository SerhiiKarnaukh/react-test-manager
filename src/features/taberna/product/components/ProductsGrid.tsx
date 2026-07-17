import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import { ProductCard } from '@features/taberna/product/components/ProductCard'
import type { TabernaProduct } from '@features/taberna/product/api/products'

type ProductsGridProps = {
  products: TabernaProduct[]
  isLoading?: boolean
}

export function ProductsGrid({ products, isLoading = false }: ProductsGridProps) {
  const skeletonItems = Array.from({ length: 6 })

  return (
    <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
      {isLoading
        ? skeletonItems.map((_, index) => (
            <Grid key={`product-skeleton-${index}`} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Skeleton variant="rectangular" sx={{ aspectRatio: '3 / 2', width: '100%' }} />
              <Skeleton width="60%" sx={{ mt: 1.5 }} />
              <Skeleton width="40%" />
            </Grid>
          ))
        : products.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
    </Grid>
  )
}
