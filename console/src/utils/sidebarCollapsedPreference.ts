import { PAGE_LAYOUTS, type PageStyle } from "./pageStyle";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "qwenpaw_sidebar_collapsed";

/**
 * Read the current style's explicit choice, falling back to its layout.
 * The original style retains its existing storage key and expanded default.
 */
export function getSidebarCollapsedPreference(
  style: PageStyle = "classic",
): boolean {
  try {
    const value = localStorage.getItem(
      style === "classic"
        ? SIDEBAR_COLLAPSED_STORAGE_KEY
        : `${SIDEBAR_COLLAPSED_STORAGE_KEY}:${style}`,
    );
    if (value === "true" || value === "false") return value === "true";
  } catch {
    // Use the selected style's default when storage is unavailable.
  }
  return PAGE_LAYOUTS[style].sidebarCollapsed;
}

/**
 * Persist the sidebar collapsed preference set by an explicit user toggle.
 *
 * The original style removes the expanded key as before. New styles store
 * both choices so an explicitly expanded focus layout survives a reload.
 * Viewport-driven collapsing must not persist a preference.
 */
export function setSidebarCollapsedPreference(
  collapsed: boolean,
  style: PageStyle = "classic",
): void {
  try {
    if (style !== "classic") {
      localStorage.setItem(
        `${SIDEBAR_COLLAPSED_STORAGE_KEY}:${style}`,
        String(collapsed),
      );
      return;
    }
    if (collapsed) {
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    }
  } catch {
    // storage unavailable
  }
}
