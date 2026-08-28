import { getHost } from "../core/runtime";
import { addDerivation, selectDerivation } from "./useDerivationStore";
function unwrap(raw: any): any {
  if (typeof raw === "string") {
    try {
      return unwrap(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  if (Array.isArray(raw))
    return unwrap(raw.find((item) => item?.type === "text")?.text);
  if (raw?.status && raw?.result) {
    return {
      ...raw.result,
      replay: {
        replayId: String(raw.replay_id || ""),
        status: String(raw.status),
        reproducible: raw.reproducible === true,
        elapsedMs:
          typeof raw.elapsed_ms === "number" ? raw.elapsed_ms : undefined,
        diff: raw.diff && typeof raw.diff === "object" ? raw.diff : {},
      },
    };
  }
  if (raw?.output !== undefined) return unwrap(raw.output);
  if (raw?.content !== undefined) return unwrap(raw.content);
  return raw;
}
export function DerivationToolCall(props: any) {
  const React = getHost().React as any;
  const content = props?.data?.content || [];
  const raw =
    content[1]?.data?.output ??
    content[1]?.data?.content ??
    content[0]?.data?.output;
  const payload = unwrap(raw);
  const [record, setRecord] = React.useState(null as any);
  React.useEffect(() => {
    if (payload) setRecord(addDerivation(payload));
  }, [raw]);
  const open = () => {
    if (record?.uiId) selectDerivation(record.uiId);
    window.dispatchEvent(
      new CustomEvent("qwenpaw:open-compute-workbench", {
        detail: { uiId: record?.uiId },
      }),
    );
  };
  return React.createElement(
    "div",
    {
      style: {
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        padding: 8,
        margin: "4px 0",
      },
    },
    React.createElement(
      "strong",
      null,
      payload?.provenance?.source === "freeform"
        ? "⚠️ AI-推导 · 未审校"
        : "✅ UGSci 审定推导",
    ),
    payload
      ? React.createElement(
          "button",
          { type: "button", onClick: open, style: { marginLeft: 10 } },
          "在工作台打开",
        )
      : React.createElement("span", null, "计算中…"),
  );
}
