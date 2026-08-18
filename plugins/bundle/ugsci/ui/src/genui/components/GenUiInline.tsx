/** GenUiInline — renders GenUI trees inline in the chat response. */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { GenUiTreeView } from "./GenUiRegistry";
import { GenUiInteractionProvider } from "./GenUiInteraction";
import {
  useGenUiActions,
  useGenUiSnapshots,
  genUiSnapshotKey,
  extractGenUiResults,
} from "../stores/genUi";
import type { GenUiSnapshot, GenUiTreeResult } from "../types/genUi";
import { exportGenUiHtml, exportGenUiPng, printGenUiPdf } from "../lib/genUiExport";

// React is obtained from window.QwenPaw.host.React at runtime.
// This alias avoids `import from "react"` which fails to resolve in
// the packaging mirror directory (no node_modules).
type ReactElement = any;

const EMPTY_OUTPUT: unknown[] = [];

// Response bubbles share this module instance, so a module-local reference
// count is sufficient to suppress a patch-only duplicate while its base tree
// is mounted. Keeping this rendering concern out of the store also avoids
// widening the public GenUiStoreState API.
const mountedBaseCounts = new Map<string, number>();

function mountBase(uiId: string): void {
  mountedBaseCounts.set(uiId, (mountedBaseCounts.get(uiId) || 0) + 1);
}

function unmountBase(uiId: string): void {
  const next = (mountedBaseCounts.get(uiId) || 1) - 1;
  if (next > 0) mountedBaseCounts.set(uiId, next);
  else mountedBaseCounts.delete(uiId);
}

function hasMountedBase(uiId: string): boolean {
  return (mountedBaseCounts.get(uiId) || 0) > 0;
}

export function GenUiInline({ data }: { data: Record<string, unknown> }): ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React;
  if (!React) return null;

  const store = useGenUiActions();
  const exportedValues = React.useRef(new Map<string, Record<string, unknown>>());

  // Get sessionId from the host (response data doesn't carry it directly).
  // During initial replay the host may not have resolved the backend session
  // id yet.  A stable fallback still keeps tree/patch identity coherent (the
  // server-generated ui_id is globally unique) and avoids dropping the UI.
  const sessionId = host.getCurrentSessionId?.() || "__current_chat__";

  // Normalize once instead of repeatedly asserting `unknown` to `unknown[]`.
  // This also keeps malformed/streaming response envelopes from reaching the
  // store with an undefined value.
  const output: unknown[] = Array.isArray(data.output) ? data.output : EMPTY_OUTPUT;

  // Memoize results to prevent useEffect from firing on every render
  // (extractGenUiResults returns a new array reference each call).
  const results = React.useMemo(
    () => extractGenUiResults(output),
    [output],
  );

  // Persist new snapshots in a useEffect (NOT during render) to avoid
  // the React anti-pattern of calling state setters during render.
  React.useEffect(() => {
    for (const result of results as GenUiTreeResult[]) {
      if (!result.ui_id || !result.tree) continue;
      const existing = store.getSnapshot(sessionId, result.ui_id);
      if (existing && existing.revision >= (result.revision || 1)) continue;
      store.setSnapshot({
        schemaVersion: "1",
        uiId: result.ui_id,
        revision: result.revision || 1,
        tree: result.tree,
        sessionId,
        sourceToolCallId: result.tool_call_id,
        updatedAt: Date.now(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, sessionId]);

  const baseUiIds = React.useMemo(
    () => (results as GenUiTreeResult[])
      .filter((result) => result.kind === "genui" && Boolean(result.ui_id))
      .map((result) => result.ui_id as string),
    [results],
  );
  const baseUiIdsKey = baseUiIds.join("\u0000");
  React.useEffect(() => {
    for (const uiId of baseUiIds) mountBase(uiId);
    return () => { for (const uiId of baseUiIds) unmountBase(uiId); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUiIdsKey]);

  const resultUiIds = React.useMemo(
    () => (results as GenUiTreeResult[])
      .map((result) => result.ui_id)
      .filter((uiId): uiId is string => Boolean(uiId)),
    [results],
  );
  const storeSnapshots = useGenUiSnapshots(sessionId, resultUiIds);

  // Filter to current session and deduplicate by ui_id (keep latest revision only)
  // Only render snapshots that originate from THIS response bubble's output,
  // not all session snapshots — otherwise trees appear duplicated across bubbles.
  const sessionSnapshots = storeSnapshots
    .filter((snap: GenUiSnapshot) =>
      // Only include snapshots whose ui_id appears in this response's results
      results.some((r: GenUiTreeResult) =>
          r.ui_id === snap.uiId && (
          r.kind === "genui" ||
          (r.kind === "genui_patch" && !hasMountedBase(snap.uiId))
        ),
      ),
    )
    .sort((a: GenUiSnapshot, b: GenUiSnapshot) => a.updatedAt - b.updatedAt);

  if (sessionSnapshots.length === 0) return null;

  return React.createElement(
    "div", { className: "qwenpaw-genui-inline", style: { marginTop: 8, marginBottom: 8 } },
    ...sessionSnapshots.map((snap: GenUiSnapshot) =>
      React.createElement(
        "div", {
          key: genUiSnapshotKey(snap.sessionId, snap.uiId),
          className: "qwenpaw-genui-tree",
          "data-genui-id": snap.uiId,
          style: { border: "1px solid var(--ant-color-border-secondary, #f0f0f0)", borderRadius: 12, padding: 16, marginBottom: 8, background: "var(--ant-color-bg-container, #fff)" },
          ref: (element: HTMLElement | null) => { if (element) (element as any).__genuiId = snap.uiId; },
        },
        React.createElement("div", { className: "qwenpaw-genui-export-target" },
          React.createElement(GenUiInteractionProvider, {
            node: snap.tree.root,
            onValuesChange: (values: Record<string, unknown>) => exportedValues.current.set(snap.uiId, values),
            children: React.createElement(GenUiTreeView, { node: snap.tree.root }),
          }),
        ),
        React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 } },
          React.createElement("button", { type: "button", title: "导出 PNG", onClick: (event: any) => {
            const target = event.currentTarget.closest(".qwenpaw-genui-tree")?.querySelector(".qwenpaw-genui-export-target") as HTMLElement | null;
            if (target) void exportGenUiPng(target, snap.uiId).catch((error) => console.warn("[ugsci.genui] PNG export failed", error));
          } }, "PNG"),
          React.createElement("button", { type: "button", title: "打印或另存为 PDF", onClick: (event: any) => {
            const target = event.currentTarget.closest(".qwenpaw-genui-tree")?.querySelector(".qwenpaw-genui-export-target") as HTMLElement | null;
            if (target) {
              void printGenUiPdf(target, snap.tree.root, exportedValues.current.get(snap.uiId) || {}, snap.uiId)
                .catch((error) => console.warn("[ugsci.genui] PDF print failed", error));
            }
          } }, "PDF"),
          React.createElement("button", { type: "button", title: "导出 HTML", onClick: (event: any) => {
            const target = event.currentTarget.closest(".qwenpaw-genui-tree")?.querySelector(".qwenpaw-genui-export-target") as HTMLElement | null;
            if (target) void exportGenUiHtml(target, snap.tree.root, exportedValues.current.get(snap.uiId) || {}, snap.uiId, snap.uiId)
              .catch((error) => console.warn("[ugsci.genui] HTML export failed", error));
          } }, "HTML"),
        ),
      ),
    ),
  );
}
