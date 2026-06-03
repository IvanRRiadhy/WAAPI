import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark'): Theme => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#e11d48' : '#fb7185', // Rose-600 vs Rose-400
      },
      secondary: {
        main: mode === 'light' ? '#ea580c' : '#fb923c', // Orange-600 vs Orange-400
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#090d16', // Slate-50 vs Deep Obsidian
        paper: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.6)', // Glassmorphic translucent default
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f8fafc',
        secondary: mode === 'light' ? '#475569' : '#94a3b8',
      },
      divider: mode === 'light' ? 'rgba(225, 29, 72, 0.08)' : 'rgba(255, 255, 255, 0.08)',
      success: {
        main: '#2e7d32', // Green
      },
      error: {
        main: '#c62828', // Red
      },
      warning: {
        main: '#ef6c00', // Orange
      },
      info: {
        main: '#0277bd', // Blue
      },
    },
    typography: {
      fontFamily: [
        'Outfit',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.03em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${theme.palette.divider}`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: mode === 'light' ? 'rgba(225, 29, 72, 0.25)' : 'rgba(251, 113, 133, 0.25)',
              boxShadow: mode === 'light' 
                ? '0 12px 24px -10px rgba(225, 29, 72, 0.12)' 
                : '0 12px 24px -10px rgba(251, 113, 133, 0.18)',
            },
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '6px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },
    },
  });
};
