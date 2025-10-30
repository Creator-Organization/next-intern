'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

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
  isLoading: boolean;
};

const initialState: ThemeProviderState = {
  theme: 'teal',
  setTheme: () => null,
  isLoading: true,
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
  storageKey = 'Internship And Project-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  // Load theme on mount
  useEffect(() => {
    setMounted(true);
    
    // If user is authenticated, we could fetch their theme preference from the database
    // For now, we'll use localStorage as fallback
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && ['teal', 'blue', 'purple'].includes(stored)) {
      setThemeState(stored);
    }
    
    setIsLoading(false);
  }, [storageKey]);

  // Sync theme with user preferences from database when session is available
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user && status === 'authenticated') {
      // In a real implementation, you might fetch user preferences here
      // For now, we'll use localStorage
      const stored = localStorage.getItem(storageKey) as Theme;
      if (stored && ['teal', 'blue', 'purple'].includes(stored)) {
        setThemeState(stored);
      }
    }
    
    setIsLoading(false);
  }, [session, status, storageKey]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted || isLoading) return;

    const root = window.document.documentElement;
    
    // Remove old theme classes and data attributes
    root.removeAttribute('data-theme');
    root.classList.remove('theme-teal', 'theme-blue', 'theme-purple');
    
    // Set new theme
    root.setAttribute('data-theme', theme);
    root.classList.add(`theme-${theme}`);
    
    // Persist to localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey, mounted, isLoading]);

  // Theme setter with potential database sync
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // If user is authenticated, we could sync with database
    if (session?.user) {
      try {
        // In a real implementation, you would call an API to update user preferences
        // await fetch('/api/user/preferences', {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ theme: newTheme })
        // });
      } catch (error) {
        console.error('Failed to sync theme preference:', error);
        // Theme is still set locally, so user experience isn't broken
      }
    }
  };

  const value = {
    theme,
    setTheme,
    themes: initialState.themes,
    isLoading,
  };

  // Show nothing during SSR or while loading
  if (!mounted || isLoading) {
    return (
      <ThemeProviderContext.Provider value={value} {...props}>
        {children}
      </ThemeProviderContext.Provider>
    );
  }

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};