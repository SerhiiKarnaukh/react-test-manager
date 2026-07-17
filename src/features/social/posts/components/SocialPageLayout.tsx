import type { ReactNode } from 'react'
import Box from '@mui/material/Box'

type SocialPageLayoutProps = {
  main: ReactNode
  sidebar: ReactNode
}

export function SocialPageLayout({ main, sidebar }: SocialPageLayoutProps) {
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
          md: 'minmax(0, 2fr) minmax(280px, 1fr)',
        },
        alignItems: 'start',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>{main}</Box>
      <Box
        component="aside"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          order: { xs: 2, md: 0 },
        }}
      >
        {sidebar}
      </Box>
    </Box>
  )
}
