import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useColorScheme } from '@mui/material/styles'

const APP_LINKS = [
  { to: '/', label: 'Apps' },
  { to: '/taberna', label: 'Taberna' },
  { to: '/social/home', label: 'Social' },
  { to: '/ai-lab', label: 'AI Lab' },
] as const

type AppShellLayoutProps = {
  title: string
  children: ReactNode
}

export function AppShellLayout({ title, children }: AppShellLayoutProps) {
  const { mode, setMode } = useColorScheme()
  const nextMode = mode === 'dark' ? 'light' : 'dark'

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" component="div" sx={{ mr: 2 }}>
            {title}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {APP_LINKS.map((link) => (
            <Button
              key={link.to}
              component={RouterLink}
              to={link.to}
              color="inherit"
              size="small"
            >
              {link.label}
            </Button>
          ))}
          <IconButton
            color="inherit"
            aria-label={`Switch to ${nextMode} mode`}
            onClick={() => setMode(nextMode)}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          borderTop: 1,
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Applications Manager — {title}
        </Typography>
      </Box>
    </Box>
  )
}
