import React, { useEffect, useRef, useState } from "react";
import { parseRuntimeInputs, type Api, type FlowDocument } from "./model";
import {
  RunInspector,
  RunValue,
  runStatusLabels as labels,
  safeRunValue,
  type RunEvent,
  type RunNodeDetail,
} from "./RunInspector";

import type { RunRecord } from "./runRecord";
import type { RepairSource } from "./authoringModel";
import { RunComparison } from "./RunComparison";
import { RunSurface } from "./RunSurface";
import { RunAnalytics } from "./RunAnalytics";
import { RunValueScope } from "./RunValueViews";
import { useWorkflowI18n } from "./i18n";

const color = (state: string) =>
  ["completed", "success", "cached"].includes(state)
    ? "success"
    : ["failed", "error", "timeout"].includes(state)
    ? "error"
    : ["paused", "waiting_human", "blocked"].includes(state)
    ? "warning"
    : state === "running"
    ? "processing"
    : "default";

export function RunInputDialog({
  flow,
  onClose,
  onRun,
  antd,
  TypedInput,
}: {
  flow: FlowDocument | null;
  onClose: () => void;
  onRun: (inputs: Record<string, any>) => Promise<void>;
  antd: any;
  TypedInput: any;
}) {
  const { t, locale } = useWorkflowI18n();
  const { Modal, Alert, Form, Typography } = antd;
  const [values, setValues] = useState<Record<string, any>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setValues(
      Object.fromEntries(
        (flow?.inputs || []).map((field) => [field.name, field.default]),
      ),
    );
    setError("");
  }, [flow]);
  return (
    <Modal
      title={`${t("试运行", "Trial run")} · ${
        flow?.name || t("工作流", "Workflow")
      }`}
      open={!!flow}
      onCancel={busy ? undefined : onClose}
      okText={t("开始运行", "Start run")}
      cancelText={t("取消", "Cancel")}
      okButtonProps={{ "aria-label": t("开始运行", "Start run") }}
      confirmLoading={busy}
      maskClosable={!busy}
      onOk={async () => {
        setError("");
        setBusy(true);
        try {
          await onRun(parseRuntimeInputs(flow?.inputs || [], values, locale));
        } catch (failure: any) {
          setError(failure.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <Alert
        showIcon
        type="info"
        message={t("将执行已保存版本", "The saved revision will run")}
        description={t(
          "工具节点会调用真实能力，请检查输入参数与业务条件。",
          "Tool nodes execute real operations. Review inputs and business conditions.",
        )}
        style={{ marginBottom: 16 }}
      />
      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 12 }}
        />
      )}
      <Form layout="vertical">
        {(flow?.inputs || []).map((field) => (
          <TypedInput
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(value: any) =>
              setValues((previous) => ({ ...previous, [field.name]: value }))
            }
          />
        ))}
      </Form>
      {!flow?.inputs?.length && (
        <Typography.Text type="secondary">
          {t(
            "此工作流没有额外输入参数。",
            "This workflow has no additional inputs.",
          )}
        </Typography.Text>
      )}
    </Modal>
  );
}

export function RunMonitor({
  runId,
  onClose,
  onStatusUpdate,
  onResumed,
  antd,
  api,
  streamUrl,
  headers,
  docked = false,
  onRecord,
  agentId,
  onRepair,
}: {
  runId: string | null;
  onClose: () => void;
  onStatusUpdate: (statuses: Record<string, string>, flowId: string) => void;
  onResumed: (id: string) => void;
  antd: any;
  api: Api;
  streamUrl: (path: string) => string;
  headers: () => Record<string, string>;
  docked?: boolean;
  onRecord?: (record: RunRecord) => void;
  agentId?: string;
  onRepair?: (source: RepairSource) => void;
}) {
  const { t } = useWorkflowI18n();
  const {
    Button,
    Alert,
    Tag,
    Typography,
    Tabs,
    Empty,
    Spin,
    Select,
    Input,
    Space,
    Timeline,
  } = antd;
  const [run, setRun] = useState<RunRecord | null>(null),
    [events, setEvents] = useState<RunEvent[]>([]);
  const [children, setChildren] = useState<RunRecord[]>([]);
  const [error, setError] = useState(""),
    [streamError, setStreamError] = useState(""),
    [loading, setLoading] = useState(false);
  const [comments, setComments] = useState(""),
    [reviewNode, setReviewNode] = useState<string | undefined>(),
    [resuming, setResuming] = useState(false);
  const recordListener = useRef(onRecord);
  recordListener.current = onRecord;
  const update = useRef(onStatusUpdate);
  update.current = onStatusUpdate;
  const refreshRef = useRef<() => Promise<void>>(async () => {});
  const visitRef = useRef({ runId, agentId, alive: true });
  if (
    visitRef.current.runId !== runId ||
    visitRef.current.agentId !== agentId
  ) {
    visitRef.current.alive = false;
    visitRef.current = { runId, agentId, alive: true };
  }
  const visit = visitRef.current;
  useEffect(() => {
    visit.alive = true;
    return () => {
      visit.alive = false;
    };
  }, [visit]);
  const ownsVisit = () => visit.alive && visitRef.current === visit;
  useEffect(() => {
    if (!runId) return;
    let alive = true,
      timer: ReturnType<typeof setTimeout> | undefined,
      reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let terminal = false,
      receivedEvents = 0,
      reconnectDelay = 1000,
      refreshSequence = 0;
    setRun(null);
    setEvents([]);
    setChildren([]);
    setError("");
    setStreamError("");
    setComments("");
    setReviewNode(undefined);
    setResuming(false);
    setLoading(true);
    const controller = new AbortController();
    let familyKey = "";
    const refresh = async () => {
      const sequence = ++refreshSequence;
      try {
        const record = await api<RunRecord>(
          `/flowforge/runs/${encodeURIComponent(runId)}`,
          {
            signal: controller.signal,
            ...(agentId ? { headers: { "X-Agent-Id": agentId } } : {}),
          },
        );
        if (alive && sequence === refreshSequence) {
          setRun(record);
          recordListener.current?.(record);
          terminal =
            !!record.resumed_by_run_id ||
            !["queued", "running", "pending"].includes(record.status);
          setError("");
          update.current(record.node_statuses || {}, record.flow_id);
          const key = `${record.status}:${
            Object.keys(record.node_statuses || {}).length
          }`;
          if (familyKey !== key) {
            try {
              const related = await api<RunRecord[]>("/flowforge/runs", {
                signal: controller.signal,
                ...(agentId ? { headers: { "X-Agent-Id": agentId } } : {}),
              });
              if (alive && sequence === refreshSequence) {
                familyKey = key;
                setChildren(
                  related.filter((entry) => entry.parent_run_id === runId),
                );
              }
            } catch {
              /* Run polling stays available if the history list fails. */
            }
          }
        }
      } catch (failure: any) {
        if (alive && sequence === refreshSequence)
          setError(
            `${t("无法读取运行状态", "Cannot load run status")}：${
              failure.message
            }`,
          );
      } finally {
        if (alive && sequence === refreshSequence) setLoading(false);
      }
    };
    refreshRef.current = refresh;
    const poll = async () => {
      await refresh();
      if (alive) timer = setTimeout(poll, 2000);
    };
    void poll();
    const connect = async () => {
      try {
        const response = await fetch(
          streamUrl(`/flowforge/runs/${encodeURIComponent(runId)}/events`),
          {
            headers: {
              ...headers(),
              ...(agentId ? { "X-Agent-Id": agentId } : {}),
            },
            signal: controller.signal,
          },
        );
        if (!response.ok || !response.body)
          throw new Error(`HTTP ${response.status}`);
        const reader = response.body.getReader(),
          decoder = new TextDecoder();
        let buffer = "",
          streamIndex = 0;
        if (alive) setStreamError("");
        while (alive) {
          const part = await reader.read();
          if (part.done) break;
          buffer += decoder.decode(part.value, { stream: true });
          // CRLF can straddle chunks. Normalize only once a complete frame exists.
          let match = /\r?\n\r?\n/.exec(buffer);
          while (match) {
            const frame = buffer.slice(0, match.index);
            buffer = buffer.slice(match.index + match[0].length);
            const data = frame
              .split(/\r?\n/)
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trimStart())
              .join("\n");
            if (data) {
              const event = JSON.parse(data) as RunEvent;
              // The endpoint replays history from the beginning. Count frames,
              // not payload hashes: identical repeated node events are valid.
              streamIndex += 1;
              if (alive && streamIndex > receivedEvents) {
                receivedEvents = streamIndex;
                reconnectDelay = 1000;
                setEvents((previous) => [...previous.slice(-999), event]);
              }
            }
            match = /\r?\n\r?\n/.exec(buffer);
          }
        }
        if (alive) await refresh();
      } catch {
        if (alive)
          setStreamError(
            terminal
              ? t(
                  "实时事件读取中断，当前显示已保存的运行记录。",
                  "Live events disconnected. Showing the saved run record.",
                )
              : t(
                  "实时事件连接中断，正在自动重连；运行状态仍每 2 秒刷新。",
                  "Live events disconnected. Reconnecting automatically and polling status every 2 seconds.",
                ),
          );
      } finally {
        if (alive && !terminal) {
          reconnectTimer = setTimeout(() => void connect(), reconnectDelay);
          reconnectDelay = Math.min(reconnectDelay * 2, 10000);
        }
      }
    };
    void connect();
    return () => {
      alive = false;
      controller.abort();
      if (timer) clearTimeout(timer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [runId, agentId, api]);
  const finished =
    !!run?.resumed_by_run_id ||
    ["completed", "failed", "cancelled", "timeout"].includes(run?.status || "");
  const waiting =
    !run?.resumed_by_run_id &&
    ["paused", "waiting_human"].includes(run?.status || "");
  const blocked = Object.entries(run?.node_statuses || {})
    .filter(([, state]) => ["blocked", "waiting_human"].includes(state))
    .map(([id]) => id);
  const resume = async (approved: boolean) => {
    if (resuming) return;
    setResuming(true);
    setError("");
    try {
      const result = await api<{ run_id: string }>(
        `/flowforge/runs/${encodeURIComponent(runId!)}/resume`,
        {
          method: "POST",
          ...(agentId ? { headers: { "X-Agent-Id": agentId } } : {}),
          body: JSON.stringify({
            inputs: {
              ...(blocked.length > 1 && reviewNode
                ? { node_id: reviewNode }
                : {}),
              approved,
              comments,
            },
          }),
        },
      );
      if (ownsVisit()) onResumed(result.run_id);
    } catch (failure: any) {
      if (ownsVisit())
        setError(`${t("恢复失败", "Resume failed")}：${failure.message}`);
    } finally {
      if (ownsVisit()) setResuming(false);
    }
  };
  const visibleEvents =
    streamError && run?.events?.length
      ? run.events.slice(-1000)
      : events.length
      ? events
      : (run?.events || []).slice(-1000);
  return (
    <RunSurface
      docked={docked}
      antd={antd}
      title={
        runId
          ? `${t("运行监控", "Run monitor")} · ${runId.slice(0, 8)}`
          : t("运行监控", "Run monitor")
      }
      open={!!runId}
      onClose={onClose}
      extra={
        run &&
        !finished && (
          <Button
            danger
            onClick={async () => {
              try {
                await api(
                  `/flowforge/runs/${encodeURIComponent(runId!)}/cancel`,
                  {
                    method: "POST",
                    ...(agentId ? { headers: { "X-Agent-Id": agentId } } : {}),
                  },
                );
                if (ownsVisit()) await refreshRef.current();
              } catch (failure: any) {
                if (ownsVisit()) setError(failure.message);
              }
            }}
          >
            {t("取消运行", "Cancel run")}
          </Button>
        )
      }
    >
      {loading && !run && <Spin />}
      {error && (
        <Alert
          type="error"
          showIcon
          message={safeRunValue(error)}
          className="ff-spaced"
        />
      )}
      {streamError && (
        <Alert
          type="warning"
          showIcon
          message={streamError}
          className="ff-spaced"
        />
      )}
      {run?.parent_run_id && (
        <Button
          size="small"
          style={{ marginBottom: 12 }}
          onClick={() => onResumed(run.parent_run_id!)}
        >
          {t("返回父工作流运行", "View parent run")}
        </Button>
      )}
      {!!children.length && (
        <div className="ff-child-runs">
          <strong>{t("子工作流运行", "Child runs")}</strong>
          {children.map((child) => (
            <div className="ff-run-node" key={child.run_id}>
              <span>
                {child.flow_id} ·{" "}
                {child.resumed_by_run_id
                  ? t("已恢复", "Resumed")
                  : t(labels[child.status] || child.status)}
              </span>
              <Button
                size="small"
                onClick={() =>
                  onResumed(child.resumed_by_run_id || child.run_id)
                }
              >
                {t("查看", "View")}
                {["paused", "waiting_human"].includes(child.status) &&
                !child.resumed_by_run_id
                  ? t("并处理", " and review")
                  : ""}
              </Button>
            </div>
          ))}
        </div>
      )}
      {run?.resumed_by_run_id && (
        <Alert
          showIcon
          type="info"
          message={t("此运行已恢复", "This run has been resumed")}
          description={t(
            "审核结果已提交，后续步骤在新的运行记录中继续。",
            "The review was submitted. Execution continues in a new run record.",
          )}
          action={
            <Button
              size="small"
              onClick={() => onResumed(run.resumed_by_run_id!)}
            >
              {t("查看后续运行", "View continuation")}
            </Button>
          }
        />
      )}
      {waiting && (
        <div className="ff-review">
          <Alert
            type="warning"
            showIcon
            message={t("等待人工处理", "Waiting for human review")}
            description={t(
              "检查节点输出与审核请求后，选择通过或拒绝。",
              "Inspect node outputs and the review request, then approve or reject.",
            )}
          />
          {blocked.length > 1 && (
            <Select
              value={reviewNode}
              options={blocked.map((id) => ({
                label: run?.node_details?.[id]?.label || id,
                value: id,
              }))}
              onChange={setReviewNode}
              placeholder={t("选择待处理节点", "Select a node to review")}
              style={{ width: "100%", marginTop: 12 }}
            />
          )}
          <Input.TextArea
            aria-label={t("审核意见", "Review comments")}
            value={comments}
            onChange={(event: any) => setComments(event.target.value)}
            placeholder={t("审核意见（可选）", "Review comments (optional)")}
            style={{ margin: "12px 0" }}
          />
          <Space>
            <Button
              type="primary"
              aria-label={t("通过并继续", "Approve and continue")}
              loading={resuming}
              disabled={blocked.length > 1 && !reviewNode}
              onClick={() => resume(true)}
            >
              {t("通过并继续", "Approve and continue")}
            </Button>
            <Button
              danger
              aria-label={t("拒绝", "Reject")}
              loading={resuming}
              disabled={blocked.length > 1 && !reviewNode}
              onClick={() => resume(false)}
            >
              {t("拒绝", "Reject")}
            </Button>
          </Space>
        </div>
      )}
      {run ? (
        <RunValueScope.Provider
          value={{ runId: run.run_id, agentId: run.agent_id }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              margin: "16px 0",
            }}
          >
            <Tag color={color(run.status)}>
              {t(labels[run.status] || run.status)}
            </Tag>
            <Typography.Text type="secondary">
              {run.status === "running" && !run.duration_ms
                ? t("耗时统计中", "Timing in progress")
                : `${run.duration_ms ?? "—"} ms`}{" "}
              · {t("版本", "Revision")} {run.flow_revision ?? "—"}
            </Typography.Text>
          </div>
          <details className="ff-spaced">
            <summary>{t("运行关联", "Related runs")}</summary>
            <div className="ff-inspector-meta">
              <span>
                {t("工作流", "Workflow")}：{run.flow_id}
              </span>
              <span>
                {t("运行", "Run")}：{run.run_id}
              </span>
            </div>
            {run.resumed_from_run_id && (
              <Button
                size="small"
                onClick={() => onResumed(run.resumed_from_run_id!)}
              >
                {t("查看恢复前运行", "View original run")}
              </Button>
            )}
            {run.root_run_id &&
              run.root_run_id !== run.run_id &&
              run.root_run_id !== run.parent_run_id && (
                <Button
                  size="small"
                  onClick={() => onResumed(run.root_run_id!)}
                >
                  {t("查看根运行", "View root run")}
                </Button>
              )}
          </details>
          <Tabs
            items={[
              {
                key: "nodes",
                label: t("节点检查", "Node inspector"),
                children: (
                  <RunInspector
                    runId={run.run_id}
                    agentId={run.agent_id}
                    nodes={run.node_details}
                    statuses={run.node_statuses || {}}
                    events={visibleEvents}
                    antd={antd}
                    onRepair={
                      onRepair &&
                      run.run_id === runId &&
                      (!agentId || (run.agent_id || "default") === agentId)
                        ? (nodeId) => {
                            if (ownsVisit())
                              onRepair({
                                runId: run.run_id,
                                flowId: run.flow_id,
                                nodeId,
                              });
                          }
                        : undefined
                    }
                  />
                ),
              },
              {
                key: "analytics",
                label: t("运行分析", "Run analytics"),
                children: (
                  <RunAnalytics
                    key={run.run_id}
                    nodes={run.node_details}
                    statuses={run.node_statuses || {}}
                    events={run.events?.length ? run.events : visibleEvents}
                    error={
                      typeof run.error === "string"
                        ? String(safeRunValue(run.error))
                        : undefined
                    }
                  />
                ),
              },
              {
                key: "outputs",
                label: t("输出", "Outputs"),
                children: Object.keys(run.outputs || {}).length ? (
                  <RunValue
                    value={run.outputs}
                    interactive
                    nodeIds={Object.keys(run.node_details || {})}
                  />
                ) : (
                  <Empty description={t("暂无输出", "No outputs")} />
                ),
              },
              {
                key: "errors",
                label: t("错误", "Errors"),
                children:
                  run.error || run.errors?.length ? (
                    <Alert
                      type="error"
                      message={safeRunValue(
                        run.error || t("节点执行错误", "Node execution error"),
                      )}
                      description={<RunValue value={run.errors || []} />}
                    />
                  ) : (
                    <Empty description={t("无错误", "No errors")} />
                  ),
              },
              {
                key: "events",
                label: `${t("事件流", "Events")} (${visibleEvents.length})`,
                children: (
                  <>
                    <Typography.Text type="secondary">
                      {t(
                        "保留最近 1000 条事件，下方显示其中最近 80 条。",
                        "Retaining the latest 1,000 events and showing the latest 80 below.",
                      )}
                    </Typography.Text>
                    <Timeline
                      items={visibleEvents.slice(-80).map((event, index) => ({
                        key: index,
                        children: (
                          <div>
                            <strong>{event.type}</strong>
                            {event.node_id && <span> · {event.node_id}</span>}
                            {(event.state || event.data) && (
                              <RunValue
                                value={{ state: event.state, data: event.data }}
                              />
                            )}
                          </div>
                        ),
                      }))}
                    />
                  </>
                ),
              },
            ]}
          />
        </RunValueScope.Provider>
      ) : !loading && !error ? (
        <Empty description={t("未找到运行记录", "Run record not found")} />
      ) : null}
    </RunSurface>
  );
}

export function RunHistory({
  open,
  flowId,
  onClose,
  onSelect,
  antd,
  api,
  agentId,
}: {
  open: boolean;
  flowId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  antd: any;
  api: Api;
  agentId?: string;
}) {
  const { t } = useWorkflowI18n();
  const { Drawer, Table, Button, Tag, Alert, Input, Select, Space } = antd;
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState("");
  const [revision, setRevision] = useState(""),
    [agentFilter, setAgentFilter] = useState("");
  const [afterDate, setAfterDate] = useState(""),
    [beforeDate, setBeforeDate] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [comparison, setComparison] = useState<string[]>([]);
  useEffect(() => {
    setSelected([]);
    setComparison([]);
    setRuns([]);
    setError("");
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    api<RunRecord[]>("/flowforge/runs", {
      signal: controller.signal,
      ...(agentId ? { headers: { "X-Agent-Id": agentId } } : {}),
    })
      .then((data) => {
        if (!controller.signal.aborted)
          setRuns(data.filter((run) => !flowId || run.flow_id === flowId));
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open, flowId, agentId, api]);
  const from = afterDate
    ? new Date(`${afterDate}T00:00:00`).getTime() / 1000
    : -Infinity;
  const until = beforeDate
    ? new Date(`${beforeDate}T23:59:59.999`).getTime() / 1000
    : Infinity;
  const filtered = runs.filter(
    (run) =>
      (!query ||
        `${run.flow_id} ${run.run_id}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!status || run.status === status) &&
      (!revision || String(run.flow_revision) === revision) &&
      (!agentFilter || run.agent_id === agentFilter) &&
      run.started_at >= from &&
      run.started_at <= until,
  );
  const selectedFlow = runs.find((run) => run.run_id === selected[0])?.flow_id;
  const allAgents = Array.from(
    new Set(runs.map((run) => run.agent_id).filter(Boolean)),
  );
  return (
    <Drawer
      title={
        flowId
          ? t("当前工作流运行记录", "Workflow run history")
          : t("全部运行记录", "All run history")
      }
      open={open}
      onClose={onClose}
      width={960}
    >
      {error && <Alert type="error" message={safeRunValue(error)} />}
      <Space wrap className="ff-spaced">
        <Input
          aria-label={t("搜索运行", "Search runs")}
          placeholder={t("搜索工作流或运行 ID", "Workflow or run ID")}
          value={query}
          onChange={(event: any) => setQuery(event.target.value)}
          allowClear
        />
        <Select
          aria-label={t("运行状态筛选", "Filter run status")}
          value={status}
          onChange={setStatus}
          style={{ minWidth: 150 }}
          options={[
            { value: "", label: t("全部状态", "All statuses") },
            ...[
              "queued",
              "running",
              "completed",
              "failed",
              "cancelled",
              "timeout",
              "paused",
              "waiting_human",
            ].map((value) => ({ value, label: t(labels[value] || value) })),
          ]}
        />
        <Input
          aria-label={t("修订筛选", "Filter revision")}
          placeholder={t("修订", "Revision")}
          value={revision}
          onChange={(event: any) => setRevision(event.target.value)}
          style={{ width: 100 }}
        />
        <Select
          aria-label={t("运行专家筛选", "Filter run agent")}
          value={agentFilter}
          onChange={setAgentFilter}
          style={{ minWidth: 150 }}
          options={[
            { value: "", label: t("全部专家", "All agents") },
            ...allAgents.map((value) => ({ value, label: value })),
          ]}
        />
        <input
          type="date"
          aria-label={t("起始日期", "Start date")}
          value={afterDate}
          onChange={(event) => setAfterDate(event.target.value)}
        />
        <input
          type="date"
          aria-label={t("结束日期", "End date")}
          value={beforeDate}
          onChange={(event) => setBeforeDate(event.target.value)}
        />
        <Button
          disabled={selected.length !== 2}
          onClick={() => setComparison([...selected])}
        >
          {t("比较所选运行", "Compare selected runs")}
        </Button>
        <Button
          onClick={() => {
            setQuery("");
            setStatus("");
            setRevision("");
            setAgentFilter("");
            setAfterDate("");
            setBeforeDate("");
            setSelected([]);
            setComparison([]);
          }}
        >
          {t("重置筛选", "Reset filters")}
        </Button>
      </Space>
      <p className="ff-muted">
        {t(
          "选择同一工作流的两次运行，比较其保存的节点输入、输出和配置记录。",
          "Select two runs of the same workflow to compare recorded node inputs, outputs and configuration.",
        )}
      </p>
      <Table
        rowKey="run_id"
        loading={loading}
        dataSource={filtered}
        size="small"
        pagination={{ pageSize: 12 }}
        scroll={{ x: 720 }}
        rowSelection={{
          selectedRowKeys: selected,
          onChange: (keys: React.Key[]) => {
            setSelected(keys.map(String).slice(-2));
            setComparison([]);
          },
          getCheckboxProps: (record: RunRecord) => ({
            disabled:
              !selected.includes(record.run_id) &&
              (selected.length >= 2 ||
                Boolean(selectedFlow && record.flow_id !== selectedFlow)),
          }),
        }}
        columns={[
          {
            title: t("工作流", "Workflow"),
            dataIndex: "flow_id",
            ellipsis: true,
          },
          {
            title: t("运行", "Run"),
            dataIndex: "run_id",
            render: (value: string) => (
              <span title={value}>{value.slice(0, 8)}</span>
            ),
          },
          {
            title: t("开始时间", "Started"),
            dataIndex: "started_at",
            render: (value: number) => new Date(value * 1000).toLocaleString(),
          },
          { title: t("版本", "Revision"), dataIndex: "flow_revision" },
          {
            title: t("耗时", "Duration"),
            dataIndex: "duration_ms",
            render: (value?: number) =>
              value == null ? t("未记录", "Not recorded") : `${value} ms`,
          },
          {
            title: t("状态", "Status"),
            dataIndex: "status",
            render: (value: string) => (
              <Tag color={color(value)}>{t(labels[value] || value)}</Tag>
            ),
          },
          {
            title: t("操作", "Actions"),
            key: "actions",
            render: (_: unknown, row: RunRecord) => (
              <Button size="small" onClick={() => onSelect(row.run_id)}>
                {t("查看", "View")}
              </Button>
            ),
          },
        ]}
      />
      {comparison.length === 2 && selectedFlow && (
        <RunComparison
          runIds={comparison}
          flowId={selectedFlow}
          agentId={agentId}
          api={api}
          antd={antd}
        />
      )}
    </Drawer>
  );
}
