import { getHost } from "../core/runtime";
import { FlowGraph } from "./FlowGraph";
import { Timeline } from "./Timeline";
import {
  selectDerivation,
  useDerivationRecords,
  useSelectedDerivationId,
} from "./useDerivationStore";
export function UgsciDerivationPanel() {
  const React = getHost().React as any;
  const sessionId = getHost().getCurrentSessionId?.() || "";
  const records = useDerivationRecords(sessionId);
  const requestedId = useSelectedDerivationId();
  const [selected, setSelected] = React.useState(records[0] as any);
  const [view, setView] = React.useState("timeline");
  React.useEffect(() => {
    const requested = records.find((item) => item.uiId === requestedId);
    if (requested && requested !== selected) setSelected(requested);
    else if (!records.some((item) => item.uiId === selected?.uiId))
      setSelected(records[0]);
  }, [records, requestedId, selected]);
  if (!records.length)
    return React.createElement(
      "div",
      { style: { padding: 20 } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。",
    );
  const payload = selected?.payload || records[0].payload;
  const provenance = payload.provenance || {};
  const replaySummary = payload.replay;
  const replay = () => {
    const token = provenance.replay_token;
    if (!token) return;
    (window as any).QwenPaw?.chat?.sendMessage?.(
      `请调用 ugsci_replay_calculation 验证并重放以下令牌：\n${token}`,
    );
  };
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: 12,
        gap: 10,
        overflow: "auto",
      },
    },
    React.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      React.createElement(
        "strong",
        null,
        payload.trace?.formula_name || payload.operation || "UGSci 推导",
      ),
      React.createElement(
        "span",
        null,
        provenance.source === "freeform"
          ? "⚠️ AI-推导 · 未审校"
          : `✅ 审定公式 · ${
              provenance.formula_id || payload.trace?.formula_id || ""
            }`,
      ),
      provenance.reference
        ? React.createElement("span", null, provenance.reference)
        : null,
      replaySummary
        ? React.createElement(
            "span",
            {
              style: {
                color: replaySummary.reproducible ? "#15803d" : "#b45309",
              },
            },
            replaySummary.reproducible
              ? `✅ 可复现 · ${replaySummary.elapsedMs ?? "?"} ms`
              : "⚠️ 版本已变化",
          )
        : null,
      provenance.replay_token
        ? React.createElement(
            "button",
            { type: "button", onClick: replay },
            "重新计算",
          )
        : null,
    ),
    React.createElement(
      "div",
      { style: { display: "flex", gap: 6 } },
      ...["flow", "timeline", "logs"].map((item) =>
        React.createElement(
          "button",
          {
            key: item,
            type: "button",
            onClick: () => setView(item),
            "aria-pressed": view === item,
          },
          item === "flow" ? "流程" : item === "timeline" ? "时间线" : "日志",
        ),
      ),
    ),
    React.createElement(
      "select",
      {
        value: selected?.uiId || records[0].uiId,
        onChange: (event: any) => {
          selectDerivation(event.target.value);
          setSelected(records.find((item) => item.uiId === event.target.value));
        },
      },
      ...records.map((item) =>
        React.createElement(
          "option",
          { key: item.uiId, value: item.uiId },
          item.payload.trace?.formula_name || item.uiId.slice(0, 18),
        ),
      ),
    ),
    view === "flow"
      ? React.createElement(FlowGraph, { payload })
      : view === "timeline"
      ? React.createElement(Timeline, { payload })
      : React.createElement(
          "pre",
          { style: { whiteSpace: "pre-wrap", fontSize: 11 } },
          JSON.stringify(payload, null, 2),
        ),
  );
}
