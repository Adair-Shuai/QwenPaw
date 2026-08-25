import React from "react";

export interface SafeChatAction {
  icon?: React.ReactNode;
  render?: (context: { data: unknown }) => React.ReactNode;
  onClick?: (context: { data: unknown }) => void;
  [key: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Keep the vendor chat component on its array-based contract across versions. */
export function normalizeChatActions(value: unknown): SafeChatAction[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord) as SafeChatAction[];
  }
  if (isRecord(value) && Array.isArray(value.list)) {
    return value.list.filter(isRecord) as SafeChatAction[];
  }
  return [];
}

/** React rejects plain objects as children; tolerate malformed plugin output. */
export function isRenderableActionNode(value: unknown): value is React.ReactNode {
  if (value == null || typeof value === "string" || typeof value === "number") {
    return true;
  }
  if (typeof value === "boolean" || React.isValidElement(value)) return true;
  return Array.isArray(value) && value.every(isRenderableActionNode);
}
