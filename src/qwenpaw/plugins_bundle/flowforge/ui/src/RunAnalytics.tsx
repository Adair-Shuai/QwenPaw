import React, { useState } from "react";
import { useWorkflowI18n } from "./i18n";
import {
  safeRunValue,
  type RunEvent,
  type RunNodeDetail,
} from "./RunInspector";

const count = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;

function usageCounts(usage: Record<string, unknown> | undefined) {
  const input = count(usage?.input_tokens) ?? count(usage?.prompt_tokens);
  const output = count(usage?.output_tokens) ?? count(usage?.completion_tokens);
  return {
    input,
    output,
    total:
      count(usage?.total_tokens) ??
      (input !== undefined && output !== undefined
        ? input + output
        : undefined),
  };
}

export function RunAnalytics({
  nodes = {},
  statuses,
  events,
  error,
}: {
  nodes?: Record<string, RunNodeDetail>;
  statuses: Record<string, string>;
  events: RunEvent[];
  error?: string;
}) {
  const { t, locale } = useWorkflowI18n();
  const [inputRate, setInputRate] = useState("");
  const [outputRate, setOutputRate] = useState("");
  const [currency, setCurrency] = useState("");
  const ids = Array.from(
    new Set([
      ...Object.keys(nodes),
      ...Object.keys(statuses),
      ...events.flatMap((event) => (event.node_id ? [event.node_id] : [])),
    ]),
  );
  const rows = ids.map((id) => {
    const detail = nodes[id];
    const nodeEvents = events.filter((event) => event.node_id === id);
    const observed = nodeEvents
      .filter((event) => event.state)
      .map((event) => event.state!);
    const latest = observed[observed.length - 1];
    const retry =
      detail?.retry_count ??
      observed.reduce<number | undefined>((value, state) => {
        const recorded = count(state.metadata?.retry);
        return recorded === undefined ? value : Math.max(value ?? 0, recorded);
      }, undefined);
    const timeline = detail?.timeline?.length
      ? detail.timeline
      : [
          {
            started_at_ms:
              detail?.started_at_ms ??
              observed.find((state) => count(state.started_at_ms) !== undefined)
                ?.started_at_ms,
            finished_at_ms: detail?.finished_at_ms ?? latest?.finished_at_ms,
          },
        ];
    const status = statuses[id] || detail?.status || latest?.status;
    const failure = ["failed", "error", "timeout"].includes(status || "");
    const summary = detail?.usage_summary;
    const cached = status === "cached" || detail?.debug_pinned;
    const usage = summary || (cached ? undefined : detail?.metadata?.usage);
    return {
      id,
      detail,
      status,
      retry,
      timeline,
      label: detail?.label || id,
      error: failure
        ? detail?.error ??
          [...observed].reverse().find((state) => state.error)?.error
        : undefined,
      failure,
      usage: usageCounts(usage),
      partial: !!summary?.incomplete || (!!usage && !summary),
    };
  });
  const starts = rows.flatMap((row) =>
    row.timeline.flatMap((timing) =>
      count(timing.started_at_ms) === undefined ? [] : [timing.started_at_ms!],
    ),
  );
  const origin = starts.length ? Math.min(...starts) : undefined;
  const ends = rows.flatMap((row) =>
    row.timeline.flatMap((timing) =>
      count(timing.finished_at_ms) === undefined
        ? []
        : [timing.finished_at_ms!],
    ),
  );
  const span =
    origin === undefined
      ? 1
      : Math.max(
          1,
          ...ends.map((end) => end - origin),
          ...starts.map((start) => start - origin),
        );
  const total = (field: "input" | "output" | "total") => {
    const values = rows.flatMap((row) =>
      row.usage[field] === undefined ? [] : [row.usage[field]!],
    );
    return values.length
      ? values.reduce((sum, value) => sum + value, 0)
      : undefined;
  };
  const input = total("input"),
    output = total("output"),
    tokens = total("total");
  const rate = (value: string) =>
    value.trim() ? count(Number(value)) : undefined;
  const inputPrice = rate(inputRate),
    outputPrice = rate(outputRate);
  const estimate =
    input !== undefined &&
    output !== undefined &&
    inputPrice !== undefined &&
    outputPrice !== undefined &&
    currency.trim()
      ? (input * inputPrice + output * outputPrice) / 1_000_000
      : undefined;
  const recordedRetries = rows.flatMap((row) =>
    row.retry === undefined ? [] : [row.retry],
  );
  const failures = rows.filter((row) => row.failure);
  return (
    <section
      className="ff-run-analytics"
      aria-label={t("运行分析", "Run analytics")}
    >
      <h4>{t("节点耗时瀑布图", "Node timing waterfall")}</h4>
      <p className="ff-muted">
        {t(
          "位置基于实际节点起止时间，以最早记录的节点开始为零点。缺少时间的旧记录单独标识。",
          "Positions use recorded node start and finish times, relative to the earliest recorded start. Older records with missing timestamps are marked.",
        )}
      </p>
      <ol
        className="ff-waterfall"
        aria-label={t("节点执行时间", "Node execution timing")}
      >
        {rows.map((row) => (
          <li key={row.id}>
            <strong>{row.label}</strong>
            <code>{row.id}</code>
            {row.timeline.map((timing, index) => {
              const start = count(timing.started_at_ms),
                finish = count(timing.finished_at_ms);
              const known =
                start !== undefined &&
                finish !== undefined &&
                finish >= start &&
                origin !== undefined;
              return (
                <div className="ff-waterfall-item" key={index}>
                  <div className="ff-waterfall-track">
                    {known && (
                      <span
                        className={`ff-waterfall-bar${
                          row.failure ? " ff-waterfall-failed" : ""
                        }`}
                        style={{
                          left: `${(100 * (start - origin)) / span}%`,
                          width: `${(100 * (finish - start)) / span}%`,
                        }}
                        title={`${new Date(start).toLocaleString(
                          locale === "zh" ? "zh-CN" : "en-US",
                        )} → ${new Date(finish).toLocaleString(
                          locale === "zh" ? "zh-CN" : "en-US",
                        )}`}
                        data-start-ms={start}
                        data-finish-ms={finish}
                      />
                    )}
                  </div>
                  <span>
                    {known
                      ? `${start - origin} ms · ${finish - start} ms`
                      : start !== undefined && finish === undefined
                      ? t(
                          "已记录开始，结束时间待记录",
                          "Start recorded, awaiting finish time",
                        )
                      : t(
                          "起止时间未记录",
                          "Start and finish times were not recorded",
                        )}
                  </span>
                </div>
              );
            })}
            <span>
              {t("重试 {count}", "Retries {count}", {
                count: row.retry ?? t("未记录", "Not recorded"),
              })}
            </span>
          </li>
        ))}
      </ol>
      <p>
        {t("已记录重试总数 {count}", "Recorded retries {count}", {
          count: recordedRetries.length
            ? recordedRetries.reduce((sum, value) => sum + value, 0)
            : t("未记录", "Not recorded"),
        })}
      </p>
      {recordedRetries.length < rows.length && (
        <p className="ff-muted">
          {t("部分节点缺少重试记录。", "Some nodes have no retry record.")}
        </p>
      )}
      <h4>{t("集中失败汇总", "Failure summary")}</h4>
      {failures.length ? (
        <ul>
          {failures.map((row) => (
            <li key={row.id}>
              <strong>{row.label}</strong> <code>{row.id}</code>
              <pre className="ff-code">
                {typeof row.error === "string"
                  ? String(safeRunValue(row.error))
                  : row.error === undefined
                  ? t("错误详情未记录", "Error detail was not recorded")
                  : JSON.stringify(safeRunValue(row.error), null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("当前没有失败节点", "No failed nodes in the current record")}</p>
      )}
      {error && <pre className="ff-code">{String(safeRunValue(error))}</pre>}
      <h4>{t("已记录 token 用量", "Recorded token usage")}</h4>
      <dl className="ff-usage-totals">
        <div>
          <dt>{t("输入 token", "Input tokens")}</dt>
          <dd>{input ?? "—"}</dd>
        </div>
        <div>
          <dt>{t("输出 token", "Output tokens")}</dt>
          <dd>{output ?? "—"}</dd>
        </div>
        <div>
          <dt>{t("总 token", "Total tokens")}</dt>
          <dd>{tokens ?? "—"}</dd>
        </div>
      </dl>
      <p className="ff-muted">
        {t(
          "统计范围以保存的响应用量为准，缺失调用和重试用量可能另计。费用估算使用下方统一单价。",
          "Counts cover saved response usage. Missing calls and retry usage may add further usage. The estimate applies the unit prices below to these recorded tokens.",
        )}
      </p>
      {rows.some((row) => row.partial) && (
        <p className="ff-muted">
          {t(
            "部分用量记录不完整，旧记录可能仅保留节点最后一次响应。",
            "Some usage records are incomplete. Older records may retain only a node's latest response.",
          )}
        </p>
      )}
      <div className="ff-usage-pricing">
        <label>
          {t("币种", "Currency")}
          <input
            aria-label={t("费用币种", "Cost currency")}
            value={currency}
            maxLength={12}
            onChange={(event) => setCurrency(event.target.value)}
            placeholder="CNY / USD"
          />
        </label>
        <label>
          {t("输入单价 / 百万 token", "Input price / million tokens")}
          <input
            aria-label={t(
              "输入单价 / 百万 token",
              "Input price / million tokens",
            )}
            type="number"
            min="0"
            step="any"
            value={inputRate}
            onChange={(event) => setInputRate(event.target.value)}
          />
        </label>
        <label>
          {t("输出单价 / 百万 token", "Output price / million tokens")}
          <input
            aria-label={t(
              "输出单价 / 百万 token",
              "Output price / million tokens",
            )}
            type="number"
            min="0"
            step="any"
            value={outputRate}
            onChange={(event) => setOutputRate(event.target.value)}
          />
        </label>
      </div>
      <p role="status">
        {estimate === undefined
          ? t(
              "填写币种和两项单价后，计算已记录用量的费用估算。",
              "Enter a currency and both unit prices to estimate the recorded usage.",
            )
          : t(
              "已记录用量估算 {currency} {cost}",
              "Recorded usage estimate {currency} {cost}",
              {
                currency: currency.trim(),
                cost: estimate.toLocaleString(
                  locale === "zh" ? "zh-CN" : "en-US",
                  { maximumFractionDigits: 8 },
                ),
              },
            )}
      </p>
    </section>
  );
}
