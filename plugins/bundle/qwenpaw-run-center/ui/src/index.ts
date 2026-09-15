/** Run Center frontend.
 *
 * This bundle intentionally uses the host React runtime so the independent
 * plugin stays small. It provides the durable run list, deep-linked details,
 * lifecycle controls, event/log replay, and background refresh.
 */

(() => {
  type RunRecord = Record<string, any> & {
    run_id: string;
    status: string;
    operation: string;
  };
  type RunEvent = Record<string, any> & {
    sequence?: number;
    seq?: number;
    type?: string;
    event_type?: string;
    data?: Record<string, any>;
  };
  type CenterView = "runs" | "models" | "research" | "compare";

  const AUTO_REFRESH_MS = 3000;
  const ACTIVE_STATUSES = new Set([
    "draft",
    "queued",
    "preparing",
    "running",
    "finalizing",
    "paused",
    "cancelling",
    "retry_wait",
  ]);

  function getHost(): any {
    const host = (window as any).QwenPaw?.host;
    if (!host?.React || !host?.getApiUrl)
      throw new Error("[run-center] QwenPaw host is not ready");
    return host;
  }

  function apiUrl(path: string): string {
    return getHost().getApiUrl(path);
  }

  function authHeaders(): Record<string, string> {
    const token = getHost().getApiToken?.() || "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function apiFetch(path: string, init?: RequestInit): Promise<any> {
    const host = getHost();
    const headers = new Headers(authHeaders());
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
    const response = host.fetch
      ? await host.fetch(path, { ...init, headers })
      : await fetch(apiUrl(path), { ...init, headers });
    if (!response.ok) {
      const text = await response.text();
      let message = text || `HTTP ${response.status}`;
      try {
        message = JSON.parse(text).detail || message;
      } catch {}
      throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
  }

  function initialRunId(): string | null {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("run_id") || params.get("run");
    } catch {
      return null;
    }
  }

  function isLegacyRun(run: RunRecord | null | undefined): boolean {
    return Boolean(
      run?.source === "ugsci-legacy" ||
        String(run?.run_id || "").startsWith("ugsci:"),
    );
  }

  function RunCenterPage() {
    const React = getHost().React;
    const [runs, setRuns] = React.useState([] as RunRecord[]);
    const [selected, setSelected] = React.useState(null as RunRecord | null);
    const [events, setEvents] = React.useState([] as RunEvent[]);
    const [error, setError] = React.useState("");
    const [notice, setNotice] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [detailLoading, setDetailLoading] = React.useState(false);
    const [actionBusy, setActionBusy] = React.useState("");
    const [autoRefresh, setAutoRefresh] = React.useState(true);
    const [detailTab, setDetailTab] = React.useState("logs");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [search, setSearch] = React.useState("");
    const [view, setView] = React.useState("runs" as CenterView);
    const [models, setModels] = React.useState([] as any[]);
    const [studies, setStudies] = React.useState([] as any[]);
    const [capabilities, setCapabilities] = React.useState(
      {} as Record<string, any>,
    );
    const [catalogLoading, setCatalogLoading] = React.useState(false);
    const [catalogError, setCatalogError] = React.useState("");
    const [compareStudyId, setCompareStudyId] = React.useState("");
    const [compareMetric, setCompareMetric] = React.useState("working_gas");
    const [realizations, setRealizations] = React.useState([] as any[]);
    const [selectedRealizations, setSelectedRealizations] = React.useState(
      [] as string[],
    );
    const [comparison, setComparison] = React.useState(null as any | null);
    const [compareLoading, setCompareLoading] = React.useState(false);
    const [report, setReport] = React.useState(null as any | null);
    const [reportLoading, setReportLoading] = React.useState(false);
    const selectedRef = React.useRef(null as RunRecord | null);
    const listRequestSerial = React.useRef(0);
    const detailRequestSerial = React.useRef(0);
    const catalogRequestSerial = React.useRef(0);

    React.useEffect(() => {
      selectedRef.current = selected;
    }, [selected]);

    const loadRuns = React.useCallback(async (silent = false) => {
      const serial = ++listRequestSerial.current;
      if (!silent) {
        setLoading(true);
        setError("");
      }
      try {
        const data = await apiFetch("/run-center/runs?limit=100");
        if (serial === listRequestSerial.current)
          setRuns(Array.isArray(data.runs) ? data.runs : []);
      } catch (err) {
        if (serial === listRequestSerial.current)
          setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!silent && serial === listRequestSerial.current) setLoading(false);
      }
    }, []);

    const loadRunDetails = React.useCallback(
      async (run: RunRecord | { run_id: string }, silent = false) => {
        const serial = ++detailRequestSerial.current;
        if (!silent) {
          setSelected((current: RunRecord | null) =>
            current?.run_id === run.run_id ? current : (run as RunRecord),
          );
          setEvents([]);
          setDetailLoading(true);
          setError("");
        }
        try {
          const encodedId = encodeURIComponent(run.run_id);
          const [detail, eventData] = await Promise.all([
            apiFetch(`/run-center/runs/${encodedId}`),
            apiFetch(`/run-center/runs/${encodedId}/events`),
          ]);
          if (serial !== detailRequestSerial.current) return;
          setSelected(detail);
          setEvents(Array.isArray(eventData.events) ? eventData.events : []);
        } catch (err) {
          if (serial === detailRequestSerial.current)
            setError(err instanceof Error ? err.message : String(err));
        } finally {
          if (!silent && serial === detailRequestSerial.current)
            setDetailLoading(false);
        }
      },
      [],
    );

    const loadCatalog = React.useCallback(async (silent = false) => {
      const serial = ++catalogRequestSerial.current;
      if (!silent) {
        setCatalogLoading(true);
        setCatalogError("");
      }
      const results = await Promise.allSettled([
        apiFetch("/run-center/health"),
        apiFetch("/run-center/models"),
        apiFetch("/run-center/studies"),
      ]);
      if (serial !== catalogRequestSerial.current) return;
      const [health, modelData, studyData] = results;
      if (health.status === "fulfilled")
        setCapabilities(health.value?.capabilities || {});
      if (modelData.status === "fulfilled")
        setModels(
          Array.isArray(modelData.value?.models) ? modelData.value.models : [],
        );
      if (studyData.status === "fulfilled") {
        const nextStudies = Array.isArray(studyData.value?.studies)
          ? studyData.value.studies
          : [];
        setStudies(nextStudies);
        setCompareStudyId(
          (current: string) => current || nextStudies[0]?.study_id || "",
        );
      }
      const failed = results.find((result) => result.status === "rejected") as
        | PromiseRejectedResult
        | undefined;
      if (failed && !silent)
        setCatalogError(
          failed.reason instanceof Error
            ? failed.reason.message
            : String(failed.reason),
        );
      if (!silent) setCatalogLoading(false);
    }, []);

    const refreshAll = React.useCallback(
      async (silent = false) => {
        const current = selectedRef.current;
        const requests = [loadRuns(silent)];
        if (current?.run_id) requests.push(loadRunDetails(current, silent));
        await Promise.all(requests);
      },
      [loadRuns, loadRunDetails],
    );

    React.useEffect(() => {
      let active = true;
      void Promise.all([loadRuns(), loadCatalog()]).then(() => {
        const runId = initialRunId();
        if (active && runId) void loadRunDetails({ run_id: runId }, false);
      });
      return () => {
        active = false;
      };
    }, [loadRuns, loadRunDetails, loadCatalog]);

    React.useEffect(() => {
      if (!autoRefresh) return;
      const timer = window.setInterval(() => {
        if (document.visibilityState !== "hidden") void refreshAll(true);
      }, AUTO_REFRESH_MS);
      return () => window.clearInterval(timer);
    }, [autoRefresh, refreshAll]);

    // Prefer the durable SSE stream for native runs.  Polling remains active
    // as a compatibility fallback for hosts that do not expose streaming
    // fetch, proxies that strip text/event-stream, and legacy UGSci records.
    React.useEffect(() => {
      if (!autoRefresh || !selected?.run_id || isLegacyRun(selected)) return;
      const runId = selected.run_id;
      let lastSeq = 0;
      const controller = new AbortController();
      let active = true;
      const consume = async () => {
        while (active) {
          try {
            const host = getHost();
            const streamPath = `/run-center/runs/${encodeURIComponent(runId)}/events/stream?after_seq=${lastSeq}`;
            const response = host.fetch
              ? await host.fetch(streamPath, {
                  signal: controller.signal,
                  headers: authHeaders(),
                })
              : await fetch(apiUrl(streamPath), {
                  signal: controller.signal,
                  headers: authHeaders(),
                });
            if (!response.ok || !response.body) return;
            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("text/event-stream")) return;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            while (active) {
              const chunk = await reader.read();
              if (chunk.done) break;
              buffer += decoder.decode(chunk.value, { stream: true });
              const frames = buffer.split(/\r?\n\r?\n/);
              buffer = frames.pop() || "";
              for (const frame of frames) {
                const dataLine = frame
                  .split(/\r?\n/)
                  .find((line) => line.startsWith("data:"));
                if (!dataLine) continue;
                try {
                  const event = JSON.parse(dataLine.slice(5).trim()) as RunEvent;
                  const sequence = Number(event.seq ?? event.sequence ?? 0);
                  if (sequence > lastSeq) lastSeq = sequence;
                  setEvents((current: RunEvent[]) => {
                    const merged = current.filter(
                      (item) =>
                        Number(item.sequence ?? item.seq ?? 0) !== sequence ||
                        sequence === 0,
                    );
                    merged.push({ ...event, sequence });
                    return merged.sort(
                      (left, right) =>
                        Number(left.sequence ?? left.seq ?? 0) -
                        Number(right.sequence ?? right.seq ?? 0),
                    );
                  });
                } catch {
                  // Ignore malformed provider frames; the next replay can
                  // recover the durable event history.
                }
              }
            }
          } catch {
            if (!active) return;
          }
          if (active) await new Promise((resolve) => window.setTimeout(resolve, 1000));
        }
      };
      void consume();
      return () => {
        active = false;
        controller.abort();
      };
    }, [autoRefresh, selected?.run_id]);

    React.useEffect(() => {
      if (!autoRefresh) return;
      const timer = window.setInterval(() => {
        if (document.visibilityState !== "hidden") void loadCatalog(true);
      }, AUTO_REFRESH_MS);
      return () => window.clearInterval(timer);
    }, [autoRefresh, loadCatalog]);

    const selectRun = React.useCallback(
      (run: RunRecord) => {
        setNotice("");
        void loadRunDetails(run, false);
      },
      [loadRunDetails],
    );

    const runAction = React.useCallback(
      async (action: string) => {
        const run = selectedRef.current;
        if (!run?.run_id || actionBusy) return;
        setActionBusy(action);
        setError("");
        setNotice("");
        try {
          const result = await apiFetch(
            `/run-center/runs/${encodeURIComponent(run.run_id)}/${action}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            },
          );
          const labels: Record<string, string> = {
            pause: "已暂停",
            resume: "已恢复并重新排队",
            cancel: "已提交取消",
            retry: "已创建重试运行",
            clone: "已克隆运行",
          };
          setNotice(labels[action] || "操作已完成");
          if (result?.run_id) {
            selectedRef.current = result;
            setSelected(result);
            await Promise.all([loadRuns(true), loadRunDetails(result, true)]);
          } else await refreshAll(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setActionBusy("");
        }
      },
      [actionBusy, loadRuns, loadRunDetails, refreshAll],
    );

    const loadRealizations = React.useCallback(async (studyId: string) => {
      if (!studyId) {
        setRealizations([]);
        return;
      }
      try {
        const data = await apiFetch(
          `/run-center/studies/${encodeURIComponent(studyId)}/realizations`,
        );
        setRealizations(
          Array.isArray(data?.realizations) ? data.realizations : [],
        );
      } catch (err) {
        setCatalogError(err instanceof Error ? err.message : String(err));
      }
    }, []);

    React.useEffect(() => {
      if (view === "compare" && compareStudyId)
        void loadRealizations(compareStudyId);
    }, [view, compareStudyId, loadRealizations]);

    const createComparison = React.useCallback(async () => {
      if (!compareStudyId || selectedRealizations.length < 2 || compareLoading)
        return;
      setCompareLoading(true);
      setCatalogError("");
      try {
        const data = await apiFetch("/run-center/comparisons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            study_id: compareStudyId,
            name: `运行中心比较 · ${compareMetric}`,
            realization_ids: selectedRealizations,
            metric_keys: [compareMetric],
            objectives: [{ key: compareMetric, direction: "maximize" }],
          }),
        });
        setComparison(data);
        setReport(null);
      } catch (err) {
        setCatalogError(err instanceof Error ? err.message : String(err));
      } finally {
        setCompareLoading(false);
      }
    }, [compareStudyId, compareMetric, compareLoading, selectedRealizations]);

    const createComparisonReport = React.useCallback(async () => {
      const comparisonId = comparison?.comparison_id;
      if (!comparisonId || reportLoading) return;
      setReportLoading(true);
      setCatalogError("");
      try {
        const data = await apiFetch("/run-center/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comparison_id: comparisonId,
            title: `运行中心比较报告 · ${compareMetric}`,
            format: "markdown",
          }),
        });
        setReport(data);
      } catch (err) {
        setCatalogError(err instanceof Error ? err.message : String(err));
      } finally {
        setReportLoading(false);
      }
    }, [comparison, compareMetric, reportLoading]);

    const statusColor = (status: string) => {
      if (["succeeded", "completed"].includes(status)) return "#389e0d";
      if (["running", "preparing", "queued", "finalizing"].includes(status))
        return "#1677ff";
      if (["failed", "blocked"].includes(status)) return "#cf1322";
      if (["cancelled", "cancelling"].includes(status)) return "#d46b08";
      if (status === "paused") return "#722ed1";
      return "#8c8c8c";
    };
    const card = (children: any, extra?: any) =>
      React.createElement(
        "section",
        {
          style: {
            background: "var(--ant-color-bg-container, #fff)",
            border: "1px solid var(--ant-color-border, #d9d9d9)",
            borderRadius: 8,
            padding: 16,
            minWidth: 0,
            ...extra,
          },
        },
        children,
      );
    const displayValue = (value: any) =>
      value == null || value === ""
        ? "—"
        : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
    const field = (label: string, value: any) =>
      React.createElement(
        "div",
        { style: { marginBottom: 9 } },
        React.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-tertiary, #8c8c8c)",
              fontSize: 11,
            },
          },
          label,
        ),
        React.createElement(
          "div",
          { style: { wordBreak: "break-word" } },
          displayValue(value),
        ),
      );
    const button = (label: string, action: string, options: any = {}) =>
      React.createElement(
        "button",
        {
          key: action,
          type: "button",
          onClick: () => void runAction(action),
          disabled: Boolean(actionBusy),
          title: options.title,
          style: {
            padding: "6px 11px",
            borderRadius: 5,
            cursor: actionBusy ? "wait" : "pointer",
            border: `1px solid ${
              options.danger ? "#ff7875" : "var(--ant-color-border, #d9d9d9)"
            }`,
            color: options.danger
              ? "#cf1322"
              : "var(--ant-color-text, #262626)",
            background: "var(--ant-color-bg-container, #fff)",
            opacity: actionBusy && actionBusy !== action ? 0.55 : 1,
          },
        },
        actionBusy === action ? "处理中…" : label,
      );
    const eventType = (event: RunEvent) =>
      String(event.type || event.event_type || "event");
    const eventSequence = (event: RunEvent) =>
      event.sequence ?? event.seq ?? "—";
    const isLogEvent = (event: RunEvent) => {
      const type = eventType(event).toLowerCase();
      const data = event.data || {};
      return (
        type.includes("log") ||
        type.includes("stdout") ||
        type.includes("stderr") ||
        data.message != null ||
        data.line != null ||
        data.stdout != null ||
        data.stderr != null
      );
    };
    const logText = (event: RunEvent) => {
      const data = event.data || {};
      return displayValue(
        data.message ?? data.line ?? data.stdout ?? data.stderr ?? data,
      );
    };
    const formatTime = (value: any) => {
      if (!value) return "";
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString();
    };
    const status = selected?.status || "";
    const isLegacy =
      selected?.source === "ugsci-legacy" ||
      String(selected?.run_id || "").startsWith("ugsci:");
    const controls = [] as any[];
    if (!isLegacy && status === "running")
      controls.push(button("暂停", "pause"));
    if (!isLegacy && status === "paused")
      controls.push(button("恢复", "resume"));
    if (!isLegacy && ACTIVE_STATUSES.has(status))
      controls.push(button("取消", "cancel", { danger: true }));
    if (!isLegacy && ["failed", "blocked", "cancelled"].includes(status))
      controls.push(button("重试", "retry"));
    if (!isLegacy && selected) controls.push(button("克隆", "clone"));

    const normalizedSearch = search.trim().toLowerCase();
    const filteredRuns = runs.filter((run) => {
      if (statusFilter !== "all" && run.status !== statusFilter) return false;
      return (
        !normalizedSearch ||
        [
          run.run_id,
          run.operation,
          run.phase,
          run.project_id,
          run.provider_id,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(normalizedSearch),
        )
      );
    });
    const logEvents = events.filter(isLogEvent);
    const visibleEvents = detailTab === "logs" ? logEvents : events;

    const capabilityEntries = [
      ["运行控制", capabilities.run_state_control],
      ["SSE 事件流", capabilities.sse_event_stream],
      ["执行器", capabilities.executor_runtime],
      ["模型版本", capabilities.model_registry],
      ["Study / DOE", capabilities.study_engine],
      ["不确定性统计", capabilities.uncertainty_statistics],
      ["敏感性筛选", capabilities.sensitivity_screening],
      ["方案比较", capabilities.scenario_comparison],
    ];
    const views = [
      ["runs", "运行"],
      ["models", "模型"],
      ["research", "研究"],
      ["compare", "比较"],
    ] as const;
    const renderViewPanel = () => {
      if (view === "runs") return null;
      if (view === "models") {
        return card(
          [
            React.createElement(
              "div",
              {
                key: "title",
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                },
              },
              React.createElement("strong", null, "模型与版本"),
              React.createElement(
                "span",
                {
                  style: {
                    color: "var(--ant-color-text-tertiary, #8c8c8c)",
                    fontSize: 12,
                  },
                },
                `${models.length} 个模型`,
              ),
            ),
            catalogLoading
              ? React.createElement(
                  "div",
                  { key: "loading", style: { padding: 20, color: "#8c8c8c" } },
                  "加载模型目录…",
                )
              : models.length === 0
              ? React.createElement(
                  "div",
                  { key: "empty", style: { padding: 28, color: "#8c8c8c" } },
                  "暂无模型版本。模型插件注册后会在此显示脚本、参数、标签和验证状态。",
                )
              : React.createElement(
                  "div",
                  {
                    key: "list",
                    style: { display: "grid", gap: 10, marginTop: 14 },
                  },
                  models.map((model) =>
                    React.createElement(
                      "article",
                      {
                        key: model.model_id,
                        style: {
                          border:
                            "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                          borderRadius: 6,
                          padding: 12,
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                          },
                        },
                        React.createElement(
                          "strong",
                          null,
                          model.name || model.model_id,
                        ),
                        React.createElement("code", null, model.model_id),
                      ),
                      React.createElement(
                        "div",
                        { style: { color: "#8c8c8c", marginTop: 4 } },
                        model.description || "未填写描述",
                      ),
                      React.createElement(
                        "div",
                        { style: { marginTop: 8, fontSize: 12 } },
                        (model.versions || []).length
                          ? (model.versions || []).map((version: any) =>
                              React.createElement(
                                "span",
                                {
                                  key: version.version_id,
                                  style: {
                                    display: "inline-block",
                                    padding: "3px 7px",
                                    margin: "0 6px 5px 0",
                                    borderRadius: 4,
                                    background:
                                      "var(--ant-color-fill-tertiary, #f5f5f5)",
                                  },
                                },
                                `${version.label || `v${version.revision}`} · ${
                                  version.status
                                }`,
                              ),
                            )
                          : "暂无版本",
                      ),
                    ),
                  ),
                ),
          ],
          { width: "100%" },
        );
      }
      if (view === "research") {
        return card(
          [
            React.createElement(
              "div",
              {
                key: "title",
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                },
              },
              React.createElement("strong", null, "研究与 DOE"),
              React.createElement(
                "span",
                {
                  style: {
                    color: "var(--ant-color-text-tertiary, #8c8c8c)",
                    fontSize: 12,
                  },
                },
                `${studies.length} 个 Study`,
              ),
            ),
            catalogLoading
              ? React.createElement(
                  "div",
                  { key: "loading", style: { padding: 20, color: "#8c8c8c" } },
                  "加载 Study 目录…",
                )
              : studies.length === 0
              ? React.createElement(
                  "div",
                  { key: "empty", style: { padding: 28, color: "#8c8c8c" } },
                  "暂无 Study。可从模型版本创建历史拟合、预测、不确定性、敏感性或优化研究。",
                )
              : React.createElement(
                  "div",
                  {
                    key: "list",
                    style: { display: "grid", gap: 8, marginTop: 14 },
                  },
                  studies.map((study) =>
                    React.createElement(
                      "article",
                      {
                        key: study.study_id,
                        style: {
                          border:
                            "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                          borderRadius: 6,
                          padding: 12,
                        },
                      },
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                          },
                        },
                        React.createElement(
                          "strong",
                          null,
                          study.name || study.study_id,
                        ),
                        React.createElement(
                          "span",
                          { style: { color: "#1677ff" } },
                          study.study_type || study.type,
                        ),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            color: "#8c8c8c",
                            fontSize: 12,
                            marginTop: 4,
                          },
                        },
                        `${study.status || "draft"} · model ${
                          study.model_version_id || "—"
                        } · revision ${study.revision || 1}`,
                      ),
                    ),
                  ),
                ),
          ],
          { width: "100%" },
        );
      }
      return card(
        [
          React.createElement(
            "div",
            {
              key: "title",
              style: {
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              },
            },
            React.createElement("strong", null, "多方案比较"),
            React.createElement(
              "span",
              {
                style: {
                  color: "var(--ant-color-text-tertiary, #8c8c8c)",
                  fontSize: 12,
                },
              },
              "轻量指标比较与 Pareto 前沿",
            ),
          ),
          React.createElement(
            "div",
            {
              key: "controls",
              style: {
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 14,
              },
            },
            React.createElement(
              "select",
              {
                "aria-label": "比较 Study",
                value: compareStudyId,
                onChange: (event: any) => {
                  setCompareStudyId(event.target.value);
                  setSelectedRealizations([]);
                  setComparison(null);
                },
                style: { padding: "7px 9px", minWidth: 200 },
              },
              [
                React.createElement(
                  "option",
                  { key: "", value: "" },
                  "选择 Study",
                ),
                ...studies.map((study) =>
                  React.createElement(
                    "option",
                    { key: study.study_id, value: study.study_id },
                    study.name || study.study_id,
                  ),
                ),
              ],
            ),
            React.createElement("input", {
              "aria-label": "比较指标",
              value: compareMetric,
              onChange: (event: any) => setCompareMetric(event.target.value),
              placeholder: "指标 key",
              style: { padding: "7px 9px", width: 150 },
            }),
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => void createComparison(),
                disabled: compareLoading || selectedRealizations.length < 2,
              },
              compareLoading ? "计算中…" : "生成比较",
            ),
          ),
          !compareStudyId
            ? React.createElement(
                "div",
                { key: "empty", style: { padding: 28, color: "#8c8c8c" } },
                "选择一个 Study 后勾选至少两个 realization，即可生成指标对比。",
              )
            : realizations.length === 0
            ? React.createElement(
                "div",
                { key: "empty2", style: { padding: 20, color: "#8c8c8c" } },
                "该 Study 暂无 realization。",
              )
            : React.createElement(
                "div",
                {
                  key: "realizations",
                  style: { display: "grid", gap: 6, marginTop: 14 },
                },
                realizations.map((realization) =>
                  React.createElement(
                    "label",
                    {
                      key: realization.realization_id,
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: 8,
                        border:
                          "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                        borderRadius: 5,
                      },
                    },
                    React.createElement("input", {
                      type: "checkbox",
                      checked: selectedRealizations.includes(
                        realization.realization_id,
                      ),
                      onChange: (event: any) =>
                        setSelectedRealizations((current: string[]) =>
                          event.target.checked
                            ? [...current, realization.realization_id]
                            : current.filter(
                                (id) => id !== realization.realization_id,
                              ),
                        ),
                    }),
                    React.createElement(
                      "code",
                      null,
                      realization.realization_id,
                    ),
                    React.createElement(
                      "span",
                      null,
                      JSON.stringify(realization.parameter_values || {}),
                    ),
                    React.createElement(
                      "span",
                      { style: { marginLeft: "auto", color: "#8c8c8c" } },
                      realization.status,
                    ),
                  ),
                ),
              ),
          comparison
            ? React.createElement(
                "div",
                { key: "result", style: { marginTop: 14 } },
                React.createElement(
                  "div",
                  { style: { display: "flex", gap: 8, alignItems: "center" } },
                  React.createElement("strong", null, "比较结果"),
                  React.createElement(
                    "button",
                    {
                      type: "button",
                      onClick: () => void createComparisonReport(),
                      disabled: reportLoading,
                    },
                    reportLoading ? "生成报告…" : "生成 Markdown 报告",
                  ),
                ),
                React.createElement(
                  "pre",
                  {
                    style: {
                      marginTop: 8,
                      maxHeight: 300,
                      overflow: "auto",
                      padding: 10,
                      background: "var(--ant-color-fill-tertiary, #f5f5f5)",
                      fontSize: 11,
                    },
                  },
                  JSON.stringify(comparison.result || comparison, null, 2),
                ),
                report
                  ? React.createElement(
                      "div",
                      { style: { marginTop: 10 } },
                      React.createElement(
                        "div",
                        { style: { color: "#389e0d", fontSize: 12 } },
                        `报告已生成 · ${report.artifact?.ref_id || report.report_id}`,
                      ),
                      React.createElement(
                        "pre",
                        {
                          style: {
                            maxHeight: 260,
                            overflow: "auto",
                            padding: 10,
                            whiteSpace: "pre-wrap",
                            background: "var(--ant-color-fill-tertiary, #f5f5f5)",
                            fontSize: 11,
                          },
                        },
                        report.content || "",
                      ),
                    )
                  : null,
              )
            : null,
        ],
        { width: "100%" },
      );
    };

    return React.createElement(
      "main",
      {
        style: {
          padding: 24,
          height: "100%",
          overflow: "auto",
          boxSizing: "border-box",
          color: "var(--ant-color-text, #262626)",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          },
        },
        React.createElement(
          "div",
          null,
          React.createElement(
            "h1",
            { style: { margin: 0, fontSize: 24 } },
            "运行中心",
          ),
          React.createElement(
            "div",
            {
              style: {
                color: "var(--ant-color-text-tertiary, #8c8c8c)",
                marginTop: 6,
              },
            },
            "统一查看并控制仿真、计算、导入和研究任务",
          ),
        ),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 12 } },
          React.createElement(
            "label",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                cursor: "pointer",
              },
            },
            React.createElement("input", {
              type: "checkbox",
              checked: autoRefresh,
              onChange: (event: any) => setAutoRefresh(event.target.checked),
            }),
            `自动刷新（${AUTO_REFRESH_MS / 1000} 秒）`,
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => void refreshAll(false),
              disabled: loading,
              style: {
                padding: "7px 14px",
                cursor: loading ? "wait" : "pointer",
              },
            },
            loading ? "刷新中…" : "刷新",
          ),
        ),
      ),
      React.createElement(
        "nav",
        {
          key: "views",
          "aria-label": "运行中心视图",
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 14,
            borderBottom:
              "1px solid var(--ant-color-border-secondary, #f0f0f0)",
          },
        },
        views.map(([key, label]) =>
          React.createElement(
            "button",
            {
              key,
              type: "button",
              "aria-current": view === key ? "page" : undefined,
              onClick: () => setView(key),
              style: {
                border: "none",
                borderBottom:
                  view === key ? "2px solid #1677ff" : "2px solid transparent",
                background: "transparent",
                color: view === key ? "#1677ff" : "inherit",
                padding: "8px 13px",
                cursor: "pointer",
                fontWeight: view === key ? 600 : 400,
              },
            },
            label,
          ),
        ),
      ),
      React.createElement(
        "div",
        {
          key: "capabilities",
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 14,
            fontSize: 11,
          },
        },
        capabilityEntries.map(([label, value]) =>
          React.createElement(
            "span",
            {
              key: label,
              title:
                value === undefined
                  ? "能力状态未知"
                  : value
                  ? "已启用"
                  : "未启用",
              style: {
                borderRadius: 12,
                padding: "3px 9px",
                color: value ? "#237804" : "#8c8c8c",
                background: value
                  ? "#f6ffed"
                  : "var(--ant-color-fill-tertiary, #f5f5f5)",
                border: `1px solid ${
                  value
                    ? "#b7eb8f"
                    : "var(--ant-color-border-secondary, #f0f0f0)"
                }`,
              },
            },
            `${label} · ${
              value ? "已启用" : value === false ? "未启用" : "未知"
            }`,
          ),
        ),
      ),
      error || catalogError
        ? React.createElement(
            "div",
            {
              role: "alert",
              style: {
                color: "#cf1322",
                background: "#fff1f0",
                border: "1px solid #ffa39e",
                padding: 10,
                borderRadius: 6,
                marginBottom: 14,
              },
            },
            error || catalogError,
          )
        : null,
      notice
        ? React.createElement(
            "div",
            {
              role: "status",
              style: {
                color: "#237804",
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                padding: 10,
                borderRadius: 6,
                marginBottom: 14,
              },
            },
            notice,
          )
        : null,
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "flex-start",
          },
        },
        card(
          [
            React.createElement(
              "div",
              {
                key: "title",
                style: {
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                },
              },
              React.createElement(
                "strong",
                null,
                `运行记录（${filteredRuns.length}/${runs.length}）`,
              ),
              React.createElement(
                "span",
                {
                  style: {
                    color: "var(--ant-color-text-tertiary, #8c8c8c)",
                    fontSize: 12,
                  },
                },
                "UGSci 兼容桥接 + 原生运行",
              ),
            ),
            React.createElement(
              "div",
              {
                key: "filters",
                style: {
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 12,
                },
              },
              React.createElement("input", {
                "aria-label": "搜索运行",
                value: search,
                onChange: (event: any) => setSearch(event.target.value),
                placeholder: "搜索 Run ID、操作、阶段或项目",
                style: {
                  flex: "1 1 230px",
                  minWidth: 0,
                  padding: "7px 9px",
                  border: "1px solid var(--ant-color-border, #d9d9d9)",
                  borderRadius: 5,
                  background: "var(--ant-color-bg-container, #fff)",
                  color: "inherit",
                },
              }),
              React.createElement(
                "select",
                {
                  "aria-label": "状态筛选",
                  value: statusFilter,
                  onChange: (event: any) => setStatusFilter(event.target.value),
                  style: {
                    padding: "7px 9px",
                    border: "1px solid var(--ant-color-border, #d9d9d9)",
                    borderRadius: 5,
                    background: "var(--ant-color-bg-container, #fff)",
                    color: "inherit",
                  },
                },
                [
                  "all",
                  "draft",
                  "queued",
                  "preparing",
                  "running",
                  "paused",
                  "succeeded",
                  "failed",
                  "blocked",
                  "cancelling",
                  "cancelled",
                ].map((value) =>
                  React.createElement(
                    "option",
                    { key: value, value },
                    value === "all" ? "全部状态" : value,
                  ),
                ),
              ),
            ),
            filteredRuns.length === 0
              ? React.createElement(
                  "div",
                  {
                    key: "empty",
                    style: {
                      color: "var(--ant-color-text-tertiary, #8c8c8c)",
                      padding: "36px 12px",
                      textAlign: "center",
                    },
                  },
                  runs.length
                    ? "没有符合筛选条件的运行。"
                    : "暂无运行记录。启用 UGSci 仿真或导入任务后会显示在这里。",
                )
              : React.createElement(
                  "div",
                  { key: "table", style: { overflowX: "auto" } },
                  React.createElement(
                    "table",
                    {
                      style: {
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                      },
                    },
                    React.createElement(
                      "thead",
                      null,
                      React.createElement(
                        "tr",
                        null,
                        ["状态", "操作", "阶段", "进度"].map((value) =>
                          React.createElement(
                            "th",
                            {
                              key: value,
                              style: {
                                textAlign: "left",
                                borderBottom:
                                  "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                                padding: "8px 6px",
                                color:
                                  "var(--ant-color-text-tertiary, #8c8c8c)",
                                fontWeight: 500,
                              },
                            },
                            value,
                          ),
                        ),
                      ),
                    ),
                    React.createElement(
                      "tbody",
                      null,
                      filteredRuns.map((run) =>
                        React.createElement(
                          "tr",
                          {
                            key: run.run_id,
                            tabIndex: 0,
                            role: "button",
                            "aria-label": `查看运行 ${run.run_id}`,
                            onClick: () => selectRun(run),
                            onKeyDown: (event: any) => {
                              if (event.key === "Enter" || event.key === " ")
                                selectRun(run);
                            },
                            style: {
                              cursor: "pointer",
                              background:
                                selected?.run_id === run.run_id
                                  ? "var(--ant-color-primary-bg, #e6f4ff)"
                                  : undefined,
                            },
                          },
                          React.createElement(
                            "td",
                            {
                              style: {
                                padding: "10px 6px",
                                borderBottom:
                                  "1px solid var(--ant-color-border-secondary, #f5f5f5)",
                                color: statusColor(run.status),
                                fontWeight: 600,
                              },
                            },
                            run.status,
                          ),
                          React.createElement(
                            "td",
                            {
                              style: {
                                padding: "10px 6px",
                                borderBottom:
                                  "1px solid var(--ant-color-border-secondary, #f5f5f5)",
                              },
                            },
                            run.operation,
                          ),
                          React.createElement(
                            "td",
                            {
                              style: {
                                padding: "10px 6px",
                                borderBottom:
                                  "1px solid var(--ant-color-border-secondary, #f5f5f5)",
                              },
                            },
                            run.phase || "—",
                          ),
                          React.createElement(
                            "td",
                            {
                              style: {
                                padding: "10px 6px",
                                borderBottom:
                                  "1px solid var(--ant-color-border-secondary, #f5f5f5)",
                              },
                            },
                            run.progress == null
                              ? "—"
                              : `${Math.round(Number(run.progress) * 100)}%`,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
          ],
          { flex: "3 1 560px" },
        ),
        card(
          selected
            ? [
                React.createElement(
                  "div",
                  {
                    key: "heading",
                    style: {
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    },
                  },
                  React.createElement("strong", null, "运行详情"),
                  React.createElement(
                    "span",
                    {
                      style: {
                        color: statusColor(status),
                        fontWeight: 600,
                        fontSize: 13,
                      },
                    },
                    status,
                  ),
                ),
                detailLoading
                  ? React.createElement(
                      "div",
                      {
                        key: "loading",
                        style: {
                          color: "var(--ant-color-text-tertiary, #8c8c8c)",
                          marginTop: 10,
                        },
                      },
                      "正在加载详情…",
                    )
                  : null,
                controls.length
                  ? React.createElement(
                      "div",
                      {
                        key: "controls",
                        "aria-label": "运行控制",
                        style: {
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          marginTop: 14,
                        },
                      },
                      controls,
                    )
                  : null,
                isLegacy
                  ? React.createElement(
                      "div",
                      {
                        key: "legacy-note",
                        style: {
                          marginTop: 12,
                          color: "var(--ant-color-text-tertiary, #8c8c8c)",
                          fontSize: 12,
                        },
                      },
                      "这是 UGSci 兼容运行记录，控制操作请在原任务入口执行。",
                    )
                  : null,
                selected.progress != null
                  ? React.createElement(
                      "div",
                      { key: "progress", style: { marginTop: 14 } },
                      React.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 11,
                            marginBottom: 4,
                          },
                        },
                        React.createElement(
                          "span",
                          null,
                          selected.phase || "运行进度",
                        ),
                        React.createElement(
                          "span",
                          null,
                          `${Math.round(Number(selected.progress) * 100)}%`,
                        ),
                      ),
                      React.createElement(
                        "div",
                        {
                          style: {
                            height: 7,
                            borderRadius: 4,
                            overflow: "hidden",
                            background:
                              "var(--ant-color-fill-secondary, #f0f0f0)",
                          },
                        },
                        React.createElement("div", {
                          style: {
                            width: `${Math.max(
                              0,
                              Math.min(100, Number(selected.progress) * 100),
                            )}%`,
                            height: "100%",
                            background: statusColor(status),
                            transition: "width .25s",
                          },
                        }),
                      ),
                    )
                  : null,
                React.createElement(
                  "div",
                  {
                    key: "fields",
                    style: {
                      marginTop: 14,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "0 14px",
                    },
                  },
                  [
                    ["Run ID", selected.run_id],
                    ["操作", selected.operation],
                    ["来源", selected.source],
                    ["Provider", selected.provider_id],
                    ["项目", selected.project_id],
                    ["父运行", selected.parent_run_id],
                    ["模型版本", selected.model_version_id],
                    ["研究", selected.study_id],
                    ["创建时间", formatTime(selected.created_at)],
                    ["开始时间", formatTime(selected.started_at)],
                    ["结束时间", formatTime(selected.finished_at)],
                    ["错误", selected.error],
                  ].map(([label, value]) =>
                    React.createElement(
                      React.Fragment,
                      { key: label },
                      field(label, value),
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    key: "tabs",
                    style: {
                      display: "flex",
                      gap: 6,
                      margin: "12px 0 8px",
                      borderBottom:
                        "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                    },
                  },
                  [
                    ["logs", `日志（${logEvents.length}）`],
                    ["events", `全部事件（${events.length}）`],
                  ].map(([key, label]) =>
                    React.createElement(
                      "button",
                      {
                        key,
                        type: "button",
                        onClick: () => setDetailTab(key),
                        style: {
                          border: "none",
                          borderBottom:
                            detailTab === key
                              ? "2px solid #1677ff"
                              : "2px solid transparent",
                          background: "transparent",
                          padding: "7px 8px",
                          cursor: "pointer",
                          color: detailTab === key ? "#1677ff" : "inherit",
                        },
                      },
                      label,
                    ),
                  ),
                ),
                React.createElement(
                  "div",
                  {
                    key: "events",
                    "aria-label":
                      detailTab === "logs" ? "运行日志" : "运行事件",
                    style: {
                      maxHeight: 340,
                      overflow: "auto",
                      background: "var(--ant-color-fill-tertiary, #fafafa)",
                      padding: 9,
                      borderRadius: 5,
                      fontFamily: "monospace",
                      fontSize: 11,
                    },
                  },
                  visibleEvents.length
                    ? visibleEvents.map((event) =>
                        React.createElement(
                          "div",
                          {
                            key: `${eventSequence(event)}-${eventType(event)}`,
                            style: {
                              padding: "7px 0",
                              borderBottom:
                                "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            },
                          },
                          React.createElement(
                            "div",
                            {
                              style: {
                                color:
                                  "var(--ant-color-text-tertiary, #8c8c8c)",
                                marginBottom: 3,
                              },
                            },
                            `#${eventSequence(event)} ${formatTime(
                              event.created_at,
                            )} ${eventType(event)}`,
                          ),
                          React.createElement(
                            "div",
                            null,
                            detailTab === "logs"
                              ? logText(event)
                              : JSON.stringify(event.data || {}, null, 2),
                          ),
                        ),
                      )
                    : detailTab === "logs"
                    ? "暂无日志。状态、指标等信息可在“全部事件”中查看。"
                    : "暂无事件",
                ),
              ]
            : [
                React.createElement("strong", { key: "title" }, "运行详情"),
                React.createElement(
                  "div",
                  {
                    key: "empty",
                    style: {
                      color: "var(--ant-color-text-tertiary, #8c8c8c)",
                      padding: "36px 0",
                    },
                  },
                  "选择一条运行记录查看详情、控制任务和回放日志。",
                ),
              ],
          { flex: "2 1 420px" },
        ),
      ),
      renderViewPanel(),
    );
  }

  function register(attempt = 0) {
    const QP = (window as any).QwenPaw;
    if (!QP?.route?.add || !QP?.menu?.add) {
      if (attempt < 40) setTimeout(() => register(attempt + 1), 250);
      else console.warn("[run-center] host API did not become ready");
      return;
    }
    if ((window as any).__qwenpawRunCenterRegistered) return;
    (window as any).__qwenpawRunCenterRegistered = true;
    const React = getHost().React;
    const routeId = "qwenpaw-run-center.run-center";
    QP.route.add("qwenpaw-run-center", {
      id: routeId,
      path: "/run-center",
      component: RunCenterPage,
    });
    QP.menu.add("qwenpaw-run-center", {
      id: "core.run-center",
      location: "primary.settings",
      label: () => "运行中心",
      icon: QP.host.antdIcons?.ThunderboltOutlined
        ? React.createElement(QP.host.antdIcons.ThunderboltOutlined, {
            style: { fontSize: 16 },
          })
        : undefined,
      route: routeId,
      order: 8,
    });
    QP.sidebar?.registerSimpleModeItems?.(["core.run-center"]);
    console.info("[run-center] registered route and Simple Mode menu");
  }

  if (typeof window !== "undefined") register();
})();
