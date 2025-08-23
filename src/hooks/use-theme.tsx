'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'teal' | 'blue' | 'purple';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; description: string }[];
};

const initialState: ThemeProviderState = {
  theme: 'teal',
  setTheme: () => null,
  themes: [
    { value: 'teal', label: 'Teal-Cyan Professional', description: 'Fresh and modern' },
    { value: 'blue', label: 'Blue Professional', description: 'Classic and trustworthy' },
    { value: 'purple', label: 'Purple-Indigo Modern', description: 'Creative and trendy' },
  ],
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'teal',
  storageKey = 'nextintern-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && ['teal', 'blue', 'purple'].includes(stored)) {
      setTheme(stored);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    // Remove old data-theme attributes
    root.removeAttribute('data-theme');
    // Set new data-theme attribute
    root.setAttribute('data-theme', theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey, mounted]);

  const value = {
    theme,
    setTheme: (theme: Theme) => setTheme(theme),
    themes: initialState.themes,
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
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