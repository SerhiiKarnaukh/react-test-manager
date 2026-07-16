import { createTheme } from '@mui/material/styles'

/**
 * React Apps Manager identity — not Angular navy/cyan clone.
 * Teal primary for AppBar + contained buttons; cool light surfaces.
 */
export const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#0D9488',
          light: '#2DD4BF',
          dark: '#0F766E',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#475569',
          light: '#64748B',
          dark: '#334155',
          contrastText: '#FFFFFF',
        },
        background: {
          default: '#F8FAFC',
          paper: '#FFFFFF',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#2DD4BF',
          light: '#5EEAD4',
          dark: '#14B8A6',
          contrastText: '#042F2E',
        },
        secondary: {
          main: '#94A3B8',
          light: '#CBD5E1',
          dark: '#64748B',
          contrastText: '#0F172A',
        },
        background: {
          default: '#0F172A',
          paper: '#1E293B',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
        },
      },
    },
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
