import { PAGE_LAYOUTS, type PageStyle } from "../utils/pageStyle";

export const SIDEBAR_WIDTH_STORAGE_KEY = "qwenpaw_sidebar_width";
export const SIDEBAR_MIN_WIDTH = 220;
// Leave room below the minimum usable width before treating a drag as collapse.
export const SIDEBAR_COLLAPSE_WIDTH = 160;
export const SIDEBAR_MAX_WIDTH = 480;
export const SIDEBAR_RESIZE_STEP = 16;

export function clampSidebarWidth(
  width: number,
  minWidth = SIDEBAR_MIN_WIDTH,
): number {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(minWidth, Math.round(width)));
}

export function readStoredSidebarWidth(
  storage: Pick<Storage, "getItem"> | undefined,
  style: PageStyle = "classic",
): number | null {
  if (!storage) return null;

  try {
    const rawWidth = storage.getItem(
      style === "classic"
        ? SIDEBAR_WIDTH_STORAGE_KEY
        : `${SIDEBAR_WIDTH_STORAGE_KEY}:${style}`,
    );
    if (rawWidth === null) return null;

    const width = Number(rawWidth);
    return Number.isFinite(width)
      ? clampSidebarWidth(width, PAGE_LAYOUTS[style].sidebarMinWidth)
      : null;
  } catch {
    return null;
  }
}

export function writeStoredSidebarWidth(
  storage: Pick<Storage, "setItem"> | undefined,
  width: number,
  style: PageStyle = "classic",
): void {
  try {
    storage?.setItem(
      style === "classic"
        ? SIDEBAR_WIDTH_STORAGE_KEY
        : `${SIDEBAR_WIDTH_STORAGE_KEY}:${style}`,
      String(clampSidebarWidth(width, PAGE_LAYOUTS[style].sidebarMinWidth)),
    );
  } catch {
    // Storage may be unavailable in private browsing or embedded webviews.
  }
}

export function clearStoredSidebarWidth(
  storage: Pick<Storage, "removeItem"> | undefined,
  style: PageStyle = "classic",
): void {
  try {
    storage?.removeItem(
      style === "classic"
        ? SIDEBAR_WIDTH_STORAGE_KEY
        : `${SIDEBAR_WIDTH_STORAGE_KEY}:${style}`,
    );
  } catch {
    // Keep the in-memory reset even when persistence is unavailable.
  }
}
