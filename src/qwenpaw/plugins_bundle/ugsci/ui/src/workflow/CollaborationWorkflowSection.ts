import { apiFetch, getHost } from "../core/runtime";
import { PRIMARY_BTN_STYLE } from "../core/shared";
import { fetchAgents } from "../core/api";
import type { AgentSummary } from "../core/types";

interface FlowSummary {
  id: string;
  name: string;
  description: string;
  version: string;
  node_count: number;
  updated_at: number;
}

interface FlowRun {
  run_id: string;
  flow_id: string;
  status: string;
  started_at: number;
  finished_at?: number | null;
  error?: string | null;
  node_statuses?: Record<string, string> | null;
  duration_ms?: number;
  /** Optional execution events emitted by FlowForge for richer run inspection. */
  events?: Array<Record<string, unknown>> | null;
}

const DOMAIN_TEMPLATES = [
  {
    key: "ugs-cycle-review",
    icon: "🏭",
    name: "储气库周期运行评价",
    category: "生产运行",
    description: "资料质检、库容与压力分析、注采能力预测、风险复核和运行建议。",
    sop: "校验储气库本周期井口、井底压力和注采量数据；分析库容、压力窗口与单井能力；预测下一周期注采能力；由完整性专家复核井筒与盖层风险；生成带证据和风险边界的运行建议。",
    roleHints: ["Underground Gas Storage", "PVT", "储气库", "Verifier", "Underground Gas Storage"],
    roleKeys: ["analyst", "pvt-analyst", "reservoir-engineer", "domain-reviewer", "analyst"],
  },
  {
    key: "reservoir-model-review",
    icon: "🛢️",
    name: "油藏模型历史拟合与复核",
    category: "开发研究",
    description: "从数据质检到模拟、敏感性分析、独立复算和成果归档。",
    sop: "检查静动态数据、单位和模型版本；运行油藏数值模拟与历史拟合；开展关键参数敏感性和不确定性分析；由独立油藏工程师复核；归档模型、脚本、运行日志和结论。",
    roleHints: ["油藏工程师", "油藏工程师", "油藏工程师 Copy", "Verifier", "油藏工程师"],
    roleKeys: ["analyst", "reservoir-engineer", "reservoir-engineer", "domain-reviewer", "analyst"],
  },
  {
    key: "research-validation",
    icon: "🔬",
    name: "科研方法验证与独立复算",
    category: "科学研究",
    description: "文献证据、方法实现、对照实验、反方审查和可复现成果。",
    sop: "检索并分级相关文献证据；定义可证伪假设和评价指标；实现候选方法并运行对照实验；由独立专家复算关键结果；由反方审稿专家检查替代解释；归档数据、代码、环境、不确定性和负结果。",
    roleHints: ["QA Agent", "Default", "QA Agent", "Verifier", "QA Agent", "QA Agent"],
    roleKeys: ["analyst", "analyst", "analyst", "domain-reviewer", "analyst", "analyst"],
  },
];

const POLL_INTERVAL_MS = 5000;
const STATUS_COLORS: Record<string, string> = {
  completed: "green",
  success: "green",
  failed: "red",
  error: "red",
  cancelled: "orange",
  running: "blue",
  queued: "cyan",
  paused: "gold",
  waiting_human: "gold",
  timeout: "volcano",
};

function navigate(path: string): void {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function openFlowForge(flowId?: string, runId?: string): void {
  const params = new URLSearchParams();
  if (flowId) params.set("flow", flowId);
  if (runId) params.set("run", runId);
  navigate(`/flowforge${params.size ? `?${params.toString()}` : ""}`);
}

function formatTimestamp(ts: number): string {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m${rem}s`;
}

function summarizeNodeProgress(
  nodeStatuses: Record<string, string> | null | undefined,
): string {
  if (!nodeStatuses) return "";
  const total = Object.keys(nodeStatuses).length;
  if (total === 0) return "";
  const done = Object.values(nodeStatuses).filter(
    (s) => s === "success" || s === "completed" || s === "skipped" || s === "cached",
  ).length;
  const failed = Object.values(nodeStatuses).filter(
    (s) => s === "error" || s === "failed",
  ).length;
  if (failed > 0) return `${done}/${total} 节点完成 (${failed} 失败)`;
  return `${done}/${total} 节点完成`;
}

function nodeStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    success: "已完成", completed: "已完成", skipped: "已跳过", cached: "已缓存",
    running: "执行中", queued: "排队中", waiting: "等待中", pending: "待执行",
    error: "失败", failed: "失败", cancelled: "已取消",
  };
  return labels[status] || status;
}

function nodeStatusColor(status: string): string {
  if (["success", "completed", "skipped", "cached"].includes(status)) return "green";
  if (["error", "failed"].includes(status)) return "red";
  if (["running"].includes(status)) return "blue";
  if (["queued", "pending"].includes(status)) return "cyan";
  return "gold";
}

function formatFlowEvent(event: Record<string, unknown>, index: number): string {
  const type = typeof event.type === "string" ? event.type : "事件";
  const node = typeof event.node_id === "string" ? ` · ${event.node_id}` : "";
  const state = event.state && typeof event.state === "object"
    ? event.state as Record<string, unknown>
    : {};
  const data = event.data && typeof event.data === "object"
    ? event.data as Record<string, unknown>
    : {};
  const message = [event.message, state.message, state.error, data.message, data.error]
    .find((value): value is string => typeof value === "string" && value.length > 0) || "";
  if (message) return `${type}${node}: ${message}`;
  const rawStatus = typeof event.status === "string"
    ? event.status
    : typeof state.status === "string"
      ? state.status
      : "";
  const status = rawStatus ? ` · ${nodeStatusLabel(rawStatus)}` : "";
  if (status) return `${type}${node}${status}`;
  try {
    const serialized = JSON.stringify(Object.keys(data).length > 0 ? data : event) || "{}";
    const bounded = serialized.length > 240 ? `${serialized.slice(0, 237)}...` : serialized;
    return `${type}${node}: ${bounded}`;
  } catch {
    return `${type}${node} #${index + 1}`;
  }
}

const ACTIVE_RUN_STATUSES = new Set(["running", "queued", "paused", "waiting_human"]);

export function CollaborationWorkflowSection() {
  const React = getHost().React;
  const { useCallback, useEffect, useRef, useState } = React;
  const {
    Alert,
    Button,
    Card,
    Col,
    Empty,
    Input,
    Popconfirm,
    Row,
    Space,
    Spin,
    Tabs,
    Progress,
    Tag,
    Tooltip,
    Typography,
    message,
  } = getHost().antd;
  const {
    ApartmentOutlined,
    DeleteOutlined,
    ReloadOutlined,
    RocketOutlined,
    PlayCircleOutlined,
    StopOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph, Title } = Typography;
  const useSelectedAgent = getHost().useSelectedAgent;
  const selectedAgent = useSelectedAgent
    ? useSelectedAgent()
    : { id: "default" };
  const controllerAgentId = selectedAgent?.id || "default";

  const [flows, setFlows] = useState<FlowSummary[]>([]);
  const [runs, setRuns] = useState<FlowRun[]>([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [naturalName, setNaturalName] = useState("");
  const [naturalPrompt, setNaturalPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<string>("templates");
  const [cancellingRuns, setCancellingRuns] = useState<Set<string>>(new Set());
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveRuns = runs.some((r) => ACTIVE_RUN_STATUSES.has(r.status));

  // Build a flow_id → name lookup map
  const flowNameMap = React.useMemo(() => {
    const m: Record<string, string> = {};
    flows.forEach((f) => { m[f.id] = f.name; });
    return m;
  }, [flows]);

  // Build a flow_id → active run count lookup
  const activeRunByFlow = React.useMemo(() => {
    const m: Record<string, number> = {};
    runs.forEach((r) => {
      if (ACTIVE_RUN_STATUSES.has(r.status)) {
        m[r.flow_id] = (m[r.flow_id] || 0) + 1;
      }
    });
    return m;
  }, [runs]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [flowList, runList, agentList] = await Promise.all([
        apiFetch<FlowSummary[]>("/flowforge/flows", { bypassCache: true }),
        apiFetch<FlowRun[]>("/flowforge/runs", { bypassCache: true }),
        fetchAgents().catch(() => [] as AgentSummary[]),
      ]);
      setFlows(flowList);
      setRuns(runList);
      setAgents(agentList);
      setAvailable(true);
    } catch (error) {
      console.warn("[ugsci] FlowForge is unavailable:", error);
      setAvailable(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    void load();
  }, [load]);

  // Auto-poll when there are active runs
  useEffect(() => {
    if (!available || !hasActiveRuns) {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }
    pollTimerRef.current = setTimeout(() => {
      void load(true);
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [hasActiveRuns, available, load]);

  // ── Template creation with binding result summary ──
  const createFromTemplate = useCallback(
    async (template: (typeof DOMAIN_TEMPLATES)[number]) => {
      if (creating) return; // concurrent guard
      setCreating(template.key);
      try {
        const generated = await apiFetch<Record<string, unknown>>(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: template.sop,
              name: template.name,
              agent_id: controllerAgentId,
            }),
          },
        );
        const generatedNodes = {
          ...((generated.nodes as Record<string, Record<string, unknown>>) || {}),
        };
        const stepNodes = Object.entries(generatedNodes)
          .filter(([nodeId]) => /^step_\d+$/.test(nodeId))
          .sort(([left], [right]) => Number(left.slice(5)) - Number(right.slice(5)));
        const nodeBindings: Record<string, Record<string, string>> = {};
        let matchedCount = 0;
        let fallbackCount = 0;
        stepNodes.forEach(([nodeId, node], index) => {
          const hint = template.roleHints[index] || "";
          const roleKey = template.roleKeys[index] || "analyst";
          const matched = agents.find((agent) =>
            `${agent.name} ${agent.id}`.toLowerCase().includes(hint.toLowerCase()),
          );
          if (matched) {
            matchedCount++;
          } else {
            fallbackCount++;
          }
          const boundAgentId = matched?.id || controllerAgentId;
          const inputs = { ...((node.inputs as Record<string, unknown>) || {}) };
          inputs.agent_id = boundAgentId;
          generatedNodes[nodeId] = {
            ...node,
            inputs,
            metadata: {
              ...((node.metadata as Record<string, unknown>) || {}),
              binding_policy: "fixed_instance",
              role_hint: hint,
              role_key: roleKey,
              agent_id: boundAgentId,
            },
          };
          nodeBindings[nodeId] = {
            binding_policy: "fixed_instance",
            role_hint: hint,
            role_key: roleKey,
            agent_id: boundAgentId,
          };
        });
        const flow = {
          ...generated,
          nodes: generatedNodes,
          id: `${template.key}-${Date.now()}`,
          name: template.name,
          description: template.description,
          metadata: {
            ...((generated.metadata as Record<string, unknown>) || {}),
            domain: "oil-gas",
            template_key: template.key,
            expert_binding_policy: "fixed_instance",
            controller_agent_id: controllerAgentId,
            node_bindings: nodeBindings,
          },
        };
        await apiFetch("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(flow),
        });
        const summary =
          stepNodes.length > 0
            ? `（${matchedCount} 个专家已匹配，${fallbackCount} 个回退到控制器）`
            : "";
        message.success(`已创建工作流草稿「${template.name}」${summary}`);
        await load();
      } catch (error: any) {
        message.error(error.message || "创建工作流失败");
      } finally {
        setCreating(null);
      }
    },
    [agents, controllerAgentId, creating, load, message],
  );

  const createFromNaturalLanguage = useCallback(async () => {
    if (creating) return; // concurrent guard
    if (!naturalPrompt.trim()) {
      message.warning("请先描述工作流步骤和控制要求");
      return;
    }
    setCreating("natural-language");
    try {
      const generated = await apiFetch<Record<string, unknown>>(
        "/flowforge/generate",
        {
          method: "POST",
          body: JSON.stringify({
            prompt: naturalPrompt.trim(),
            name: naturalName.trim(),
            agent_id: controllerAgentId,
          }),
        },
      );
      const flow = {
        ...generated,
        id: `natural-${Date.now()}`,
        metadata: {
          ...((generated.metadata as Record<string, unknown>) || {}),
          domain: "oil-gas",
          source: "natural-language",
          expert_binding_policy: "fixed_instance",
          controller_agent_id: controllerAgentId,
        },
      };
      await apiFetch("/flowforge/flows", {
        method: "POST",
        body: JSON.stringify(flow),
      });
      message.success("已从自然语言生成可编辑工作流草稿");
      setNaturalName("");
      setNaturalPrompt("");
      await load();
    } catch (error: any) {
      message.error(error.message || "自然语言生成失败");
    } finally {
      setCreating(null);
    }
  }, [controllerAgentId, creating, load, message, naturalName, naturalPrompt]);

  // ── Run / delete / cancel handlers ──
  const runFlow = useCallback(
    async (flowId: string, flowName: string) => {
      try {
        await apiFetch(`/flowforge/flows/${encodeURIComponent(flowId)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} }),
        });
        message.success(`已启动工作流「${flowName}」`);
        await load(true);
      } catch (error: any) {
        message.error(error.message || "启动工作流失败");
      }
    },
    [load, message],
  );

  const deleteFlow = useCallback(
    async (flowId: string, flowName: string) => {
      try {
        await apiFetch(`/flowforge/flows/${encodeURIComponent(flowId)}`, {
          method: "DELETE",
        });
        message.success(`已删除工作流「${flowName}」`);
        await load();
      } catch (error: any) {
        message.error(error.message || "删除工作流失败");
      }
    },
    [load, message],
  );

  const cancelRun = useCallback(
    async (runId: string) => {
      setCancellingRuns((prev) => {
        const next = new Set(prev);
        next.add(runId);
        return next;
      });
      try {
        await apiFetch(`/flowforge/runs/${encodeURIComponent(runId)}/cancel`, {
          method: "POST",
        });
        message.success("已请求取消运行");
        await load(true);
      } catch (error: any) {
        message.error(error.message || "取消运行失败");
      } finally {
        setCancellingRuns((prev) => {
          const next = new Set(prev);
          next.delete(runId);
          return next;
        });
      }
    },
    [load, message],
  );

  // ── Templates tab ──
  const templatesTab = React.createElement(
    "div",
    null,
    React.createElement(
      Card,
      {
        size: "small",
        title: "用自然语言生成工作流",
        style: { marginBottom: 16 },
      },
      React.createElement(
        Space,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        React.createElement(Input, {
          value: naturalName,
          onChange: (event: any) => setNaturalName(event.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80,
        }),
        React.createElement(Input.TextArea, {
          value: naturalPrompt,
          onChange: (event: any) => setNaturalPrompt(event.target.value),
          placeholder:
            "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 },
        }),
        React.createElement(
          Button,
          {
            type: "primary",
            onClick: () => void createFromNaturalLanguage(),
            loading: creating === "natural-language",
            disabled: !available || !!creating,
            style: PRIMARY_BTN_STYLE,
          },
          "生成可编辑草稿",
        ),
      ),
    ),
    React.createElement(
      Row,
      { gutter: [12, 12] },
      ...DOMAIN_TEMPLATES.map((template) =>
        React.createElement(
          Col,
          { key: template.key, xs: 24, md: 8 },
          React.createElement(
            Card,
            { style: { height: "100%" } },
            React.createElement(
              Space,
              { align: "start", style: { width: "100%" } },
              React.createElement("span", { style: { fontSize: 28 } }, template.icon),
              React.createElement(
                "div",
                { style: { flex: 1 } },
                React.createElement(Title, { level: 5, style: { margin: 0 } }, template.name),
                React.createElement(Tag, { color: "blue", style: { marginTop: 6 } }, template.category),
                React.createElement(
                  Paragraph,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  template.description,
                ),
                React.createElement(
                  Button,
                  {
                    type: "primary",
                    loading: creating === template.key,
                    disabled: !available || !!creating,
                    onClick: () => void createFromTemplate(template),
                    style: PRIMARY_BTN_STYLE,
                  },
                  "创建草稿",
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      Card,
      { size: "small", title: "专家节点绑定策略", style: { marginTop: 16 } },
      React.createElement(
        Row,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"],
        ].map(([title, description, status]) =>
          React.createElement(
            Col,
            { key: title, xs: 24, sm: 12, lg: 6 },
            React.createElement(Text, { strong: true }, title),
            React.createElement(
              Tag,
              {
                color: status === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 },
              },
              status,
            ),
            React.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, description),
          ),
        ),
      ),
    ),
  );

  // ── My flows tab ──
  const flowListTab = loading
    ? React.createElement(Spin)
    : flows.length === 0
      ? React.createElement(Empty, { description: "暂无工作流，可从模板创建" })
      : React.createElement(
          Row,
          { gutter: [12, 12] },
          ...flows.map((flow) => {
            const activeCount = activeRunByFlow[flow.id] || 0;
            return React.createElement(
              Col,
              { key: flow.id, xs: 24, md: 12, xl: 8 },
              React.createElement(
                Card,
                {
                  size: "small",
                  title: React.createElement(
                    Space,
                    { size: 6 },
                    React.createElement("span", null, flow.name),
                    activeCount > 0
                      ? React.createElement(
                          Tag,
                          { color: "blue" },
                          `${activeCount} 个运行中`,
                        )
                      : null,
                  ),
                  extra: React.createElement(Tag, null, `v${flow.version}`),
                },
                React.createElement(Paragraph, { ellipsis: { rows: 2 } }, flow.description || "暂无描述"),
                React.createElement(
                  Space,
                  { size: 8, wrap: true },
                  React.createElement(Tag, { color: "geekblue" }, `${flow.node_count} 个节点`),
                  React.createElement(Button, {
                    size: "small",
                    type: "primary",
                    icon: PlayCircleOutlined ? React.createElement(PlayCircleOutlined) : undefined,
                    disabled: !available,
                    onClick: () => void runFlow(flow.id, flow.name),
                  }, "运行"),
                  React.createElement(Button, {
                    size: "small",
                    onClick: () => openFlowForge(flow.id),
                  }, "编辑"),
                  React.createElement(
                    Popconfirm,
                    {
                      title: "确认删除",
                      description: `确定要删除工作流「${flow.name}」吗？此操作不可撤销。`,
                      onConfirm: () => void deleteFlow(flow.id, flow.name),
                      okText: "删除",
                      cancelText: "取消",
                      okButtonProps: { danger: true },
                    },
                    React.createElement(Button, {
                      size: "small",
                      danger: true,
                      icon: DeleteOutlined ? React.createElement(DeleteOutlined) : undefined,
                    }, "删除"),
                  ),
                ),
              ),
            );
          }),
        );

  // ── Run center tab ──
  const runCenterTab = loading
    ? React.createElement(Spin)
    : runs.length === 0
      ? React.createElement(Empty, { description: "暂无工作流运行记录" })
      : React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 8 } },
          ...runs.map((run) => {
            const flowName = flowNameMap[run.flow_id] || run.flow_id;
            const isActive = ACTIVE_RUN_STATUSES.has(run.status);
            const nodeProgress = summarizeNodeProgress(run.node_statuses);
            const nodeEntries = Object.entries(run.node_statuses || {});
            const doneNodes = nodeEntries.filter(([, s]) => ["success", "completed", "skipped", "cached"].includes(s)).length;
            const failedNodes = nodeEntries.filter(([, s]) => ["error", "failed"].includes(s)).length;
            const hasNodeProgress = nodeEntries.length > 0;
            const terminalSuccess = run.status === "completed" || run.status === "success";
            const progressPercent = hasNodeProgress
              ? Math.round((doneNodes / nodeEntries.length) * 100)
              : isActive
                ? 18
                : terminalSuccess
                  ? 100
                  : 0;
            const eventEntries = Array.isArray(run.events)
              ? run.events.filter(
                  (event): event is Record<string, unknown> =>
                    Boolean(event) && typeof event === "object",
                ).slice(-100)
              : [];
            const expanded = expandedRuns.has(run.run_id);
            const duration =
              run.duration_ms && run.duration_ms > 0
                ? run.duration_ms
                : run.finished_at && run.started_at
                  ? (run.finished_at - run.started_at) * 1000
                  : isActive && run.started_at
                    ? (Date.now() / 1000 - run.started_at) * 1000
                    : 0;
            return React.createElement(
              Card,
              {
                key: run.run_id,
                size: "small",
                style: {
                  borderLeft: `3px solid ${STATUS_COLORS[run.status] === "green" ? "#52c41a" : STATUS_COLORS[run.status] === "red" ? "#ff4d4f" : "#1677ff"}`,
                  transition: "box-shadow .2s ease",
                },
              },
              React.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
                React.createElement(
                  Tag,
                  { color: STATUS_COLORS[run.status] || "default" },
                  run.status,
                ),
                React.createElement(Text, { strong: true }, flowName),
                React.createElement(
                  Tooltip,
                  { title: run.run_id },
                  React.createElement(
                    Text,
                    { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
                    run.run_id.slice(0, 8) + "…",
                  ),
                ),
                React.createElement(
                  Text,
                  { type: "secondary", style: { fontSize: 12 } },
                  formatTimestamp(run.started_at),
                ),
                duration > 0
                  ? React.createElement(
                      Text,
                      { type: "secondary", style: { fontSize: 12 } },
                      `耗时 ${formatDuration(duration)}`,
                    )
                  : null,
                nodeProgress
                  ? React.createElement(Tag, { color: "geekblue", style: { fontSize: 11 } }, nodeProgress)
                  : null,
                run.error
                  ? React.createElement(
                      Tooltip,
                      { title: run.error },
                      React.createElement(Text, { type: "danger", style: { fontSize: 12 } }, "（有错误）"),
                    )
                  : null,
                React.createElement(
                  "div",
                  { style: { marginLeft: "auto", display: "flex", gap: 6 } },
                  isActive
                    ? React.createElement(
                        Popconfirm,
                        {
                          title: "确认取消运行？",
                          onConfirm: () => void cancelRun(run.run_id),
                          okText: "取消运行",
                          cancelText: "保留",
                          okButtonProps: { danger: true },
                        },
                        React.createElement(Button, {
                          size: "small",
                          danger: true,
                          loading: cancellingRuns.has(run.run_id),
                          icon: StopOutlined ? React.createElement(StopOutlined) : undefined,
                        }, "取消运行"),
                      )
                    : null,
                  React.createElement(
                    Button,
                    {
                      size: "small",
                      type: "link",
                      onClick: () => setExpandedRuns((prev) => {
                        const next = new Set(prev);
                        if (next.has(run.run_id)) next.delete(run.run_id); else next.add(run.run_id);
                        return next;
                      }),
                    },
                    expanded ? "收起过程" : "查看过程",
                  ),
                  React.createElement(
                    Button,
                    {
                      size: "small",
                      type: "link",
                      onClick: () => openFlowForge(undefined, run.run_id),
                    },
                    "查看详情",
                  ),
                ),
              ),
              React.createElement(
                "div",
                { style: { marginTop: 10, display: "flex", alignItems: "center", gap: 10 } },
                React.createElement(Progress, { percent: progressPercent, size: "small", status: failedNodes || run.status === "failed" || run.status === "error" ? "exception" : isActive ? "active" : "success", showInfo: false, style: { flex: 1, margin: 0 } }),
                React.createElement(Text, { type: "secondary", style: { fontSize: 12, minWidth: 90, textAlign: "right" } }, hasNodeProgress ? `${progressPercent}%` : "暂无节点进度"),
              ),
              expanded && (nodeEntries.length > 0 || eventEntries.length > 0 || Boolean(run.error))
                ? React.createElement(
                    "div",
                    { style: { marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "var(--ant-color-fill-quaternary, #fafafa)" } },
                    React.createElement(
                      "div",
                      { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
                      React.createElement(Text, { strong: true }, "协作过程"),
                      React.createElement(Text, { type: "secondary", style: { fontSize: 12 } }, nodeEntries.length > 0 ? `${doneNodes}/${nodeEntries.length} 个 Agent 节点完成${failedNodes ? ` · ${failedNodes} 个失败` : ""}` : "暂无节点状态"),
                    ),
                    nodeEntries.length > 0
                      ? React.createElement(
                          "div",
                          { style: { display: "grid", gap: 7 } },
                          ...nodeEntries.map(([nodeId, status], index) =>
                            React.createElement(
                              "div",
                              { key: nodeId, style: { display: "flex", alignItems: "center", gap: 8 } },
                              React.createElement("span", { style: { width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: nodeStatusColor(status) === "green" ? "#f6ffed" : nodeStatusColor(status) === "red" ? "#fff2f0" : "#e6f4ff", color: nodeStatusColor(status) === "green" ? "#389e0d" : nodeStatusColor(status) === "red" ? "#cf1322" : "#1677ff", fontSize: 11, fontWeight: 600 } }, index + 1),
                              React.createElement(Text, { style: { flex: 1, fontSize: 12 } }, nodeId.replace(/^step[_-]?\d+[_-]?/, "") || `Agent ${index + 1}`),
                              index < nodeEntries.length - 1 ? React.createElement(Text, { type: "secondary", style: { fontSize: 11 } }, "→") : null,
                              React.createElement(Tag, { color: nodeStatusColor(status), style: { margin: 0, fontSize: 11 } }, nodeStatusLabel(status)),
                            ),
                          ),
                        )
                      : null,
                    eventEntries.length > 0
                      ? React.createElement(
                          "div",
                          { style: { display: "grid", gap: 5, marginTop: nodeEntries.length > 0 ? 10 : 0 } },
                          React.createElement(Text, { strong: true, style: { fontSize: 12 } }, "执行事件"),
                          ...eventEntries.map((event, index) => React.createElement(Text, { key: `event-${index}`, type: "secondary", style: { fontSize: 12 } }, formatFlowEvent(event, index))),
                        )
                      : null,
                    run.error ? React.createElement(Alert, { type: "error", showIcon: true, message: "运行错误", description: run.error, style: { marginTop: 10 } }) : null,
                  )
                : null,
            );
          }),
        );

  // ── Tab-aware extra content ──
  const tabBarExtraContent = React.createElement(
    Space,
    null,
    React.createElement(Button, {
      icon: ReloadOutlined ? React.createElement(ReloadOutlined) : undefined,
      onClick: () => void load(),
      loading,
    }, "刷新"),
    activeTab !== "templates"
      ? React.createElement(Button, {
          type: "primary",
          icon: ApartmentOutlined
            ? React.createElement(ApartmentOutlined)
            : RocketOutlined
              ? React.createElement(RocketOutlined)
              : undefined,
          onClick: () => openFlowForge(),
          disabled: !available,
          style: PRIMARY_BTN_STYLE,
        }, "打开流程编辑器")
      : null,
  );

  return React.createElement(
    "div",
    null,
    !available
      ? React.createElement(Alert, {
          type: "warning",
          message: "FlowForge 引擎未启动",
          description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
          showIcon: true,
          style: { marginBottom: 16 },
        })
      : null,
    React.createElement(Tabs, {
      items: [
        { key: "templates", label: "工作流模板", children: templatesTab },
        { key: "mine", label: `我的工作流 (${flows.length})`, children: flowListTab },
        {
          key: "runs",
          label: React.createElement(
            "span",
            null,
            "运行中心 (",
            runs.length,
            hasActiveRuns
              ? React.createElement(
                  "span",
                  { style: { color: "#1677ff", marginLeft: 2 } },
                  `·${runs.filter((r) => ACTIVE_RUN_STATUSES.has(r.status)).length} 活跃`,
                )
              : null,
            ")",
          ),
          children: runCenterTab,
        },
      ],
      activeKey: activeTab,
      onChange: (key: string) => setActiveTab(key),
      tabBarExtraContent,
    }),
  );
}
