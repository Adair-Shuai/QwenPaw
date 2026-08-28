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
import type { GenUiNode, GenUiSnapshot, GenUiTreeResult } from "../types/genUi";
import { exportGenUiHtml, exportGenUiPng, printGenUiPdf } from "../lib/genUiExport";
import { DerivationSummary } from "../../derivation/DerivationSummary";
import {
  addDerivation,
  extractDerivations,
  selectDerivation,
} from "../../derivation/useDerivationStore";

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

function flattenNodes(root: GenUiNode): GenUiNode[] {
  const nodes: GenUiNode[] = [];
  const visit = (node: GenUiNode) => {
    nodes.push(node);
    for (const child of node.children || []) visit(child);
  };
  visit(root);
  return nodes;
}

function traceTreePresentation(root: GenUiNode) {
  const nodes = flattenNodes(root);
  const title = String(
    nodes.find(
      (node) => node.kind === "Heading" && Number(node.props?.level) === 2,
    )?.props?.value || "公式计算",
  );
  const warning = nodes.some(
    (node) =>
      node.kind === "Alert" &&
      String(node.props?.severity || "") === "warning",
  );
  const metrics = nodes
    .filter((node) => node.kind === "MetricCard")
    .map((node) => ({
      label: String(node.props?.title || "结果"),
      value: String(node.props?.value ?? "—"),
    }));
  const derived = nodes
    .filter((node) => node.kind === "TableRow")
    .map((row) =>
      (row.children || [])
        .filter((cell) => cell.kind === "TableCell")
        .map((cell) => String(cell.props?.value ?? "")),
    )
    .filter((cells) => cells.length >= 4 && cells[3] === "derived")
    .map((cells) => ({
      label: cells[0] || "结果",
      value: [cells[1], cells[2]].filter(Boolean).join(" "),
    }))
    .reverse();
  const inputs = nodes
    .filter((node) => node.kind === "NumberInput" || node.kind === "Slider")
    .slice(0, 5)
    .map(
      (node) =>
        `${String(node.props?.label || node.props?.name || "输入")}=${String(
          node.props?.value ?? "—",
        )}`,
    );
  const conditions = nodes
    .filter((node) => node.kind === "AccordionItem")
    .filter((node) =>
      ["适用场景", "假设条件"].includes(String(node.props?.header || "")),
    )
    .flatMap((node) => flattenNodes(node))
    .filter((node) => node.kind === "ListItem")
    .map((node) => String(node.props?.value || ""))
    .filter(Boolean)
    .slice(0, 3);
  const results = [...derived, ...metrics].filter(
    (item, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.label === item.label && candidate.value === item.value,
      ) === index,
  );
  return { title, warning, inputs, conditions, results };
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
  const derivations = React.useMemo(
    () => extractDerivations(output),
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

  if (derivations.length > 0) {
    return React.createElement(
      "div",
      {
        className: "qwenpaw-genui-inline qwenpaw-derivation-inline",
        style: { marginTop: 8, marginBottom: 8, display: "grid", gap: 8 },
      },
      ...derivations.map((payload: any, index: number) =>
        React.createElement(
          "div",
          {
            key: String(
              payload.provenance?.replay_token ||
                payload.trace?.formula_id ||
                index,
            ),
            style: {
              border:
                "1px solid var(--ant-color-border-secondary, #f0f0f0)",
              borderRadius: 12,
              padding: 12,
              background: "var(--ant-color-bg-container, #fff)",
            },
          },
          React.createElement(DerivationSummary, {
            payload,
            compact: true,
            onOpenDerivation: () => {
              const record = addDerivation(payload, sessionId);
              if (record?.uiId) selectDerivation(record.uiId);
              window.dispatchEvent(
                new CustomEvent("qwenpaw:open-compute-workbench", {
                  detail: { uiId: record?.uiId },
                }),
              );
            },
          }),
        ),
      ),
    );
  }

  if (sessionSnapshots.length === 0) return null;

  const renderTree = (snap: GenUiSnapshot) =>
    React.createElement(
      "div",
      {
        key: genUiSnapshotKey(snap.sessionId, snap.uiId),
        className: "qwenpaw-genui-tree",
        "data-genui-id": snap.uiId,
        style: {
          border:
            "1px solid var(--ant-color-border-secondary, #f0f0f0)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 8,
          background: "var(--ant-color-bg-container, #fff)",
        },
        ref: (element: HTMLElement | null) => {
          if (element) (element as any).__genuiId = snap.uiId;
        },
      },
      React.createElement(
        "div",
        { className: "qwenpaw-genui-export-target" },
        React.createElement(GenUiInteractionProvider, {
          node: snap.tree.root,
          onValuesChange: (values: Record<string, unknown>) =>
            exportedValues.current.set(snap.uiId, values),
          children: React.createElement(GenUiTreeView, {
            node: snap.tree.root,
          }),
        }),
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "flex-end",
            gap: 6,
            marginTop: 8,
          },
        },
        React.createElement(
          "button",
          {
            type: "button",
            title: "导出 PNG",
            onClick: (event: any) => {
              const target = event.currentTarget
                .closest(".qwenpaw-genui-tree")
                ?.querySelector(
                  ".qwenpaw-genui-export-target",
                ) as HTMLElement | null;
              if (target)
                void exportGenUiPng(target, snap.uiId).catch((error) =>
                  console.warn("[ugsci.genui] PNG export failed", error),
                );
            },
          },
          "PNG",
        ),
        React.createElement(
          "button",
          {
            type: "button",
            title: "打印或另存为 PDF",
            onClick: (event: any) => {
              const target = event.currentTarget
                .closest(".qwenpaw-genui-tree")
                ?.querySelector(
                  ".qwenpaw-genui-export-target",
                ) as HTMLElement | null;
              if (target) {
                void printGenUiPdf(
                  target,
                  snap.tree.root,
                  exportedValues.current.get(snap.uiId) || {},
                  snap.uiId,
                ).catch((error) =>
                  console.warn("[ugsci.genui] PDF print failed", error),
                );
              }
            },
          },
          "PDF",
        ),
        React.createElement(
          "button",
          {
            type: "button",
            title: "导出 HTML",
            onClick: (event: any) => {
              const target = event.currentTarget
                .closest(".qwenpaw-genui-tree")
                ?.querySelector(
                  ".qwenpaw-genui-export-target",
                ) as HTMLElement | null;
              if (target)
                void exportGenUiHtml(
                  target,
                  snap.tree.root,
                  exportedValues.current.get(snap.uiId) || {},
                  snap.uiId,
                  snap.uiId,
                ).catch((error) =>
                  console.warn("[ugsci.genui] HTML export failed", error),
                );
            },
          },
          "HTML",
        ),
      ),
    );

  return React.createElement(
    "div",
    {
      className: "qwenpaw-genui-inline",
      style: { marginTop: 8, marginBottom: 8 },
    },
    ...sessionSnapshots.map((snap: GenUiSnapshot) => {
      if (!snap.uiId.startsWith("ui_trc_")) return renderTree(snap);
      const presentation = traceTreePresentation(snap.tree.root);
      const primary = presentation.results[0] || {
        label: "计算结果",
        value: "已完成",
      };
      return React.createElement(
        "div",
        {
          key: genUiSnapshotKey(snap.sessionId, snap.uiId),
          className: "qwenpaw-derivation-inline",
          "data-trace-ui-id": snap.uiId,
          style: {
            border:
              "1px solid var(--ant-color-border-secondary, #f0f0f0)",
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
            display: "grid",
            gap: 10,
            background: "var(--ant-color-bg-container, #fff)",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap",
            },
          },
          React.createElement(
            "div",
            { style: { minWidth: 0 } },
            React.createElement(
              "div",
              {
                style: {
                  color:
                    "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12,
                },
              },
              presentation.title,
            ),
            React.createElement(
              "strong",
              {
                style: {
                  display: "block",
                  marginTop: 2,
                  fontSize: 22,
                  color: "var(--ant-color-text, rgba(0,0,0,.88))",
                  overflowWrap: "anywhere",
                },
              },
              primary.value,
            ),
            React.createElement(
              "span",
              {
                style: {
                  color:
                    "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12,
                },
              },
              primary.label,
            ),
          ),
          React.createElement(
            "span",
            {
              style: {
                borderRadius: 999,
                padding: "4px 8px",
                fontSize: 12,
                color: presentation.warning
                  ? "var(--ant-color-warning, #faad14)"
                  : "var(--ant-color-success, #52c41a)",
                background: presentation.warning
                  ? "var(--ant-color-warning-bg, #fffbe6)"
                  : "var(--ant-color-success-bg, #f6ffed)",
              },
            },
            presentation.warning ? "需要人工复核" : "✓ 公式与单位已核验",
          ),
        ),
        presentation.results.length > 1
          ? React.createElement(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: 8,
                },
              },
              ...presentation.results.slice(1, 4).map((item) =>
                React.createElement(
                  "div",
                  {
                    key: `${item.label}:${item.value}`,
                    style: {
                      padding: 8,
                      borderRadius: 8,
                      background:
                        "var(--ant-color-fill-quaternary, rgba(0,0,0,.02))",
                    },
                  },
                  React.createElement(
                    "div",
                    {
                      style: {
                        color:
                          "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                        fontSize: 11,
                      },
                    },
                    item.label,
                  ),
                  React.createElement("strong", null, item.value),
                ),
              ),
            )
          : null,
        presentation.inputs.length
          ? React.createElement(
              "div",
              {
                style: {
                  color:
                    "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12,
                  lineHeight: 1.6,
                },
              },
              `关键输入：${presentation.inputs.join("；")}`,
            )
          : null,
        presentation.conditions.length
          ? React.createElement(
              "div",
              {
                style: {
                  color:
                    "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12,
                  lineHeight: 1.6,
                },
              },
              `适用条件：${presentation.conditions.join("；")}`,
            )
          : null,
        React.createElement(
          "details",
          null,
          React.createElement(
            "summary",
            {
              style: {
                cursor: "pointer",
                color: "var(--ant-color-primary, #1677ff)",
                fontSize: 13,
                fontWeight: 600,
              },
            },
            "查看推导",
          ),
          React.createElement(
            "div",
            { style: { marginTop: 10 } },
            renderTree(snap),
          ),
        ),
      );
    }),
  );
}
