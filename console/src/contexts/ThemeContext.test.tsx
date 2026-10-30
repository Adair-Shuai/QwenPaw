/**
 * Tests for ThemeContext.
 *
 * Covers:
 * - ThemeProvider renders children
 * - useTheme returns default context values
 * - setThemeMode updates theme and isDark
 * - toggleTheme switches between light and dark
 * - getInitialMode reads from localStorage
 * - resolveIsDark handles system preference
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ReactNode } from "react";
import { colorContrast } from "../utils/actionColors";
import { INTERFACE_STYLES } from "../utils/interfaceStyle";
import { ThemeProvider, useTheme } from "./ThemeContext";

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("ThemeProvider + useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("provides default theme context", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    // Default is "light" when no localStorage
    expect(result.current.themeMode).toBe("light");
    expect(result.current.isDark).toBe(false);
  });

  it("setThemeMode changes themeMode and isDark", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode("dark");
    });
    expect(result.current.themeMode).toBe("dark");
    expect(result.current.isDark).toBe(true);

    act(() => {
      result.current.setThemeMode("light");
    });
    expect(result.current.themeMode).toBe("light");
    expect(result.current.isDark).toBe(false);
  });

  it("setThemeMode persists to localStorage", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode("dark");
    });
    expect(localStorage.getItem("qwenpaw-theme")).toBe("dark");
  });

  it("toggleTheme switches between light and dark", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode("light");
    });
    expect(result.current.isDark).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.isDark).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.isDark).toBe(false);
  });

  it("reads initial mode from localStorage", () => {
    localStorage.setItem("qwenpaw-theme", "dark");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.themeMode).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("keeps custom colors and light-dark choice when switching interface styles", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    const custom = {
      accent: "#a9325f",
      radius: "15px",
      dark: { accent: "#e292b0", surface: "#242124" },
    };
    act(() => {
      result.current.setThemePreview(custom);
      result.current.setInterfaceStyle("warm-minimal");
    });
    expect(
      document.documentElement.style.getPropertyValue("--app-accent"),
    ).toBe("#485440");
    expect(result.current.previewTheme).toBe(custom);
    expect(
      document.documentElement.style.getPropertyValue("--app-text-inverse"),
    ).toBe("#ffffff");
    act(() => result.current.setThemeMode("dark"));
    expect(
      document.documentElement.style.getPropertyValue("--app-accent"),
    ).toBe("#b4c6a7");
    expect(
      document.documentElement.style.getPropertyValue("--app-text-inverse"),
    ).toBe("#1b1c19");
    act(() => result.current.setInterfaceStyle("classic"));
    expect(result.current.themeMode).toBe("dark");
    expect(
      document.documentElement.style.getPropertyValue("--app-accent"),
    ).toBe(custom.dark.accent);
    expect(
      document.documentElement.style.getPropertyValue("--app-surface"),
    ).toBe(custom.dark.surface);
    expect(
      document.documentElement.style.getPropertyValue("--app-composer-bg"),
    ).toBe("");
    expect(
      document.documentElement.style.getPropertyValue("--app-text-inverse"),
    ).toBe("");
  });

  it("falls back for invalid stored styles and synchronizes another window", () => {
    localStorage.setItem("qwenpaw-interface-style", "unknown-style");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.interfaceStyle).toBe("classic");
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "qwenpaw-interface-style",
          newValue: "soft-focus",
        }),
      ),
    );
    expect(result.current.interfaceStyle).toBe("soft-focus");
    expect(document.documentElement).toHaveAttribute(
      "data-interface-style",
      "soft-focus",
    );
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: null })));
    expect(result.current.interfaceStyle).toBe("classic");
  });
  it("updates readable card action roles live across all palettes and modes without changing layout", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setPageStyle("deepseek"));
    const root = document.documentElement;
    for (const style of INTERFACE_STYLES) {
      for (const mode of ["light", "dark"] as const) {
        act(() => {
          result.current.setInterfaceStyle(style.id);
          result.current.setThemeMode(mode);
        });
        const foreground = root.style.getPropertyValue("--app-action-fg");
        for (const role of [
          "--app-action-bg",
          "--app-action-hover",
          "--app-action-active",
        ]) {
          expect(
            colorContrast(foreground, root.style.getPropertyValue(role)),
          ).toBeGreaterThanOrEqual(4.5);
        }
        expect(root).toHaveAttribute("data-interface-style", style.id);
        expect(root).toHaveAttribute("data-page-style", "deepseek");
      }
    }
    act(() => {
      result.current.setInterfaceStyle("classic");
      result.current.setThemeMode("light");
      result.current.setThemePreview({
        accent: "#ffffff",
        accent_hover: "#eeeeee",
      });
    });
    expect(root.style.getPropertyValue("--app-action-fg")).toBe("#141413");
    expect(result.current.previewTheme.accent).toBe("#ffffff");
  });
});
