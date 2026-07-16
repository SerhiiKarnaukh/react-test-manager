import Box from '@mui/material/Box'
import { Outlet } from 'react-router-dom'
import { AppsManagerFooter } from '@features/apps-manager/components/AppsManagerFooter'
import { AppsManagerNavbar } from '@features/apps-manager/components/AppsManagerNavbar'

export function MainAppsManagerLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <AppsManagerNavbar />
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
      <AppsManagerFooter />
    </Box>
  )
}
