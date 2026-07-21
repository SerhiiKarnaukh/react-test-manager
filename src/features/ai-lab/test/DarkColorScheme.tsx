import { useColorScheme } from '@mui/material/styles'
import { useEffect, type ReactNode } from 'react'

export function DarkColorScheme({ children }: { children: ReactNode }) {
  const { setMode } = useColorScheme()

  useEffect(() => {
    setMode('dark')
  }, [setMode])

  return children
}
