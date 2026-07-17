import type { ReactNode } from 'react'
import Box from '@mui/material/Box'

type ProfilePageLayoutProps = {
  sidebar: ReactNode
  main: ReactNode
  widgets: ReactNode
}

export function ProfilePageLayout({ sidebar, main, widgets }: ProfilePageLayoutProps) {
  return (
    <Box
      sx={{
        maxWidth: 1600,
        mx: 'auto',
        px: 2,
        py: 3,
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(200px, 260px) minmax(0, 1fr)',
          lg: 'minmax(220px, 280px) minmax(0, 1fr) minmax(260px, 320px)',
        },
        alignItems: 'start',
      }}
    >
      <Box sx={{ minWidth: 0 }}>{sidebar}</Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>{main}</Box>
      <Box
        component="aside"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          gridColumn: { xs: '1', md: '1 / -1', lg: 'auto' },
        }}
      >
        {widgets}
      </Box>
    </Box>
  )
}
