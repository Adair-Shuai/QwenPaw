/** GenUiInline — renders GenUI trees inline in the chat response. */

import { GenUiTreeView } from "./GenUiRegistry";
import { useGenUiStore, genUiSnapshotKey, extractGenUiResults } from "../stores/genUi";
import type { GenUiSnapshot } from "../types/genUi";

export function GenUiInline({ data }: { data: Record<string, unknown> }): React.ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React;
  if (!React) return null;

  const store = useGenUiStore();

  // Get sessionId from the host (response data doesn't carry it directly).
  const sessionId = host.getCurrentSessionId?.() || "";

  const output = data.output;

  // Memoize results to prevent useEffect from firing on every render
  // (extractGenUiResults returns a new array reference each call).
  const results = React.useMemo(
    () => extractGenUiResults(output),
    [output],
  );

  // Persist new snapshots in a useEffect (NOT during render) to avoid
  // the React anti-pattern of calling state setters during render.
  React.useEffect(() => {
    if (results.length > 0 && sessionId) {
      store.hydrateFromMessages(sessionId, output as unknown[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, sessionId]);

  // Filter to current session and deduplicate by ui_id (keep latest revision only)
  // Only render snapshots that originate from THIS response bubble's output,
  // not all session snapshots — otherwise trees appear duplicated across bubbles.
  const sessionSnapshots = Object.values(store.snapshots)
    .filter((snap: GenUiSnapshot) => snap.sessionId === sessionId)
    .filter((snap: GenUiSnapshot) =>
      // Only include snapshots whose ui_id appears in this response's results
      results.some((r) => r.ui_id === snap.uiId),
    )
    .sort((a: GenUiSnapshot, b: GenUiSnapshot) => a.updatedAt - b.updatedAt); // sort by time for stable order

  if (sessionSnapshots.length === 0) return null;

  return React.createElement(
    "div", { className: "qwenpaw-genui-inline", style: { marginTop: 8, marginBottom: 8 } },
    ...sessionSnapshots.map((snap: GenUiSnapshot) =>
      React.createElement(
        "div", {
          key: genUiSnapshotKey(snap.sessionId, snap.uiId),
          className: "qwenpaw-genui-tree",
          style: { border: "1px solid var(--ant-color-border-secondary, #f0f0f0)", borderRadius: 12, padding: 16, marginBottom: 8, background: "var(--ant-color-bg-container, #fff)" },
        },
        React.createElement(GenUiTreeView, { node: snap.tree.root }),
      ),
    ),
  );
}
