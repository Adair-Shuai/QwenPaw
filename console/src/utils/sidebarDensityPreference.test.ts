import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sidebarDensityPreference } from "./sidebarDensityPreference";

const KEY = "ugsci_sidebar_density";

beforeEach(() => {
  localStorage.removeItem(KEY);
  const unsubscribe = sidebarDensityPreference.subscribe(() => {});
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  unsubscribe();
});

afterEach(() => vi.restoreAllMocks());

describe("Sidebar density preference", () => {
  it("defaults missing and invalid saved densities to medium", () => {
    expect(sidebarDensityPreference.get()).toBe("medium");
    localStorage.setItem(KEY, "invalid");
    expect(sidebarDensityPreference.get()).toBe("medium");
  });

  it("persists every density and releases same-window subscriptions", () => {
    const listener = vi.fn();
    const unsubscribe = sidebarDensityPreference.subscribe(listener);
    for (const density of ["comfortable", "compact", "medium"] as const) {
      sidebarDensityPreference.set(density);
      expect(localStorage.getItem(KEY)).toBe(density);
      expect(sidebarDensityPreference.get()).toBe(density);
    }
    expect(listener).toHaveBeenCalledTimes(3);
    unsubscribe();
    sidebarDensityPreference.set("compact");
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("follows cross-window changes and storage clearing", () => {
    const listener = vi.fn();
    const unsubscribe = sidebarDensityPreference.subscribe(listener);
    localStorage.setItem(KEY, "compact");
    window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    expect(listener).not.toHaveBeenCalled();
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    expect(listener).toHaveBeenCalledOnce();
    expect(sidebarDensityPreference.get()).toBe("compact");
    localStorage.clear();
    window.dispatchEvent(new StorageEvent("storage", { key: null }));
    expect(listener).toHaveBeenCalledTimes(2);
    expect(sidebarDensityPreference.get()).toBe("medium");
    unsubscribe();
  });

  it("keeps changes in memory when storage fails and saves after recovery", () => {
    const failure = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable");
    });
    sidebarDensityPreference.set("compact");
    expect(sidebarDensityPreference.get()).toBe("compact");
    failure.mockRestore();
    sidebarDensityPreference.set("comfortable");
    expect(localStorage.getItem(KEY)).toBe("comfortable");
    expect(sidebarDensityPreference.get()).toBe("comfortable");
  });
});
