import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme, useColorScheme } from '@mui/material/styles'
import AppsIcon from '@mui/icons-material/Apps'
import CloseIcon from '@mui/icons-material/Close'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import GridViewIcon from '@mui/icons-material/GridView'
import LightModeIcon from '@mui/icons-material/LightMode'
import MenuIcon from '@mui/icons-material/Menu'
import PublicIcon from '@mui/icons-material/Public'
import SearchIcon from '@mui/icons-material/Search'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import { SearchDialog } from '@features/apps-manager/components/SearchDialog'
import { useTopbarLinks } from '@features/apps-manager/hooks/useTopbarLinks'

/**
 * Structure mirrors Angular Apps Manager navbar (brand + Apps menu +
 * topbar links + theme/search). Styling uses MUI theme — not Angular colors.
 */
export function AppsManagerNavbar() {
  const theme = useTheme()
  const isHandset = useMediaQuery(theme.breakpoints.down('md'))
  const { mode, setMode } = useColorScheme()
  const isDark = mode === 'dark'
  const nextMode = isDark ? 'light' : 'dark'
  const { data: topbarLinks = [] } = useTopbarLinks()
  const remoteHost = import.meta.env.VITE_REMOTE_HOST || '/'

  const [searchOpen, setSearchOpen] = useState(false)
  const [appsMenuAnchor, setAppsMenuAnchor] = useState<null | HTMLElement>(null)
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null)
  const [mobileAppsAnchor, setMobileAppsAnchor] = useState<null | HTMLElement>(null)

  return (
    <>
      <AppBar position="sticky" color="primary" elevation={2}>
        <Toolbar sx={{ gap: 1, minHeight: 64 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'primary.contrastText',
              textDecoration: 'none',
              py: 0.5,
              px: 0.5,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.12)',
                color: 'primary.contrastText',
              },
            }}
          >
            <AppsIcon sx={{ fontSize: 28 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <Typography
                component="span"
                sx={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'inherit',
                }}
              >
                React Apps Manager
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  opacity: 0.85,
                  color: 'inherit',
                }}
              >
                Portfolio launcher
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {!isHandset ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Button
                color="inherit"
                onClick={(e) => setAppsMenuAnchor(e.currentTarget)}
                sx={{
                  textTransform: 'none',
                  gap: 1,
                  px: 1.5,
                  '& .MuiButton-startIcon': { m: 0 },
                }}
                startIcon={<GridViewIcon sx={{ fontSize: 20 }} />}
              >
                Apps Manager
              </Button>
              <Menu
                anchorEl={appsMenuAnchor}
                open={Boolean(appsMenuAnchor)}
                onClose={() => setAppsMenuAnchor(null)}
              >
                <MenuItem
                  component="a"
                  href={remoteHost}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setAppsMenuAnchor(null)}
                >
                  <PublicIcon fontSize="small" sx={{ mr: 1.5 }} />
                  All Apps
                </MenuItem>
                <MenuItem
                  component={RouterLink}
                  to="/"
                  onClick={() => setAppsMenuAnchor(null)}
                >
                  <ViewModuleIcon fontSize="small" sx={{ mr: 1.5 }} />
                  React Apps
                </MenuItem>
              </Menu>

              {topbarLinks.map((link) => (
                <Button
                  key={link.key}
                  color="inherit"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    textTransform: 'none',
                    gap: 1,
                    px: 1.5,
                    minWidth: 'auto',
                  }}
                >
                  <Box
                    component="i"
                    className={link.icon_class}
                    aria-hidden
                    sx={{
                      fontSize: 18,
                      width: 20,
                      minWidth: 20,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  />
                  <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                    {link.title}
                  </Box>
                </Button>
              ))}

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  mx: 1,
                  borderColor: 'rgba(255,255,255,0.35)',
                  alignSelf: 'center',
                  height: 28,
                }}
              />

              <IconButton
                color="inherit"
                aria-label={`Switch to ${nextMode} mode`}
                onClick={() => setMode(nextMode)}
              >
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon />
              </IconButton>
            </Box>
          ) : (
            <IconButton
              color="inherit"
              aria-label={mobileMenuAnchor ? 'Close menu' : 'Open menu'}
              onClick={(e) => {
                /* istanbul ignore next -- button is inert behind the modal while the menu is open */
                setMobileMenuAnchor(mobileMenuAnchor ? null : e.currentTarget)
              }}
            >
              {mobileMenuAnchor ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={() => setMobileMenuAnchor(null)}
      >
        <MenuItem onClick={(e) => setMobileAppsAnchor(e.currentTarget)}>
          <GridViewIcon fontSize="small" sx={{ mr: 1.5 }} />
          Apps Manager
        </MenuItem>
        <Menu
          anchorEl={mobileAppsAnchor}
          open={Boolean(mobileAppsAnchor)}
          onClose={() => setMobileAppsAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            component="a"
            href={remoteHost}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setMobileAppsAnchor(null)
              setMobileMenuAnchor(null)
            }}
          >
            <PublicIcon fontSize="small" sx={{ mr: 1.5 }} />
            All Apps
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/"
            onClick={() => {
              setMobileAppsAnchor(null)
              setMobileMenuAnchor(null)
            }}
          >
            <ViewModuleIcon fontSize="small" sx={{ mr: 1.5 }} />
            React Apps
          </MenuItem>
        </Menu>
        <Divider />
        {topbarLinks.map((link) => (
          <MenuItem
            key={link.key}
            component="a"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuAnchor(null)}
          >
            <Box
              component="i"
              className={link.icon_class}
              aria-hidden
              sx={{
                mr: 1.5,
                width: 24,
                minWidth: 24,
                textAlign: 'center',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            />
            {link.title}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setMode(nextMode)
            setMobileMenuAnchor(null)
          }}
        >
          {isDark ? (
            <LightModeIcon fontSize="small" sx={{ mr: 1.5 }} />
          ) : (
            <DarkModeIcon fontSize="small" sx={{ mr: 1.5 }} />
          )}
          {isDark ? 'Light mode' : 'Dark mode'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMobileMenuAnchor(null)
            setSearchOpen(true)
          }}
        >
          <SearchIcon fontSize="small" sx={{ mr: 1.5 }} />
          Search
        </MenuItem>
      </Menu>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
