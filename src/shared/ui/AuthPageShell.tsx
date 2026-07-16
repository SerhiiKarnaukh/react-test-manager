import type { ReactNode } from 'react'
import Box from '@mui/material/Box'

type AuthPageShellProps = {
  children: ReactNode
  maxWidth?: number | string
}

export function AuthPageShell({ children, maxWidth = 400 }: AuthPageShellProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth }}>{children}</Box>
    </Box>
  )
}
