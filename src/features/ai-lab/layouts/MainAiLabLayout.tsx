import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import { ThemeProvider } from '@mui/material/styles'
import { useAuthStore } from '@core/auth/auth.store'
import { AiLabFooter } from '@features/ai-lab/components/AiLabFooter'
import { AiLabNavbar } from '@features/ai-lab/components/AiLabNavbar'
import { aiLabTheme } from '@features/ai-lab/ai-lab.theme'
import { AiLabRealtimeProvider } from '@features/ai-lab/hooks/AiLabRealtimeContext'
import { useAiLabRealtime } from '@features/ai-lab/hooks/useAiLabRealtime'

function AiLabLayoutContent() {
  const setActiveApp = useAuthStore((s) => s.setActiveApp)
  const { connect, disconnect } = useAiLabRealtime()

  useEffect(() => {
    setActiveApp('ai-lab')
  }, [setActiveApp])

  useEffect(() => {
    void connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <AiLabNavbar />
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </Box>
      <AiLabFooter />
    </Box>
  )
}

export function MainAiLabLayout() {
  return (
    <ThemeProvider theme={aiLabTheme}>
      <AiLabRealtimeProvider>
        <AiLabLayoutContent />
      </AiLabRealtimeProvider>
    </ThemeProvider>
  )
}
