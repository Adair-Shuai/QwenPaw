export type PanelKind =
  | "overview"
  | "metrics"
  | "curves"
  | "fields"
  | "stages"
  | "table"
  | "artifacts"
  | "provenance";
export type TaskType =
  | "auto"
  | "simulation"
  | "comparison"
  | "analysis"
  | "workflow"
  | "report"
  | "data_import";
export interface PresentationPlan {
  version: 1;
  task_type: TaskType;
  title?: string;
  objective?: string;
  layout: "stack" | "tabs" | "dashboard";
  panels: {
    id: string;
    kind: PanelKind;
    title?: string;
    description?: string;
    options?: {
      series_ids?: string[];
      metric_ids?: string[];
      property?: string;
    };
  }[];
}
export interface AdaptivePanel {
  kind: PanelKind;
  title: string;
  node: any;
  available?: boolean;
}
export interface AdaptiveLayoutProps {
  runId: string;
  scope: { agentId?: string; chatId?: string };
  taskType: TaskType;
  panels: AdaptivePanel[];
  compact?: boolean;
  refreshKey?: string | number;
  onPlanChange?: (plan: PresentationPlan) => void;
}
export const taskLabels: Record<TaskType, string> = {
  auto: "自动识别",
  simulation: "数值模拟",
  comparison: "方案比较",
  analysis: "结果分析",
  workflow: "执行流程",
  report: "报告成果",
  data_import: "数据导入",
};
const kinds: PanelKind[] = [
  "overview",
  "metrics",
  "curves",
  "fields",
  "stages",
  "table",
  "artifacts",
  "provenance",
];
const order: Record<string, PanelKind[]> = {
  simulation: [
    "overview",
    "curves",
    "fields",
    "metrics",
    "stages",
    "table",
    "artifacts",
    "provenance",
  ],
  comparison: [
    "overview",
    "table",
    "metrics",
    "curves",
    "stages",
    "artifacts",
    "fields",
    "provenance",
  ],
  analysis: [
    "overview",
    "metrics",
    "curves",
    "table",
    "fields",
    "stages",
    "artifacts",
    "provenance",
  ],
  workflow: [
    "overview",
    "stages",
    "metrics",
    "artifacts",
    "table",
    "curves",
    "fields",
    "provenance",
  ],
  report: [
    "overview",
    "artifacts",
    "table",
    "metrics",
    "provenance",
    "curves",
    "fields",
    "stages",
  ],
  data_import: [
    "overview",
    "stages",
    "fields",
    "table",
    "artifacts",
    "metrics",
    "curves",
    "provenance",
  ],
};
const control = {
  padding: "5px 8px",
  border: "1px solid var(--ant-color-border, #d9d9d9)",
  borderRadius: 5,
  background: "var(--ant-color-bg-container, white)",
  color: "inherit",
  maxWidth: "100%",
};
export function automaticPlan(
  type: TaskType,
  panels: AdaptivePanel[],
): PresentationPlan {
  const sequence = order[type] || order.analysis;
  return {
    version: 1,
    task_type: "auto",
    layout: type === "comparison" ? "dashboard" : "stack",
    panels: sequence
      .filter((kind) =>
        panels.some(
          (panel) => panel.kind === kind && panel.available !== false,
        ),
      )
      .map((kind) => ({ id: kind, kind })),
  };
}
export function validPlan(value: any): value is PresentationPlan {
  const text = (input: any, max: number) =>
    input === undefined ||
    (typeof input === "string" &&
      input.trim().length > 0 &&
      input.length <= max);
  const fields = (input: any, keys: string[]) =>
    input &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    Object.keys(input).every((key) => keys.includes(key));
  const ids = new Set();
  const usedKinds = new Set();
  const list = (input: any) =>
    input === undefined ||
    (Array.isArray(input) &&
      input.length >= 1 &&
      input.length <= 32 &&
      new Set(input).size === input.length &&
      input.every(
        (id) =>
          typeof id === "string" && id.trim().length > 0 && id.length <= 160,
      ));
  return Boolean(
    fields(value, [
      "version",
      "task_type",
      "title",
      "objective",
      "layout",
      "panels",
    ]) &&
      value.version === 1 &&
      Object.hasOwnProperty.call(taskLabels, value.task_type) &&
      ["stack", "tabs", "dashboard"].includes(value.layout) &&
      text(value.title, 160) &&
      text(value.objective, 1000) &&
      Array.isArray(value.panels) &&
      value.panels.length > 0 &&
      value.panels.length <= 8 &&
      value.panels.every((panel: any) => {
        if (
          !fields(panel, ["id", "kind", "title", "description", "options"]) ||
          typeof panel.id !== "string" ||
          !panel.id.trim().length ||
          panel.id.length > 80 ||
          ids.has(panel.id) ||
          usedKinds.has(panel.kind) ||
          !kinds.includes(panel.kind) ||
          !text(panel.title, 160) ||
          !text(panel.description, 600)
        )
          return false;
        ids.add(panel.id);
        usedKinds.add(panel.kind);
        const options = panel.options;
        const allowed =
          panel.kind === "curves"
            ? ["series_ids"]
            : panel.kind === "metrics"
            ? ["metric_ids"]
            : panel.kind === "fields"
            ? ["property"]
            : [];
        return (
          options === undefined ||
          (fields(options, allowed) &&
            list(options.series_ids) &&
            list(options.metric_ids) &&
            text(options.property, 160))
        );
      }),
  );
}

/** A layout fallback with stable panel identities, including inactive tabs. */
function createNativeTaskLayout(React: any) {
  const h = React.createElement;
  return function NativeTaskLayout({ plan, panels }: any) {
    const [active, setActive] = React.useState("");
    const shown = plan.panels.map((panel: any) => panel.id);
    const current = shown.includes(active) ? active : shown[0];
    const ids = [
      ...shown,
      ...Object.keys(panels).filter((id) => !shown.includes(id)),
    ];
    return h(
      "div",
      { "data-task-layout": plan.layout },
      plan.title && h("h4", { style: { margin: "8px 0" } }, plan.title),
      plan.objective &&
        h(
          "p",
          { style: { fontSize: 12, opacity: 0.75, overflowWrap: "anywhere" } },
          plan.objective,
        ),
      plan.layout === "tabs" &&
        h(
          "div",
          {
            role: "tablist",
            "aria-label": "任务展示面板",
            style: {
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 8,
            },
          },
          plan.panels.map((panel: any) =>
            h(
              "button",
              {
                key: panel.id,
                type: "button",
                role: "tab",
                "aria-selected": current === panel.id,
                style: control,
                onClick: () => setActive(panel.id),
              },
              panel.title,
            ),
          ),
        ),
      h(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns:
              plan.layout === "dashboard"
                ? "repeat(auto-fit, minmax(min(100%, 300px), 1fr))"
                : "minmax(0, 1fr)",
            gap: 12,
          },
        },
        ids.map((id) => {
          const item = plan.panels.find((panel: any) => panel.id === id);
          return h(
            "section",
            {
              key: id,
              hidden: !item || (plan.layout === "tabs" && current !== id),
              "data-run-panel": id,
              style: {
                minWidth: 0,
                gridColumn:
                  id === "fields" || id === "curves" ? "1 / -1" : undefined,
              },
            },
            item &&
              h("h4", { style: { margin: "8px 0", fontSize: 13 } }, item.title),
            item?.description &&
              h(
                "p",
                { style: { fontSize: 12, opacity: 0.7 } },
                item.description,
              ),
            panels[id],
          );
        }),
      ),
    );
  };
}

export function createAdaptiveLayout(React: any, host: any) {
  const h = React.createElement;
  const NativeTaskLayout = createNativeTaskLayout(React);
  async function request(
    runId: string,
    scope: AdaptiveLayoutProps["scope"],
    init: RequestInit,
  ) {
    const id = runId.startsWith("sim_") ? `ugsci:${runId}` : runId;
    const path = `/run-center/runs/${encodeURIComponent(id)}/presentation`;
    const headers = new Headers(init.headers);
    const token = host.getApiToken?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (scope.agentId) headers.set("X-Agent-Id", scope.agentId);
    if (scope.chatId) headers.set("X-Chat-Id", scope.chatId);
    return host.fetch
      ? host.fetch(path, { ...init, headers })
      : fetch(host.getApiUrl(path), { ...init, headers });
  }
  return function AdaptiveLayout(props: AdaptiveLayoutProps) {
    const scopeKey = JSON.stringify([
      props.scope.agentId,
      props.scope.chatId,
      props.runId,
    ]);
    const [stored, setStored] = React.useState(
      null as null | {
        key: string;
        revision: number;
        plan: PresentationPlan | null;
      },
    );
    const [draft, setDraft] = React.useState(
      null as null | {
        key: string;
        plan: PresentationPlan;
        baseRevision: number;
      },
    );
    const [message, setMessage] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const [ready, setReady] = React.useState(false);
    const [retry, setRetry] = React.useState(0);
    const [runtimeVersion, setRuntimeVersion] = React.useState(0);
    const generation = React.useRef(0);
    const requestNumber = React.useRef(0);
    const savingRef = React.useRef(false);
    const callback = React.useRef(props.onPlanChange);
    callback.current = props.onPlanChange;
    // Data/plan changes keep the renderer stable. Explicit plugin lifecycle
    // changes may replace it so disabling OpenUI releases its runtime.
    const Renderer = React.useMemo(
      () => (window as any).QwenPaw?.openui?.TaskLayout || NativeTaskLayout,
      [scopeKey, runtimeVersion],
    );
    React.useEffect(() => {
      const changed = () => setRuntimeVersion((value: number) => value + 1);
      window.addEventListener("qwenpaw:openui-task-layout-ready", changed);
      return () =>
        window.removeEventListener("qwenpaw:openui-task-layout-ready", changed);
    }, []);
    const auto = automaticPlan(props.taskType, props.panels);
    const plan =
      draft?.key === scopeKey
        ? draft.plan
        : stored?.key === scopeKey && stored.plan
        ? stored.plan
        : auto;
    const planKey = JSON.stringify(plan);
    React.useEffect(() => {
      callback.current?.(plan);
    }, [scopeKey, planKey]);
    React.useEffect(() => {
      const controller = new AbortController();
      const epoch = ++generation.current;
      let busy = false;
      setStored(null);
      setDraft(null);
      setMessage("");
      setSaving(false);
      savingRef.current = false;
      setReady(false);
      const load = async () => {
        if (busy || savingRef.current) return;
        busy = true;
        const serial = ++requestNumber.current;
        try {
          const response = await request(props.runId, props.scope, {
            signal: controller.signal,
          });
          if (!response.ok)
            throw new Error(
              response.status === 404
                ? "当前任务没有可保存的展示计划，已使用自动展示。"
                : `展示计划读取失败（${response.status}）`,
            );
          const data = await response.json();
          if (epoch !== generation.current || serial !== requestNumber.current)
            return;
          if (
            !Number.isInteger(data.revision) ||
            data.revision < 0 ||
            (data.plan !== null && !validPlan(data.plan))
          )
            throw new Error("展示计划格式不兼容，已保留当前展示。");
          setStored({
            key: scopeKey,
            revision: data.revision,
            plan: data.plan,
          });
          setReady(true);
        } catch (error) {
          if (
            !controller.signal.aborted &&
            epoch === generation.current &&
            serial === requestNumber.current
          )
            setMessage(error instanceof Error ? error.message : String(error));
        } finally {
          busy = false;
        }
      };
      void load();
      // Plans can be updated by the agent even after computation has ended.
      const timer = window.setInterval(() => {
        if (document.visibilityState !== "hidden") void load();
      }, 5000);
      window.addEventListener("focus", load);
      return () => {
        ++generation.current;
        controller.abort();
        window.clearInterval(timer);
        window.removeEventListener("focus", load);
      };
    }, [scopeKey, retry]);
    const change = (next: PresentationPlan) => {
      setDraft({
        key: scopeKey,
        plan: next,
        baseRevision:
          draft?.key === scopeKey
            ? draft.baseRevision
            : stored?.key === scopeKey
            ? stored.revision
            : 0,
      });
      setMessage("展示已调整，保存后其他入口将使用此计划。");
    };
    const save = async () => {
      if (!ready || saving) return;
      const epoch = generation.current;
      const currentPlan = plan;
      ++requestNumber.current;
      setSaving(true);
      savingRef.current = true;
      try {
        const response = await request(props.runId, props.scope, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: currentPlan,
            expected_revision:
              draft?.key === scopeKey
                ? draft.baseRevision
                : stored?.key === scopeKey
                ? stored.revision
                : 0,
          }),
        });
        const data = await response.json();
        if (epoch !== generation.current) return;
        if (!response.ok)
          throw new Error(
            response.status === 409
              ? "计划已由其他入口更新，请刷新计划后重试。"
              : data.detail || `保存失败（${response.status}）`,
          );
        if (
          !validPlan(data.plan) ||
          !Number.isInteger(data.revision) ||
          data.revision < 0
        )
          throw new Error("服务端未返回有效展示计划。");
        setStored({ key: scopeKey, revision: data.revision, plan: data.plan });
        setDraft(null);
        setMessage("展示计划已保存");
      } catch (error) {
        if (epoch === generation.current)
          setMessage(error instanceof Error ? error.message : String(error));
      } finally {
        if (epoch === generation.current) {
          ++requestNumber.current;
          setSaving(false);
          savingRef.current = false;
        }
      }
    };
    // One stable native instance per panel kind, regardless of plan IDs or
    // order. Plans select presentation, never create extra result subscribers.
    const seen = new Set<string>();
    const unsupported = props.compact
      ? plan.panels.filter(
          (panel) => !props.panels.some((item) => item.kind === panel.kind),
        )
      : [];
    const supported = props.compact
      ? plan.panels.filter((panel) =>
          props.panels.some((item) => item.kind === panel.kind),
        )
      : plan.panels;
    const visiblePlan = {
      ...plan,
      panels: supported.length ? supported : auto.panels,
    };
    const layoutPanels = visiblePlan.panels
      .filter((panel) => !seen.has(panel.kind) && Boolean(seen.add(panel.kind)))
      .map((panel) => ({
        id: panel.kind,
        title:
          panel.title ||
          props.panels.find((item) => item.kind === panel.kind)?.title ||
          panel.kind,
        description: panel.description,
      }));
    const panels: Record<string, any> = {};
    props.panels.forEach((panel) => {
      panels[panel.kind] = panel.node;
    });
    layoutPanels.forEach((panel) => {
      if (!Object.hasOwnProperty.call(panels, panel.id))
        panels[panel.id] = h(
          "p",
          { style: { fontSize: 12, opacity: 0.7 } },
          "该任务尚无此类数据。",
        );
    });
    return h(
      "div",
      { "aria-label": "自适应任务展示", style: { minWidth: 0 } },
      !props.compact &&
        h(
          "div",
          {
            style: {
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              margin: "12px 0",
              fontSize: 12,
            },
          },
          h(
            "label",
            null,
            "展示重点 ",
            h(
              "select",
              {
                "aria-label": "展示重点",
                value: plan.task_type,
                disabled: saving,
                style: control,
                onChange: (event: any) => {
                  const type = event.target.value as TaskType;
                  change({
                    ...automaticPlan(
                      type === "auto" ? props.taskType : type,
                      props.panels,
                    ),
                    task_type: type,
                    title: plan.title,
                    objective: plan.objective,
                    layout: plan.layout,
                  });
                },
              },
              Object.entries(taskLabels).map(([id, label]) =>
                h("option", { key: id, value: id }, label),
              ),
            ),
          ),
          h("span", null, `已识别：${taskLabels[props.taskType]}`),
          h(
            "label",
            null,
            "布局 ",
            h(
              "select",
              {
                "aria-label": "任务布局",
                style: control,
                disabled: saving,
                value: plan.layout,
                onChange: (event: any) =>
                  change({ ...plan, layout: event.target.value }),
              },
              [
                ["stack", "纵向"],
                ["tabs", "分页"],
                ["dashboard", "仪表板"],
              ].map(([value, title]) =>
                h("option", { key: value, value }, title),
              ),
            ),
          ),
          h(
            "button",
            {
              type: "button",
              style: control,
              disabled: !ready || saving,
              onClick: () => {
                void save();
              },
            },
            saving ? "正在保存…" : "保存展示",
          ),
          h(
            "button",
            {
              type: "button",
              style: control,
              disabled: saving,
              onClick: () => setRetry((value: number) => value + 1),
            },
            "刷新计划",
          ),
        ),
      !props.compact &&
        message &&
        h(
          "p",
          { "aria-live": "polite", style: { fontSize: 12, margin: "4px 0" } },
          message,
        ),
      h(Renderer, {
        key: scopeKey,
        scopeKey,
        compact: props.compact,
        plan: {
          title: plan.title,
          objective: plan.objective,
          layout: props.compact ? "stack" : plan.layout,
          panels: layoutPanels,
        },
        panels,
      }),
      unsupported.length > 0 &&
        h(
          "p",
          { style: { fontSize: 11, opacity: 0.7 } },
          "此计划还有 ",
          unsupported
            .map(
              (panel) =>
                panel.title ||
                (
                  {
                    fields: "场图",
                    stages: "阶段",
                    table: "数据对照",
                    artifacts: "成果文件",
                    provenance: "结果来源",
                  } as Record<string, string>
                )[panel.kind] ||
                panel.kind,
            )
            .join("、"),
          "，可在侧栏完整查看。",
        ),
    );
  };
}
