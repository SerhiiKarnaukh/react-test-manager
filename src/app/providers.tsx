import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import { queryClient } from '@app/query-client'
import { theme } from '@app/theme'
import { AppMessage } from '@shared/ui/AppMessage'
import { LoadingOverlay } from '@shared/ui/LoadingOverlay'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <InitColorSchemeScript attribute="class" defaultMode="light" />
      <ThemeProvider theme={theme} defaultMode="light">
        <CssBaseline />
        {children}
        <AppMessage />
        <LoadingOverlay />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
