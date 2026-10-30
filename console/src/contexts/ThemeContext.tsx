import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import { themeApi, type ThemeConfig } from "@/api/modules/theme";
import {
  applyInterfaceTheme,
  INTERFACE_STYLE_STORAGE_KEY,
  parseInterfaceStyle,
  readInterfaceStyle,
  type InterfaceStyle,
} from "../utils/interfaceStyle";

import {
  applyPageStyle,
  PAGE_STYLE_STORAGE_KEY,
  parsePageStyle,
  readPageStyle,
  type PageStyle,
} from "../utils/pageStyle";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "qwenpaw-theme";

interface ThemeContextValue {
  /** User selected preference: light / dark / system */
  themeMode: ThemeMode;
  interfaceStyle: InterfaceStyle;
  setInterfaceStyle: (style: InterfaceStyle) => void;
  pageStyle: PageStyle;
  setPageStyle: (style: PageStyle) => void;
  /** Resolved final theme after applying system preference */
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  /** Convenience toggle: light ↔ dark (skips system) */
  toggleTheme: () => void;
  userTheme: ThemeConfig;
  previewTheme: ThemeConfig;
  setThemePreview: (theme: ThemeConfig) => void;
  saveUserTheme: (theme: ThemeConfig) => Promise<ThemeConfig>;
  resetUserTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: "light",
  interfaceStyle: "classic",
  setInterfaceStyle: () => {},
  pageStyle: "classic",
  setPageStyle: () => {},
  isDark: false,
  setThemeMode: () => {},
  toggleTheme: () => {},
  userTheme: {},
  previewTheme: {},
  setThemePreview: () => {},
  saveUserTheme: async () => ({}),
  resetUserTheme: async () => {},
});

function getInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore storage errors
  }
  return "light";
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  // system
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function ThemeProvider({
  children,
  syncRemote = true,
}: {
  children: ReactNode;
  syncRemote?: boolean;
}) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialMode);
  const [isDark, setIsDark] = useState<boolean>(() =>
    resolveIsDark(getInitialMode()),
  );
  const [userTheme, setUserTheme] = useState<ThemeConfig>({});
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig>({});
  const [interfaceStyle, setInterfaceStyleState] = useState(readInterfaceStyle);
  const [pageStyle, setPageStyleState] = useState(readPageStyle);
  const setPageStyle = useCallback((style: PageStyle) => {
    const next = parsePageStyle(style);
    setPageStyleState(next);
    try {
      localStorage.setItem(PAGE_STYLE_STORAGE_KEY, next);
    } catch {
      /* Apply in memory when storage is unavailable. */
    }
  }, []);

  const setInterfaceStyle = useCallback((style: InterfaceStyle) => {
    const next = parseInterfaceStyle(style);
    setInterfaceStyleState(next);
    try {
      localStorage.setItem(INTERFACE_STYLE_STORAGE_KEY, next);
    } catch {
      // Still apply the style for this window when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === INTERFACE_STYLE_STORAGE_KEY || event.key === null) {
        setInterfaceStyleState(parseInterfaceStyle(event.newValue));
      }
      if (event.key === PAGE_STYLE_STORAGE_KEY || event.key === null) {
        setPageStyleState(parsePageStyle(event.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useLayoutEffect(() => {
    const clearTheme = applyInterfaceTheme(
      document.documentElement,
      interfaceStyle,
      previewTheme,
      isDark,
    );
    const clearLayout = applyPageStyle(document.documentElement, pageStyle);
    return () => {
      clearLayout();
      clearTheme();
    };
  }, [interfaceStyle, previewTheme, isDark, pageStyle]);

  useEffect(() => {
    if (!syncRemote) return;
    let cancelled = false;
    themeApi
      .get()
      .then((theme) => {
        if (!cancelled) {
          setUserTheme(theme);
          setPreviewTheme(theme);
        }
      })
      .catch(() => {
        // Theme loading is optional; built-in defaults remain active.
      });
    return () => {
      cancelled = true;
    };
  }, [syncRemote]);

  const saveUserTheme = useCallback(async (theme: ThemeConfig) => {
    const saved = await themeApi.update(theme);
    setUserTheme(saved);
    setPreviewTheme((current) => (current === theme ? saved : current));
    return saved;
  }, []);

  const resetUserTheme = useCallback(async () => {
    await themeApi.reset();
    setUserTheme({});
    setPreviewTheme({});
  }, []);

  // Apply dark/light class to <html> element for global CSS variable overrides
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark-mode");
    } else {
      html.classList.remove("dark-mode");
    }
  }, [isDark]);

  // Listen to system theme changes when mode is "system"
  useEffect(() => {
    if (themeMode !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeMode]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    setIsDark(resolveIsDark(mode));
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? "light" : "dark");
  }, [isDark, setThemeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        interfaceStyle,
        setInterfaceStyle,
        pageStyle,
        setPageStyle,
        isDark,
        setThemeMode,
        toggleTheme,
        userTheme,
        previewTheme,
        setThemePreview: setPreviewTheme,
        saveUserTheme,
        resetUserTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
