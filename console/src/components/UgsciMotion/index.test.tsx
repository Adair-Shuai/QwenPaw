import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "antd";
import { UGSCI_BUTTON_LOADING, UgsciLoading, UgsciMotion } from ".";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

describe("UGSci cached motion", () => {
  let intersection: IntersectionObserverCallback;
  let mediaChange: () => void;
  let reduced: boolean;
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();
  const addMediaListener = vi.fn();
  const removeMediaListener = vi.fn();

  beforeEach(() => {
    reduced = false;
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        get matches() {
          return reduced;
        },
        addEventListener: addMediaListener.mockImplementation(
          (_event, listener) => {
            mediaChange = listener;
          },
        ),
        removeEventListener: removeMediaListener,
      })),
    );
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn().mockImplementation(function (callback) {
        intersection = callback;
        return { observe, unobserve, disconnect };
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function visible(element: Element, value: boolean) {
    act(() =>
      intersection(
        [
          {
            target: element,
            isIntersecting: value,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      ),
    );
  }

  it.each(["startup", "page", "content", "model", "files", "button"] as const)(
    "uses local browser-cacheable assets for %s and reuses the mounted image",
    (variant) => {
      const view = render(<UgsciMotion variant={variant} label="Motion" />);
      const image = screen.getByRole("img", { name: "Motion" });
      expect(image.getAttribute("src")).toContain(`${variant}-static.svg`);
      visible(image, true);
      expect(image.getAttribute("src")).toContain(`${variant}.svg`);
      expect(image.getAttribute("src")).not.toMatch(/^(?:https?:|data:|blob:)/);
      view.rerender(<UgsciMotion variant={variant} label="Motion" />);
      expect(screen.getByRole("img", { name: "Motion" })).toBe(image);
      view.rerender(
        <UgsciMotion variant={variant} label="Motion" active={false} />,
      );
      expect(image.getAttribute("src")).toContain(`${variant}-static.svg`);
    },
  );

  it("shares observers and subscriptions and releases them after the last instance", () => {
    const first = render(<UgsciMotion variant="content" />);
    const second = render(<UgsciMotion variant="button" />);
    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(addMediaListener).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(2);
    first.unmount();
    expect(disconnect).not.toHaveBeenCalled();
    expect(removeMediaListener).not.toHaveBeenCalled();
    second.unmount();
    expect(unobserve).toHaveBeenCalledTimes(2);
    expect(disconnect).toHaveBeenCalledOnce();
    expect(removeMediaListener).toHaveBeenCalledOnce();
  });

  it("stops offscreen and hidden-page animations and responds to reduced motion", () => {
    render(<UgsciMotion variant="files" label="Parsing" />);
    const image = screen.getByRole("img", { name: "Parsing" });
    visible(image, true);
    expect(image).toHaveAttribute("data-motion-running", "true");
    visible(image, false);
    expect(image).toHaveAttribute("data-motion-running", "false");
    visible(image, true);
    act(() => {
      vi.spyOn(document, "hidden", "get").mockReturnValue(true);
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(image.getAttribute("src")).toContain("files-static.svg");
    act(() => {
      vi.spyOn(document, "hidden", "get").mockReturnValue(false);
      document.dispatchEvent(new Event("visibilitychange"));
      reduced = true;
      mediaChange();
    });
    expect(image).toHaveAttribute("data-motion-running", "false");
    act(() => {
      reduced = false;
      mediaChange();
    });
    expect(image).toHaveAttribute("data-motion-running", "true");
  });

  it("does not create frame callbacks or timers while rendering and updating", () => {
    const frame = vi.spyOn(window, "requestAnimationFrame");
    const timer = vi.spyOn(window, "setInterval");
    const timeout = vi.spyOn(window, "setTimeout");
    const view = render(<UgsciMotion variant="model" label="Model" />);
    visible(screen.getByRole("img", { name: "Model" }), true);
    view.rerender(<UgsciMotion variant="model" label="Model" size={96} />);
    expect(frame).not.toHaveBeenCalled();
    expect(timer).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();
  });

  it("keeps native button busy guards and removes the icon after completion", () => {
    const onClick = vi.fn();
    const view = render(
      <Button
        aria-label="Save"
        loading={UGSCI_BUTTON_LOADING}
        onClick={onClick}
      >
        Save
      </Button>,
    );
    expect(
      view.container.querySelector('[data-ugsci-motion="button"]'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).not.toHaveBeenCalled();
    view.rerender(
      <Button aria-label="Save" loading={false} onClick={onClick}>
        Save
      </Button>,
    );
    expect(
      view.container.querySelector('[data-ugsci-motion="button"]'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps route loading accessible without starting a simulated progress timer", () => {
    const view = render(<UgsciLoading variant="page" label="Loading page" />);
    expect(
      screen.getByRole("status", { name: "Loading page" }),
    ).toHaveAttribute("aria-busy", "true");
    expect(
      view.container.querySelector('[data-ugsci-motion="page"]'),
    ).toBeInTheDocument();
  });

  it("uses cached startup assets in the pre-React bootstrap without a script loop", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    expect(html).toContain(
      'src="/src/assets/ugsci-motion/startup.svg?no-inline"',
    );
    expect(html).toContain(
      'srcset="/src/assets/ugsci-motion/startup-static.svg?no-inline"',
    );
    expect(html).toContain('media="(prefers-reduced-motion: reduce)"');
    expect(html).not.toContain("requestAnimationFrame");
    expect(html).not.toContain("setInterval");
  });

  it("loops assembled startup eyes rightward and traces all four rounded page edges", () => {
    const directory = resolve(process.cwd(), "src/assets/ugsci-motion");
    const startup = readFileSync(`${directory}/startup.svg`, "utf8");
    const startupDocument = new DOMParser().parseFromString(
      startup,
      "image/svg+xml",
    );
    const eyes = startupDocument.querySelector('[data-motion-part="eyes"]')!;
    expect(eyes.querySelectorAll("rect")).toHaveLength(4);
    expect(eyes.querySelector("g")?.getAttribute("transform")).toBe(
      "translate(-29 0)",
    );
    expect(startup).toContain(
      "animation:ugsm1-eye-scroll 1800ms linear 1800ms infinite both",
    );
    expect(startup).toContain(
      "from{transform:translateX(0px)}to{transform:translateX(29px)}",
    );
    for (const name of ["page.svg", "page-static.svg"]) {
      const source = readFileSync(`${directory}/${name}`, "utf8");
      const drawing = new DOMParser().parseFromString(source, "image/svg+xml");
      const outline = drawing.querySelector('[data-motion-part="outline"]')!;
      expect(outline.getAttribute("pathLength")).toBe("100");
      expect(outline.getAttribute("stroke-dasharray")).toBe("10 90");
      expect(outline.getAttribute("width")).toBe("224");
      expect(outline.getAttribute("height")).toBe("102");
      expect(outline.getAttribute("rx")).toBe("7");
      expect(drawing.querySelector('clipPath[id*="page-slot"]')).toBeNull();
      if (name === "page.svg") {
        expect(source).toContain(
          "animation:ugsm3-outline 2600ms linear infinite",
        );
        expect(source).toContain(
          "from{stroke-dashoffset:0}to{stroke-dashoffset:-100}",
        );
      }
    }
  });

  it("ships only twelve bounded vector assets with finite logo assembly and static fallbacks", () => {
    const directory = resolve(process.cwd(), "src/assets/ugsci-motion");
    const names = readdirSync(directory);
    expect(names).toHaveLength(12);
    let bytes = 0;
    for (const name of names) {
      const source = readFileSync(`${directory}/${name}`, "utf8");
      bytes += Buffer.byteLength(source);
      expect(source).not.toMatch(
        /<script|<foreignObject|<image|href=|data:|<animate/i,
      );
      if (name.includes("-static")) expect(source).not.toContain("@keyframes");
      if (name === "startup.svg") {
        for (const part of ["shell", "visor", "wordmark"]) {
          expect(source).toContain(
            `animation:ugsm1-${part} 1800ms ease 0ms 1 both`,
          );
        }
      }
    }
    expect(bytes).toBeLessThan(32 * 1024);
  });
});
