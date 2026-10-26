import { loadSimulationCharts } from "./chartLoader";
import { createAdaptiveLayout, type PresentationPlan } from "./adaptiveLayout";

export interface SimulationMonitorProps {
  runId: string;
  status?: string;
  startedAt?: string;
  finishedAt?: string;
  compact?: boolean;
  refreshKey?: number | string;
  subscribe?: boolean;
  agentId?: string;
  chatId?: string;
  scope?: { agentId?: string; chatId?: string };
  onCapabilities?: (capabilities: Record<string, unknown>) => void;
}

type Point = { time: number; value: number | null };
type Series = { id: string; label: string; unit?: string; time_unit?: string; well?: string | null; points: Point[]; total_points?: number };
type Dataset = { dataset_id: string; label?: string; revision?: number | string; properties: string[]; time_steps: { index?: number; timeStep?: number; step_number?: number; date?: string | null; properties?: string[] }[] };
type Snapshot = {
  schema_version: number; run_id: string; revision: string | number; status: string; job_status?: string;
  simulator?: string; updated_at?: string | number; data_updated_at?: string | number; simulation_time?: any;
  start_ts?: number | null; end_ts?: number | null;
  started_at?: string | null; finished_at?: string | null;
  capabilities?: Record<string, unknown>; metrics: Series[]; series: Series[];
  finalized?: boolean; collection_status?: string; stale?: boolean;
  fields?: { status?: string; datasets?: Dataset[]; warnings?: string[] }; warnings?: string[];
};
const TERMINAL = new Set(["completed", "succeeded", "failed", "cancelled", "canceled", "blocked", "timeout", "error", "interrupted"]);
const LABELS: Record<string, string> = { running: "计算中", queued: "排队中", preparing: "准备中", finalizing: "整理结果", paused: "已暂停", completed: "已完成", succeeded: "已完成", failed: "失败", cancelled: "已取消", cancelling: "取消中", blocked: "受阻", timeout: "已超时", error: "运行错误", interrupted: "已中断" };
const controlStyle = { border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 5, background: "var(--ant-color-bg-container, #fff)", color: "inherit", padding: "6px 9px", maxWidth: "100%" };
const errorText = (error: unknown) => error instanceof Error ? error.message : String(error);
const timestamp = (value: any): number => typeof value === "number" ? (value < 1e12 ? value * 1000 : value) : Date.parse(value || "");
const SERIES_LABELS: Record<string, string> = { FPR: "全场平均压力", WBHP: "井底压力", WOPR: "井产油量", FOPR: "全场产油量", FGPR: "全场产气量", FGIR: "全场注气量", WGPR: "井产气量", WGIR: "井注气量", WWPR: "井产水量", WWIR: "井注水量", WWCT: "井含水率", WGPT: "井累计产气量", FGPT: "全场累计产气量" };
const seriesKey = (series: Series) => series.id.split(":")[0];
const seriesLabel = (series: Series) => SERIES_LABELS[seriesKey(series).toUpperCase()] || series.label || seriesKey(series);
const groupCharts = (series: Series[]): Series[][] => {
  const groups = new Map<string, Series[]>();
  for (const item of series) {
    // Unknown units never imply that unrelated quantities share a dimension.
    const key = `${item.unit || `unknown:${seriesKey(item)}`}|${item.time_unit || "unknown"}`;
    const group = groups.get(key) || [];
    group.push(item); groups.set(key, group);
  }
  return [...groups.values()];
};
const normalizedSeries = (items: any): Series[] => Array.isArray(items) ? items.filter((item) => item && typeof item.id === "string").map((item) => ({ ...item, label: item.label || item.id, points: Array.isArray(item.points) ? item.points.filter((point: any) => Number.isFinite(point.time)).map((point: any) => ({ time: point.time, value: typeof point.value === "number" && Number.isFinite(point.value) ? point.value : null })) : [] })) : [];

/** Shared by the full Run Center, the chat card, and the chat workspace. */
export function createSimulationMonitor(React: any, host: any) {
  const h = React.createElement;
  const AdaptiveLayout = createAdaptiveLayout(React, host);

  async function request(path: string, agentId: string, init: RequestInit = {}, chatId?: string) {
    const headers = new Headers(init.headers);
    const token = host.getApiToken?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (agentId) headers.set("X-Agent-Id", agentId);
    if (chatId) headers.set("X-Chat-Id", chatId);
    const response = host.fetch
      ? await host.fetch(path, { ...init, headers })
      : await fetch(host.getApiUrl(path), { ...init, headers });
    if (!response.ok) {
      const text = await response.text();
      let detail = text;
      try { detail = JSON.parse(text).detail || text; } catch { /* plain HTTP errors */ }
      throw new Error(detail || `HTTP ${response.status}`);
    }
    return response;
  }

  function LiveChart({ series, compact, label }: { series: Series[]; compact?: boolean; label: string }) {
    const element = React.useRef(null as HTMLDivElement | null);
    const handle = React.useRef(null as any);
    const latest = React.useRef(series);
    const [error, setError] = React.useState("");
    const [retry, setRetry] = React.useState(0);
    latest.current = series;
    React.useEffect(() => {
      let active = true;
      let observer: ResizeObserver | undefined;
      let resize: (() => void) | undefined;
      setError("");
      void loadSimulationCharts(host).then((runtime) => {
        if (!active || !element.current) return;
        handle.current = runtime.mountChart(element.current);
        handle.current.update(latest.current, Boolean(compact));
        resize = () => handle.current?.resize();
        if (typeof ResizeObserver !== "undefined") { observer = new ResizeObserver(resize); observer.observe(element.current); }
        else window.addEventListener("resize", resize);
      }).catch((err) => { if (active) setError(`曲线显示暂不可用：${errorText(err)}`); });
      return () => {
        active = false;
        observer?.disconnect();
        if (resize) window.removeEventListener("resize", resize);
        handle.current?.dispose();
        handle.current = null;
      };
    }, [retry, compact]);
    React.useEffect(() => { handle.current?.update(series, Boolean(compact)); }, [series, compact]);
    return h("div", null,
      h("div", { ref: element, role: "img", "aria-label": label, style: { width: "100%", minWidth: 0, height: compact ? 160 : 280 } }),
      error && h("div", { role: "alert", style: { color: "#b45309", fontSize: 12 } }, error, " ", h("button", { type: "button", style: controlStyle, onClick: () => setRetry((value: number) => value + 1) }, "重试图表")),
    );
  }

  function FieldView({ runId, agentId, chatId, datasets, defaultProperty }: { runId: string; agentId: string; chatId?: string; datasets: Dataset[]; defaultProperty?: string }) {
    const [datasetId, setDatasetId] = React.useState("");
    const [property, setProperty] = React.useState("");
    const [timeStep, setTimeStep] = React.useState(0);
    const [followLatest, setFollowLatest] = React.useState(true);
    const [error, setError] = React.useState("");
    const [ready, setReady] = React.useState(false);
    const [retry, setRetry] = React.useState(0);
    const element = React.useRef(null as HTMLDivElement | null);
    const viewer = React.useRef(null as any);
    const queue = React.useRef(Promise.resolve());
    const epoch = React.useRef(0);
    const current = datasets.find((item) => item.dataset_id === datasetId) || datasets[0];
    const id = current?.dataset_id || "";
    const steps = current?.time_steps || [];
    const properties = current?.properties || [];
    const selectedProperty = properties.includes(property) ? property : properties.includes(defaultProperty || "") ? defaultProperty! : properties.includes("pressure") ? "pressure" : properties[0] || "";
    const lastStep = steps.length ? Number(steps[steps.length - 1].timeStep ?? ((steps[steps.length - 1].index ?? steps.length - 1) + 1)) : 0;
    const selectedStep = followLatest ? lastStep : timeStep;

    React.useEffect(() => {
      const controller = new AbortController();
      const generation = ++epoch.current;
      let local: any = null;
      queue.current = Promise.resolve();
      setReady(false);
      setError("");
      const mount = (window as any).QwenPaw?.ugsci?.visualization?.mount;
      if (!id) return;
      if (!mount) { setError("UGSci 场图查看器尚未加载，请启用 UGSci 插件后重试。"); return; }
      void Promise.resolve().then(() => mount(element.current, {
        scope: { agentId, chatId }, initialDatasetId: id, autoLoad: false, compact: true,
        enableCommands: false, persistenceKey: `simulation:${agentId}:${runId}`, signal: controller.signal,
      })).then(async (handle: any) => {
        local = handle;
        if (controller.signal.aborted) { handle.dispose(); return; }
        viewer.current = handle;
        await handle.ready;
        if (!controller.signal.aborted) setReady(true);
      }).catch((err: unknown) => { if (!controller.signal.aborted) setError(errorText(err)); });
      return () => {
        controller.abort();
        if (epoch.current === generation) { ++epoch.current; viewer.current = null; }
        local?.dispose();
      };
    }, [id, runId, agentId, chatId, retry]);

    function enqueue(command: string, args: Record<string, unknown>) {
      const generation = epoch.current;
      const handle = viewer.current;
      if (!handle?.executeCommand) return;
      queue.current = queue.current.catch(() => {}).then(async () => {
        if (generation !== epoch.current) return;
        try { await handle.executeCommand(command, args); if (generation === epoch.current) setError(""); }
        catch (err) { if (generation === epoch.current) setError(errorText(err)); }
      });
    }
    React.useEffect(() => {
      if (ready) enqueue("refresh-dataset", { datasetId: id, followLatest });
    }, [ready, id, current?.revision, followLatest]);
    React.useEffect(() => {
      if (ready && selectedProperty) enqueue("set-property", { property: selectedProperty });
    }, [ready, selectedProperty, id]);
    React.useEffect(() => {
      if (ready) enqueue("set-timestep", { timeStep: selectedStep });
    }, [ready, selectedStep, id]);

    return h("section", { "aria-label": "模拟场图", style: { marginTop: 16 } },
      h("h4", { style: { margin: "0 0 8px" } }, "场图"),
      h("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 } },
        h("select", { "aria-label": "场图数据集", style: controlStyle, value: id, onChange: (event: any) => { setDatasetId(event.target.value); setProperty(""); setTimeStep(0); } }, datasets.map((item) => h("option", { value: item.dataset_id, key: item.dataset_id }, item.label || item.dataset_id))),
        h("select", { "aria-label": "场图变量", style: controlStyle, value: selectedProperty, onChange: (event: any) => setProperty(event.target.value) }, properties.map((name) => h("option", { value: name, key: name }, name))),
        h("select", { "aria-label": "场图时间步", style: controlStyle, value: selectedStep, onChange: (event: any) => { setFollowLatest(false); setTimeStep(Number(event.target.value)); } },
          h("option", { value: 0 }, "初始场"),
          steps.map((step, index) => h("option", { value: step.timeStep ?? ((step.index ?? index) + 1), key: step.step_number ?? index }, step.date ? String(step.date) : `报告步 ${step.step_number ?? index + 1}`))),
        h("label", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 } }, h("input", { type: "checkbox", checked: followLatest, onChange: (event: any) => { if (!event.target.checked) setTimeStep(selectedStep); setFollowLatest(event.target.checked); } }), "跟随最新"),
      ),
      !property && defaultProperty && !properties.includes(defaultProperty) && h("p", { role: "status", style: { fontSize: 12, color: "#b45309" } }, `计划指定的场变量 ${defaultProperty} 尚不可用，当前显示 ${selectedProperty || "暂无可用变量"}。`),
      h("div", { ref: element, "aria-label": "三维模拟结果", style: { position: "relative", isolation: "isolate", contain: "layout paint style", width: "100%", height: 390, minWidth: 0, overflow: "hidden", borderRadius: 6, background: "#17202d" } }),
      !ready && !error && h("p", null, "正在加载场图…"),
      error && h("div", { role: "alert", style: { marginTop: 8, color: "#b45309" } }, error, " ", h("button", { type: "button", style: controlStyle, onClick: () => setRetry((value: number) => value + 1) }, "重试场图")),
    );
  }

  return function SimulationMonitor(props: SimulationMonitorProps) {
    // Bind the default Agent once per run. A later global selection must never
    // redirect an old card's requests into a different Agent's result store.
    const explicitAgent = props.scope?.agentId || props.agentId;
    const chatId = props.scope?.chatId || props.chatId;
    const capturedAgent = React.useMemo(() => String(explicitAgent || host.getSelectedAgentId?.() || ""), [props.runId, explicitAgent]);
    const scopeKey = JSON.stringify([props.runId, capturedAgent, chatId]);
    const [snapshot, setSnapshot] = React.useState(null as { key: string; data: Snapshot } | null);
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [connection, setConnection] = React.useState("正在连接");
    const [now, setNow] = React.useState(Date.now());
    const [variable, setVariable] = React.useState("");
    const [well, setWell] = React.useState("all");
    const [metric, setMetric] = React.useState("");
    const [presentation, setPresentation] = React.useState(null as { key: string; plan: PresentationPlan } | null);
    const [exportId, setExportId] = React.useState("");
    const [exportBusy, setExportBusy] = React.useState(false);
    const refresh = React.useRef(null as (() => void) | null);
    const lifecycle = React.useRef(0);
    const capabilitiesCallback = React.useRef(props.onCapabilities);
    capabilitiesCallback.current = props.onCapabilities;
    const result = snapshot?.key === scopeKey ? snapshot.data : null;

    React.useEffect(() => {
      let alive = true;
      let busy = false;
      let pending = false;
      let completed = false;
      let lastSeq = 0;
      let reconnect: number | undefined;
      let poll: number | undefined;
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      const controller = new AbortController();
      ++lifecycle.current;
      setError(""); setLoading(true); setVariable(""); setWell("all"); setMetric(""); setExportId(""); setExportBusy(false); setPresentation(null);
      const path = `/ugsci/sim/jobs/${encodeURIComponent(props.runId)}/results`;
      const load = async () => {
        if (!alive) return;
        if (busy) { pending = true; return; }
        busy = true;
        try {
          const response = await request(path, capturedAgent, { signal: controller.signal }, chatId);
          const data = await response.json();
          if (!alive) return;
          if (data.schema_version !== 1 || !Array.isArray(data.series) || !Array.isArray(data.metrics)) throw new Error("模拟结果尚未就绪或服务端版本不兼容");
          const normalized = { ...data, series: normalizedSeries(data.series), metrics: normalizedSeries(data.metrics) } as Snapshot;
          setSnapshot({ key: scopeKey, data: normalized });
          setError("");
          capabilitiesCallback.current?.(normalized.capabilities || {});
          completed = normalized.finalized === true || ["error", "not_collected"].includes(normalized.collection_status || "");
          if (completed) {
            if (reconnect !== undefined) window.clearTimeout(reconnect);
            void reader?.cancel();
            setConnection("历史结果");
          }
        } catch (err) { if (alive && !controller.signal.aborted) setError(`结果更新失败：${errorText(err)}`); }
        finally {
          busy = false;
          if (alive) setLoading(false);
          if (pending && alive && !completed) { pending = false; void load(); }
        }
      };
      refresh.current = () => { completed = false; void load(); };
      poll = window.setInterval(() => { if (!completed) void load(); }, 3000);
      const consume = async () => {
        if (!alive || completed) return;
        try {
          const response = await request(`/run-center/runs/${encodeURIComponent(props.runId)}/events/stream?after_seq=${lastSeq}`, capturedAgent, { signal: controller.signal }, chatId);
          if (!response.headers.get("content-type")?.includes("text/event-stream") || !response.body) { setConnection("定时同步"); return; }
          reader = response.body.getReader();
          if (!alive || completed) { void reader.cancel(); return; }
          setConnection("实时连接");
          const decoder = new TextDecoder();
          let buffer = "";
          while (alive && !completed) {
            const chunk = await reader.read();
            if (chunk.done) break;
            buffer += decoder.decode(chunk.value, { stream: true });
            const frames = buffer.split(/\r?\n\r?\n/);
            buffer = frames.pop() || "";
            let changed = false;
            for (const frame of frames) {
              const text = frame.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
              if (!text) continue;
              try {
                const event = JSON.parse(text);
                const seq = Number(event.sequence ?? event.seq ?? 0);
                if (seq && seq <= lastSeq) continue;
                lastSeq = Math.max(lastSeq, seq);
                changed = true;
              } catch { /* next poll recovers malformed frames */ }
            }
            if (changed) void load();
          }
        } catch { /* polling remains active during reconnect */ }
        finally { reader?.releaseLock(); reader = undefined; }
        if (alive && !completed) { setConnection("定时同步 · 正在重连"); reconnect = window.setTimeout(() => { void consume(); }, 3000); }
      };
      void load();
      // Legacy IDs do not have a native durable Run Center event stream.
      if (props.subscribe !== false && !props.runId.startsWith("ugsci:") && !TERMINAL.has(props.status || "")) void consume();
      else setConnection("定时同步");
      return () => {
        alive = false; ++lifecycle.current; controller.abort();
        if (poll !== undefined) window.clearInterval(poll);
        if (reconnect !== undefined) window.clearTimeout(reconnect);
        void reader?.cancel(); refresh.current = null;
      };
    }, [scopeKey, props.subscribe]);
    React.useEffect(() => { refresh.current?.(); }, [props.refreshKey, props.status]);
    React.useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);

    const status = result?.status && result.status !== "not_collected" ? result.status : result?.job_status || props.status || "unknown";
    const allSeries: Series[] = (result?.series || []).filter((item: Series) => !["TIME", "DAYS"].includes(seriesKey(item).toUpperCase()));
    const plan = presentation?.key === scopeKey ? presentation.plan : null;
    const defaultSeries = plan?.panels.find((panel) => panel.kind === "curves")?.options?.series_ids;
    const defaultMetrics = plan?.panels.find((panel) => panel.kind === "metrics")?.options?.metric_ids;
    const defaultProperty = plan?.panels.find((panel) => panel.kind === "fields")?.options?.property;
    const variables: string[] = [...new Set(allSeries.map(seriesKey))];
    const wells: string[] = [...new Set(allSeries.map((item) => item.well || ""))];
    const selectedVariable = variable === "all" || variables.includes(variable) ? variable : defaultSeries?.length ? "all" : variables[0] || "all";
    const visibleSeries = allSeries.filter((item) => (!variable && defaultSeries?.length ? defaultSeries.includes(item.id) : selectedVariable === "all" || seriesKey(item) === selectedVariable) && (well === "all" || (item.well || "") === well));
    const chartSeries = (props.compact ? visibleSeries.slice(0, 2) : visibleSeries).map((item) => ({ ...item, label: item.well ? `${seriesLabel(item)} · ${item.well}` : seriesLabel(item) }));
    const metrics = (result?.metrics || []).filter((item) => !metric && defaultMetrics?.length ? defaultMetrics.includes(item.id) : !metric || metric === "all" || item.id === metric);
    const datasets = result?.fields?.datasets || [];
    const selectedExport = visibleSeries.find((item) => item.id === exportId)?.id || visibleSeries[0]?.id || "";
    const updated = timestamp(result?.data_updated_at || result?.updated_at);
    const stale = result?.stale || (!TERMINAL.has(status) && Number.isFinite(updated) && now - updated > 15000);
    const start = timestamp(props.startedAt || result?.started_at || result?.start_ts);
    const end = timestamp(props.finishedAt || result?.finished_at || result?.end_ts);
    const collectedAt = timestamp(result?.updated_at);
    const elapsedUntil = Number.isFinite(end) ? end : TERMINAL.has(status) && Number.isFinite(collectedAt) ? collectedAt : now;
    const duration = Number.isFinite(start) ? Math.max(0, Math.floor((elapsedUntil - start) / 1000)) : null;
    const elapsed = duration == null ? "—" : `${Math.floor(duration / 3600)}时 ${Math.floor(duration % 3600 / 60)}分 ${duration % 60}秒`;
    const simulationTime = result?.simulation_time;
    const simulationLabel = simulationTime == null ? "等待首个时间步" : typeof simulationTime === "object" ? `${simulationTime.value ?? simulationTime.time ?? simulationTime.current ?? "—"} ${simulationTime.unit || ""}` : String(simulationTime);

    const exportCsv = async () => {
      if (!selectedExport || exportBusy) return;
      const generation = lifecycle.current;
      setExportBusy(true);
      try {
        const response = await request(`/ugsci/sim/jobs/${encodeURIComponent(props.runId)}/results/export?series_id=${encodeURIComponent(selectedExport)}`, capturedAgent, {}, chatId);
        const blob = await response.blob();
        if (generation !== lifecycle.current) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${props.runId}-${selectedExport}`.replace(/[^\w.\-\u4e00-\u9fff]/g, "_") + ".csv";
        document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      } catch (err) { if (generation === lifecycle.current) setError(`导出失败：${errorText(err)}`); }
      finally { if (generation === lifecycle.current) setExportBusy(false); }
    };
    const collectResults = async () => {
      const generation = lifecycle.current;
      setLoading(true);
      try {
        await request(`/ugsci/sim/jobs/${encodeURIComponent(props.runId)}/results/refresh`, capturedAgent, { method: "POST" }, chatId);
        if (generation === lifecycle.current) refresh.current?.();
      } catch (err) { if (generation === lifecycle.current) setError(`结果采集失败：${errorText(err)}`); }
      finally { if (generation === lifecycle.current) setLoading(false); }
    };
    const select = (label: string, value: string, onChange: (value: string) => void, options: [string, string][]) => h("label", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12 } }, label,
      h("select", { "aria-label": label, style: controlStyle, value, onChange: (event: any) => onChange(event.target.value) }, options.map(([id, title]) => h("option", { key: id, value: id, title: id }, title))));
    const latestValues = (result?.metrics || []).slice(0, props.compact ? 2 : 4).map((item) => ({ ...item, latest: [...item.points].reverse().find((point) => point.value !== null) }));

    const overview = h("div", null,
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 8, marginTop: 10 } },
        [["运行耗时", elapsed], ["模拟时间", simulationLabel], ...latestValues.map((item) => [item.label, item.latest ? `${item.latest.value} ${item.unit || ""}` : "暂无有效值"])].map(([label, value]) => h("div", { key: label, style: { padding: "8px 10px", borderRadius: 6, background: "var(--ant-color-fill-tertiary, #f5f7fb)" } }, h("div", { style: { fontSize: 11, opacity: 0.7 } }, label), h("div", { style: { fontSize: 13, marginTop: 4, overflowWrap: "anywhere" } }, value)))),
      h("div", { style: { fontSize: 11, margin: "8px 0", color: stale ? "#b45309" : "var(--ant-color-text-secondary, #666)" } },
        Number.isFinite(updated) ? `数据更新时间：${new Date(updated).toLocaleString()}` : "等待计算结果",
        stale && " · 暂无新数据，请检查任务日志；已保留上次结果"),
    );
    const curves = allSeries.length > 0 ? h("section", { "aria-label": "井曲线", style: { marginTop: 10 } },
        !props.compact && h("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" } },
          select("曲线变量", selectedVariable, setVariable, [["all", "全部变量"], ...variables.map((value): [string, string] => [value, `${SERIES_LABELS[value.toUpperCase()] || value} (${value})`])]),
          select("井筛选", well, setWell, [["all", "全部井"], ...wells.map((value): [string, string] => [value, value || "全场"])])),
        chartSeries.length ? groupCharts(chartSeries).map((group) => h("div", { key: `${scopeKey}:series:${group[0].unit || seriesKey(group[0])}:${group[0].time_unit || "unknown"}` },
          !props.compact && h("div", { style: { marginTop: 8, fontSize: 11, opacity: 0.7 } }, `纵轴：${group[0].unit || "单位未标注"} · 横轴：${group[0].time_unit || "时间（单位未标注）"}`),
          h(LiveChart, { series: group, compact: props.compact, label: "模拟井曲线（可缩放）" }))) : h("p", null, "当前筛选没有曲线。"),
        !props.compact && visibleSeries.length > 0 && h("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" } },
          select("导出曲线", selectedExport, setExportId, visibleSeries.map((item): [string, string] => [item.id, `${seriesLabel(item)}${item.well ? ` · ${item.well}` : ""}`])),
          h("button", { type: "button", style: controlStyle, disabled: exportBusy, onClick: () => { void exportCsv(); } }, exportBusy ? "正在导出…" : "导出完整 CSV")),
        !props.compact && h("details", { style: { marginTop: 8, fontSize: 12 } }, h("summary", null, "曲线数据摘要"), h("ul", null, visibleSeries.map((item) => h("li", { key: item.id, title: item.id }, `${seriesLabel(item)}${item.well ? ` · ${item.well}` : ""}：显示 ${item.points.length} / ${item.total_points ?? item.points.length} 点；缺测值保留为空`)))),
      ) : h("p", { style: { fontSize: 12, color: "var(--ant-color-text-secondary, #666)" } }, "暂未生成井曲线；计算过程中产生的有效结果将持续显示。");
    const metricPanel = (result?.metrics || []).length > 0 ? h("section", { "aria-label": "收敛指标", style: { marginTop: 16 } },
        h("h4", { style: { margin: "0 0 8px" } }, "收敛与运行指标"),
        !props.compact && select("指标筛选", metric || "all", setMetric, [["all", "全部指标"], ...(result?.metrics || []).map((item): [string, string] => [item.id, item.label])]),
        groupCharts(props.compact ? metrics.slice(0, 2) : metrics).map((group) => h(LiveChart, { key: `${scopeKey}:metrics:${group[0].unit || seriesKey(group[0])}`, series: group, compact: props.compact, label: "模拟收敛与运行指标曲线" }))) : h("p", null, "暂无收敛指标。");
    const fields = datasets.length ? h(FieldView, { key: scopeKey, runId: props.runId, agentId: capturedAgent, chatId, datasets, defaultProperty }) : h("p", { style: { marginTop: 14, fontSize: 12 } }, result?.fields?.status === "unavailable" ? "场图读取器尚不可用，请检查 UGSci 运行环境。" : "等待完整的场结果时间步。");
    return h("section", { "aria-label": "数值模拟监测", style: { minWidth: 0, width: "100%", marginTop: props.compact ? 0 : 16, color: "var(--ant-color-text, #262626)" } },
      h("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 } },
        h("strong", null, result?.simulator ? `${result.simulator.toUpperCase()} 数模监测` : "数模监测"),
        h("span", { style: { fontSize: 12, color: status === "failed" ? "#cf1322" : "#2563eb" } }, LABELS[status] || status, " · ", connection)),
      loading && !result && h("p", null, "正在读取模拟结果…"),
      !props.compact && h("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 12, marginTop: 8 } },
        h("button", { type: "button", style: controlStyle, disabled: loading, onClick: () => { void collectResults(); } }, result?.collection_status === "not_collected" ? "采集历史结果" : "重新采集结果"),
        result?.collection_status === "finalizing" && "计算已结束，正在采集最终结果…",
        result?.collection_status === "collecting" && "正在采集结果…"),
      error && h("div", { role: "alert", style: { color: "#b45309", padding: 8, marginBottom: 8, background: "#fffbeb", borderRadius: 5 } }, error,
        result && "；当前保留上次成功结果。", " ", h("button", { type: "button", onClick: () => refresh.current?.(), style: controlStyle }, "重试结果")),
      !props.compact && result?.capabilities?.checkpoint_resume === false && h("p", { style: { fontSize: 12, color: "var(--ant-color-text-secondary, #666)" } }, "此模拟器尚未提供检查点暂停／续算，请使用取消或重新运行。"),
      [...(result?.warnings || []), ...(result?.fields?.warnings || [])].length > 0 && h("ul", { "aria-label": "结果提示", style: { fontSize: 12, color: "#b45309", paddingLeft: 18 } }, [...new Set([...(result?.warnings || []), ...(result?.fields?.warnings || [])])].map((warning) => h("li", { key: warning }, warning))),
      h(AdaptiveLayout, { runId: props.runId, scope: { agentId: capturedAgent, chatId }, taskType: "simulation", compact: props.compact,
        onPlanChange: (plan: PresentationPlan) => setPresentation({ key: scopeKey, plan }),
        panels: [
          { kind: "overview", title: "运行概览", node: overview },
          { kind: "curves", title: "井曲线", node: curves, available: true },
          { kind: "metrics", title: "收敛与运行指标", node: metricPanel, available: (result?.metrics || []).length > 0 },
          ...props.compact ? [] : [
            { kind: "fields", title: "场图", node: fields, available: true },
          ],
        ],
      }),
    );
  };
}
