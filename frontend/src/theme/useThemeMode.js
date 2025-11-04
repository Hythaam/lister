import { useContext } from 'react';
import { ThemeContext } from './ThemeContext.js';

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a CustomThemeProvider');
  }
  return context;
}