/**
 * simpleModeWhitelist.ts — mutable whitelist for simple sidebar mode.
 *
 * The sidebar's "simple" mode shows only a curated subset of menu items.
 * Historically this was a hardcoded `Set` inside `Sidebar.tsx`, which meant
 * plugins could not make their entries visible in simple mode without
 * modifying host code.
 *
 * This module exports the same Set as a **mutable singleton** plus a
 * `registerSimpleModeItem()` helper that plugins can call (via the
 * `window.QwenPaw.sidebar.registerSimpleModeItem` bridge in
 * `hostExternals.ts`) to add their own menu item IDs.
 *
 * Builtin IDs are seeded here so the Set is ready before the first render.
 */

// ── Builtin IDs that are always visible in simple mode ──────────────────────
// NOTE: "core.agent-config" (运行配置) and "core.models" (模型设置) are
// intentionally excluded — they are full-mode-only and hidden in simple mode.

const BUILTIN_SIMPLE_MODE_IDS = [
  "core.inbox",
  "core.app-center",
  "core.cron-jobs",
];

// ── Mutable singleton ────────────────────────────────────────────────────────

/** Menu item IDs that remain visible in simple sidebar mode (no groups). */
export const simpleModeWhitelist: Set<string> = new Set(
  BUILTIN_SIMPLE_MODE_IDS,
);

/**
 * Register a menu item ID so it stays visible in simple sidebar mode.
 *
 * Called by plugins (via `window.QwenPaw.sidebar.registerSimpleModeItem`)
 * to ensure their menu entries are not filtered out when the user switches
 * to simple mode.
 *
 * @param id - Menu item ID to add to the whitelist.
 */
export function registerSimpleModeItem(id: string): void {
  simpleModeWhitelist.add(id);
}

/**
 * Register multiple menu item IDs at once.
 *
 * @param ids - Array of menu item IDs to add to the whitelist.
 */
export function registerSimpleModeItems(ids: string[]): void {
  for (const id of ids) {
    simpleModeWhitelist.add(id);
  }
}

/** Check whether a menu item ID is whitelisted for simple mode. */
export function isSimpleModeItem(id: string): boolean {
  return simpleModeWhitelist.has(id);
}
