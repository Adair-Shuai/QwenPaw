import React, { useEffect, useRef, useState } from "react";
import { parseRuntimeInputs, type Api, type FlowDocument } from "./model";

interface RunRecord {
  run_id: string;
  flow_id: string;
  status: string;
  node_statuses: Record<string, string>;
  outputs: Record<string, any>;
  errors: any[];
  error?: string;
  started_at: number;
  duration_ms: number;
  flow_revision?: number;
  resumed_by_run_id?: string;
  parent_run_id?: string;
  root_run_id?: string;
  resumed_from_run_id?: string;
}
const labels: Record<string, string> = {
  pending: "待运行",
  running: "执行中",
  success: "完成",
  completed: "已完成",
  failed: "失败",
  error: "错误",
  cancelled: "已取消",
  timeout: "已超时",
  waiting_human: "等待审核",
  paused: "已暂停",
  blocked: "待处理",
  skipped: "已跳过",
};
const color = (state: string) =>
  ["completed", "success"].includes(state)
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
      title={`试运行 · ${flow?.name || "工作流"}`}
      open={!!flow}
      onCancel={busy ? undefined : onClose}
      okText="开始运行"
      cancelText="取消"
      okButtonProps={{ "aria-label": "开始运行" }}
      confirmLoading={busy}
      maskClosable={!busy}
      onOk={async () => {
        setError("");
        setBusy(true);
        try {
          await onRun(parseRuntimeInputs(flow?.inputs || [], values));
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
        message="将执行已保存版本"
        description="工具节点会调用真实能力，请检查输入参数与业务条件。"
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
          此工作流没有额外输入参数。
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
}: {
  runId: string | null;
  onClose: () => void;
  onStatusUpdate: (statuses: Record<string, string>, flowId: string) => void;
  onResumed: (id: string) => void;
  antd: any;
  api: Api;
  streamUrl: (path: string) => string;
  headers: () => Record<string, string>;
}) {
  const {
    Drawer,
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
    [events, setEvents] = useState<any[]>([]);
  const [children, setChildren] = useState<RunRecord[]>([]);
  const [error, setError] = useState(""),
    [streamError, setStreamError] = useState(""),
    [loading, setLoading] = useState(false);
  const [comments, setComments] = useState(""),
    [reviewNode, setReviewNode] = useState<string | undefined>(),
    [resuming, setResuming] = useState(false);
  const update = useRef(onStatusUpdate);
  update.current = onStatusUpdate;
  const refreshRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    if (!runId) return;
    let alive = true,
      timer: ReturnType<typeof setTimeout> | undefined;
    setRun(null);
    setEvents([]);
    setChildren([]);
    setError("");
    setStreamError("");
    setComments("");
    setReviewNode(undefined);
    setLoading(true);
    const controller = new AbortController();
    let familyKey = "";
    const refresh = async () => {
      try {
        const record = await api<RunRecord>(
          `/flowforge/runs/${encodeURIComponent(runId)}`,
        );
        if (alive) {
          setRun(record);
          setError("");
          update.current(record.node_statuses || {}, record.flow_id);
          const key = `${record.status}:${
            Object.keys(record.node_statuses || {}).length
          }`;
          if (familyKey !== key) {
            familyKey = key;
            try {
              const related = await api<RunRecord[]>("/flowforge/runs");
              if (alive)
                setChildren(
                  related.filter((entry) => entry.parent_run_id === runId),
                );
            } catch {
              /* Run polling stays available if the history list fails. */
            }
          }
        }
      } catch (failure: any) {
        if (alive) setError(`无法读取运行状态：${failure.message}`);
      } finally {
        if (alive) setLoading(false);
      }
    };
    refreshRef.current = refresh;
    const poll = async () => {
      await refresh();
      if (alive) timer = setTimeout(poll, 2000);
    };
    void poll();
    (async () => {
      try {
        const response = await fetch(
          streamUrl(`/flowforge/runs/${encodeURIComponent(runId)}/events`),
          { headers: headers(), signal: controller.signal },
        );
        if (!response.ok || !response.body)
          throw new Error(`HTTP ${response.status}`);
        const reader = response.body.getReader(),
          decoder = new TextDecoder();
        let buffer = "";
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
              const event = JSON.parse(data);
              if (alive)
                setEvents((previous) => [...previous.slice(-999), event]);
            }
            match = /\r?\n\r?\n/.exec(buffer);
          }
        }
        if (alive) await refresh();
      } catch {
        if (alive) setStreamError("实时事件连接中断，运行状态仍每 2 秒刷新。");
      }
    })();
    return () => {
      alive = false;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [runId]);
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
      onResumed(result.run_id);
    } catch (failure: any) {
      setError(`恢复失败：${failure.message}`);
    } finally {
      setResuming(false);
    }
  };
  return (
    <Drawer
      title={runId ? `运行监控 · ${runId.slice(0, 8)}` : "运行监控"}
      open={!!runId}
      onClose={onClose}
      width={580}
      extra={
        run &&
        !finished && (
          <Button
            danger
            onClick={async () => {
              try {
                await api(
                  `/flowforge/runs/${encodeURIComponent(runId!)}/cancel`,
                  { method: "POST" },
                );
                await refreshRef.current();
              } catch (failure: any) {
                setError(failure.message);
              }
            }}
          >
            取消运行
          </Button>
        )
      }
    >
      {loading && !run && <Spin />}
      {error && (
        <Alert type="error" showIcon message={error} className="ff-spaced" />
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
          返回父工作流运行
        </Button>
      )}
      {!!children.length && (
        <div className="ff-child-runs">
          <strong>子工作流运行</strong>
          {children.map((child) => (
            <div className="ff-run-node" key={child.run_id}>
              <span>
                {child.flow_id} ·{" "}
                {child.resumed_by_run_id
                  ? "已恢复"
                  : labels[child.status] || child.status}
              </span>
              <Button
                size="small"
                onClick={() =>
                  onResumed(child.resumed_by_run_id || child.run_id)
                }
              >
                查看
                {["paused", "waiting_human"].includes(child.status) &&
                !child.resumed_by_run_id
                  ? "并处理"
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
          message="此运行已恢复"
          description="审核结果已提交，后续步骤在新的运行记录中继续。"
          action={
            <Button
              size="small"
              onClick={() => onResumed(run.resumed_by_run_id!)}
            >
              查看后续运行
            </Button>
          }
        />
      )}
      {waiting && (
        <div className="ff-review">
          <Alert
            type="warning"
            showIcon
            message="等待人工处理"
            description="检查节点输出与审核请求后，选择通过或拒绝。"
          />
          {blocked.length > 1 && (
            <Select
              value={reviewNode}
              options={blocked.map((id) => ({ label: id, value: id }))}
              onChange={setReviewNode}
              placeholder="选择待处理节点"
              style={{ width: "100%", marginTop: 12 }}
            />
          )}
          <Input.TextArea
            aria-label="审核意见"
            value={comments}
            onChange={(event: any) => setComments(event.target.value)}
            placeholder="审核意见（可选）"
            style={{ margin: "12px 0" }}
          />
          <Space>
            <Button
              type="primary"
              aria-label="通过并继续"
              loading={resuming}
              disabled={blocked.length > 1 && !reviewNode}
              onClick={() => resume(true)}
            >
              通过并继续
            </Button>
            <Button
              danger
              aria-label="拒绝"
              loading={resuming}
              disabled={blocked.length > 1 && !reviewNode}
              onClick={() => resume(false)}
            >
              拒绝
            </Button>
          </Space>
        </div>
      )}
      {run ? (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              margin: "16px 0",
            }}
          >
            <Tag color={color(run.status)}>
              {labels[run.status] || run.status}
            </Tag>
            <Typography.Text type="secondary">
              {run.duration_ms || 0} ms · 版本 {run.flow_revision ?? "—"}
            </Typography.Text>
          </div>
          <Tabs
            items={[
              {
                key: "nodes",
                label: "节点状态",
                children: Object.entries(run.node_statuses || {}).length ? (
                  Object.entries(run.node_statuses).map(([id, state]) => (
                    <div key={id} className="ff-run-node">
                      <code>{id}</code>
                      <Tag color={color(state)}>{labels[state] || state}</Tag>
                    </div>
                  ))
                ) : (
                  <Empty description="暂无节点状态" />
                ),
              },
              {
                key: "outputs",
                label: "输出",
                children: Object.keys(run.outputs || {}).length ? (
                  <pre className="ff-code">
                    {JSON.stringify(run.outputs, null, 2)}
                  </pre>
                ) : (
                  <Empty description="暂无输出" />
                ),
              },
              {
                key: "errors",
                label: "错误",
                children:
                  run.error || run.errors?.length ? (
                    <Alert
                      type="error"
                      message={run.error || "节点执行错误"}
                      description={
                        <pre className="ff-code">
                          {JSON.stringify(run.errors || [], null, 2)}
                        </pre>
                      }
                    />
                  ) : (
                    <Empty description="无错误" />
                  ),
              },
              {
                key: "events",
                label: `事件流 (${events.length})`,
                children: (
                  <Timeline
                    items={events.slice(-80).map((event, index) => ({
                      key: index,
                      children: (
                        <div>
                          <strong>{event.type}</strong>
                          {event.node_id && <span> · {event.node_id}</span>}
                          {event.data && (
                            <pre className="ff-code">
                              {JSON.stringify(event.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      ),
                    }))}
                  />
                ),
              },
            ]}
          />
        </>
      ) : !loading && !error ? (
        <Empty description="未找到运行记录" />
      ) : null}
    </Drawer>
  );
}

export function RunHistory({
  open,
  flowId,
  onClose,
  onSelect,
  antd,
  api,
}: {
  open: boolean;
  flowId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  antd: any;
  api: Api;
}) {
  const { Drawer, Table, Button, Tag, Alert } = antd;
  const [runs, setRuns] = useState<RunRecord[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    setError("");
    api<RunRecord[]>("/flowforge/runs")
      .then((data) => {
        if (alive)
          setRuns(data.filter((run) => !flowId || run.flow_id === flowId));
      })
      .catch((failure) => {
        if (alive) setError(failure.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, flowId]);
  return (
    <Drawer
      title={flowId ? "当前工作流运行记录" : "全部运行记录"}
      open={open}
      onClose={onClose}
      width={700}
    >
      {error && <Alert type="error" message={error} />}
      <Table
        rowKey="run_id"
        loading={loading}
        dataSource={runs}
        size="small"
        pagination={{ pageSize: 12 }}
        columns={[
          { title: "工作流", dataIndex: "flow_id", ellipsis: true },
          {
            title: "开始时间",
            dataIndex: "started_at",
            render: (value: number) => new Date(value * 1000).toLocaleString(),
          },
          {
            title: "状态",
            dataIndex: "status",
            render: (value: string, row: RunRecord) => (
              <Tag color={color(value)}>
                {row.resumed_by_run_id ? "已恢复" : labels[value] || value}
              </Tag>
            ),
          },
          {
            title: "操作",
            key: "actions",
            render: (_: any, row: RunRecord) => (
              <Button size="small" onClick={() => onSelect(row.run_id)}>
                查看
              </Button>
            ),
          },
        ]}
      />
    </Drawer>
  );
}
