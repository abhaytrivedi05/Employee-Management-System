import React, { createContext } from 'react';

export const ThemeContext = createContext();

// Always light — TeamHub style
export const ThemeProvider = ({ children }) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark');
  }
  return (
    <ThemeContext.Provider value={{ mode: 'light', toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};
