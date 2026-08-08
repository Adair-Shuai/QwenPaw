/**
 * GenUiToolCall — ToolCard renderer for emit_ui_tree tool calls.
 *
 * Registered via `window.QwenPaw.chat.toolRender`. Shows:
 * - Loading state while the tool is executing.
 * - Error message if the tree validation failed.
 * - Summary (node count, ui_id, revision) on success.
 *
 * The actual tree rendering is handled by GenUiInline in response.append.
 */

export function GenUiToolCall(props: {
  data?: Record<string, unknown>;
  content?: Record<string, unknown>;
  isStreaming?: boolean;
}): React.ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React;
  if (!React) return null;

  const { antd = {}, antdIcons = {} } = host;
  const content = props.data || props.content || {};
  const isStreaming = props.isStreaming;
  const isLoading = content.status === "calling" && isStreaming;
  const isError = content.status === "error";

  // Parse the result text
  const resultText =
    typeof content.result === "string"
      ? content.result
      : JSON.stringify(content.result ?? "", null, 2);

  let resultInfo: {
    ok?: boolean;
    kind?: string;
    ui_id?: string;
    revision?: number;
    error_code?: string;
    message?: string;
    hint?: string;
    nodeCount?: number;
  } = {};

  try {
    const parsed = JSON.parse(resultText);
    if (parsed && typeof parsed === "object") {
      resultInfo = parsed;
      // Count nodes in the tree
      if (parsed.tree?.root) {
        resultInfo.nodeCount = countNodes(parsed.tree.root);
      }
    }
  } catch {
    // Result is not JSON yet (streaming)
  }

  const title = isLoading
    ? "🎨 Generating UI Tree..."
    : isError
      ? "🎨 UI Tree Error"
      : resultInfo.ok
        ? `🎨 UI Tree (${resultInfo.nodeCount ?? 0} nodes)`
        : "🎨 UI Tree";

  const summary = resultInfo.ok
    ? `ui_id: ${resultInfo.ui_id?.slice(0, 16) ?? ""}… | rev: ${resultInfo.revision ?? 1}`
    : resultInfo.message
      ? resultInfo.message
      : undefined;

  return React.createElement(
    "details",
    {
      open: isLoading || isError,
      style: {
        margin: "4px 0",
        border: "1px solid var(--ant-color-border, #d9d9d9)",
        borderRadius: 8,
        padding: "4px 8px",
        fontSize: 13,
      },
    },
    React.createElement(
      "summary",
      {
        style: {
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        },
      },
      isLoading
        ? React.createElement("span", {
            className: "ant-spin-dot ant-spin-dot-spin",
          })
        : React.createElement("span", null, "🎨"),
      React.createElement("span", null, title),
      !isLoading && summary
        ? React.createElement(
            "span",
            { style: { fontSize: 11, color: "#999", marginLeft: "auto" } },
            summary,
          )
        : null,
    ),
    isError || (resultInfo.ok === false)
      ? React.createElement(
          "div",
          { style: { padding: "8px 12px", fontSize: 12 } },
          React.createElement(
            "div",
            { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } },
            resultInfo.message || "Unknown error",
          ),
          resultInfo.hint
            ? React.createElement(
                "div",
                { style: { color: "#999" } },
                `💡 ${resultInfo.hint}`,
              )
            : null,
        )
      : resultInfo.ok
        ? React.createElement(
            "div",
            { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
            `UI tree rendered below (${resultInfo.nodeCount ?? 0} nodes, revision ${resultInfo.revision ?? 1})`,
          )
        : React.createElement(
            "pre",
            {
              style: {
                fontSize: 12,
                padding: "8px 12px",
                background: "rgba(0,0,0,0.03)",
                borderRadius: 8,
                overflow: "auto",
                maxHeight: 200,
              },
            },
            resultText,
          ),
  );
}

function countNodes(node: any): number {
  if (!node || typeof node !== "object") return 0;
  let count = 1;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}
