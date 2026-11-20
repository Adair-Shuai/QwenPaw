import React, { useContext, useEffect, useState } from "react";
import { useWorkflowI18n } from "./i18n";
import { RunValueScope, RunValueViews } from "./RunValueViews";
// @ts-ignore — blob-loaded plugins embed styles rather than loading CSS URLs.
import inspectorCss from "./run-inspector.css?inline";

if (typeof document !== "undefined" && typeof inspectorCss === "string") {
  const styleId = "flowforge-run-inspector-css";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = inspectorCss;
    document.head.appendChild(style);
  }
}

export interface RunNodeDetail {
  id: string;
  label?: string;
  class_type?: string;
  status?: string;
  inputs_available?: boolean;
  inputs?: unknown;
  outputs?: unknown;
  duration_ms?: number;
  started_at_ms?: number;
  finished_at_ms?: number;
  retry_count?: number;
  timeline?: {
    started_at_ms?: number;
    finished_at_ms?: number;
    status?: string;
    retry_count?: number;
  }[];
  usage_summary?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    recorded_executions?: number;
    executions?: number;
    incomplete?: boolean;
  };
  error?: unknown;
  debug_pinned?: boolean;
  metadata?: Record<string, any>;
  configuration?: Record<string, unknown>;
}

export interface RunEvent {
  type: string;
  node_id?: string;
  state?: {
    status?: string;
    error?: string;
    preview?: unknown;
    message?: string;
    started_at_ms?: number;
    finished_at_ms?: number;
    execution_index?: number;
    metadata?: Record<string, unknown>;
  };
  data?: Record<string, unknown>;
}

export const runStatusLabels: Record<string, string> = {
  queued: "排队中",
  pending: "等待执行",
  not_executed: "未执行",
  running: "执行中",
  success: "完成",
  completed: "已完成",
  cached: "使用缓存",
  failed: "失败",
  error: "错误",
  cancelled: "已取消",
  timeout: "已超时",
  waiting_human: "等待审核",
  paused: "已暂停",
  blocked: "待处理",
  skipped: "已跳过",
};

// The server owns credential-value redaction. This is a display-only fallback
// for legacy records; it never modifies values passed to workflow execution.
export function safeRunValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(safeRunValue);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /(?:api.?key|access.?token|refresh.?token|password|passwd|secret|authorization|cookie|private.?key|credential)/i.test(
          key,
        )
          ? "[redacted]"
          : safeRunValue(item),
      ]),
    );
  if (typeof value === "string")
    return value
      .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [redacted]")
      .replace(/\bsk-[A-Za-z0-9_-]{12,}/g, "[redacted]");
  return value;
}

export function RunValue({
  value,
  nodeIds,
  interactive = false,
  outputSlots = false,
}: {
  value: unknown;
  nodeIds?: string[];
  interactive?: boolean;
  outputSlots?: boolean;
}): React.ReactElement {
  const scope = useContext(RunValueScope);
  // Only the workflow output map can index node identities. Nested business
  // objects still receive the ordinary credential-field fallback.
  const safe =
    nodeIds && value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).map(([key, item]) => [
            key,
            nodeIds.includes(key)
              ? safeRunValue(item)
              : (safeRunValue({ [key]: item }) as Record<string, unknown>)[key],
          ]),
        )
      : safeRunValue(value);
  if (!interactive)
    return (
      <pre className="ff-code ff-inspector-value">
        {JSON.stringify(safe, null, 2)}
      </pre>
    );
  return (
    <RunValueViews
      key={`${scope.runId}:${scope.agentId}`}
      value={safe}
      outputSlots={outputSlots}
      redact={safeRunValue}
    />
  );
}

export function RunInspector({
  runId,
  nodes,
  statuses,
  events,
  antd,
  agentId,
  onRepair,
}: {
  runId: string;
  agentId?: string;
  nodes?: Record<string, RunNodeDetail>;
  statuses: Record<string, string>;
  events: RunEvent[];
  antd: any;
  onRepair?: (nodeId: string) => void;
}) {
  const { t } = useWorkflowI18n();
  const { Tag, Empty, Typography, Button } = antd;
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => setSelected(null), [runId]);
  // Never read the current editor graph: a historical run belongs to its own
  // immutable revision, including nodes later renamed or removed.
  const ids = Array.from(
    new Set([
      ...Object.keys(nodes || {}),
      ...Object.keys(statuses),
      ...events.flatMap((event) => (event.node_id ? [event.node_id] : [])),
    ]),
  );
  const id = selected && ids.includes(selected) ? selected : ids[0];
  const detail = nodes?.[id];
  const nodeEvents = events.filter((event) => event.node_id === id);
  const latestState = [...nodeEvents].reverse().find((event) => event.state)
    ?.state;
  const statusOf = (nodeId: string) =>
    statuses[nodeId] || nodes?.[nodeId]?.status || "not_executed";
  const labelOf = (nodeId: string) => nodes?.[nodeId]?.label || nodeId;
  const duration = detail?.duration_ms ?? latestState?.metadata?.duration_ms;
  const error = detail?.error ?? latestState?.error;
  // Workflow output names may coincide with a node ID. Only the server's
  // node-specific observation can establish that this is a node output.
  const hasOutput = Object.prototype.hasOwnProperty.call(
    detail || {},
    "outputs",
  );
  const output = detail?.outputs;

  if (!ids.length)
    return <Empty description={t("暂无节点状态", "No node observations")} />;
  return (
    <RunValueScope.Provider value={{ runId, agentId }}>
      <div className="ff-inspector">
        <div
          className="ff-inspector-nodes"
          role="group"
          aria-label={t("选择运行节点", "Select run node")}
        >
          {ids.map((nodeId) => (
            <button
              key={nodeId}
              type="button"
              className="ff-inspector-node"
              aria-pressed={nodeId === id}
              aria-label={t("检查节点 {label}", "Inspect node {label}", {
                label: labelOf(nodeId),
              })}
              onClick={() => setSelected(nodeId)}
            >
              <span>{labelOf(nodeId)}</span>
              <Tag>
                {t(runStatusLabels[statusOf(nodeId)] || statusOf(nodeId))}
              </Tag>
            </button>
          ))}
        </div>
        <section
          className="ff-inspector-detail"
          aria-label={t("节点详情 {label}", "Node details {label}", {
            label: labelOf(id),
          })}
        >
          <strong>{labelOf(id)}</strong>
          {onRepair &&
            ["failed", "error", "timeout"].includes(statusOf(id)) && (
              <Button
                size="small"
                aria-label={t("AI 修复节点 {label}", "AI repair node {label}", {
                  label: labelOf(id),
                })}
                onClick={() => onRepair(id)}
              >
                {t("AI 修复", "AI repair")}
              </Button>
            )}
          <div className="ff-inspector-meta">
            <code>{id}</code>
            {detail?.class_type && <span>{detail.class_type}</span>}
            <span>
              {t("耗时：", "Duration ")}
              {typeof duration === "number" && Number.isFinite(duration)
                ? `${duration} ms`
                : t("未记录", "Not recorded")}
            </span>
            {detail?.debug_pinned && (
              <Tag color="purple">{t("固定测试数据", "Pinned test data")}</Tag>
            )}
            {detail?.metadata?.provider && (
              <span>
                {t("供应商", "Provider")} {detail.metadata.provider}
              </span>
            )}
            {detail?.metadata?.model && (
              <span>
                {t("实际模型", "Actual model")} {detail.metadata.model}
              </span>
            )}
          </div>
          <Typography.Text type="secondary">
            {t(
              "本次运行的节点记录。未执行、等待执行与已跳过分别保留实际状态。",
              "Recorded observations for this run, including unexecuted, waiting and skipped nodes.",
            )}
          </Typography.Text>
          {detail?.metadata?.usage && (
            <details>
              <summary>{t("模型用量", "Model usage")}</summary>
              <RunValue value={detail.metadata.usage} />
            </details>
          )}
          <h4>{t("实际输入", "Actual inputs")}</h4>
          {detail?.inputs_available &&
          Object.prototype.hasOwnProperty.call(detail, "inputs") ? (
            <RunValue value={detail.inputs} />
          ) : (
            <Typography.Text type="secondary">
              {t(
                "此运行未记录解析后的实际输入，不能用当前配置还原。",
                "Resolved inputs were not recorded for this run.",
              )}
            </Typography.Text>
          )}
          <h4>{t("节点输出", "Node outputs")}</h4>
          {hasOutput ? (
            <RunValue
              key={`${runId}:${id}:outputs`}
              value={output}
              interactive
              outputSlots
            />
          ) : (
            <Typography.Text type="secondary">
              {t("尚无已记录的节点输出。", "No recorded node output yet.")}
            </Typography.Text>
          )}
          {error != null && (
            <>
              <h4>{t("节点错误", "Node error")}</h4>
              <RunValue value={error} />
            </>
          )}
          <h4>
            {t("节点事件（{count}）", "Node events ({count})", {
              count: nodeEvents.length,
            })}
          </h4>
          {nodeEvents.length ? (
            <ol className="ff-inspector-events">
              {nodeEvents.slice(-80).map((event, index) => (
                <li key={index}>
                  <strong>{event.type}</strong>
                  <RunValue
                    value={{
                      ...(event.state ? { state: event.state } : {}),
                      ...(event.data ? { data: event.data } : {}),
                    }}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <Typography.Text type="secondary">
              {t("暂无此节点事件。", "No events for this node.")}
            </Typography.Text>
          )}
        </section>
      </div>
    </RunValueScope.Provider>
  );
}
