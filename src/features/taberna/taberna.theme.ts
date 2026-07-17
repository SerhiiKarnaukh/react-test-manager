import { createTheme } from '@mui/material/styles'

/**
 * Taberna identity — fig / aubergine / copper / warm cream.
 * Scoped under MainTabernaLayout so shared auth forms inherit it too.
 */
export const tabernaTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#B86B42',
          light: '#D4895F',
          dark: '#945235',
          contrastText: '#FFF8EB',
        },
        secondary: {
          main: '#4A2337',
          light: '#6B3A52',
          dark: '#2B1834',
          contrastText: '#FFF8EB',
        },
        background: {
          default: '#F7F1E8',
          paper: '#FFFCF7',
        },
        text: {
          primary: '#2B1834',
          secondary: '#6B4A3A',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#E0A06E',
          light: '#F0B36D',
          dark: '#B86B42',
          contrastText: '#2B1834',
        },
        secondary: {
          main: '#C4A0B0',
          light: '#D8BCC8',
          dark: '#8A6578',
          contrastText: '#1A1018',
        },
        background: {
          default: '#1A1018',
          paper: '#2B1834',
        },
        text: {
          primary: '#FFF8EB',
          secondary: '#D4C4B8',
        },
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: 'class',
    cssVarPrefix: 'taberna',
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px var(--taberna-palette-background-paper) inset',
            WebkitTextFillColor: 'var(--taberna-palette-text-primary)',
            caretColor: 'var(--taberna-palette-text-primary)',
            borderRadius: 'inherit',
          },
        },
      },
    },
  },
})
