export const SIDEBAR_WIDTH_STORAGE_KEY = "qwenpaw_sidebar_width";
export const SIDEBAR_MIN_WIDTH = 220;
export const SIDEBAR_MAX_WIDTH = 480;
export const SIDEBAR_RESIZE_STEP = 16;

export function clampSidebarWidth(width: number): number {
  return Math.min(
    SIDEBAR_MAX_WIDTH,
    Math.max(SIDEBAR_MIN_WIDTH, Math.round(width)),
  );
}

export function readStoredSidebarWidth(
  storage: Pick<Storage, "getItem"> | undefined,
): number | null {
  if (!storage) return null;

  try {
    const rawWidth = storage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (rawWidth === null) return null;

    const width = Number(rawWidth);
    return Number.isFinite(width) ? clampSidebarWidth(width) : null;
  } catch {
    return null;
  }
}

export function writeStoredSidebarWidth(
  storage: Pick<Storage, "setItem"> | undefined,
  width: number,
): void {
  try {
    storage?.setItem(
      SIDEBAR_WIDTH_STORAGE_KEY,
      String(clampSidebarWidth(width)),
    );
  } catch {
    // Storage may be unavailable in private browsing or embedded webviews.
  }
}

export function clearStoredSidebarWidth(
  storage: Pick<Storage, "removeItem"> | undefined,
): void {
  try {
    storage?.removeItem(SIDEBAR_WIDTH_STORAGE_KEY);
  } catch {
    // Keep the in-memory reset even when persistence is unavailable.
  }
}
