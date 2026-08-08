/**
 * GenUI store — manages UI tree snapshots keyed by sessionId::uiId.
 *
 * Ported from LeAgent frontend/src/stores/genUi.ts (Apache-2.0).
 * Adapted: uses a simple React context + useState pattern instead of
 * Zustand, since the UGSci plugin bundle runs in the host React tree
 * without its own state management library.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { GenUiSnapshot, GenUiTreeResult, GenUiTreeV1 } from "../types/genUi";

// ── Store shape ────────────────────────────────────────────────────────────

interface GenUiStoreState {
  snapshots: Record<string, GenUiSnapshot>;
  setSnapshot: (snapshot: GenUiSnapshot) => void;
  applyPatch: (uiId: string, revision: number, tree: GenUiTreeV1) => void;
  clearSession: (sessionId: string) => void;
  getSnapshot: (sessionId: string, uiId: string) => GenUiSnapshot | undefined;
}

const GenUiStoreContext = createContext<GenUiStoreState | null>(null);

// ── Store key helper ───────────────────────────────────────────────────────

export function genUiSnapshotKey(sessionId: string, uiId: string): string {
  return `${sessionId}::${uiId}`;
}

// ── Parse tool result ──────────────────────────────────────────────────────

/**
 * Parse a PLUGIN_CALL_OUTPUT result string for an emit_ui_tree success.
 * Returns null if the result is not a valid GenUI tree result.
 */
export function parseGenUiResult(
  resultText: string,
): GenUiTreeResult | null {
  try {
    const parsed = JSON.parse(resultText);
    if (parsed && typeof parsed === "object" && parsed.ok === true && parsed.kind === "genui") {
      return parsed as GenUiTreeResult;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Scan chat response output messages for emit_ui_tree results.
 * Returns all valid GenUI tree results found, in order.
 */
export function extractGenUiResults(
  output: unknown,
): GenUiTreeResult[] {
  if (!Array.isArray(output)) return [];
  const results: GenUiTreeResult[] = [];
  for (const msg of output) {
    const m = msg as Record<string, unknown>;
    // Check for plugin_call_output or function_call_output with emit_ui_tree
    const msgType = m.type as string;
    if (
      msgType !== "plugin_call_output" &&
      msgType !== "function_call_output"
    )
      continue;
    const name = m.name as string;
    if (name !== "emit_ui_tree") continue;
    const outputText = m.output as string;
    if (typeof outputText !== "string") continue;
    const parsed = parseGenUiResult(outputText);
    if (parsed) results.push(parsed);
  }
  return results;
}

// ── Provider ───────────────────────────────────────────────────────────────

export function GenUiStoreProvider({ children }: { children: ReactNode }) {
  const [snapshots, setSnapshots] = useState<Record<string, GenUiSnapshot>>(
    {},
  );

  const setSnapshot = useCallback((snapshot: GenUiSnapshot) => {
    const key = genUiSnapshotKey(snapshot.sessionId, snapshot.uiId);
    setSnapshots((prev) => ({ ...prev, [key]: snapshot }));
  }, []);

  const applyPatch = useCallback(
    (uiId: string, revision: number, tree: GenUiTreeV1) => {
      // Phase-2: will be implemented with patch support
      void uiId;
      void revision;
      void tree;
    },
    [],
  );

  const clearSession = useCallback((sessionId: string) => {
    setSnapshots((prev) => {
      const next: Record<string, GenUiSnapshot> = {};
      for (const [key, snap] of Object.entries(prev)) {
        if (!key.startsWith(`${sessionId}::`)) {
          next[key] = snap;
        }
      }
      return next;
    });
  }, []);

  const getSnapshot = useCallback(
    (sessionId: string, uiId: string) => {
      const key = genUiSnapshotKey(sessionId, uiId);
      return snapshots[key];
    },
    [snapshots],
  );

  const store: GenUiStoreState = {
    snapshots,
    setSnapshot,
    applyPatch,
    clearSession,
    getSnapshot,
  };

  return (
    <GenUiStoreContext.Provider value={store}>
      {children}
    </GenUiStoreContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useGenUiStore(): GenUiStoreState {
  const ctx = useContext(GenUiStoreContext);
  if (!ctx) {
    throw new Error("useGenUiStore must be used within GenUiStoreProvider");
  }
  return ctx;
}
