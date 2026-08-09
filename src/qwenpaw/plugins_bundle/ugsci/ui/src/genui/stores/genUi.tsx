/**
 * GenUI store — manages UI tree snapshots keyed by sessionId::uiId.
 * Uses React context + useState (no external state library).
 *
 * IMPORTANT: This module must NOT use `import { ... } from "react"` for
 * runtime values. The UGSci plugin is loaded via Blob URL `import()`,
 * and bare module specifiers like "react" cannot be resolved by the
 * browser. All React hooks are obtained from `window.QwenPaw.host.React`
 * at runtime, consistent with the UGSci UI pattern.
 */

import type { Context, ReactNode } from "react";
import type { GenUiSnapshot, GenUiTreeResult, GenUiPatchPayload } from "../types/genUi";

type ReactFn = typeof import("react");

interface GenUiStoreState {
  snapshots: Record<string, GenUiSnapshot>;
  setSnapshot: (snapshot: GenUiSnapshot) => void;
  applyPatch: (payload: GenUiPatchPayload, tree: GenUiSnapshot["tree"], revision: number) => void;
  getSnapshot: (sessionId: string, uiId: string) => GenUiSnapshot | undefined;
  clearSession: (sessionId: string) => void;
  hydrateFromMessages: (sessionId: string, output: unknown[]) => void;
}

// ── Lazy-initialized React context ─────────────────────────────────────────
let _storeContext: Context<GenUiStoreState | null> | null = null;

function getStoreContext(): Context<GenUiStoreState | null> | null {
  if (_storeContext) return _storeContext;
  const React = (window as any).QwenPaw?.host?.React as ReactFn | undefined;
  if (!React) return null;
  _storeContext = React.createContext<GenUiStoreState | null>(null);
  return _storeContext;
}

export function genUiSnapshotKey(sessionId: string, uiId: string): string {
  return `${sessionId}::${uiId}`;
}

// ── Result parsing (shared between ToolCard and history recovery) ──────────

/**
 * Parse a GenUI tool result string.
 * This is the SINGLE parsing function used by both ToolCard and history
 * recovery, per REVIEW §5.1 requirement.
 */
export function parseGenUiResult(resultText: string): GenUiTreeResult | null {
  if (!resultText || typeof resultText !== "string") return null;
  try {
    const parsed = JSON.parse(resultText);
    if (parsed && typeof parsed === "object" && parsed.ok === true &&
        (parsed.kind === "genui" || parsed.kind === "genui_patch")) {
      return parsed;
    }
    return null;
  } catch {
    console.warn("[ugsci.genui] Failed to parse tool result as JSON");
    return null;
  }
}

/**
 * Parse a GenUI error result string.
 */
export function parseGenUiError(resultText: string): GenUiTreeResult | null {
  if (!resultText || typeof resultText !== "string") return null;
  try {
    const parsed = JSON.parse(resultText);
    if (parsed && typeof parsed === "object" && parsed.ok === false) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Tool call message types that may contain emit_ui_tree/emit_ui_patch results. */
const TOOL_OUTPUT_TYPES = new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output",
]);

const GENUI_TOOL_NAMES = new Set(["emit_ui_tree", "emit_ui_patch"]);

/**
 * Extract GenUI tree/patch results from the AgentScope response `output` array.
 */
export function extractGenUiResults(output: unknown): GenUiTreeResult[] {
  if (!Array.isArray(output)) return [];
  const results: GenUiTreeResult[] = [];

  for (const msg of output) {
    if (!msg || typeof msg !== "object") continue;
    const m = msg as Record<string, unknown>;
    const msgType = m.type as string;
    if (!msgType || !TOOL_OUTPUT_TYPES.has(msgType)) continue;

    const content = m.content;
    if (!Array.isArray(content) || content.length === 0) continue;

    const firstItem = content[0] as Record<string, unknown> | undefined;
    if (!firstItem || typeof firstItem !== "object") continue;
    const callData = firstItem.data as Record<string, unknown> | undefined;
    if (!callData) continue;
    const toolName = (callData.name as string) || "";
    if (!GENUI_TOOL_NAMES.has(toolName)) continue;

    if (content.length > 1) {
      const secondItem = content[1] as Record<string, unknown> | undefined;
      const outputData = secondItem?.data as Record<string, unknown> | undefined;
      const out = outputData?.output;
      if (out != null) {
        const outStr = typeof out === "string" ? out : JSON.stringify(out);
        const parsed = parseGenUiResult(outStr);
        if (parsed) results.push(parsed);
        else {
          const errParsed = parseGenUiError(outStr);
          if (errParsed) results.push(errParsed);
        }
      }
    }
  }

  return results;
}

// ── Provider ───────────────────────────────────────────────────────────────

export function GenUiStoreProvider({ children }: { children: ReactNode }) {
  const React = (window as any).QwenPaw?.host?.React as ReactFn | undefined;
  if (!React) return null;

  const [snapshots, setSnapshots] = React.useState<Record<string, GenUiSnapshot>>({});

  const setSnapshot = React.useCallback((snapshot: GenUiSnapshot) => {
    const key = genUiSnapshotKey(snapshot.sessionId, snapshot.uiId);
    setSnapshots((prev: Record<string, GenUiSnapshot>) => {
      // Revision monotonic increase check: only update if new revision >= existing
      const existing = prev[key];
      if (existing && snapshot.revision <= existing.revision) {
        console.warn(
          "[ugsci.genui] Ignoring stale snapshot: ui_id=%s, existing_revision=%d, new_revision=%d",
          snapshot.uiId, existing.revision, snapshot.revision,
        );
        return prev;
      }
      return { ...prev, [key]: snapshot };
    });
  }, []);

  const applyPatch = React.useCallback(
    (payload: GenUiPatchPayload, tree: GenUiSnapshot["tree"], revision: number) => {
      const key = genUiSnapshotKey(
        (window as any).QwenPaw?.host?.getCurrentSessionId?.() || "",
        payload.ui_id,
      );
      setSnapshots((prev: Record<string, GenUiSnapshot>) => {
        const existing = prev[key];
        if (!existing) {
          console.warn("[ugsci.genui] applyPatch: ui_id '%s' not found in store", payload.ui_id);
          return prev;
        }
        if (revision <= existing.revision) {
          console.warn(
            "[ugsci.genui] applyPatch: ignoring stale revision %d (current: %d)",
            revision, existing.revision,
          );
          return prev;
        }
        return {
          ...prev,
          [key]: {
            ...existing,
            tree,
            revision,
            updatedAt: Date.now(),
          },
        };
      });
    },
    [],
  );

  const getSnapshot = React.useCallback(
    (sessionId: string, uiId: string) => snapshots[genUiSnapshotKey(sessionId, uiId)],
    [snapshots],
  );

  const clearSession = React.useCallback((sessionId: string) => {
    setSnapshots((prev: Record<string, GenUiSnapshot>) => {
      const next: Record<string, GenUiSnapshot> = {};
      for (const [key, val] of Object.entries(prev)) {
        if (val.sessionId !== sessionId) next[key] = val;
      }
      return next;
    });
  }, []);

  const hydrateFromMessages = React.useCallback(
    (sessionId: string, output: unknown[]) => {
      const results = extractGenUiResults(output);
      for (const r of results) {
        if (r.ui_id && r.tree) {
          const key = genUiSnapshotKey(sessionId, r.ui_id);
          const newRev = r.revision || 1;
          // Revision check inside functional update to avoid stale closure
          setSnapshots((prev: Record<string, GenUiSnapshot>) => {
            const existingRev = prev[key]?.revision || 0;
            if (newRev <= existingRev) return prev;
            return {
              ...prev,
              [key]: {
                schemaVersion: "1",
                uiId: r.ui_id!,
                revision: newRev,
                tree: r.tree!,
                sessionId,
                sourceToolCallId: r.tool_call_id,
                updatedAt: Date.now(),
              },
            };
          });
        }
      }
    },
    [],
  );

  const store: GenUiStoreState = React.useMemo(
    () => ({ snapshots, setSnapshot, applyPatch, getSnapshot, clearSession, hydrateFromMessages }),
    [snapshots, setSnapshot, applyPatch, getSnapshot, clearSession, hydrateFromMessages],
  );

  const ctx = getStoreContext();
  if (!ctx) return null;

  return React.createElement(ctx.Provider, { value: store }, children);
}

export function useGenUiStore(): GenUiStoreState {
  const React = (window as any).QwenPaw?.host?.React as ReactFn | undefined;
  const ctx = getStoreContext();
  if (!React || !ctx) throw new Error("useGenUiStore: host React not available");
  const val = React.useContext(ctx);
  if (!val) throw new Error("useGenUiStore must be used within GenUiStoreProvider");
  return val;
}
