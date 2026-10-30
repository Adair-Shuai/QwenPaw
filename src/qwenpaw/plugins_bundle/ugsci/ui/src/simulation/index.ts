import { getHost } from "../core/runtime";

type RunReference = {
  kind: "ugsci_simulation";
  run_id: string;
  simulator?: string;
  agent_id?: string;
  session_id?: string;
};
const toolNames = new Set([
  "launch_simulation",
  "check_simulation_status",
  "wait_for_simulation",
  "read_simulation_results",
  "analyze_simulation",
]);
const outputTypes = new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output",
  "tool_result",
]);

/** Only a named simulation tool output can create an interactive run card. */
export function extractSimulationRuns(output: unknown): RunReference[] {
  const runs = new Map<string, RunReference>();
  const readReference = (value: any, depth = 0): void => {
    if (depth > 16 || value == null) return;
    if (typeof value === "string") {
      if (value.length > 200_000) return;
      try {
        readReference(JSON.parse(value), depth + 1);
      } catch {
        // Live tool events concatenate the explanatory TextBlock and the
        // reference. Only the bounded, explicit protocol marker is parsed.
        for (const match of value.matchAll(
          /<ugsci-simulation-ref>([\s\S]{1,4096}?)<\/ugsci-simulation-ref>/g,
        )) {
          try {
            readReference(JSON.parse(match[1]), depth + 1);
          } catch {
            /* malformed reference */
          }
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach((item) => readReference(item, depth + 1));
    } else if (typeof value === "object") {
      if (
        value.kind === "ugsci_simulation" &&
        value.schema_version === 1 &&
        typeof value.run_id === "string" &&
        /^[\w:.-]{1,160}$/.test(value.run_id)
      ) {
        runs.set(value.run_id, {
          kind: "ugsci_simulation",
          run_id: value.run_id,
          simulator:
            typeof value.simulator === "string" ? value.simulator : undefined,
          agent_id:
            typeof value.agent_id === "string" ? value.agent_id : undefined,
          session_id:
            typeof value.session_id === "string" ? value.session_id : undefined,
        });
      } else {
        for (const key of [
          "text",
          "output",
          "content",
          "result",
          "data",
          "metadata",
        ]) {
          readReference(value[key], depth + 1);
        }
      }
    }
  };
  const visit = (value: any, depth = 0): void => {
    if (!value || typeof value !== "object" || depth > 16) return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }
    if (value.role === "user" || value.role === "system") return;
    if (outputTypes.has(value.type)) {
      const content = Array.isArray(value.content) ? value.content : [];
      // Stream envelopes use top-level name="assistant"; SDK merges keep
      // the actual tool identity in a content data block.
      const names = [
        value.data?.name,
        ...content.map((item: any) => item?.data?.name),
        value.name,
      ];
      if (names.some((name) => toolNames.has(name))) readReference(value);
      return;
    }
    // Only traverse message wrappers, never parse arbitrary assistant/user prose.
    for (const key of ["output", "content", "data"])
      visit(value[key], depth + 1);
  };
  visit(output);
  return [...runs.values()];
}

function SimulationCard({ reference }: { reference: RunReference }) {
  const host = getHost();
  const React = host.React;
  const { Button } = host.antd;
  const [expanded, setExpanded] = React.useState(false);
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);
  const cardId = React.useId();
  const detailsId = `${cardId}-details`;
  const resultsId = `${cardId}-results`;
  const [, setReady] = React.useState(0);
  const navigate = host.useNavigate?.();
  const currentAgent =
    host.useSelectedAgent?.()?.id || host.getSelectedAgentId?.() || "default";
  const sessionId = host.getCurrentSessionId?.() || "";
  const agentId = reference.agent_id || currentAgent;
  const sameAgent = currentAgent === agentId;
  const title = `数模任务 · ${reference.simulator || "模拟计算"}`;
  const buttonStyle = {
    borderRadius: "var(--app-radius, 10px)",
    minHeight: 34,
    height: "auto",
    padding: "6px 14px",
    fontSize: "var(--app-font-secondary, 13px)",
    lineHeight: 1.5,
    whiteSpace: "normal" as const,
  };
  React.useEffect(() => {
    const changed = () => setReady((version) => version + 1);
    window.addEventListener("qwenpaw:simulation-monitor-ready", changed);
    return () =>
      window.removeEventListener("qwenpaw:simulation-monitor-ready", changed);
  }, []);
  const QP = (window as any).QwenPaw;
  const Monitor = QP?.runCenter?.SimulationMonitor;
  const openPanel = () =>
    window.dispatchEvent(
      new CustomEvent("qwenpaw:open-simulation-workbench", {
        detail: { runId: reference.run_id, agentId, sessionId },
      }),
    );
  return React.createElement(
    "section",
    {
      "aria-label": title,
      style: {
        boxSizing: "border-box",
        width: "100%",
        maxWidth: 640,
        minWidth: 0,
        padding: "var(--app-space-4, 16px)",
        margin: "12px 0",
        border: "1px solid var(--app-border-subtle, #e2e8f0)",
        borderRadius: "var(--app-radius-card, 16px)",
        background: "var(--app-surface, #fff)",
        color: "var(--app-text, #1e293b)",
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        },
      },
      React.createElement(
        "strong",
        {
          style: {
            fontSize: "var(--app-font-body, 14px)",
            lineHeight: 1.5,
            overflowWrap: "anywhere",
          },
        },
        title,
      ),
      React.createElement(
        Button,
        {
          type: "text",
          size: "small",
          "aria-expanded": detailsExpanded,
          "aria-controls": detailsId,
          onClick: () => setDetailsExpanded((value) => !value),
          style: {
            fontSize: "var(--app-font-caption, 12px)",
            color: "var(--app-text-secondary, #64748b)",
            borderRadius: "var(--app-radius, 10px)",
          },
        },
        detailsExpanded ? "收起详情" : "任务详情",
      ),
    ),
    React.createElement(
      "p",
      {
        style: {
          fontSize: "var(--app-font-secondary, 13px)",
          lineHeight: 1.6,
          color: "var(--app-text-secondary, #64748b)",
          margin: "6px 0 14px",
        },
      },
      "查看计算结果，或在工作区持续监测。",
    ),
    !sameAgent &&
      React.createElement(
        "p",
        {
          style: {
            fontSize: "var(--app-font-secondary, 13px)",
            lineHeight: 1.6,
            margin: "0 0 12px",
            color: "var(--app-text-secondary, #64748b)",
          },
        },
        "请切换到该任务所属智能体后查看结果。",
      ),
    React.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
      React.createElement(
        Button,
        {
          type: "primary",
          style: buttonStyle,
          disabled: !sameAgent,
          "aria-expanded": expanded,
          "aria-controls": resultsId,
          onClick: () => setExpanded((value) => !value),
        },
        expanded ? "收起结果" : "查看结果",
      ),
      React.createElement(
        Button,
        { style: buttonStyle, disabled: !sameAgent, onClick: openPanel },
        "在侧栏监测",
      ),
      navigate &&
        React.createElement(
          Button,
          {
            type: "text",
            style: buttonStyle,
            disabled: !sameAgent,
            onClick: () =>
              navigate(
                `/run-center?run_id=${encodeURIComponent(reference.run_id)}`,
              ),
          },
          "打开运行中心",
        ),
    ),
    expanded &&
      sameAgent &&
      React.createElement(
        "div",
        {
          id: resultsId,
          style: {
            minWidth: 0,
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid var(--app-border-subtle, #e2e8f0)",
          },
        },
        Monitor
          ? React.createElement(Monitor, {
              runId: reference.run_id,
              compact: true,
              scope: { agentId, chatId: sessionId },
            })
          : React.createElement(
              "p",
              { role: "status" },
              "运行中心监测组件尚未加载，请启用运行中心插件。",
            ),
      ),
    detailsExpanded &&
      React.createElement(
        "dl",
        {
          id: detailsId,
          "aria-label": "任务详情",
          style: {
            display: "grid",
            gridTemplateColumns: "max-content minmax(0, 1fr)",
            gap: "8px 12px",
            margin: "14px 0 0",
            padding: 12,
            borderRadius: "var(--app-radius, 10px)",
            background: "var(--app-fill-subtle, #f8fafc)",
            fontSize: "var(--app-font-caption, 12px)",
            lineHeight: 1.6,
          },
        },
        ...[
          ["任务 ID", reference.run_id],
          ["所属智能体", agentId],
          ["来源会话", reference.session_id || sessionId],
        ]
          .filter(([, value]) => value)
          .flatMap(([label, value]) => [
            React.createElement(
              "dt",
              {
                key: `${label}-label`,
                style: { color: "var(--app-text-secondary, #64748b)" },
              },
              label,
            ),
            React.createElement(
              "dd",
              {
                key: label,
                style: {
                  margin: 0,
                  minWidth: 0,
                  overflowWrap: "anywhere",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                },
              },
              value,
            ),
          ]),
      ),
  );
}

export function SimulationInline({ data }: { data: Record<string, unknown> }) {
  const React = getHost().React;
  return React.createElement(
    React.Fragment,
    null,
    ...extractSimulationRuns(data.output).map((reference) =>
      React.createElement(SimulationCard, { key: reference.run_id, reference }),
    ),
  );
}

export function registerSimulationFrontend(QP: any, React: any): void {
  QP.ugsciSimulationDispose?.();
  const registration = QP.chat?.response?.append?.(
    "ugsci",
    ({ data }: { data: Record<string, unknown> }) =>
      React.createElement(SimulationInline, { data }),
    { id: "ugsci.simulation.response-append", order: 60 },
  );
  QP.ugsciSimulationDispose = () => registration?.dispose?.();
}
