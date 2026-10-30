/**
 * Shared utilities and UI components used across multiple UGSci domain modules.
 */

import { getHost } from "./runtime";

// React is obtained from window.QwenPaw.host.React at runtime.
// This alias avoids `import from "react"` which fails to resolve in
// the packaging mirror directory (no node_modules).
type ReactNode = any;

// ─── Shared Styles ────────────────────────────────────────────────────────────

/**
 * Shared button geometry with contrast-safe colors supplied by the host theme.
 */
export const PRIMARY_BTN_STYLE: Record<string, unknown> = {
  background: "var(--app-action-bg, var(--app-accent, #0072f5))",
  color: "var(--app-action-fg, #fff)",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
};

// ─── Shared Helpers ───────────────────────────────────────────────────────────

/** Check if the sidebar is currently in simple mode. */
export function isSimpleMode(): boolean {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return false;
  }
}

/**
 * Render markdown text using the host's ReactMarkdown component.
 * Falls back to plain text if ReactMarkdown is not available.
 */
export function renderMarkdown(text: string, React: any) {
  const host = getHost();
  if (host.ReactMarkdown && host.remarkGfm) {
    return React.createElement(
      host.ReactMarkdown,
      { remarkPlugins: [host.remarkGfm] },
      text,
    );
  }
  // Fallback: strip basic markdown formatting
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^[-*]\s+/gm, "• ");
}

// ─── Shared Components ────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}) {
  const React = getHost().React;
  const { Space } = getHost().antd;
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: "1px solid var(--app-border)",
      },
    },
    React.createElement(
      "div",
      null,
      React.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        title,
      ),
      subtitle
        ? React.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 13,
                color: "var(--app-card-muted, #8c8c8c)",
              },
            },
            subtitle,
          )
        : null,
    ),
    extra ? React.createElement(Space, null, extra) : null,
  );
}
