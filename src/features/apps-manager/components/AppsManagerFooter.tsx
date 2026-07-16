import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

export function AppsManagerFooter() {
  const remoteHost = import.meta.env.VITE_REMOTE_HOST || '/'
  const year = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 3,
        px: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
        <Button href={remoteHost} target="_blank" rel="noopener noreferrer">
          All Apps
        </Button>
        <Button component={RouterLink} to="/">
          React Apps
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {year} — <strong>React Apps Manager</strong>
      </Typography>
    </Box>
  )
}
