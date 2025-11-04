import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { ThemeContext } from './ThemeContext.js';
import theme from './theme.js';
import darkTheme from './darkTheme.js';

export function CustomThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem('theme-mode');
    if (saved) {
      return saved === 'dark';
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const currentTheme = isDark ? darkTheme : theme;

  const value = {
    isDark,
    toggleTheme,
    theme: currentTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={currentTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default CustomThemeProvider;