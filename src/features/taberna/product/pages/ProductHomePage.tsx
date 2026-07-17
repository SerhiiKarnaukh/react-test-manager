import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { ProductsGrid } from '@features/taberna/product/components/ProductsGrid'
import { useLatestProducts } from '@features/taberna/product/hooks/useProducts'

export function ProductHomePage() {
  const { data: products = [], isPending } = useLatestProducts()
  const heroRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotion.matches) return

    let frameId: number | null = null

    const updateParallax = () => {
      frameId = null
      const hero = heroRef.current
      const background = backgroundRef.current
      const content = contentRef.current
      if (!hero || !background || !content) return

      const rect = hero.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return

      const offset = Math.max(0, -rect.top)
      background.style.transform = `translate3d(0, ${offset * 0.24}px, 0)`
      content.style.transform = `translate3d(0, ${offset * 0.12}px, 0)`
    }

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateParallax)
      }
    }

    updateParallax()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <Box>
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 420, md: 'calc(100svh - 64px)' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 2,
          color: 'common.white',
        }}
      >
        <Box
          ref={backgroundRef}
          aria-hidden
          sx={{
            position: 'absolute',
            inset: '-18% 0',
            background:
              'radial-gradient(circle at 20% 20%, rgba(248, 181, 105, 0.42), transparent 28%), radial-gradient(circle at 80% 12%, rgba(114, 74, 119, 0.46), transparent 32%), linear-gradient(135deg, #2B1834 0%, #5C2741 48%, #B86B42 100%)',
            willChange: 'transform',
          }}
        />
        <Box
          ref={contentRef}
          sx={{
            position: 'relative',
            zIndex: 1,
            willChange: 'transform',
          }}
        >
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
