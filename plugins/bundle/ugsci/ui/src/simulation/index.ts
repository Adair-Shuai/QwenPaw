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
  const [expanded, setExpanded] = React.useState(false);
  const [, setReady] = React.useState(0);
  const navigate = host.useNavigate?.();
  const currentAgent =
    host.useSelectedAgent?.()?.id || host.getSelectedAgentId?.() || "default";
  const sessionId = host.getCurrentSessionId?.() || "";
  const agentId = reference.agent_id || currentAgent;
  const sameAgent = currentAgent === agentId;
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
      "aria-label": `数模任务 ${reference.run_id}`,
      style: {
        padding: 14,
        margin: "10px 0",
        border: "1px solid var(--ant-color-border, #d9e2ec)",
        borderRadius: 10,
      },
    },
    React.createElement(
      "strong",
      null,
      `数模任务 · ${reference.simulator || "模拟计算"}`,
    ),
    React.createElement(
      "div",
      {
        style: {
          fontSize: 12,
          color: "var(--ant-color-text-secondary, #64748b)",
          margin: "6px 0",
        },
      },
      reference.run_id,
    ),
    !sameAgent &&
      React.createElement("p", null, "请切换到该任务所属智能体后查看结果。"),
    React.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
      React.createElement(
        "button",
        { type: "button", disabled: !sameAgent, onClick: openPanel },
        "在侧栏监测",
      ),
      React.createElement(
        "button",
        {
          type: "button",
          disabled: !sameAgent,
          "aria-expanded": expanded,
          onClick: () => setExpanded(!expanded),
        },
        expanded ? "收起结果" : "查看实时结果",
      ),
      navigate &&
        React.createElement(
          "button",
          {
            type: "button",
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
      (Monitor
        ? React.createElement(Monitor, {
            runId: reference.run_id,
            compact: true,
            scope: { agentId, chatId: sessionId },
          })
        : React.createElement(
            "p",
            { role: "status" },
            "运行中心监测组件尚未加载，请启用运行中心插件。",
          )),
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
