import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useColorScheme } from '@mui/material/styles'
import { aiLabTokens } from '@features/ai-lab/ai-lab.theme'

export function AiLabFooter() {
  const { mode } = useColorScheme()
  const tokens = mode === 'dark' ? aiLabTokens.dark : aiLabTokens.light
  const remoteHost = import.meta.env.VITE_REMOTE_HOST as string | undefined
  const year = new Date().getFullYear()

  const linkSx = {
    color: tokens.navFg,
    '&:hover': { bgcolor: 'rgba(250, 245, 255, 0.1)' },
  } as const

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 3,
        textAlign: 'center',
        color: tokens.navFg,
        background: tokens.footerBg,
        borderTop: tokens.footerBorder,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          mb: 1.5,
        }}
      >
        {remoteHost ? (
          <Button
            component="a"
            href={remoteHost}
            target="_blank"
            rel="noopener noreferrer"
            sx={linkSx}
          >
            All Apps
          </Button>
        ) : null}
        <Button component={RouterLink} to="/" sx={linkSx}>
          React Apps
        </Button>
      </Box>
      <Typography variant="body2">
        {year} — <strong>AI Lab</strong>
      </Typography>
    </Box>
  )
}
