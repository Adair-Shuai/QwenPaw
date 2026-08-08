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
              { key: run.run_id, size: "small" },
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
                    { size: "small", type: "link", onClick: () => openFlowForge(undefined, run.run_id) },
                    "查看详情",
                  ),
                ),
              ),
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
                  { style: { color: "var(--ant-color-primary, #1677ff)", marginLeft: 2 } },
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
