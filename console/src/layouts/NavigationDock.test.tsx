import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NavigationDock from "./NavigationDock";
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
class TestPointer extends MouseEvent {
  pointerId: number;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
  }
}
const edge = () =>
  document
    .querySelector("[data-navigation-dock]")
    ?.getAttribute("data-navigation-dock");
function Rail() {
  return (
    <div style={{ width: 1000, height: 700 }}>
      <NavigationDock>
        {(handle) => (
          <nav>
            <input
              aria-label="Retained navigation draft"
              defaultValue="draft"
            />
            {handle}
            <button>Account</button>
          </nav>
        )}
      </NavigationDock>
    </div>
  );
}
beforeEach(() => {
  localStorage.removeItem("ugsci_navigation_dock_v1");
  vi.stubGlobal("PointerEvent", TestPointer);
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      return {
        x: 0,
        y: 36,
        left: 0,
        top: 36,
        right: this.hasAttribute("data-navigation-orientation") ? 66 : 1000,
        bottom: 736,
        width: this.hasAttribute("data-navigation-orientation") ? 66 : 1000,
        height: 700,
        toJSON() {},
      } as DOMRect;
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("Navigation docking", () => {
  it("docks left right bottom and floating with orientation-specific six-dot grips while preserving mounted content", async () => {
    const view = render(<Rail />);
    const draft = screen.getByRole("textbox");
    fireEvent.change(draft, { target: { value: "unsaved navigation" } });
    const handle = screen.getByRole("button", { name: "sidebar.dock.handle" });
    for (const target of ["bottom", "right", "floating", "left"]) {
      fireEvent.click(handle);
      expect(await screen.findAllByRole("menuitem")).toHaveLength(4);
      expect(
        screen.queryByRole("menuitem", { name: "sidebar.dock.top" }),
      ).toBeNull();
      fireEvent.click(
        await screen.findByRole("menuitem", { name: `sidebar.dock.${target}` }),
      );
      await waitFor(() => expect(edge()).toBe(target));
      expect(screen.getByRole("textbox")).toBe(draft);
      expect(draft).toHaveValue("unsaved navigation");
      expect(
        handle.querySelector(
          target === "bottom"
            ? ".lucide-grip-vertical"
            : ".lucide-grip-horizontal",
        ),
      ).toBeTruthy();
    }
    view.unmount();
    render(<Rail />);
    expect(edge()).toBe("left");
  });
  it("falls back from saved top placements and keeps top-edge gestures floating", () => {
    localStorage.setItem(
      "ugsci_navigation_dock_v1",
      JSON.stringify({ edge: "top", x: 120, y: 80 }),
    );
    const view = render(<Rail />);
    expect(edge()).toBe("left");
    const handle = screen.getByRole("button", { name: "sidebar.dock.handle" });
    fireEvent.pointerDown(handle, {
      pointerId: 7,
      button: 0,
      clientX: 30,
      clientY: 500,
    });
    fireEvent.pointerMove(handle, {
      pointerId: 7,
      clientX: 400,
      clientY: 40,
    });
    expect(document.querySelectorAll("[data-dock-target]")).toHaveLength(3);
    expect(document.querySelector('[data-dock-target="top"]')).toBeNull();
    expect(document.querySelector('[data-active="true"]')).toBeNull();
    fireEvent.pointerUp(handle, { pointerId: 7 });
    expect(edge()).toBe("floating");
    expect(
      JSON.parse(localStorage.getItem("ugsci_navigation_dock_v1") ?? "null")
        .edge,
    ).toBe("floating");
    view.unmount();
    render(<Rail />);
    expect(edge()).toBe("floating");
    localStorage.setItem(
      "ugsci_navigation_dock_v1",
      JSON.stringify({ edge: "top", x: 120, y: 80 }),
    );
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", { key: "ugsci_navigation_dock_v1" }),
      ),
    );
    expect(edge()).toBe("left");
  });
  it("snaps real pointer gestures on release and cancels escape pointer cancellation and blur without saving", () => {
    render(<Rail />);
    const handle = screen.getByRole("button", { name: "sidebar.dock.handle" });
    const start = () =>
      fireEvent.pointerDown(handle, {
        pointerId: 7,
        button: 0,
        clientX: 30,
        clientY: 500,
      });
    start();
    fireEvent.pointerMove(handle, { pointerId: 8, clientX: 990, clientY: 500 });
    expect(document.querySelector("[data-dock-target]")).toBeNull();
    fireEvent.pointerMove(handle, { pointerId: 7, clientX: 990, clientY: 500 });
    expect(
      document.querySelector('[data-dock-target="right"][data-active="true"]'),
    ).toBeTruthy();
    expect(edge()).toBe("left");
    fireEvent.pointerUp(handle, { pointerId: 7 });
    expect(edge()).toBe("right");
    const saved = localStorage.getItem("ugsci_navigation_dock_v1");
    for (const cancel of [
      () => fireEvent.keyDown(window, { key: "Escape" }),
      () => fireEvent.pointerCancel(handle, { pointerId: 7 }),
      () => fireEvent.blur(window),
    ]) {
      start();
      fireEvent.pointerMove(handle, {
        pointerId: 7,
        clientX: 400,
        clientY: 40,
      });
      cancel();
      expect(edge()).toBe("right");
      expect(localStorage.getItem("ugsci_navigation_dock_v1")).toBe(saved);
      expect(document.querySelector("[data-dock-target]")).toBeNull();
    }
  });
  it("recovers corrupt placement and synchronizes idle windows without interrupting a drag", () => {
    localStorage.setItem(
      "ugsci_navigation_dock_v1",
      '{"edge":"bogus","x":null,"y":2}',
    );
    render(<Rail />);
    expect(edge()).toBe("left");
    localStorage.setItem(
      "ugsci_navigation_dock_v1",
      JSON.stringify({ edge: "bottom", x: 0, y: 0 }),
    );
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", { key: "ugsci_navigation_dock_v1" }),
      ),
    );
    expect(edge()).toBe("bottom");
  });
});
