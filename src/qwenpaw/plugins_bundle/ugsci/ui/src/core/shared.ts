/**
 * Shared utilities and UI components used across multiple UGSci domain modules.
 */

import type React from "react";
import { getHost } from "./runtime";

// ─── Shared Styles ────────────────────────────────────────────────────────────

/**
 * Shared button style that matches the "新建聊天" (new chat) button:
 * solid #0072f5 fill, white text, 13px / 600 weight, no border, 8px radius.
 */
export const PRIMARY_BTN_STYLE: Record<string, unknown> = {
  background: "#0072f5",
  color: "#fff",
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
export function renderMarkdown(text: string, React: typeof import("react")) {
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
  extra?: React.ReactNode;
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
        borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
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
            { style: { marginTop: 4, fontSize: 13, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            subtitle,
          )
        : null,
    ),
    extra ? React.createElement(Space, null, extra) : null,
  );
}
