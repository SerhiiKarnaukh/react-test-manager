import { useEffect, useState } from 'react'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Badge from '@mui/material/Badge'
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
import CategoryIcon from '@mui/icons-material/Category'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { ThemeProvider, useColorScheme, useTheme } from '@mui/material/styles'
import { useAuthStore } from '@core/auth/auth.store'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import { TabernaSearchDialog } from '@features/taberna/product/components/TabernaSearchDialog'
import { useProductCategories } from '@features/taberna/product/hooks/useProducts'
import { tabernaTheme } from '@features/taberna/taberna.theme'

const tabernaNavButtonSx = {
  color: '#FFF8EB',
  '&:hover': { bgcolor: 'rgba(255, 248, 235, 0.1)' },
} as const

export function MainTabernaLayout() {
  const setActiveApp = useAuthStore((s) => s.setActiveApp)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const logout = useAuthStore((s) => s.logout)
  const cartQuantity = useCartStore((s) => s.cart.quantity || 0)
  const loadCart = useCartStore((s) => s.loadCart)
  const { data: categories = [] } = useProductCategories()
  const { mode, setMode } = useColorScheme()
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [appsAnchor, setAppsAnchor] = useState<null | HTMLElement>(null)
  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null)
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setActiveApp('taberna')
  }, [setActiveApp])

  useEffect(() => {
    void loadCart({ silent: true })
  }, [loadCart])

  const nextMode = mode === 'dark' ? 'light' : 'dark'

  const closeMenus = () => {
    setAppsAnchor(null)
    setCategoryAnchor(null)
    setMobileAnchor(null)
  }

  const handleLogout = () => {
    logout()
    closeMenus()
    void navigate('/taberna/login')
  }

  const openSearch = () => {
    closeMenus()
    setSearchOpen(true)
  }

  return (
    <ThemeProvider theme={tabernaTheme}>
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
          background:
            'linear-gradient(90deg, #2B1834 0%, #4A2337 48%, #7A3F35 100%)',
          boxShadow: '0 8px 28px rgba(43, 24, 52, 0.28)',
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: 64 }}>
          <Button
            component={RouterLink}
            to="/taberna"
            startIcon={<StorefrontIcon />}
            sx={{
              ...tabernaNavButtonSx,
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            Taberna
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                aria-label="Open menu"
                onClick={(event) => setMobileAnchor(event.currentTarget)}
                sx={{ color: '#FFF8EB' }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileAnchor}
                open={Boolean(mobileAnchor)}
                onClose={closeMenus}
                slotProps={{ list: { 'aria-label': 'Taberna navigation' } }}
              >
                <MenuItem component={RouterLink} to="/" onClick={closeMenus}>
                  <AppsIcon fontSize="small" sx={{ mr: 1 }} />
                  React Apps
                </MenuItem>
                <Divider />
                {categories.map((category) => (
                  <MenuItem
                    key={category.get_absolute_url}
                    component={RouterLink}
                    to={category.get_absolute_url}
                    onClick={closeMenus}
                  >
                    <CategoryIcon fontSize="small" sx={{ mr: 1 }} />
                    {category.name}
                  </MenuItem>
                ))}
                <Divider />
                {isAuthenticated ? (
                  [
                    <MenuItem
                      key="dashboard"
                      component={RouterLink}
                      to="/taberna/dashboard"
                      onClick={closeMenus}
                    >
                      <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                      Dashboard
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
                      to="/taberna/login"
                      onClick={closeMenus}
                    >
                      <LoginIcon fontSize="small" sx={{ mr: 1 }} />
                      Login
                    </MenuItem>,
                    <MenuItem
                      key="signup"
                      component={RouterLink}
                      to="/taberna/signup"
                      onClick={closeMenus}
                    >
                      <PersonAddIcon fontSize="small" sx={{ mr: 1 }} />
                      Signup
                    </MenuItem>,
                  ]
                )}
                <MenuItem component={RouterLink} to="/taberna/cart" onClick={closeMenus}>
                  <ShoppingBasketIcon fontSize="small" sx={{ mr: 1 }} />
                  Cart ({cartQuantity})
                </MenuItem>
                <MenuItem onClick={() => setMode(nextMode)}>
                  {mode === 'dark' ? (
                    <LightModeIcon fontSize="small" sx={{ mr: 1 }} />
                  ) : (
                    <DarkModeIcon fontSize="small" sx={{ mr: 1 }} />
                  )}
                  {mode === 'dark' ? 'Light mode' : 'Dark mode'}
                </MenuItem>
                <MenuItem onClick={openSearch}>
                  <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                  Search
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                startIcon={<AppsIcon />}
                onClick={(event) => setAppsAnchor(event.currentTarget)}
                sx={tabernaNavButtonSx}
              >
                Apps Manager
              </Button>
              <Menu
                anchorEl={appsAnchor}
                open={Boolean(appsAnchor)}
                onClose={closeMenus}
                slotProps={{ list: { 'aria-label': 'Apps Manager links' } }}
              >
                <MenuItem component={RouterLink} to="/" onClick={closeMenus}>
                  React Apps
                </MenuItem>
                {import.meta.env.VITE_REMOTE_HOST ? (
                  <MenuItem
                    component="a"
                    href={import.meta.env.VITE_REMOTE_HOST}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenus}
                  >
                    All Apps
                  </MenuItem>
                ) : null}
              </Menu>

              <Button
                startIcon={<CategoryIcon />}
                onClick={(event) => setCategoryAnchor(event.currentTarget)}
                sx={tabernaNavButtonSx}
              >
                Category
              </Button>
              <Menu
                anchorEl={categoryAnchor}
                open={Boolean(categoryAnchor)}
                onClose={closeMenus}
                slotProps={{ list: { 'aria-label': 'Product categories' } }}
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category.get_absolute_url}
                    component={RouterLink}
                    to={category.get_absolute_url}
                    onClick={closeMenus}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Menu>

              {isAuthenticated ? (
                <>
                  <Button
                    component={RouterLink}
                    to="/taberna/dashboard"
                    startIcon={<DashboardIcon />}
                    sx={tabernaNavButtonSx}
                  >
                    Dashboard
                  </Button>
                  <Button startIcon={<LogoutIcon />} onClick={handleLogout} sx={tabernaNavButtonSx}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={RouterLink}
                    to="/taberna/login"
                    startIcon={<LoginIcon />}
                    sx={tabernaNavButtonSx}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/taberna/signup"
                    startIcon={<PersonAddIcon />}
                    sx={tabernaNavButtonSx}
                  >
                    Signup
                  </Button>
                </>
              )}

              <IconButton
                color="inherit"
                aria-label={`Switch to ${nextMode} mode`}
                onClick={() => setMode(nextMode)}
                sx={{ color: '#FFF8EB' }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              <Button
                component={RouterLink}
                to="/taberna/cart"
                startIcon={
                  <Badge badgeContent={cartQuantity} color="warning" showZero={false}>
                    <ShoppingBasketIcon />
                  </Badge>
                }
                sx={tabernaNavButtonSx}
              >
                Cart
              </Button>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderColor: 'rgba(255, 248, 235, 0.28)', mx: 0.5 }}
              />

              <IconButton
                color="inherit"
                aria-label="Search"
                onClick={openSearch}
                sx={{ color: '#FFF8EB' }}
              >
                <SearchIcon />
              </IconButton>
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
          color: '#FFF8EB',
          background: 'linear-gradient(90deg, #2B1834 0%, #4A2337 100%)',
        }}
      >
        <Typography variant="body2">
          Taberna — curated catalog powered by React and MUI
        </Typography>
      </Box>

      <TabernaSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
    </ThemeProvider>
  )
}
