import {
  createAdaptiveLayout,
  type AdaptivePanel,
  type PresentationPlan,
  type TaskType,
} from "./adaptiveLayout";
import { loadSimulationCharts } from "./chartLoader";

const object = (value: any): value is Record<string, any> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const array = (value: any): any[] => (Array.isArray(value) ? value : []);
const printable = (value: any, limit = 1600): string => {
  if (value == null) return "—";
  let budget = 180;
  const seen = new WeakSet();
  const bound = (item: any, depth = 0): any => {
    if (--budget < 0 || depth > 5) return "[已截断]";
    if (typeof item === "string")
      return item.length > 600 ? `${item.slice(0, 600)}…[已截断]` : item;
    if (!item || typeof item !== "object") return item;
    if (seen.has(item)) return "[重复引用]";
    seen.add(item);
    if (Array.isArray(item))
      return [
        ...item.slice(0, 30).map((child) => bound(child, depth + 1)),
        ...(item.length > 30 ? ["[已截断]"] : []),
      ];
    const keys = Object.keys(item);
    return Object.fromEntries([
      ...keys.slice(0, 25).map((key) => [key, bound(item[key], depth + 1)]),
      ...(keys.length > 25 ? [["…", "[已截断]"]] : []),
    ]);
  };
  const text =
    typeof value === "object" ? JSON.stringify(bound(value)) : String(value);
  return text.length > limit ? `${text.slice(0, limit)}…[已截断]` : text;
};
const scalar = (value: any) =>
  ["number", "string", "boolean"].includes(typeof value) || value === null;
const statusLabels: Record<string, string> = {
  draft: "草稿",
  queued: "排队中",
  preparing: "准备中",
  running: "运行中",
  finalizing: "整理结果",
  succeeded: "已完成",
  completed: "已完成",
  failed: "失败",
  blocked: "受阻",
  cancelled: "已取消",
  paused: "已暂停",
};

export function inferTaskType(operation: string, run: any): TaskType {
  if (operation === "simulation.run") return "simulation";
  if (/import|\.read$/.test(operation)) return "data_import";
  if (/study\.|compar|scenario|multi_objective/.test(operation))
    return "comparison";
  if (/report|export/.test(operation)) return "report";
  if (
    /workflow|pipeline\.execute/.test(operation) ||
    (!operation && array(run.stages).length)
  )
    return "workflow";
  return "analysis";
}

/** Result data stays data. Only known envelope fields are projected; strings
 * are never parsed as UI plans, prompts, expressions, or executable markup. */
export function projectRun(run: any, events: any[]) {
  const sorted = [...events].sort(
    (left, right) =>
      Number(left.sequence ?? left.seq ?? 0) -
      Number(right.sequence ?? right.seq ?? 0),
  );
  let envelope: any = run.payload?.result ?? run.result ?? null;
  let resultEvent: any = null;
  for (const event of sorted) {
    const type = event.type || event.event_type;
    if (type === "result.ready" && object(event.data)) {
      envelope = event.data;
      resultEvent = event;
    }
    if (type === "run.status_changed" && event.data?.result != null) {
      envelope = event.data.result;
      resultEvent = event;
    }
  }
  const outer = object(envelope) ? envelope : {};
  const result = outer.result !== undefined ? outer.result : envelope;
  const body = object(result) ? result : {};
  const units = object(outer.units)
    ? outer.units
    : object(body.units)
    ? body.units
    : {};
  const rawMetrics = outer.metrics ?? body.metrics ?? {};
  const entries = (value: any): any[][] =>
    Array.isArray(value)
      ? value
          .filter(object)
          .slice(0, 100)
          .map((item) => [item.id || item.label, item])
      : object(value)
      ? Object.entries(value).slice(0, 100)
      : [];
  const metricEntries = entries(rawMetrics);
  const metrics = metricEntries
    .filter(
      ([id, value]) =>
        typeof id === "string" &&
        (scalar(value) || (object(value) && scalar(value.value))),
    )
    .map(([id, value]) => ({
      id,
      label:
        object(value) && typeof value.label === "string" ? value.label : id,
      value: object(value) ? value.value : value,
      unit: object(value) ? value.unit || units[id] : units[id],
    }))
    .filter((metric) => metric.value !== null);
  const stages = array(run.stages).filter(object);
  for (const stage of stages)
    for (const [id, value] of entries(stage.metrics)) {
      const metricValue = object(value) ? value.value : value;
      if (
        typeof id !== "string" ||
        !scalar(metricValue) ||
        metricValue === null
      )
        continue;
      const stageId = String(
        stage.stage_id || stage.name || stage.operation || "stage",
      );
      metrics.push({
        id: `stage:${stageId}:${id}`,
        label: `${stageId} · ${
          object(value) && typeof value.label === "string" ? value.label : id
        }`,
        value: metricValue,
        unit: object(value) ? value.unit : undefined,
      });
    }
  const tables: { id: string; rows: Record<string, any>[]; total: number }[] =
    [];
  const addTable = (id: string, rows: any) => {
    if (
      !Array.isArray(rows) ||
      !rows.length ||
      !rows.slice(0, 200).every(object) ||
      tables.some((table) => table.id === id)
    )
      return;
    tables.push({ id, rows: rows.slice(0, 200), total: rows.length });
  };
  addTable("结果", result);
  for (const [key, value] of Object.entries(body)) {
    if (["series", "metrics", "artifacts", "warnings"].includes(key)) continue;
    addTable(key, value);
    if (object(value) && ["table", "comparison", "results"].includes(key))
      addTable(key, value.rows);
  }
  if (Array.isArray(outer.rows)) addTable("结果", outer.rows);
  const facts = object(result)
    ? Object.entries(result)
        .filter(
          ([key, value]) =>
            scalar(value) && !["units", "warnings"].includes(key),
        )
        .slice(0, 50)
    : result != null && !Array.isArray(result)
    ? [["结果", result]]
    : [];
  const series = array(outer.series || body.series)
    .filter(
      (item) =>
        item && typeof item.id === "string" && Array.isArray(item.points),
    )
    .map((item) => ({
      ...item,
      label: item.label || item.id,
      points: item.points
        .filter(
          (point: any) =>
            object(point) && Number.isFinite(point.time ?? point.x),
        )
        .slice(0, 2000)
        .map((point: any) => {
          const value = Object.hasOwnProperty.call(point, "value")
            ? point.value
            : point.y;
          return {
            time: point.time ?? point.x,
            value:
              typeof value === "number" && Number.isFinite(value)
                ? value
                : null,
          };
        }),
    }))
    .filter((item) => item.points.length);
  const artifacts = [
    ...array(run.artifacts),
    ...array(outer.artifacts),
    ...array(body.artifacts),
  ];
  const artifactMap = new Map<string, any>();
  artifacts
    .filter(object)
    .slice(0, 200)
    .forEach((item) =>
      artifactMap.set(String(item.ref_id || item.uri || printable(item)), item),
    );
  const warnings = [
    ...array(outer.warnings),
    ...array(body.warnings),
    ...array(run.warnings),
    ...stages.flatMap((stage) => array(stage.warnings)),
  ].map((warning) => printable(warning));
  const provenance =
    outer.provenance ||
    run.provenance ||
    (array(run.provenance_records).length ? run.provenance_records : null);
  let datasetId =
    typeof body.dataset_id === "string"
      ? body.dataset_id
      : typeof outer.dataset_id === "string"
      ? outer.dataset_id
      : "";
  for (const event of sorted)
    if (
      ["completed", "result.ready"].includes(event.type || event.event_type) &&
      typeof event.data?.dataset_id === "string"
    )
      datasetId = event.data.dataset_id;
  return {
    result,
    metrics,
    tables,
    facts,
    series,
    artifacts: [...artifactMap.values()],
    warnings: [...new Set(warnings)],
    provenance,
    datasetId,
    stages,
    resultEvent,
  };
}

export function createAdaptiveRunView(
  React: any,
  host: any,
  SimulationMonitor: any,
) {
  const h = React.createElement;
  const AdaptiveLayout = createAdaptiveLayout(React, host);
  function Table({ rows, label }: any) {
    const columns = [
      ...new Set(
        rows.slice(0, 40).flatMap((row: any) => Object.keys(row).slice(0, 20)),
      ),
    ].slice(0, 20) as string[];
    return h(
      "div",
      { style: { overflow: "auto", maxHeight: 420 } },
      h(
        "table",
        {
          "aria-label": label,
          style: { borderCollapse: "collapse", width: "100%", fontSize: 12 },
        },
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            columns.map((key) =>
              h(
                "th",
                {
                  key,
                  style: {
                    textAlign: "left",
                    padding: 7,
                    borderBottom: "1px solid #d9d9d9",
                  },
                },
                key,
              ),
            ),
          ),
        ),
        h(
          "tbody",
          null,
          rows.map((row: any, index: number) =>
            h(
              "tr",
              { key: String(row.id ?? row.ref_id ?? index) },
              columns.map((key) =>
                h(
                  "td",
                  {
                    key,
                    style: {
                      padding: 7,
                      borderBottom:
                        "1px solid var(--ant-color-border-secondary, #eee)",
                      overflowWrap: "anywhere",
                    },
                  },
                  printable(row[key]),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
  function Curve({ series }: any) {
    const ref = React.useRef(null as HTMLElement | null);
    const chart = React.useRef(null as any);
    const latest = React.useRef(series);
    latest.current = series;
    const [error, setError] = React.useState("");
    React.useEffect(() => {
      let active = true;
      let observer: ResizeObserver | undefined;
      void loadSimulationCharts(host)
        .then((runtime) => {
          if (!active || !ref.current) return;
          chart.current = runtime.mountChart(ref.current);
          chart.current.update(latest.current, false);
          if (typeof ResizeObserver !== "undefined") {
            observer = new ResizeObserver(() => chart.current?.resize());
            observer.observe(ref.current);
          }
        })
        .catch((error) => {
          if (active) setError(String(error));
        });
      return () => {
        active = false;
        observer?.disconnect();
        chart.current?.dispose();
        chart.current = null;
      };
    }, []);
    React.useEffect(() => {
      chart.current?.update(series, false);
    }, [series]);
    return h(
      "div",
      null,
      h("div", {
        ref,
        role: "img",
        "aria-label": "任务结果曲线",
        style: { height: 280, width: "100%", minWidth: 0 },
      }),
      error && h("p", { role: "alert" }, "曲线显示失败：", error),
    );
  }
  function DatasetPreview({ datasetId, scope }: any) {
    const ref = React.useRef(null);
    const [error, setError] = React.useState("");
    React.useEffect(() => {
      const controller = new AbortController();
      let handle: any;
      const mount = (window as any).QwenPaw?.ugsci?.visualization?.mount;
      if (!mount) {
        setError("UGSci 场图查看器尚未加载，可在插件加载后重新打开此任务。");
        return;
      }
      void Promise.resolve(
        mount(ref.current, {
          scope,
          initialDatasetId: datasetId,
          autoLoad: true,
          compact: true,
          enableCommands: false,
          signal: controller.signal,
        }),
      )
        .then((result) => {
          handle = result;
          if (controller.signal.aborted) handle.dispose();
          return handle.ready;
        })
        .catch((error) => {
          if (!controller.signal.aborted) setError(String(error));
        });
      return () => {
        controller.abort();
        handle?.dispose();
      };
    }, [datasetId, scope.agentId, scope.chatId]);
    return h(
      "div",
      null,
      h("div", {
        ref,
        "aria-label": "导入数据场图",
        style: {
          height: 390,
          minWidth: 0,
          position: "relative",
          contain: "layout paint style",
          overflow: "hidden",
        },
      }),
      error && h("p", { role: "alert" }, error),
    );
  }
  function GenericRunView({ run, events, scope, compact }: any) {
    const scopeKey = JSON.stringify([run.run_id, scope.agentId, scope.chatId]);
    const data = projectRun(run, events || []);
    const [selection, setSelection] = React.useState("all");
    const [presentation, setPresentation] = React.useState(
      null as PresentationPlan | null,
    );
    React.useEffect(() => {
      setSelection("all");
      setPresentation(null);
    }, [scopeKey]);
    const selectedIds = presentation?.panels.find(
      (panel) => panel.kind === "metrics",
    )?.options?.metric_ids;
    const metrics = data.metrics.filter(
      (metric) => !selectedIds?.length || selectedIds.includes(metric.id),
    );
    const grouped = new Map<string, any[]>();
    const defaultIds = presentation?.panels.find(
      (panel) => panel.kind === "curves",
    )?.options?.series_ids;
    data.series
      .filter((series) =>
        selection !== "all"
          ? selection === series.id
          : !defaultIds?.length || defaultIds.includes(series.id),
      )
      .forEach((series) => {
        const key = `${series.unit || `unknown:${series.id}`}|${
          series.time_unit || "unknown"
        }`;
        grouped.set(key, [...(grouped.get(key) || []), series]);
      });
    const empty = h(
      "p",
      { style: { fontSize: 12, opacity: 0.7 } },
      "该任务尚无此类数据。",
    );
    const facts = data.facts.length
      ? h(Table, {
          rows: data.facts.map(([key, value]) => ({ 名称: key, 结果: value })),
          label: "结果明细",
        })
      : null;
    const params =
      run.payload?.input_snapshot?.parameters || run.payload?.input_snapshot;
    const overview = h(
      "div",
      null,
      h(
        "p",
        null,
        statusLabels[run.status] || run.status,
        run.phase ? ` · ${run.phase}` : "",
      ),
      Number.isFinite(run.progress) &&
        h("progress", {
          "aria-label": "任务进度",
          value: run.progress,
          max: 1,
        }),
      data.result == null &&
        !data.metrics.length &&
        h("p", null, "尚无计算结果，阶段和日志将继续反映任务状态。"),
      facts,
      object(params) &&
        Object.keys(params).length > 0 &&
        h(
          "details",
          null,
          h("summary", null, "输入参数"),
          h(Table, {
            rows: Object.entries(params).map(([key, value]) => ({
              参数: key,
              值: value,
            })),
            label: "任务输入参数",
          }),
        ),
    );
    const panels: AdaptivePanel[] = [
      { kind: "overview", title: "任务概览", node: overview },
      {
        kind: "metrics",
        title: "结果指标",
        available: data.metrics.length > 0,
        node: metrics.length
          ? h(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))",
                  gap: 8,
                },
              },
              metrics.map((item) =>
                h(
                  "div",
                  {
                    key: item.id,
                    style: {
                      padding: 10,
                      background: "var(--ant-color-fill-tertiary,#f5f7fb)",
                      borderRadius: 6,
                    },
                  },
                  h("div", { style: { fontSize: 12 } }, item.label),
                  h(
                    "strong",
                    null,
                    printable(item.value),
                    item.unit ? ` ${printable(item.unit)}` : "",
                  ),
                ),
              ),
            )
          : empty,
      },
      {
        kind: "curves",
        title: "结果曲线",
        available: data.series.length > 0,
        node: data.series.length
          ? h(
              "div",
              null,
              h(
                "label",
                null,
                "结果序列 ",
                h(
                  "select",
                  {
                    "aria-label": "结果序列",
                    value: selection,
                    onChange: (event: any) => setSelection(event.target.value),
                  },
                  h("option", { value: "all" }, "计划默认"),
                  ...data.series.map((series) =>
                    h(
                      "option",
                      { key: series.id, value: series.id },
                      series.label,
                    ),
                  ),
                ),
              ),
              ...[...grouped.entries()].map(([key, series]) =>
                h(Curve, { key, series }),
              ),
            )
          : empty,
      },
      {
        kind: "fields",
        title: "数据场图",
        available: Boolean(data.datasetId),
        node: data.datasetId
          ? h(DatasetPreview, {
              key: `${scopeKey}:${data.datasetId}`,
              datasetId: data.datasetId,
              scope,
            })
          : empty,
      },
      {
        kind: "stages",
        title: "执行阶段",
        available: data.stages.length > 0,
        node: data.stages.length
          ? h(
              "ol",
              null,
              data.stages.map((stage, index) =>
                h(
                  "li",
                  {
                    key: stage.stage_id || stage.name || index,
                    style: { margin: "8px 0" },
                  },
                  stage.stage_id || stage.name || stage.operation,
                  " · ",
                  statusLabels[stage.status] || stage.status,
                  Number.isFinite(stage.progress)
                    ? ` · ${Math.round(stage.progress * 100)}%`
                    : "",
                ),
              ),
            )
          : empty,
      },
      {
        kind: "table",
        title: "数据对照",
        available: data.tables.length > 0,
        node: data.tables.length
          ? h(
              "div",
              null,
              ...data.tables.map((table) =>
                h(
                  "section",
                  { key: table.id },
                  h("strong", null, table.id),
                  h(Table, { rows: table.rows, label: `${table.id}数据表` }),
                  table.total > table.rows.length &&
                    h(
                      "p",
                      null,
                      `显示前 ${table.rows.length} / ${table.total} 行`,
                    ),
                ),
              ),
            )
          : empty,
      },
      {
        kind: "artifacts",
        title: "成果文件",
        available: data.artifacts.length > 0,
        node: data.artifacts.length
          ? h(Table, {
              label: "任务成果",
              rows: data.artifacts.map((item) => ({
                名称: item.name || item.ref_id || item.uri,
                类型: item.media_type || item.kind,
                位置: item.uri || "—",
                字节数: item.size_bytes ?? "—",
              })),
            })
          : empty,
      },
      {
        kind: "provenance",
        title: "结果来源",
        available: Boolean(data.provenance),
        node: data.provenance
          ? h(
              "pre",
              {
                style: {
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  fontSize: 12,
                },
              },
              printable(data.provenance, 8000),
            )
          : empty,
      },
    ];
    return h(
      "section",
      { "aria-label": "任务结果展示", style: { marginTop: 16, minWidth: 0 } },
      // Failures and data warnings are never hidden by an AI/user plan.
      run.error &&
        h("div", { role: "alert" }, "任务错误：", printable(run.error)),
      data.warnings.length > 0 &&
        h(
          "ul",
          { "aria-label": "任务结果警告", style: { color: "#b45309" } },
          data.warnings.map((warning) => h("li", { key: warning }, warning)),
        ),
      h(AdaptiveLayout, {
        runId: run.run_id,
        scope,
        compact,
        taskType: inferTaskType(run.operation || "", run),
        panels,
        onPlanChange: setPresentation,
      }),
      data.result != null &&
        h(
          "details",
          { style: { marginTop: 12, fontSize: 12 } },
          h("summary", null, "原始结果"),
          h(
            "pre",
            {
              style: {
                maxHeight: 350,
                overflow: "auto",
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              },
            },
            printable(data.result, 12000),
          ),
        ),
    );
  }
  return function AdaptiveRunView(props: any) {
    const captured = React.useMemo(
      () =>
        props.scope || {
          agentId: props.agentId || host.getSelectedAgentId?.() || "",
        },
      [
        props.run.run_id,
        props.scope?.agentId,
        props.scope?.chatId,
        props.agentId,
      ],
    );
    return props.run.operation === "simulation.run"
      ? h(SimulationMonitor, {
          runId: props.run.run_id,
          status: props.run.status,
          startedAt: props.run.started_at,
          finishedAt: props.run.finished_at,
          scope: captured,
          compact: props.compact,
          subscribe: false,
          refreshKey: props.refreshKey,
          onCapabilities: props.onCapabilities,
        })
      : h(GenericRunView, {
          key: JSON.stringify([
            props.run.run_id,
            captured.agentId,
            captured.chatId,
          ]),
          run: props.run,
          events: props.events,
          scope: captured,
          compact: props.compact,
        });
  };
}
