/**
 * GenUiToolCall — ToolCard renderer for emit_ui_tree tool calls.
 *
 * The @agentscope-ai/chat SDK (ChatV1) calls custom tool renderers with:
 *   { data: { content: [...], status: "in_progress" | "completed" | ... } }
 *
 * Where `content` is an array of items:
 *   [0] = call:  { data: { name, arguments, call_id, server_label, ... } }
 *   [1] = result: { data: { output, ... } }  (may be absent while streaming)
 *
 * See console/src/components/Chat/ToolCards/adapters/v1Adapter.tsx for
 * the proven parsing approach.
 */

/** Parse V1 tool render props to extract status and result text. */
function parseV1Props(props: Record<string, unknown>): {
  resultText: string;
  status: string;
} {
  const data = props.data as Record<string, unknown> | undefined;
  if (!data) return { resultText: "", status: "calling" };

  const status = (data.status as string) || "calling";
  const content = data.content as unknown[] | undefined;
  if (!Array.isArray(content) || content.length === 0) {
    return { resultText: "", status };
  }

  // content[1] = result item
  if (content.length > 1) {
    const resultItem = content[1] as Record<string, unknown> | undefined;
    const resultData = resultItem?.data as Record<string, unknown> | undefined;
    const output = resultData?.output;
    if (typeof output === "string") return { resultText: output, status };
    if (output != null) return { resultText: JSON.stringify(output, null, 2), status };
  }

  // content[0] might have inline result (some SDK versions)
  const callItem = content[0] as Record<string, unknown> | undefined;
  const callData = callItem?.data as Record<string, unknown> | undefined;
  if (callData?.output) {
    const out = callData.output;
    return { resultText: typeof out === "string" ? out : JSON.stringify(out, null, 2), status };
  }

  return { resultText: "", status };
}

export function GenUiToolCall(props: {
  data?: Record<string, unknown>;
  [key: string]: unknown;
}): React.ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React;
  if (!React) return null;

  const { resultText, status } = parseV1Props(props as Record<string, unknown>);
  const isLoading = status === "in_progress" || status === "calling";
  const isError = status === "failed" || status === "error";

  let info: { ok?: boolean; ui_id?: string; revision?: number; message?: string; hint?: string; nodeCount?: number } = {};
  if (resultText) {
    try {
      const parsed = JSON.parse(resultText);
      if (parsed && typeof parsed === "object") {
        info = parsed;
        if (parsed.tree?.root) info.nodeCount = countNodes(parsed.tree.root);
      }
    } catch {}
  }

  const title = isLoading
    ? "🎨 Generating UI Tree..."
    : isError
      ? "🎨 UI Tree Error"
      : info.ok
        ? `🎨 UI Tree (${info.nodeCount ?? 0} nodes)`
        : "🎨 UI Tree";

  return React.createElement(
    "details", { open: isLoading || isError, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    React.createElement("summary", { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      React.createElement("span", null, "🎨"),
      React.createElement("span", null, title),
      info.ok ? React.createElement("span", { style: { fontSize: 11, color: "var(--ant-color-text-quaternary, #999)", marginLeft: "auto" } }, `ui_id: ${info.ui_id?.slice(0, 16) ?? ""}…`) : null,
    ),
    isError || info.ok === false
      ? React.createElement("div", { style: { padding: "8px 12px", fontSize: 12 } },
          React.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, info.message || "Unknown error"),
          info.hint ? React.createElement("div", { style: { color: "var(--ant-color-text-quaternary, #999)" } }, `💡 ${info.hint}`) : null,
        )
      : info.ok
        ? React.createElement("div", { style: { padding: "8px 12px", fontSize: 12, color: "var(--ant-color-text-quaternary, #999)" } }, `UI tree rendered below (${info.nodeCount ?? 0} nodes, revision ${info.revision ?? 1})`)
        : React.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.03))", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, resultText || "(waiting for result...)"),
  );
}

function countNodes(node: any): number {
  if (!node || typeof node !== "object") return 0;
  let count = 1;
  if (Array.isArray(node.children)) for (const c of node.children) count += countNodes(c);
  return count;
}
