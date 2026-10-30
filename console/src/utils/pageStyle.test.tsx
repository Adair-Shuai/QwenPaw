import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import { PAGE_STYLE_STORAGE_KEY } from "./pageStyle";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider syncRemote={false}>{children}</ThemeProvider>
);

describe("independent appearance preferences", () => {
  beforeEach(() => localStorage.clear());

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
    act(() => first.result.current.setPageStyle("openai"));
    expect(first.result.current.interfaceStyle).toBe("soft-focus");
    act(() => first.result.current.setThemeMode("dark"));
    expect(first.result.current.pageStyle).toBe("openai");
    expect(
      document.documentElement.style.getPropertyValue("--app-composer-radius"),
    ).toBe("10px");
    expect(localStorage.getItem(PAGE_STYLE_STORAGE_KEY)).toBe("openai");
    first.unmount();
    const second = renderHook(() => useTheme(), { wrapper });
    expect(second.result.current.pageStyle).toBe("openai");
    expect(second.result.current.interfaceStyle).toBe("soft-focus");
    expect(second.result.current.isDark).toBe(true);
    act(() => second.result.current.setPageStyle("classic"));
    expect(second.result.current.interfaceStyle).toBe("soft-focus");
    expect(
      document.documentElement.style.getPropertyValue("--app-chat-max-width"),
    ).toBe("");
  });

  it("synchronizes layout between windows without changing the color theme", () => {
    localStorage.setItem("qwenpaw-interface-style", "cool-workspace");
    localStorage.setItem(PAGE_STYLE_STORAGE_KEY, "invalid");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.pageStyle).toBe("classic");
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
    expect(result.current.pageStyle).toBe("classic");
  });
});
