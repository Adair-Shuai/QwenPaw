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
import { createPortal } from "react-dom";
import { readFileSync } from "node:fs";
import WorkbenchTabBar from "../features/files-workspace/WorkbenchTabBar";
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
  startDragging: vi.fn(),
  stop: vi.fn(),
  resized: undefined as (() => void) | undefined,
}));
vi.mock("@tauri-apps/api/core", () => ({ isTauri: () => native.enabled }));
vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    minimize: native.minimize,
    toggleMaximize: native.toggleMaximize,
    close: native.close,
    startDragging: native.startDragging,
    isMaximized: async () => native.max,
    isFullscreen: async () => native.full,
    onResized: async (callback: () => void) => {
      native.resized = callback;
      return native.stop;
    },
  }),
}));
vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
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
  native.resized = undefined;
  native.startDragging.mockReset().mockResolvedValue(undefined);
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockTitlebarBounds(height = 44) {
  vi.spyOn(
    screen.getAllByRole("banner")[0],
    "getBoundingClientRect",
  ).mockReturnValue(new DOMRect(0, 0, 146, height));
}

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

  it("drags the full macOS top band without changing the mounted frame markup", async () => {
    native.enabled = true;
    Object.defineProperty(navigator, "platform", { value: "MacIntel" });
    const { container } = render(
      <DesktopWindowFrame>
        <DesktopWindowFrame>
          <Conversations />
          <div data-main-layout>
            <span>Page heading</span>
          </div>
        </DesktopWindowFrame>
      </DesktopWindowFrame>,
    );
    mockTitlebarBounds();
    await waitFor(() => expect(native.resized).toBeTypeOf("function"));
    const markup = container.innerHTML;
    const allowed = fireEvent.mouseDown(screen.getByText("Page heading"), {
      button: 0,
      detail: 1,
      clientX: 900,
      clientY: 20,
    });
    await waitFor(() => expect(native.startDragging).toHaveBeenCalledOnce());
    expect(allowed).toBe(false);
    expect(container.innerHTML).toBe(markup);
    expect(screen.getAllByRole("banner")).toHaveLength(1);
  });

  it("keeps top band controls editable and independent of window dragging", async () => {
    native.enabled = true;
    const clicked = vi.fn();
    render(
      <DesktopWindowFrame>
        <button onClick={clicked}>
          <span>Toolbar action</span>
        </button>
        <a href="#details">
          <span>Toolbar link</span>
        </a>
        <input aria-label="Search" />
        <textarea aria-label="Message" />
        <select aria-label="Choice">
          <option>One</option>
        </select>
        <div contentEditable suppressContentEditableWarning>
          <span>Editable title</span>
        </div>
        <span role="button" tabIndex={0}>
          Custom action
        </span>
        <div role="slider" aria-label="Size">
          <span>Resize control</span>
        </div>
        <div role="separator" aria-label="Split">
          <span>Split handle</span>
        </div>
        <span data-tauri-drag-region="false">Opted out</span>
      </DesktopWindowFrame>,
    );
    mockTitlebarBounds();
    for (const element of [
      screen.getByText("Toolbar action"),
      screen.getByText("Toolbar link"),
      screen.getByLabelText("Search"),
      screen.getByLabelText("Message"),
      screen.getByLabelText("Choice"),
      screen.getByText("Editable title"),
      screen.getByText("Custom action"),
      screen.getByText("Resize control"),
      screen.getByText("Split handle"),
      screen.getByText("Opted out"),
    ]) {
      expect(
        fireEvent.mouseDown(element, { button: 0, detail: 1, clientY: 20 }),
      ).toBe(true);
    }
    fireEvent.click(screen.getByText("Toolbar action"));
    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "query" },
    });
    expect(clicked).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Search")).toHaveValue("query");
    expect(native.startDragging).not.toHaveBeenCalled();
  });

  it("drags mounted workbench whitespace while preserving real tab reordering and actions", async () => {
    native.enabled = true;
    const onDragging = vi.fn();
    const onNew = vi.fn();
    render(
      <DesktopWindowFrame>
        <WorkbenchTabBar
          tabs={[{ id: "file", title: "Report.md", kind: "files" }]}
          idPrefix="native-drag"
          activeId="file"
          dirtyPaths={new Set()}
          changedPaths={new Set()}
          onSelect={vi.fn()}
          onClose={vi.fn()}
          onCloseOthers={vi.fn()}
          onCloseAll={vi.fn()}
          onNew={onNew}
          actions={null}
          onDragging={onDragging}
        />
      </DesktopWindowFrame>,
    );
    mockTitlebarBounds();
    const tab = screen.getByRole("tab");
    fireEvent.mouseDown(tab.querySelector("span")!, {
      button: 0,
      detail: 1,
      clientY: 20,
    });
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };
    fireEvent.dragStart(tab, { dataTransfer });
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      "application/x-qwenpaw-workbench-tab",
      JSON.stringify({ scope: "native-drag", id: "file" }),
    );
    expect(onDragging).toHaveBeenCalledWith(true);
    fireEvent.dragEnd(tab);
    expect(onDragging).toHaveBeenLastCalledWith(false);
    const add = screen.getByRole("button", { name: "workbench.tabs.addTab" });
    fireEvent.mouseDown(add, { button: 0, detail: 1, clientY: 20 });
    fireEvent.click(add);
    expect(onNew).toHaveBeenCalledOnce();
    expect(native.startDragging).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByRole("tablist"), {
      button: 0,
      detail: 1,
      clientX: 900,
      clientY: 20,
    });
    await waitFor(() => expect(native.startDragging).toHaveBeenCalledOnce());
  });

  it("limits extended dragging to primary single clicks inside the visible top band", () => {
    native.enabled = true;
    render(
      <DesktopWindowFrame>
        <span>Page content</span>
        <span onMouseDown={(event) => event.preventDefault()}>
          Handled gesture
        </span>
        {createPortal(<span>Portal menu</span>, document.body)}
      </DesktopWindowFrame>,
    );
    mockTitlebarBounds();
    const content = screen.getByText("Page content");
    for (const event of [
      { button: 0, detail: 1, clientY: -1 },
      { button: 0, detail: 1, clientY: 44 },
      { button: 0, detail: 1, clientY: 160 },
      { button: 2, detail: 1, clientY: 20 },
      { button: 1, detail: 1, clientY: 20 },
      { button: 0, detail: 2, clientY: 20 },
    ])
      fireEvent.mouseDown(content, event);
    fireEvent.mouseDown(screen.getByText("Handled gesture"), {
      button: 0,
      detail: 1,
      clientY: 20,
    });
    fireEvent.mouseDown(screen.getByText("Portal menu"), {
      button: 0,
      detail: 1,
      clientY: 20,
    });
    expect(native.startDragging).not.toHaveBeenCalled();
  });

  it.each(["MacIntel", "Win32"])(
    "uses the actual desktop menu band and skips fullscreen on %s",
    async (platform) => {
      native.enabled = true;
      Object.defineProperty(navigator, "platform", { value: platform });
      render(
        <DesktopWindowFrame>
          <div data-desktop-os>
            <div data-desktop-menubar data-tauri-drag-region>
              <span>Desktop title</span>
            </div>
            <span>Desktop body</span>
          </div>
        </DesktopWindowFrame>,
      );
      mockTitlebarBounds();
      vi.spyOn(
        document.querySelector("[data-desktop-menubar]")!,
        "getBoundingClientRect",
      ).mockReturnValue(new DOMRect(0, 0, 1000, 28));
      fireEvent.mouseDown(screen.getByText("Desktop body"), {
        button: 0,
        detail: 1,
        clientY: 32,
      });
      expect(native.startDragging).not.toHaveBeenCalled();
      fireEvent.mouseDown(screen.getByText("Desktop title"), {
        button: 0,
        detail: 1,
        clientY: 20,
      });
      await waitFor(() => expect(native.startDragging).toHaveBeenCalledOnce());
      native.full = true;
      await act(async () => native.resized?.());
      fireEvent.mouseDown(screen.getByText("Desktop title"), {
        button: 0,
        detail: 1,
        clientY: 20,
      });
      expect(native.startDragging).toHaveBeenCalledOnce();
    },
  );

  it("keeps existing native regions single and retries failed extended dragging", async () => {
    native.enabled = true;
    native.startDragging.mockRejectedValueOnce(new Error("temporary failure"));
    render(
      <DesktopWindowFrame>
        <span>Plain heading</span>
        <span data-tauri-drag-region="deep">
          <span>Native subtree</span>
        </span>
      </DesktopWindowFrame>,
    );
    mockTitlebarBounds();
    fireEvent.mouseDown(screen.getByRole("banner"), {
      button: 0,
      detail: 1,
      clientY: 20,
    });
    fireEvent.mouseDown(screen.getByText("Native subtree"), {
      button: 0,
      detail: 1,
      clientY: 20,
    });
    expect(native.startDragging).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByText("Plain heading"), {
      button: 0,
      detail: 1,
      clientY: 20,
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Window action failed",
    );
    fireEvent.mouseDown(screen.getByText("Plain heading"), {
      button: 0,
      detail: 1,
      clientY: 20,
    });
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(native.startDragging).toHaveBeenCalledTimes(2);
  });

  it.each(["macos", "windows"])(
    "keeps native dragging inactive in the %s browser preview",
    (platform) => {
      window.history.replaceState(null, "", `/chat?desktopPreview=${platform}`);
      render(
        <DesktopWindowFrame>
          <span>Preview title</span>
        </DesktopWindowFrame>,
      );
      mockTitlebarBounds();
      fireEvent.mouseDown(screen.getByText("Preview title"), {
        button: 0,
        detail: 1,
        clientY: 20,
      });
      expect(native.startDragging).not.toHaveBeenCalled();
    },
  );
});
