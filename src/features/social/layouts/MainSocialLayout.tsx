import { useEffect, useState } from 'react'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import AppsIcon from '@mui/icons-material/Apps'
import ChatIcon from '@mui/icons-material/Chat'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import GroupsIcon from '@mui/icons-material/Groups'
import HomeIcon from '@mui/icons-material/Home'
import LightModeIcon from '@mui/icons-material/LightMode'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PublicIcon from '@mui/icons-material/Public'
import SearchIcon from '@mui/icons-material/Search'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import { ThemeProvider, useColorScheme, useTheme } from '@mui/material/styles'
import { useAuthStore } from '@core/auth/auth.store'
import { SOCIAL_DEFAULT_AVATAR } from '@features/social/profiles/api/profile.models'
import { useCurrentSocialUser } from '@features/social/profiles/hooks/useProfile'
import { useProfileStore } from '@features/social/profiles/store/profile.store'
import { socialTheme } from '@features/social/social.theme'

const navButtonSx = {
  color: '#F4F6F9',
  '&:hover': { bgcolor: 'rgba(244, 246, 249, 0.1)' },
} as const

export function MainSocialLayout() {
  const setActiveApp = useAuthStore((s) => s.setActiveApp)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const logout = useAuthStore((s) => s.logout)
  const initFromStorage = useProfileStore((s) => s.initFromStorage)
  const clearUserState = useProfileStore((s) => s.clearUserState)
  const { data: currentUser } = useCurrentSocialUser()
  const { mode, setMode } = useColorScheme()
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [appsAnchor, setAppsAnchor] = useState<null | HTMLElement>(null)
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null)
  const year = new Date().getFullYear()
  const remoteHost = import.meta.env.VITE_REMOTE_HOST as string | undefined

  useEffect(() => {
    setActiveApp('social')
    initFromStorage()
  }, [setActiveApp, initFromStorage])

  useEffect(() => {
    if (isAuthenticated) return
    clearUserState()
  }, [isAuthenticated, clearUserState])

  const nextMode = mode === 'dark' ? 'light' : 'dark'

  const closeMenus = () => {
    setAppsAnchor(null)
    setMobileAnchor(null)
  }

  const handleLogout = () => {
    logout()
    clearUserState()
    closeMenus()
    void navigate('/social/login')
  }

  return (
    <ThemeProvider theme={socialTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'linear-gradient(90deg, #121820 0%, #1E2A3A 48%, #2A3548 100%)',
            boxShadow: '0 8px 28px rgba(18, 24, 32, 0.35)',
            borderBottom: '2px solid #E85D4C',
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: 64 }}>
            <Button
              component={RouterLink}
              to="/social/home"
              startIcon={<GroupsIcon />}
              sx={{
                ...navButtonSx,
                fontSize: '1.05rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              Social Network
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="Open menu"
                  onClick={(event) => setMobileAnchor(event.currentTarget)}
                  sx={{ color: '#F4F6F9' }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={mobileAnchor}
                  open={Boolean(mobileAnchor)}
                  onClose={closeMenus}
                  slotProps={{ list: { 'aria-label': 'Social Network navigation' } }}
                >
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
                  <MenuItem component={RouterLink} to="/social/home" onClick={closeMenus}>
                    <HomeIcon fontSize="small" sx={{ mr: 1 }} />
                    Main
                  </MenuItem>
                  {isAuthenticated ? (
                    [
                      <MenuItem
                        key="chat"
                        component={RouterLink}
                        to="/social/chat"
                        onClick={closeMenus}
                      >
                        <ChatIcon fontSize="small" sx={{ mr: 1 }} />
                        Chat
                      </MenuItem>,
                      <MenuItem key="logout" onClick={handleLogout}>
                        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                        Logout
                      </MenuItem>,
                    ]
                  ) : (
                    [
                      <MenuItem
                        key="login"
                        component={RouterLink}
                        to="/social/login"
                        onClick={closeMenus}
                      >
                        <LoginIcon fontSize="small" sx={{ mr: 1 }} />
                        Login
                      </MenuItem>,
                      <MenuItem
                        key="signup"
                        component={RouterLink}
                        to="/social/signup"
                        onClick={closeMenus}
                      >
                        <PersonAddIcon fontSize="small" sx={{ mr: 1 }} />
                        Signup
                      </MenuItem>,
                    ]
                  )}
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
                    Theme
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/social/search" onClick={closeMenus}>
                    <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                    Search
                  </MenuItem>
                  {isAuthenticated ? (
                    [
                      <MenuItem
                        key="notifications"
                        component={RouterLink}
                        to="/social/notifications"
                        onClick={closeMenus}
                      >
                        <NotificationsIcon fontSize="small" sx={{ mr: 1 }} />
                        Notifications (0)
                      </MenuItem>,
                      currentUser?.slug ? (
                        <MenuItem
                          key="profile"
                          component={RouterLink}
                          to={`/social/profile/${currentUser.slug}`}
                          onClick={closeMenus}
                        >
                          Profile
                        </MenuItem>
                      ) : null,
                    ]
                  ) : null}
                </Menu>
              </>
            ) : (
              <>
                <Button
                  startIcon={<AppsIcon />}
                  onClick={(event) => setAppsAnchor(event.currentTarget)}
                  sx={navButtonSx}
                >
                  Apps Manager
                </Button>
                <Menu
                  anchorEl={appsAnchor}
                  open={Boolean(appsAnchor)}
                  onClose={closeMenus}
                  slotProps={{ list: { 'aria-label': 'Apps Manager links' } }}
                >
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
                  component={RouterLink}
                  to="/social/home"
                  startIcon={<HomeIcon />}
                  sx={navButtonSx}
                >
                  Main
                </Button>

                {isAuthenticated ? (
                  <>
                    <Button
                      component={RouterLink}
                      to="/social/chat"
                      startIcon={<ChatIcon />}
                      sx={navButtonSx}
                    >
                      Chat
                    </Button>
                    <Button startIcon={<LogoutIcon />} onClick={handleLogout} sx={navButtonSx}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      component={RouterLink}
                      to="/social/login"
                      startIcon={<LoginIcon />}
                      sx={navButtonSx}
                    >
                      Login
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/social/signup"
                      startIcon={<PersonAddIcon />}
                      sx={navButtonSx}
                    >
                      Signup
                    </Button>
                  </>
                )}

                <Button
                  startIcon={mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                  onClick={() => setMode(nextMode)}
                  sx={navButtonSx}
                >
                  {mode === 'dark' ? 'Light mode' : 'Dark mode'}
                </Button>

                <IconButton
                  component={RouterLink}
                  to="/social/search"
                  aria-label="Search"
                  sx={{ color: '#F4F6F9' }}
                >
                  <SearchIcon />
                </IconButton>

                {isAuthenticated ? (
                  <>
                    <Button
                      component={RouterLink}
                      to="/social/notifications"
                      startIcon={<NotificationsIcon />}
                      sx={navButtonSx}
                    >
                      (0)
                    </Button>
                    {currentUser?.slug ? (
                      <IconButton
                        component={RouterLink}
                        to={`/social/profile/${currentUser.slug}`}
                        aria-label="Profile"
                      >
                        <Avatar
                          src={currentUser.avatar_url ?? SOCIAL_DEFAULT_AVATAR}
                          alt="Profile avatar"
                          sx={{ width: 36, height: 36 }}
                        />
                      </IconButton>
                    ) : null}
                  </>
                ) : null}
              </>
            )}
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>

        <Box
          component="footer"
          sx={{
            py: 3,
            px: 3,
            textAlign: 'center',
            color: '#F4F6F9',
            background: 'linear-gradient(90deg, #121820 0%, #1E2A3A 100%)',
            borderTop: '1px solid rgba(232, 93, 76, 0.35)',
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
            <Button component={RouterLink} to="/social/home" sx={navButtonSx}>
              Home
            </Button>
            {!isAuthenticated ? (
              <>
                <Button component={RouterLink} to="/social/signup" sx={navButtonSx}>
                  Signup
                </Button>
                <Button component={RouterLink} to="/social/login" sx={navButtonSx}>
                  Login
                </Button>
              </>
            ) : null}
            {remoteHost ? (
              <Button
                component="a"
                href={remoteHost}
                target="_blank"
                rel="noopener noreferrer"
                sx={navButtonSx}
              >
                All Apps
              </Button>
            ) : null}
            <Button component={RouterLink} to="/" sx={navButtonSx}>
              React Apps
            </Button>
          </Box>
          <Typography variant="body2">
            {year} — <strong>Social Network</strong>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
