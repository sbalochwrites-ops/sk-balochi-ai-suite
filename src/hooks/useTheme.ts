import { useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'sk_ai_studio_theme';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch {
    // Ignore storage read restrictions
  }
  return 'light';
}

function applyThemeToRoot(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    applyThemeToRoot(theme);
  }, [theme]);

  // Keep in sync with OS preference only if the user has not explicitly chosen a theme
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored) {
          setThemeState(e.matches ? 'dark' : 'light');
        }
      } catch {
        // Ignore
      }
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    applyThemeToRoot(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyThemeToRoot(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
}
