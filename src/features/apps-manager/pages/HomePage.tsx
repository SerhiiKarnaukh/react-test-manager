import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { AppCard } from '@features/apps-manager/components/AppCard'
import { useApps } from '@features/apps-manager/hooks/useApps'

const NAV_HEIGHT = 64
const PARALLAX_FACTOR = 0.45

export function HomePage() {
  const { data: apps = [], isPending } = useApps()
  const heroRef = useRef<HTMLDivElement>(null)
  const [parallaxOffset, setParallaxOffset] = useState(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const updateParallax = () => {
      const hero = heroRef.current
      /* istanbul ignore next -- defensive: ref is always attached when this runs */
      if (!hero) return
      const maxOffset = hero.offsetHeight * 0.35
      setParallaxOffset(Math.min(window.scrollY * PARALLAX_FACTOR, maxOffset))
    }

    updateParallax()
    window.addEventListener('scroll', updateParallax, { passive: true })
    return () => window.removeEventListener('scroll', updateParallax)
  }, [])

  const heroMinHeight = `calc(100svh - ${NAV_HEIGHT}px)`

  return (
    <Box>
      <Box
        ref={heroRef}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: heroMinHeight,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: '-20%',
            left: 0,
            right: 0,
            height: '140%',
            backgroundImage: 'url(/manager_bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform',
            zIndex: 0,
            transform: `translate3d(0, ${parallaxOffset}px, 0)`,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: heroMinHeight,
            width: '100%',
            px: 2,
            py: 4,
            background:
              'linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.78))',
          }}
        >
          <Typography
            component="h1"
            sx={{
              m: 0,
              color: 'common.white',
              fontWeight: 300,
              fontSize: { xs: '1.75rem', md: '2.75rem' },
              textAlign: 'center',
            }}
          >
            React Applications Manager
          </Typography>
        </Box>
      </Box>

      <Container maxWidth={false} sx={{ maxWidth: 1600, py: { xs: 4, md: 6 } }}>
        <Typography component="h2" variant="h5" align="center" gutterBottom>
          Last Applications
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {isPending
            ? Array.from({ length: 3 }).map((_, index) => (
                <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Skeleton
                    variant="rectangular"
                    sx={{ aspectRatio: '3 / 2', maxHeight: 210, width: '100%' }}
                  />
                  <Skeleton width="60%" sx={{ mt: 1.5 }} />
                  <Skeleton width="40%" />
                </Grid>
              ))
            : apps.map((application) => (
                <Grid key={application.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <AppCard application={application} />
                </Grid>
              ))}
        </Grid>
      </Container>
    </Box>
  )
}
