import { createTheme } from '@mui/material/styles'

/**
 * AI Lab identity — Aurora Prism.
 * Deep cosmic violet surfaces with neon fuchsia actions and cyan accents
 * (distinct from Angular navy/cyan and other React sub-apps).
 */
export const aiLabTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#A855F7',
          light: '#C084FC',
          dark: '#7E22CE',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#06B6D4',
          light: '#22D3EE',
          dark: '#0891B2',
          contrastText: '#042F2E',
        },
        background: {
          default: '#F5F0FF',
          paper: '#FDFAFF',
        },
        text: {
          primary: '#2E1065',
          secondary: '#6B21A8',
        },
        info: {
          main: '#8B5CF6',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#D946EF',
          light: '#F0ABFC',
          dark: '#A21CAF',
          contrastText: '#1A0A24',
        },
        secondary: {
          main: '#22D3EE',
          light: '#67E8F9',
          dark: '#0891B2',
          contrastText: '#042F2E',
        },
        background: {
          default: '#0F0A1A',
          paper: '#1A1230',
        },
        text: {
          primary: '#F3E8FF',
          secondary: '#C4B5FD',
        },
        info: {
          main: '#A78BFA',
        },
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: 'class',
    cssVarPrefix: 'ailab',
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
            WebkitBoxShadow: '0 0 0 100px var(--ailab-palette-background-paper) inset',
            WebkitTextFillColor: 'var(--ailab-palette-text-primary)',
            caretColor: 'var(--ailab-palette-text-primary)',
            borderRadius: 'inherit',
          },
        },
      },
    },
  },
})

/** Layout tokens for hero, bubbles, and nav chrome */
export const aiLabTokens = {
  light: {
    navGradient: 'linear-gradient(90deg, #1E0A3C 0%, #3B0764 48%, #581C87 100%)',
    navBorder: '2px solid #D946EF',
    navFg: '#FAF5FF',
    footerBg: 'linear-gradient(90deg, #1E0A3C 0%, #3B0764 100%)',
    footerBorder: '1px solid rgba(217, 70, 239, 0.35)',
    heroOverlay: 'rgba(46, 16, 101, 0.72)',
    assistantBubble: '#EDE9FE',
    scrollHintBg: 'rgba(168, 85, 247, 0.18)',
    scrollHintRing: 'rgba(6, 182, 212, 0.5)',
    userBubble: '#A855F7',
    menuActiveBg: 'rgba(168, 85, 247, 0.14)',
  },
  dark: {
    navGradient: 'linear-gradient(90deg, #0A0614 0%, #1E0A3C 48%, #2E1065 100%)',
    navBorder: '2px solid #D946EF',
    navFg: '#FAF5FF',
    footerBg: 'linear-gradient(90deg, #0A0614 0%, #1E0A3C 100%)',
    footerBorder: '1px solid rgba(217, 70, 239, 0.4)',
    heroOverlay: 'rgba(15, 10, 26, 0.78)',
    assistantBubble: '#2D1B4E',
    scrollHintBg: 'rgba(217, 70, 239, 0.2)',
    scrollHintRing: 'rgba(34, 211, 238, 0.55)',
    userBubble: '#D946EF',
    menuActiveBg: 'rgba(217, 70, 239, 0.18)',
  },
} as const
