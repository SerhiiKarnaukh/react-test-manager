import { createTheme } from '@mui/material/styles'

/**
 * Social identity — Ember Ink.
 * Coral ember actions on cool ink/slate surfaces (distinct from Taberna aubergine
 * and the Angular Social teal).
 */
export const socialTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#E85D4C',
          light: '#FF8A70',
          dark: '#C44536',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#1E2A3A',
          light: '#3A4A5E',
          dark: '#121820',
          contrastText: '#F4F6F9',
        },
        background: {
          default: '#F0F2F5',
          paper: '#FFFFFF',
        },
        text: {
          primary: '#1A2332',
          secondary: '#5A6577',
        },
        info: {
          main: '#2B6CB0',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#FF8A70',
          light: '#FFB09E',
          dark: '#E85D4C',
          contrastText: '#1A1010',
        },
        secondary: {
          main: '#8FA3BC',
          light: '#B4C3D4',
          dark: '#5A6B80',
          contrastText: '#12161E',
        },
        background: {
          default: '#12161E',
          paper: '#1A2230',
        },
        text: {
          primary: '#F0F2F5',
          secondary: '#A8B2C1',
        },
        info: {
          main: '#6BA3D9',
        },
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: 'class',
    cssVarPrefix: 'social',
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px var(--social-palette-background-paper) inset',
            WebkitTextFillColor: 'var(--social-palette-text-primary)',
            caretColor: 'var(--social-palette-text-primary)',
            borderRadius: 'inherit',
          },
        },
      },
    },
  },
})
