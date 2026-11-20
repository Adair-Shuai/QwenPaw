import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import {
  PAGE_STYLES,
  PAGE_STYLE_STORAGE_KEY,
  parsePageStyle,
} from "./pageStyle";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider syncRemote={false}>{children}</ThemeProvider>
);

describe("independent appearance preferences", () => {
  beforeEach(() => localStorage.clear());

  it("starts a fresh installation in the light Yanjing dual-sidebar appearance", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.pageStyle).toBe("dual-sidebar");
    expect(result.current.interfaceStyle).toBe("warm-minimal");
    expect(result.current.themeMode).toBe("light");
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement).toHaveAttribute(
      "data-page-style",
      "dual-sidebar",
    );
    expect(document.documentElement).toHaveAttribute(
      "data-interface-style",
      "warm-minimal",
    );
    expect(
      document.documentElement.style.getPropertyValue("--app-shell-bg"),
    ).toBe("#f5f5f3");
  });
  it("restores an existing classic appearance and dark mode after the default changes", () => {
    localStorage.setItem(PAGE_STYLE_STORAGE_KEY, "classic");
    localStorage.setItem("qwenpaw-interface-style", "classic");
    localStorage.setItem("qwenpaw-theme", "dark");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.pageStyle).toBe("classic");
    expect(result.current.interfaceStyle).toBe("classic");
    expect(result.current.isDark).toBe(true);
  });
  it("uses the installed Yanjing defaults when local storage is unavailable", () => {
    const read = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("Storage unavailable");
      });
    try {
      const { result } = renderHook(() => useTheme(), { wrapper });
      expect(result.current.pageStyle).toBe("dual-sidebar");
      expect(result.current.interfaceStyle).toBe("warm-minimal");
      expect(result.current.isDark).toBe(false);
    } finally {
      read.mockRestore();
    }
  });

  it("keeps the theme, layout and light-dark mode independent across switches and reloads", () => {
    localStorage.setItem("qwenpaw-interface-style", "warm-minimal");
    const first = renderHook(() => useTheme(), { wrapper });
    expect(first.result.current.interfaceStyle).toBe("warm-minimal");
    act(() => first.result.current.setPageStyle("deepseek"));
    expect(
      document.documentElement.style.getPropertyValue("--app-chat-max-width"),
    ).toBe("796px");
    act(() => first.result.current.setInterfaceStyle("soft-focus"));
    expect(first.result.current.pageStyle).toBe("deepseek");
    expect(
      document.documentElement.style.getPropertyValue("--app-composer-radius"),
    ).toBe("12px");
    act(() => first.result.current.setPageStyle("classic"));
    expect(first.result.current.interfaceStyle).toBe("soft-focus");
    expect(
      document.documentElement.style.getPropertyValue("--app-composer-radius"),
    ).toBe("");
    act(() => first.result.current.setPageStyle("deepseek"));
    act(() => first.result.current.setThemeMode("dark"));
    expect(first.result.current.pageStyle).toBe("deepseek");
    expect(
      document.documentElement.style.getPropertyValue("--app-composer-radius"),
    ).toBe("12px");
    expect(localStorage.getItem(PAGE_STYLE_STORAGE_KEY)).toBe("deepseek");
    first.unmount();
    const second = renderHook(() => useTheme(), { wrapper });
    expect(second.result.current.pageStyle).toBe("deepseek");
    expect(second.result.current.interfaceStyle).toBe("soft-focus");
    expect(second.result.current.isDark).toBe(true);
    act(() => second.result.current.setPageStyle("classic"));
    expect(second.result.current.interfaceStyle).toBe("soft-focus");
    expect(
      document.documentElement.style.getPropertyValue("--app-chat-max-width"),
    ).toBe("");
  });

  it("restores the retired layout as Simple style and offers only supported choices", () => {
    localStorage.setItem(PAGE_STYLE_STORAGE_KEY, "openai");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.pageStyle).toBe("deepseek");
    expect(document.documentElement).toHaveAttribute(
      "data-page-style",
      "deepseek",
    );
    expect(PAGE_STYLES.map((style) => style.label)).toEqual([
      "UGSci Yanjing layout",
      "Original layout",
      "Simple style",
    ]);
    expect(parsePageStyle("deepseek")).toBe("deepseek");
    expect(parsePageStyle("unknown")).toBe("dual-sidebar");
  });

  it("synchronizes layout between windows without changing the color theme", () => {
    localStorage.setItem("qwenpaw-interface-style", "cool-workspace");
    localStorage.setItem(PAGE_STYLE_STORAGE_KEY, "invalid");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.pageStyle).toBe("dual-sidebar");
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: PAGE_STYLE_STORAGE_KEY,
          newValue: "deepseek",
        }),
      ),
    );
    expect(result.current.pageStyle).toBe("deepseek");
    expect(result.current.interfaceStyle).toBe("cool-workspace");
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: null })));
    expect(result.current.pageStyle).toBe("dual-sidebar");
  });

  it("persists Dual sidebar independently from the palette and restores it after reload", () => {
    localStorage.setItem("qwenpaw-interface-style", "warm-minimal");
    const first = renderHook(() => useTheme(), { wrapper });
    act(() => first.result.current.setPageStyle("dual-sidebar"));
    expect(first.result.current.interfaceStyle).toBe("warm-minimal");
    expect(localStorage.getItem(PAGE_STYLE_STORAGE_KEY)).toBe("dual-sidebar");
    first.unmount();
    const second = renderHook(() => useTheme(), { wrapper });
    expect(second.result.current.pageStyle).toBe("dual-sidebar");
    expect(document.documentElement).toHaveAttribute(
      "data-page-style",
      "dual-sidebar",
    );
    act(() => second.result.current.setInterfaceStyle("soft-focus"));
    expect(second.result.current.pageStyle).toBe("dual-sidebar");
  });
});
