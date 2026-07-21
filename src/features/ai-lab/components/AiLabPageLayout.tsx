import { useEffect, useRef, useState, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useColorScheme } from '@mui/material/styles'
import { aiLabTokens } from '@features/ai-lab/ai-lab.theme'

type AiLabPageLayoutProps = {
  title: string
  heroImage: string
  children: ReactNode
}

export function AiLabPageLayout({ title, heroImage, children }: AiLabPageLayoutProps) {
  const { mode } = useColorScheme()
  const tokens = mode === 'dark' ? aiLabTokens.dark : aiLabTokens.light
  const contentRef = useRef<HTMLElement>(null)
  const [parallaxOffset, setParallaxOffset] = useState(0)
  const [showScrollHint, setShowScrollHint] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      setParallaxOffset(scrollY * 0.35)
      setShowScrollHint(scrollY < 48)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: 'calc(100svh - 64px)',
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
            backgroundImage: `url(${heroImage})`,
            backgroundColor: '#1E0A3C',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            transform: `translate3d(0, ${parallaxOffset}px, 0)`,
            willChange: 'transform',
            zIndex: 0,
            '@media (prefers-reduced-motion: reduce)': {
              transform: 'none',
            },
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'relative',
            zIndex: 1,
            minHeight: 'calc(100svh - 64px)',
            width: '100%',
            bgcolor: tokens.heroOverlay,
          }}
        />
        {showScrollHint ? (
          <IconButton
            aria-label="Scroll to content"
            onClick={scrollToContent}
            sx={{
              position: 'absolute',
              left: '50%',
              bottom: 28,
              zIndex: 2,
              transform: 'translateX(-50%)',
              width: 52,
              height: 52,
              color: '#fff',
              bgcolor: tokens.scrollHintBg,
              backdropFilter: 'blur(6px)',
              boxShadow: '0 4px 20px rgba(15, 10, 26, 0.35)',
              '&:hover': { bgcolor: 'rgba(168, 85, 247, 0.28)' },
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -6,
                border: `1px solid ${tokens.scrollHintRing}`,
                borderRadius: '50%',
                animation: 'scroll-hint-pulse 2s ease-in-out infinite',
              },
              '@keyframes scroll-hint-pulse': {
                '0%, 100%': { opacity: 0.35, transform: 'scale(1)' },
                '50%': { opacity: 0.85, transform: 'scale(1.08)' },
              },
              '@media (prefers-reduced-motion: reduce)': {
                '&::before': { animation: 'none' },
              },
            }}
          >
            <KeyboardArrowDownIcon
              sx={{
                fontSize: 32,
                animation: 'scroll-hint-bounce 2s ease-in-out infinite',
                '@keyframes scroll-hint-bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(8px)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            />
          </IconButton>
        ) : null}
      </Box>

      <Box
        component="section"
        ref={contentRef}
        sx={{ py: 3, px: 2, pb: 6 }}
      >
        <Typography
          variant="h5"
          component="h2"
          align="center"
          sx={{
            mb: 3,
            fontWeight: 500,
            letterSpacing: '0.02em',
            color: 'text.primary',
            '&::after': {
              content: '""',
              display: 'block',
              width: 48,
              height: 3,
              mt: 1.5,
              mx: 'auto',
              borderRadius: 1,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: 'min(100%, 960px)',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  )
}
