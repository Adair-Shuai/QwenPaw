/**
 * GenUiInline — renders GenUI trees inline in the chat response.
 *
 * Registered via `window.QwenPaw.chat.response.append`. Scans the response
 * output for emit_ui_tree results, writes them to the store, and renders
 * GenUiTreeView for each.
 */

import { useEffect, useRef } from "react";
import { GenUiTreeView } from "./GenUiRegistry";
import {
  extractGenUiResults,
  useGenUiStore,
  genUiSnapshotKey,
} from "../stores/genUi";
import type { GenUiSnapshot } from "../types/genUi";

export function GenUiInline({
  data,
}: {
  data: Record<string, unknown>;
}): React.ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React;
  if (!React) return null;

  const store = useGenUiStore();
  const sessionId =
    (data.sessionId as string) ||
    (data.session_id as string) ||
    "";
  const messageId = (data.messageId as string) || (data.id as string) || "";
  const output = data.output;

  // Collect snapshots to render — written to store in an effect
  const pendingSnapshots = useRef<GenUiSnapshot[]>([]);

  const results = extractGenUiResults(output);
  if (results.length > 0 && sessionId) {
    pendingSnapshots.current = results.map((r) => ({
      schemaVersion: "1" as const,
      uiId: r.ui_id || "",
      revision: r.revision || 1,
      tree: r.tree || { schemaVersion: "1", root: { nodeId: "root", kind: "Stack" } },
      sessionId,
      messageId,
      updatedAt: Date.now(),
    }));
  }

  // Write to store in effect to avoid render-phase updates
  useEffect(() => {
    if (pendingSnapshots.current.length === 0) return;
    for (const snap of pendingSnapshots.current) {
      if (snap.uiId) store.setSnapshot(snap);
    }
    pendingSnapshots.current = [];
  }, [store]);

  // Find all snapshots for this session
  const sessionSnapshots = Object.values(store.snapshots).filter(
    (snap: GenUiSnapshot) => snap.sessionId === sessionId,
  );

  if (sessionSnapshots.length === 0) return null;

  return React.createElement(
    "div",
    {
      className: "ugsci-genui-inline",
      style: { marginTop: 8, marginBottom: 8 },
    },
    ...sessionSnapshots.map((snap: GenUiSnapshot) =>
      React.createElement(
        "div",
        {
          key: genUiSnapshotKey(snap.sessionId, snap.uiId),
          className: "ugsci-genui-tree",
          style: {
            border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 8,
            background: "var(--ant-color-bg-container, #fff)",
          },
        },
        React.createElement(GenUiTreeView, { node: snap.tree.root }),
      ),
    ),
  );
}
