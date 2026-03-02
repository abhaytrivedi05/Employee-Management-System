import React, { createContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1E3C72',
            light: mode === 'dark' ? '#4a6fa5' : '#4a6fa5',
            dark: mode === 'dark' ? '#0d1f3f' : '#0d1f3f',
          },
          secondary: {
            main: '#ff9800',
          },
          background: {
            default: mode === 'light' ? '#f5f7fb' : '#0a0e1a',
            paper: mode === 'light' ? '#ffffff' : '#1a1f2e',
          },
          text: {
            primary: mode === 'light' ? '#0f172a' : '#f1f5f9',
            secondary: mode === 'light' ? '#334155' : '#cbd5e1',
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          button: {
            textTransform: 'none',
            fontWeight: 700,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                backgroundColor: mode === 'light' ? '#ffffff' : '#1a1f2e',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                backgroundColor: mode === 'light' ? '#ffffff' : '#1a1f2e',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? '#0f172a' : '#f1f5f9',
              },
              head: {
                backgroundColor: mode === 'light' ? '#f5f7fb' : '#0f1729',
                color: mode === 'light' ? '#0f172a' : '#f1f5f9',
                fontWeight: 700,
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                '&:nth-of-type(even)': {
                  backgroundColor: mode === 'light' ? '#f9fbff' : '#141824',
                },
                '&:hover': {
                  backgroundColor: mode === 'light' ? '#f0f4ff' : '#1e2433',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: mode === 'light' ? '#ffffff' : '#1a1f2e',
                  '& fieldset': {
                    borderColor: mode === 'light' ? '#e2e8f0' : '#334155',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'light' ? '#cbd5e1' : '#475569',
                  },
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
