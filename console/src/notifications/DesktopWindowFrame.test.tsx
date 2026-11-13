import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCallback, useState } from "react";
import { readFileSync } from "node:fs";
import DesktopWindowFrame, {
  useWindowSidebar,
} from "../tauri/DesktopWindowFrame";

const native = vi.hoisted(() => ({
  enabled: false,
  max: false,
  full: false,
  minimize: vi.fn(),
  toggleMaximize: vi.fn(),
  close: vi.fn(),
  stop: vi.fn(),
  resized: undefined as (() => void) | undefined,
}));
vi.mock("@tauri-apps/api/core", () => ({ isTauri: () => native.enabled }));
vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    minimize: native.minimize,
    toggleMaximize: native.toggleMaximize,
    close: native.close,
    isMaximized: async () => native.max,
    isFullscreen: async () => native.full,
    onResized: async (callback: () => void) => {
      native.resized = callback;
      return native.stop;
    },
  }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));
function Conversations() {
  const [expanded, setExpanded] = useState(true);
  const toggle = useCallback(() => setExpanded((current) => !current), []);
  useWindowSidebar({ expanded, toggle });
  return (
    <div id="ugsci-sidebar-conversations" hidden={!expanded}>
      Actual conversation pane
    </div>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  native.enabled = false;
  native.max = false;
  native.full = false;
  native.close.mockResolvedValue(undefined);
  native.toggleMaximize.mockImplementation(async () => {
    native.max = !native.max;
  });
  window.history.replaceState(null, "", "/chat");
  Object.defineProperty(navigator, "platform", {
    configurable: true,
    value: "Win32",
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("Desktop window frame", () => {
  it("recognizes the native macOS invoke bridge when the SDK platform flag is missing", async () => {
    vi.stubGlobal("__TAURI_INTERNALS__", { invoke: vi.fn() });
    Object.defineProperty(navigator, "platform", {
      configurable: true,
      value: "MacIntel",
    });
    render(
      <DesktopWindowFrame>
        <Conversations />
      </DesktopWindowFrame>,
    );
    expect(
      document.querySelector('[data-window-platform="macos"]'),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close window" })).toBeNull();
    expect(document.querySelector('[class*="trafficLights"]')).toBeNull();
    await waitFor(() => expect(native.resized).toBeTypeOf("function"));
  });
  it("keeps one titlebar across bootstrap nesting and toggles the mounted conversations with one icon", () => {
    render(
      <DesktopWindowFrame>
        <DesktopWindowFrame>
          <Conversations />
        </DesktopWindowFrame>
      </DesktopWindowFrame>,
    );
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    const toggle = screen.getByRole("button", {
      name: "Collapse conversation pane",
    });
    expect(toggle.querySelector(".lucide-panel-left")).toBeTruthy();
    fireEvent.click(toggle);
    expect(screen.getByText("Actual conversation pane")).not.toBeVisible();
    expect(
      screen.getByRole("button", { name: "Expand conversation pane" }),
    ).toBe(toggle);
    expect(toggle.querySelector(".lucide-panel-left")).toBeTruthy();
  });
  it("uses native minimize maximize restore and close with resize synchronization and retry", async () => {
    native.enabled = true;
    const view = render(
      <DesktopWindowFrame>
        <Conversations />
      </DesktopWindowFrame>,
    );
    await waitFor(() => expect(native.resized).toBeTypeOf("function"));
    fireEvent.click(screen.getByRole("button", { name: "Minimize window" }));
    await waitFor(() => expect(native.minimize).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Maximize window" }),
      ).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Maximize window" }));
    await screen.findByRole("button", { name: "Restore window" });
    native.max = false;
    await act(async () => native.resized?.());
    await screen.findByRole("button", { name: "Maximize window" });
    native.close.mockRejectedValueOnce(new Error("temporary failure"));
    fireEvent.click(screen.getByRole("button", { name: "Close window" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Window action failed",
    );
    fireEvent.click(screen.getByRole("button", { name: "Close window" }));
    await waitFor(() => expect(native.close).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("alert")).toBeNull();
    view.unmount();
    expect(native.stop).toHaveBeenCalledOnce();
  });
  it("reserves macOS traffic lights and exposes browser previews without invoking native commands", () => {
    window.history.replaceState(null, "", "/chat?desktopPreview=macos");
    const view = render(
      <DesktopWindowFrame>
        <Conversations />
      </DesktopWindowFrame>,
    );
    expect(
      document.querySelector('[data-window-platform="macos"]'),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close window" })).toBeNull();
    view.unmount();
    window.history.replaceState(null, "", "/chat?desktopPreview=windows");
    render(
      <DesktopWindowFrame>
        <Conversations />
      </DesktopWindowFrame>,
    );
    const close = screen.getByRole("button", { name: "Close window" });
    expect(close).toBeDisabled();
    fireEvent.click(close);
    expect(native.close).not.toHaveBeenCalled();
  });
  it("ships platform frame configuration and only the required native control permissions", () => {
    const config = JSON.parse(
      readFileSync("src-tauri/tauri.conf.json", "utf8"),
    );
    const mac = JSON.parse(
      readFileSync("src-tauri/tauri.macos.conf.json", "utf8"),
    );
    expect(config.app.windows[0]).toMatchObject({
      decorations: false,
      resizable: true,
    });
    expect(mac.app.windows[0]).toMatchObject({
      decorations: true,
      titleBarStyle: "Overlay",
      hiddenTitle: true,
    });
    expect(mac.app.windows[0].minWidth).toBe(config.app.windows[0].minWidth);
    const capability = JSON.parse(
      readFileSync("src-tauri/capabilities/default.json", "utf8"),
    );
    expect(capability.windows).toEqual(["main"]);
    for (const name of [
      "close",
      "minimize",
      "toggle-maximize",
      "start-dragging",
    ])
      expect(capability.permissions).toContain(`core:window:allow-${name}`);
  });
});
