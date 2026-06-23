'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { readThemeFromStorage, THEME_STORAGE_KEY, writeThemeCookie, type Theme } from '@/lib/theme';

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

export function ThemeProvider({ children, initialTheme }: { children: ReactNode; initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const stored = readThemeFromStorage();
    if (stored !== initialTheme) {
      setTheme(stored);
      return;
    }
    localStorage.setItem(THEME_STORAGE_KEY, initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    writeThemeCookie(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme: () => {
          setTheme((current) => (current === 'light' ? 'dark' : 'light'));
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
