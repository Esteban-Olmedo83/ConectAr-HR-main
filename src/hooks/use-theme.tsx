
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'zinc' | 'rose' | 'blue' | 'green' | 'orange' | 'violet';
type Mode = 'light' | 'dark' | 'matrix';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  defaultMode?: Mode;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const initialState: ThemeProviderState = {
  theme: 'blue',
  setTheme: () => null,
  mode: 'light',
  setMode: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'blue',
  defaultMode = 'light',
  storageKey = 'conectar-ui-theme-v2',
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mode, setMode] = useState<Mode>(defaultMode);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const [sMode, sTheme] = saved.split(':');
      setMode(sMode as Mode || defaultMode);
      setTheme(sTheme as Theme || defaultTheme);
    }
    setMounted(true);
  }, [storageKey, defaultMode, defaultTheme]);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;

    // Manage modes
    root.classList.remove('light', 'dark', 'matrix');
    root.classList.add(mode);

    // Manage themes
    ['zinc', 'rose', 'blue', 'green', 'orange', 'violet'].forEach(color => {
      root.classList.remove(`theme-${color}`);
    });
    root.classList.add(`theme-${theme}`);

    localStorage.setItem(storageKey, `${mode}:${theme}`);
  }, [theme, mode, storageKey, mounted]);

  const value = {
    theme,
    setTheme,
    mode,
    setMode,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
