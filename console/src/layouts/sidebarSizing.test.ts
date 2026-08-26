import { describe, expect, it, vi } from "vitest";
import {
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_WIDTH_STORAGE_KEY,
  clampSidebarWidth,
  readStoredSidebarWidth,
  writeStoredSidebarWidth,
} from "./sidebarSizing";

describe("sidebarSizing", () => {
  it("clamps and rounds resized widths", () => {
    expect(clampSidebarWidth(120)).toBe(SIDEBAR_MIN_WIDTH);
    expect(clampSidebarWidth(301.6)).toBe(302);
    expect(clampSidebarWidth(900)).toBe(SIDEBAR_MAX_WIDTH);
  });

  it("loads a valid stored width and ignores invalid values", () => {
    expect(
      readStoredSidebarWidth({
        getItem: () => "320",
      }),
    ).toBe(320);
    expect(
      readStoredSidebarWidth({
        getItem: () => "not-a-number",
      }),
    ).toBeNull();
  });

  it("persists the clamped width", () => {
    const setItem = vi.fn();
    writeStoredSidebarWidth({ setItem }, 999);

    expect(setItem).toHaveBeenCalledWith(
      SIDEBAR_WIDTH_STORAGE_KEY,
      String(SIDEBAR_MAX_WIDTH),
    );
  });
});
