import React, { useEffect, useState } from "react";
import type { Api } from "./model";
import type { RunRecord } from "./runRecord";
import { RunValue, runStatusLabels, safeRunValue } from "./RunInspector";
import { useWorkflowI18n } from "./i18n";

interface Difference {
  path: string;
  before: unknown;
  after: unknown;
  beforePresent: boolean;
  afterPresent: boolean;
}

/** Compare recorded JSON values, preserving missing, null, false and zero. */
export function valueDifferences(
  before: unknown,
  after: unknown,
): Difference[] {
  const differences: Difference[] = [];
  const visit = (
    left: unknown,
    right: unknown,
    path: string,
    leftPresent = true,
    rightPresent = true,
    depth = 0,
  ) => {
    if (differences.length >= 200) return;
    if (leftPresent === rightPresent && Object.is(left, right)) return;
    if (
      depth < 12 &&
      leftPresent &&
      rightPresent &&
      left !== null &&
      right !== null &&
      typeof left === "object" &&
      typeof right === "object" &&
      Array.isArray(left) === Array.isArray(right)
    ) {
      const lhs = left as Record<string, unknown>;
      const rhs = right as Record<string, unknown>;
      const keys = new Set([...Object.keys(lhs), ...Object.keys(rhs)]);
      for (const key of keys) {
        visit(
          lhs[key],
          rhs[key],
          `${path}/${key.replace(/~/g, "~0").replace(/\//g, "~1")}`,
          Object.prototype.hasOwnProperty.call(lhs, key),
          Object.prototype.hasOwnProperty.call(rhs, key),
          depth + 1,
        );
        if (differences.length >= 200) break;
      }
      return;
    }
    differences.push({
      path: path || "/",
      before: left,
      after: right,
      beforePresent: leftPresent,
      afterPresent: rightPresent,
    });
  };
  visit(before, after, "");
  return differences;
}

export function RunComparison({
  runIds,
  flowId,
  agentId,
  api,
  antd,
}: {
  runIds: string[];
  flowId: string;
  agentId?: string;
  api: Api;
  antd: any;
}) {
  const { t } = useWorkflowI18n();
  const { Alert, Spin, Empty, Table, Switch } = antd;
  const [records, setRecords] = useState<RunRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlyChanged, setOnlyChanged] = useState(true);
  const firstId = runIds[0],
    secondId = runIds[1];
  useEffect(() => {
    setRecords([]);
    setError("");
    setLoading(false);
    if (!firstId || !secondId || firstId === secondId) return;
    const controller = new AbortController();
    setLoading(true);
    Promise.all(
      [firstId, secondId].map((id) =>
        api<RunRecord>(`/flowforge/runs/${encodeURIComponent(id)}`, {
          signal: controller.signal,
          ...(agentId ? { headers: { "X-Agent-Id": agentId } } : {}),
        }),
      ),
    )
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data.some((record) => record.flow_id !== flowId))
          throw new Error(t("只能比较同一工作流的运行记录"));
        setRecords(data);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [firstId, secondId, flowId, agentId, api]);

  if (loading) return <Spin aria-label={t("加载运行比较")} />;
  if (error) return <Alert type="error" message={safeRunValue(error)} />;
  if (records.length !== 2)
    return <Empty description={t("请选择两次运行进行比较")} />;
  const [before, after] = records;
  const ids = Array.from(
    new Set([
      ...Object.keys(before.node_details || {}),
      ...Object.keys(after.node_details || {}),
    ]),
  );
  const rows = ids
    .map((id) => {
      const left = before.node_details?.[id],
        right = after.node_details?.[id];
      const observation = (detail: typeof left) =>
        detail
          ? {
              status: detail.status,
              ...(detail.duration_ms != null
                ? { duration_ms: detail.duration_ms }
                : {}),
              ...(detail.inputs_available
                ? { inputs: safeRunValue(detail.inputs) }
                : {}),
              ...(Object.prototype.hasOwnProperty.call(detail, "outputs")
                ? { outputs: safeRunValue(detail.outputs) }
                : {}),
              ...(detail.error != null
                ? { error: safeRunValue(detail.error) }
                : {}),
              ...(detail.metadata
                ? { metadata: safeRunValue(detail.metadata) }
                : {}),
              ...(detail.configuration
                ? { configuration: safeRunValue(detail.configuration) }
                : {}),
            }
          : undefined;
      const differences = valueDifferences(
        observation(left),
        observation(right),
      );
      return {
        id,
        label: right?.label || left?.label || id,
        left,
        right,
        differences,
      };
    })
    .filter((row) => !onlyChanged || row.differences.length > 0);
  const outputDifferences = valueDifferences(
    safeOutput(before),
    safeOutput(after),
  );
  return (
    <section aria-label={t("运行比较")} className="ff-run-comparison">
      <p className="ff-muted">
        {t(
          "比较已保存的运行快照，字段路径使用 JSON Pointer。最多展示 200 处差异。",
        )}
      </p>
      <div className="ff-compare-summary">
        {records.map((record) => (
          <article key={record.run_id}>
            <strong>{record.run_id.slice(0, 8)}</strong>
            <div>
              {t("修订")} {record.flow_revision ?? "—"} ·{" "}
              {t(runStatusLabels[record.status] || record.status)}
            </div>
            <div>
              {record.duration_ms ?? "—"} ms · {record.agent_id || t("未记录")}
            </div>
          </article>
        ))}
      </div>
      <label className="ff-compare-filter">
        <Switch checked={onlyChanged} onChange={setOnlyChanged} size="small" />
        {t("仅显示有差异的节点")}
      </label>
      <Table
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10 }}
        dataSource={rows}
        locale={{ emptyText: t("未发现节点差异") }}
        columns={[
          { title: t("节点"), dataIndex: "label" },
          {
            title: t("前次耗时"),
            render: (_: unknown, row: (typeof rows)[number]) =>
              row.left?.duration_ms == null
                ? t("未记录")
                : `${row.left.duration_ms} ms`,
          },
          {
            title: t("后次耗时"),
            render: (_: unknown, row: (typeof rows)[number]) =>
              row.right?.duration_ms == null
                ? t("未记录")
                : `${row.right.duration_ms} ms`,
          },
          {
            title: t("差异数"),
            render: (_: unknown, row: (typeof rows)[number]) =>
              row.differences.length,
          },
        ]}
        expandable={{
          rowExpandable: (row: (typeof rows)[number]) =>
            row.differences.length > 0,
          expandedRowRender: (row: (typeof rows)[number]) => (
            <DifferenceList differences={row.differences} />
          ),
        }}
      />
      <h4>{t("工作流输出差异")}</h4>
      <DifferenceList differences={outputDifferences} />
    </section>
  );
}

function safeOutput(record: RunRecord) {
  const nodeIds = new Set(Object.keys(record.node_details || {}));
  return Object.fromEntries(
    Object.entries(record.outputs || {}).map(([key, value]) => [
      key,
      nodeIds.has(key)
        ? safeRunValue(value)
        : (safeRunValue({ [key]: value }) as Record<string, unknown>)[key],
    ]),
  );
}

function DifferenceList({ differences }: { differences: Difference[] }) {
  const { t } = useWorkflowI18n();
  if (!differences.length) return <p>{t("相同")}</p>;
  return (
    <ol className="ff-differences">
      {differences.map((difference) => (
        <li key={difference.path}>
          <code>{difference.path}</code>
          <div className="ff-compare-summary">
            <div>
              <strong>{t("前次")}</strong>
              {difference.beforePresent ? (
                <RunValue value={difference.before} />
              ) : (
                <p>{t("未记录")}</p>
              )}
            </div>
            <div>
              <strong>{t("后次")}</strong>
              {difference.afterPresent ? (
                <RunValue value={difference.after} />
              ) : (
                <p>{t("未记录")}</p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
