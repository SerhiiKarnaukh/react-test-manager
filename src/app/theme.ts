import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  colorSchemes: {
    light: true,
    dark: true,
  },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
  },
  shape: {
    borderRadius: 4,
  },
})
