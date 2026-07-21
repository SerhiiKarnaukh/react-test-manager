import { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import useMediaQuery from '@mui/material/useMediaQuery'
import AppsIcon from '@mui/icons-material/Apps'
import ChatIcon from '@mui/icons-material/Chat'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import ForumIcon from '@mui/icons-material/Forum'
import ImageIcon from '@mui/icons-material/Image'
import LightModeIcon from '@mui/icons-material/LightMode'
import MenuIcon from '@mui/icons-material/Menu'
import PsychologyIcon from '@mui/icons-material/Psychology'
import PublicIcon from '@mui/icons-material/Public'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import SettingsIcon from '@mui/icons-material/Settings'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import { useColorScheme, useTheme } from '@mui/material/styles'
import { aiLabTokens } from '@features/ai-lab/ai-lab.theme'

const AI_SERVICES: Array<{
  title: string
  icon: typeof ChatIcon
  route: string
  exact?: boolean
}> = [
  { title: 'Funny Chat', icon: ChatIcon, route: '/ai-lab', exact: true },
  { title: 'Image Generator', icon: ImageIcon, route: '/ai-lab/image-generator' },
  { title: 'Voice Generator', icon: RecordVoiceOverIcon, route: '/ai-lab/voice-generator' },
  { title: 'Realtime Chat', icon: ForumIcon, route: '/ai-lab/realtime-chat' },
]

export function AiLabNavbar() {
  const { mode, setMode } = useColorScheme()
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const tokens = mode === 'dark' ? aiLabTokens.dark : aiLabTokens.light
  const remoteHost = import.meta.env.VITE_REMOTE_HOST as string | undefined
  const [servicesAnchor, setServicesAnchor] = useState<null | HTMLElement>(null)
  const [appsAnchor, setAppsAnchor] = useState<null | HTMLElement>(null)
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null)
  const nextMode = mode === 'dark' ? 'light' : 'dark'

  const navButtonSx = {
    color: tokens.navFg,
    '&:hover': { bgcolor: 'rgba(250, 245, 255, 0.1)' },
  } as const

  const closeMenus = () => {
    setServicesAnchor(null)
    setAppsAnchor(null)
    setMobileAnchor(null)
  }

  const isServiceActive = (route: string, exact?: boolean) => {
    if (exact) return location.pathname === route
    return location.pathname.startsWith(route)
  }

  const menuItemSx = (route: string, exact?: boolean) =>
    isServiceActive(route, exact)
      ? { bgcolor: tokens.menuActiveBg, color: 'primary.main' }
      : undefined

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: tokens.navGradient,
        boxShadow: '0 8px 28px rgba(30, 10, 60, 0.35)',
        borderBottom: tokens.navBorder,
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: 64 }}>
        <Button
          component={RouterLink}
          to="/ai-lab"
          startIcon={<PsychologyIcon />}
          sx={{
            ...navButtonSx,
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          AI Lab
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="Open menu"
              onClick={(event) => setMobileAnchor(event.currentTarget)}
              sx={{ color: tokens.navFg }}
            >
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={mobileAnchor} open={Boolean(mobileAnchor)} onClose={closeMenus}>
              <MenuItem disabled sx={{ opacity: 1, fontWeight: 600 }}>
                <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                AI Services
              </MenuItem>
              {AI_SERVICES.map((item) => (
                <MenuItem
                  key={item.route}
                  component={RouterLink}
                  to={item.route}
                  onClick={closeMenus}
                  sx={menuItemSx(item.route, item.exact)}
                >
                  <item.icon fontSize="small" sx={{ mr: 1 }} />
                  {item.title}
                </MenuItem>
              ))}
              <Divider />
              {remoteHost ? (
                <MenuItem
                  component="a"
                  href={remoteHost}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenus}
                >
                  <PublicIcon fontSize="small" sx={{ mr: 1 }} />
                  All Apps
                </MenuItem>
              ) : null}
              <MenuItem component={RouterLink} to="/" onClick={closeMenus}>
                <ViewModuleIcon fontSize="small" sx={{ mr: 1 }} />
                React Apps
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  setMode(nextMode)
                  closeMenus()
                }}
              >
                {mode === 'dark' ? (
                  <LightModeIcon fontSize="small" sx={{ mr: 1 }} />
                ) : (
                  <DarkModeIcon fontSize="small" sx={{ mr: 1 }} />
                )}
                {mode === 'dark' ? 'Light mode' : 'Dark mode'}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button
              startIcon={<SettingsIcon />}
              onClick={(event) => setServicesAnchor(event.currentTarget)}
              sx={navButtonSx}
            >
              AI Services
            </Button>
            <Menu anchorEl={servicesAnchor} open={Boolean(servicesAnchor)} onClose={closeMenus}>
              {AI_SERVICES.map((item) => (
                <MenuItem
                  key={item.route}
                  component={RouterLink}
                  to={item.route}
                  onClick={closeMenus}
                  sx={menuItemSx(item.route, item.exact)}
                >
                  <item.icon fontSize="small" sx={{ mr: 1 }} />
                  {item.title}
                </MenuItem>
              ))}
            </Menu>

            <Button
              startIcon={<AppsIcon />}
              onClick={(event) => setAppsAnchor(event.currentTarget)}
              sx={navButtonSx}
            >
              Apps Manager
            </Button>
            <Menu anchorEl={appsAnchor} open={Boolean(appsAnchor)} onClose={closeMenus}>
              {remoteHost ? (
                <MenuItem
                  component="a"
                  href={remoteHost}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenus}
                >
                  <PublicIcon fontSize="small" sx={{ mr: 1 }} />
                  All Apps
                </MenuItem>
              ) : null}
              <MenuItem component={RouterLink} to="/" onClick={closeMenus}>
                <ViewModuleIcon fontSize="small" sx={{ mr: 1 }} />
                React Apps
              </MenuItem>
            </Menu>

            <Button
              startIcon={mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              onClick={() => setMode(nextMode)}
              sx={navButtonSx}
            >
              {mode === 'dark' ? 'Light mode' : 'Dark mode'}
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}
