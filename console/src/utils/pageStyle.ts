/** Page geometry is independent of the color theme and light/dark mode. */
export const PAGE_STYLES = [
  { id: "classic", label: "Original layout" },
  { id: "deepseek", label: "deepseek style" },
  { id: "openai", label: "openai style" },
] as const;

export type PageStyle = (typeof PAGE_STYLES)[number]["id"];
export const PAGE_STYLE_STORAGE_KEY = "qwenpaw-page-style";

export const PAGE_LAYOUTS = {
  classic: { sidebarWidth: 280, sidebarMinWidth: 220, sidebarCollapsed: false },
  deepseek: {
    sidebarWidth: 208,
    sidebarMinWidth: 180,
    sidebarCollapsed: false,
  },
  openai: { sidebarWidth: 180, sidebarMinWidth: 160, sidebarCollapsed: false },
} as const;

export function parsePageStyle(value: unknown): PageStyle {
  return PAGE_STYLES.find((style) => style.id === value)?.id ?? "classic";
}

export function readPageStyle(): PageStyle {
  try {
    // Existing installations keep their selected color theme. Layout becomes
    // an explicit, independent preference rather than following that theme.
    return parsePageStyle(localStorage.getItem(PAGE_STYLE_STORAGE_KEY));
  } catch {
    return "classic";
  }
}

export function applyPageStyle(
  root: HTMLElement,
  style: PageStyle,
): () => void {
  root.dataset.pageStyle = style;
  const tokens: Record<string, string> =
    style === "classic"
      ? {}
      : {
          "--app-radius": "7px",
          "--border-radius": "7px",
          "--app-radius-card": "9px",
          "--app-radius-panel": "12px",
          "--app-composer-radius": style === "deepseek" ? "12px" : "10px",
          "--app-chat-max-width": "796px",
          "--app-chat-gutter": style === "deepseek" ? "28px" : "22px",
          "--app-message-max-width": "700px",
          "--app-preview-width": "30%",
          "--app-workspace-width": style === "openai" ? "48%" : "42%",
          "--app-shadow-sm": "none",
        };
  Object.entries(tokens).forEach(([key, value]) =>
    root.style.setProperty(key, value),
  );
  return () => {
    Object.keys(tokens).forEach((key) => root.style.removeProperty(key));
    delete root.dataset.pageStyle;
  };
}
