/**
 * GenUiToolCall — ToolCard renderer for emit_ui_tree and emit_ui_patch tool calls.
 *
 * Uses the SAME parseGenUiResult function as the store (per REVIEW §5.1
 * requirement: "ToolCard 与历史恢复使用同一个 parseGenUiToolResult").
 *
 * The @agentscope-ai/chat SDK (ChatV1) calls custom tool renderers with:
 *   { data: { content: [...], status: "in_progress" | "completed" | ... } }
 *
 * Where `content` is an array of items:
 *   [0] = call:  { data: { name, arguments, call_id, server_label, ... } }
 *   [1] = result: { data: { output, ... } }  (may be absent while streaming)
 */

import { parseGenUiResult, parseGenUiError } from "../stores/genUi";

/** Parse V1 tool render props to extract status and result text. */
function parseV1Props(props: Record<string, unknown>): {
  resultText: string;
  status: string;
  toolName: string;
} {
  const data = props.data as Record<string, unknown> | undefined;
  if (!data) return { resultText: "", status: "calling", toolName: "" };

  const status = (data.status as string) || "calling";
  const content = data.content as unknown[] | undefined;
  if (!Array.isArray(content) || content.length === 0) {
    return { resultText: "", status, toolName: "" };
  }

  // Extract tool name from content[0]
  const callItem = content[0] as Record<string, unknown> | undefined;
  const callData = callItem?.data as Record<string, unknown> | undefined;
  const toolName = (callData?.name as string) || "";

  // content[1] = result item
  if (content.length > 1) {
    const resultItem = content[1] as Record<string, unknown> | undefined;
    const resultData = resultItem?.data as Record<string, unknown> | undefined;
    const output = resultData?.output;
    if (typeof output === "string") return { resultText: output, status, toolName };
    if (output != null) return { resultText: JSON.stringify(output, null, 2), status, toolName };
  }

  // content[0] might have inline result (some SDK versions)
  if (callData?.output) {
    const out = callData.output;
    return { resultText: typeof out === "string" ? out : JSON.stringify(out, null, 2), status, toolName };
  }

  return { resultText: "", status, toolName };
}

export function GenUiToolCall(props: {
  data?: Record<string, unknown>;
  [key: string]: unknown;
}): React.ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React;
  if (!React) return null;

  const { resultText, status, toolName } = parseV1Props(props as Record<string, unknown>);
  const isLoading = status === "in_progress" || status === "calling";
  const isError = status === "failed" || status === "error";

  // Use the shared parseGenUiResult (same as store/history recovery)
  const result = parseGenUiResult(resultText);
  const errorResult = !result ? parseGenUiError(resultText) : null;

  let nodeCount = 0;
  if (result?.tree?.root) nodeCount = countNodes(result.tree.root);

  const isPatch = toolName === "emit_ui_patch" || result?.kind === "genui_patch";

  const title = isLoading
    ? isPatch ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..."
    : isError
      ? isPatch ? "📝 UI Patch Error" : "🎨 UI Tree Error"
      : result
        ? isPatch
          ? `📝 UI Patched (rev ${result.revision ?? "?"})`
          : `🎨 UI Tree (${nodeCount} nodes)`
        : isPatch ? "📝 UI Patch" : "🎨 UI Tree";

  return React.createElement(
    "details", { open: isLoading || isError, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    React.createElement("summary", { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      React.createElement("span", null, isPatch ? "📝" : "🎨"),
      React.createElement("span", null, title),
      result?.ok ? React.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${result.ui_id?.slice(0, 16) ?? ""}…`) : null,
    ),
    isError || (errorResult && !result)
      ? React.createElement("div", { style: { padding: "8px 12px", fontSize: 12 } },
          React.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, errorResult?.message || "Unknown error"),
          errorResult?.hint ? React.createElement("div", { style: { color: "#999" } }, `💡 ${errorResult.hint}`) : null,
        )
      : result?.ok
        ? React.createElement("div", { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
            isPatch
              ? `UI tree patched to revision ${result.revision ?? 1} (${nodeCount} nodes)`
              : `UI tree rendered below (${nodeCount} nodes, revision ${result.revision ?? 1})`,
          )
        : React.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, resultText || "(waiting for result...)"),
  );
}

function countNodes(node: any): number {
  if (!node || typeof node !== "object") return 0;
  let count = 1;
  if (Array.isArray(node.children)) for (const c of node.children) count += countNodes(c);
  return count;
}
