import { getHost } from "../core/runtime";
import {
  DerivationSummary,
  EvidencePanel,
  LogsPanel,
  OverviewPanel,
} from "./DerivationSummary";
import { FlowGraph } from "./FlowGraph";
import { Timeline } from "./Timeline";
import {
  selectDerivation,
  useDerivationRecords,
  useSelectedDerivationId,
} from "./useDerivationStore";

const TEXT = "var(--ant-color-text, rgba(0,0,0,.88))";
const MUTED = "var(--ant-color-text-secondary, rgba(0,0,0,.45))";
const BORDER = "var(--ant-color-border, #d9d9d9)";
const SURFACE = "var(--ant-color-bg-container, #fff)";
const PRIMARY = "var(--ant-color-primary, #1677ff)";

export function UgsciDerivationPanel() {
  const React = getHost().React as any;
  const sessionId = getHost().getCurrentSessionId?.() || "";
  const records = useDerivationRecords(sessionId);
  const requestedId = useSelectedDerivationId();
  const [selected, setSelected] = React.useState(records[0] as any);
  const [view, setView] = React.useState("summary");
  const [derivationView, setDerivationView] = React.useState("steps");

  React.useEffect(() => {
    const requested = records.find((item) => item.uiId === requestedId);
    if (requested && requested !== selected) setSelected(requested);
    else if (!records.some((item) => item.uiId === selected?.uiId))
      setSelected(records[0]);
  }, [records, requestedId, selected]);

  if (!records.length)
    return React.createElement(
      "div",
      { style: { padding: 20, color: MUTED } },
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
  const views = [
    ["summary", "摘要"],
    ["derivation", "推导"],
    ["evidence", "证据"],
    ["logs", "日志"],
  ];
  const tabStyle = (active: boolean) => ({
    flex: "1 1 64px",
    minWidth: 0,
    border: "none",
    borderRadius: 7,
    padding: "6px 8px",
    background: active ? SURFACE : "transparent",
    color: active ? TEXT : MUTED,
    boxShadow: active ? "0 1px 4px rgba(0,0,0,.08)" : "none",
    cursor: "pointer",
  });

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: 14,
        gap: 12,
        overflow: "auto",
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        },
      },
      React.createElement(
        "div",
        null,
        React.createElement(
          "strong",
          { style: { display: "block", color: TEXT } },
          "计算详情",
        ),
        React.createElement(
          "span",
          { style: { color: MUTED, fontSize: 11 } },
          payload.trace?.formula_name || payload.operation || "UGSci 推导",
        ),
      ),
      replaySummary
        ? React.createElement(
            "span",
            {
              style: {
                color: replaySummary.reproducible
                  ? "var(--ant-color-success, #52c41a)"
                  : "var(--ant-color-warning, #faad14)",
                fontSize: 12,
              },
            },
            replaySummary.reproducible
              ? `✓ 可复现 · ${replaySummary.elapsedMs ?? "?"} ms`
              : "! 版本已变化",
          )
        : null,
    ),
    React.createElement(
      "div",
      {
        role: "tablist",
        "aria-label": "计算详情层级",
        style: {
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 9,
          background: "var(--ant-color-fill-quaternary, rgba(0,0,0,.02))",
        },
      },
      ...views.map(([item, label]) =>
        React.createElement(
          "button",
          {
            key: item,
            type: "button",
            role: "tab",
            onClick: () => setView(item),
            "aria-selected": view === item,
            style: tabStyle(view === item),
          },
          label,
        ),
      ),
    ),
    records.length > 1
      ? React.createElement(
          "select",
          {
            "aria-label": "选择计算记录",
            value: selected?.uiId || records[0].uiId,
            onChange: (event: any) => {
              selectDerivation(event.target.value);
              setSelected(
                records.find((item) => item.uiId === event.target.value),
              );
            },
            style: {
              width: "100%",
              padding: "7px 9px",
              border: `1px solid ${BORDER}`,
              borderRadius: 7,
              color: TEXT,
              background: SURFACE,
            },
          },
          ...records.map((item) =>
            React.createElement(
              "option",
              { key: item.uiId, value: item.uiId },
              item.payload.trace?.formula_name || item.uiId.slice(0, 18),
            ),
          ),
        )
      : null,
    view === "summary"
      ? React.createElement(
          "div",
          { role: "tabpanel", style: { display: "grid", gap: 18 } },
          React.createElement(DerivationSummary, {
            payload,
            onOpenDerivation: () => setView("derivation"),
            onOpenEvidence: () => setView("evidence"),
            onReplay: provenance.replay_token ? replay : undefined,
          }),
          React.createElement(OverviewPanel, { payload }),
        )
      : view === "derivation"
      ? React.createElement(
          "div",
          { role: "tabpanel", style: { display: "grid", gap: 10 } },
          React.createElement(
            "div",
            { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
            ...[
              ["steps", "关键步骤"],
              ["flow", "流程图"],
            ].map(([item, label]) =>
              React.createElement(
                "button",
                {
                  key: item,
                  type: "button",
                  onClick: () => setDerivationView(item),
                  "aria-pressed": derivationView === item,
                  style: {
                    border: `1px solid ${
                      derivationView === item ? PRIMARY : BORDER
                    }`,
                    borderRadius: 7,
                    padding: "5px 9px",
                    background: SURFACE,
                    color: derivationView === item ? PRIMARY : TEXT,
                    cursor: "pointer",
                  },
                },
                label,
              ),
            ),
          ),
          derivationView === "flow"
            ? React.createElement(FlowGraph, { payload })
            : React.createElement(Timeline, { payload, compact: true }),
        )
      : view === "evidence"
      ? React.createElement(
          "div",
          { role: "tabpanel" },
          React.createElement(EvidencePanel, { payload }),
        )
      : React.createElement(
          "div",
          { role: "tabpanel" },
          React.createElement(LogsPanel, { payload }),
        ),
  );
}
