'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type VisualTheme = 'clasico' | 'dark' | 'purpura' | 'esmeralda' | 'sunset';

const ALL_THEME_CLASSES: VisualTheme[] = ['clasico', 'dark', 'purpura', 'esmeralda', 'sunset'];

const STORAGE_KEY = 'conectar-visual-theme';

interface ThemeContextType {
  theme: VisualTheme;
  setTheme: (theme: VisualTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'clasico',
  setTheme: () => null,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<VisualTheme>('clasico');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as VisualTheme | null;
    if (saved && ALL_THEME_CLASSES.includes(saved)) {
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    // Remove all theme classes and dark mode class
    ALL_THEME_CLASSES.forEach(t => {
      root.classList.remove(`theme-${t}`);
    });
    root.classList.remove('dark');

    // Apply new theme class
    root.classList.add(`theme-${theme}`);

    // If dark theme, also add tailwind dark: prefix support
    if (theme === 'dark') {
      root.classList.add('dark');
    }

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: VisualTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
