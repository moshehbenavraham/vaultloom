/**
 * Hand-rolled theme hook for AssetWise.
 *
 * Supports light / dark / system, persists the user's choice in localStorage
 * under `assetwise-theme`, and falls back to `prefers-color-scheme` when the
 * choice is `system` (the default).
 *
 * The inline anti-FOUC bootstrap script in `__root.tsx` and the initial
 * resolver used here both share the same localStorage key + media query
 * logic — exported as `themeBootstrapScript` below so the two can never
 * drift apart.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'assetwise-theme';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Inline bootstrap script — runs in <head> before paint to set the .dark
 * class and document.documentElement.style.colorScheme so the first paint
 * matches the user's stored or OS preference, with no flash.
 *
 * Keep this in sync with `getInitialResolvedTheme()` below.
 */
export const themeBootstrapScript = `(function(){
  try {
    var key = '${THEME_STORAGE_KEY}';
    var stored = null;
    try { stored = window.localStorage.getItem(key); } catch (_) {}
    var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = resolved;
  } catch (_) {}
})();`;

function safeGetStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (private mode, sandboxed iframe, etc.)
  }
  return 'system';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'light' || theme === 'dark') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  // Track native form controls / scrollbars to the active theme.
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // On the SSR pass we don't have access to localStorage or matchMedia, so
  // we default to 'system' / 'light'. The inline bootstrap script will have
  // already applied the correct class before hydration; we re-sync here.
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Hydrate from localStorage + media query on mount.
  useEffect(() => {
    const initial = safeGetStoredTheme();
    setThemeState(initial);
    const resolved = resolveTheme(initial);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }, []);

  // Subscribe to OS theme changes when the user is in 'system' mode.
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      const next: ResolvedTheme = event.matches ? 'dark' : 'light';
      setResolvedTheme(next);
      applyResolvedTheme(next);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    const resolved = resolveTheme(next);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  }, [theme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, cycleTheme }),
    [theme, resolvedTheme, setTheme, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Return a noop-shaped value when used outside the provider (e.g. in
    // a route loader or before hydration). This keeps the hook safe to
    // call from anywhere without throwing.
    return {
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: () => {},
      cycleTheme: () => {},
    };
  }
  return ctx;
}
