import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { ProductsGrid } from '@features/taberna/product/components/ProductsGrid'
import { useLatestProducts } from '@features/taberna/product/hooks/useProducts'

export function ProductHomePage() {
  const { data: products = [], isPending } = useLatestProducts()

  return (
    <Box>
      <Box
        sx={{
          minHeight: { xs: 420, md: 'calc(100svh - 64px)' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 2,
          color: 'common.white',
          background:
            'radial-gradient(circle at 20% 20%, rgba(248, 181, 105, 0.42), transparent 28%), radial-gradient(circle at 80% 12%, rgba(114, 74, 119, 0.46), transparent 32%), linear-gradient(135deg, #2B1834 0%, #5C2741 48%, #B86B42 100%)',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              m: 0,
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 300,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Taberna
          </Typography>
          <Typography
            sx={{
              mt: 2,
              fontSize: { xs: '1rem', md: '1.35rem' },
              letterSpacing: '0.06em',
              color: 'rgba(255, 248, 235, 0.88)',
            }}
          >
            Warm finds, fine details, and a catalog with character.
          </Typography>
        </Box>
      </Box>

      <Container maxWidth={false} sx={{ maxWidth: 1600, py: { xs: 4, md: 6 } }}>
        <Typography
          component="h2"
          variant="h5"
          align="center"
          sx={{
            mb: 3,
            color: 'secondary.main',
            '&::after': {
              content: '""',
              display: 'block',
              width: 56,
              height: 3,
              mx: 'auto',
              mt: 1.5,
              borderRadius: 1,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            },
          }}
        >
          Latest products
        </Typography>
        <ProductsGrid products={products} isLoading={isPending} />
      </Container>
    </Box>
  )
}
