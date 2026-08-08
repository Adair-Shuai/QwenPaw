import "@testing-library/jest-dom";
import { vi } from "vitest";

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// matchMedia (required by antd)
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

// ResizeObserver (required by antd rc-resize-observer — must be a constructor, not arrow fn)
global.ResizeObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

// PointerEvent polyfill — jsdom 25 doesn't expose PointerEvent as a global,
// so @testing-library/dom falls back to plain Event which drops clientX/clientY.
// Alias to MouseEvent so pointer event tests can read coordinates.
if (typeof globalThis.PointerEvent === "undefined") {
  // @ts-expect-error – MouseEvent is a valid supertype for PointerEvent in tests
  globalThis.PointerEvent = MouseEvent;
}
if (typeof window.PointerEvent === "undefined") {
  Object.defineProperty(window, "PointerEvent", {
    value: globalThis.PointerEvent,
    writable: true,
    configurable: true,
  });
}
