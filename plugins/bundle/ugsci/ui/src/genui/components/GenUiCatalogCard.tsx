/**
 * Compact card for list_ui_components / get_genui_guide — not the emit tree card.
 */

type ReactElement = any;

function resultTextFrom(value: unknown): string {
  if (typeof value === "string") {
    if (value.trimStart().startsWith("[")) {
      try { return resultTextFrom(JSON.parse(value)); } catch { /* keep raw */ }
    }
    return value;
  }
  if (Array.isArray(value)) {
    const text = value.find((item: any) => item?.type === "text")?.text;
    return typeof text === "string" ? text : JSON.stringify(value);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, any>;
    if (typeof record.text === "string") return record.text;
    if (record.output !== undefined) return resultTextFrom(record.output);
    if (record.content !== undefined) return resultTextFrom(record.content);
  }
  return value == null ? "" : JSON.stringify(value);
}

function parseV1Props(props: Record<string, unknown>): { resultText: string; status: string; toolName: string } {
  const data = props.data as Record<string, unknown> | undefined;
  if (!data) return { resultText: "", status: "calling", toolName: "" };
  const status = (data.status as string) || "calling";
  const content = data.content as unknown[] | undefined;
  if (!Array.isArray(content) || content.length === 0) {
    return { resultText: "", status, toolName: "" };
  }
  const callData = (content[0] as Record<string, unknown> | undefined)?.data as Record<string, unknown> | undefined;
  const toolName = (callData?.name as string) || "";
  if (content.length > 1) {
    const resultItem = content[1] as Record<string, unknown> | undefined;
    const resultData = resultItem?.data as Record<string, unknown> | undefined;
    const output = resultData?.output ?? resultData?.content ?? resultItem?.output ?? resultItem?.content;
    if (output != null) return { resultText: resultTextFrom(output), status, toolName };
  }
  return { resultText: "", status, toolName };
}

export function GenUiCatalogCard(props: { data?: Record<string, unknown>; [key: string]: unknown }): ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React;
  if (!React) return null;
  const { resultText, status, toolName } = parseV1Props(props as Record<string, unknown>);
  const isGuide = toolName === "get_genui_guide";
  const isLoading = status === "in_progress" || status === "calling";
  let summary = isGuide ? "GenUI 指南" : "组件目录";
  let detail = resultText;
  try {
    const parsed = resultText ? JSON.parse(resultText) : null;
    if (parsed && typeof parsed === "object") {
      const components = parsed.components;
      if (Array.isArray(components)) {
        summary = `组件目录（${components.length} 个 kind）`;
        detail = components.map((item: any) => item?.kind).filter(Boolean).join(" · ");
      } else if (parsed.purpose || parsed.layout_structure) {
        summary = "GenUI 指南";
        detail = String(parsed.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。");
      }
    }
  } catch { /* keep raw */ }
  return React.createElement(
    "details",
    { style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    React.createElement("summary", { style: { cursor: "pointer" } }, isLoading ? (isGuide ? "查阅 GenUI 指南…" : "查阅组件目录…") : summary),
    React.createElement("div", { style: { padding: "8px 4px", fontSize: 12, color: "#666", lineHeight: 1.5 } }, detail || "(waiting…)"),
  );
}
