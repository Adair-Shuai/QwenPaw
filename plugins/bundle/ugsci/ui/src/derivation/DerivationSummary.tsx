import { getHost } from "../core/runtime";

const TEXT = "var(--ant-color-text, rgba(0, 0, 0, 0.88))";
const MUTED = "var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45))";
const BORDER = "var(--ant-color-border-secondary, #f0f0f0)";
const SURFACE = "var(--ant-color-bg-container, #fff)";
const SOFT = "var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02))";
const SUCCESS = "var(--ant-color-success, #52c41a)";
const SUCCESS_BG = "var(--ant-color-success-bg, #f6ffed)";
const WARNING = "var(--ant-color-warning, #faad14)";
const WARNING_BG = "var(--ant-color-warning-bg, #fffbe6)";
const ERROR = "var(--ant-color-error, #ff4d4f)";
const ERROR_BG = "var(--ant-color-error-bg, #fff2f0)";
const PRIMARY = "var(--ant-color-primary, #1677ff)";

const RESULT_LABELS: Record<string, string> = {
  derived_expression: "推导结果",
  effective_inventory: "有效库存",
  estimated_ogip: "估算原始储量",
  initial_p_over_z: "初始 p/z",
  current_p_over_z: "当前 p/z",
  recovery_factor: "采收率",
  remaining_gas: "剩余气量",
  result: "计算结果",
  transformed_expression: "变换结果",
};

const PARAMETER_LABELS: Record<string, string> = {
  current_pressure: "当前压力",
  current_z_factor: "当前 z 因子",
  initial_pressure: "初始压力",
  initial_z_factor: "初始 z 因子",
  produced_gas: "累计产气量",
};

export interface ResultItem {
  key: string;
  label: string;
  value: string;
  unit: string;
}

export interface DerivationPresentation {
  title: string;
  formula: string;
  trustLabel: string;
  trustDetail: string;
  trustTone: "success" | "warning" | "error";
  results: ResultItem[];
  inputs: Array<{ name: string; label: string; value: string; source: string }>;
  boundaries: string[];
  warnings: string[];
  stepCount: number;
  passedGateCount: number;
  unitCheckCount: number;
  unitAuditOk: boolean | null;
}

function humanize(value: string): string {
  return (
    RESULT_LABELS[value] ||
    PARAMETER_LABELS[value] ||
    value
      .replace(/[_.-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function formatNumber(value: number, key = ""): string {
  if (!Number.isFinite(value)) return String(value);
  if (
    /(factor|fraction|efficiency|ratio|rate)$/i.test(key) &&
    Math.abs(value) <= 1
  ) {
    return `${new Intl.NumberFormat("zh-CN", {
      maximumFractionDigits: 2,
    }).format(value * 100)}%`;
  }
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000 || (absolute > 0 && absolute < 0.0001)) {
    return value.toExponential(4);
  }
  return new Intl.NumberFormat("zh-CN", {
    maximumSignificantDigits: 7,
  }).format(value);
}

export function formatDerivationValue(value: unknown, key = ""): string {
  if (typeof value === "number") return formatNumber(value, key);
  if (typeof value === "boolean") return value ? "是" : "否";
  if (value == null) return "—";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function resultPriority(key: string): number {
  const order = [
    "result",
    "estimated_ogip",
    "effective_inventory",
    "derived_expression",
    "transformed_expression",
    "remaining_gas",
    "recovery_factor",
  ];
  const index = order.indexOf(key);
  return index < 0 ? order.length : index;
}

function primitiveResultEntries(payload: any): ResultItem[] {
  const result = payload?.result;
  if (!result || typeof result !== "object" || Array.isArray(result)) return [];
  return Object.entries(result)
    .filter(([, value]) =>
      ["string", "number", "boolean"].includes(typeof value),
    )
    .sort(([left], [right]) => resultPriority(left) - resultPriority(right))
    .slice(0, 4)
    .map(([key, value]) => ({
      key,
      label: humanize(key),
      value: formatDerivationValue(value, key),
      unit: String(payload?.units?.[key] || ""),
    }));
}

function formulaText(payload: any): string {
  const steps = Array.isArray(payload?.trace?.steps) ? payload.trace.steps : [];
  const preferred =
    steps.find(
      (step: any) =>
        step?.operation === "solve" && (step?.unicode || step?.expression),
    ) ||
    steps.find(
      (step: any) =>
        step?.group === "assemble" && (step?.unicode || step?.expression),
    ) ||
    steps.find((step: any) => step?.unicode || step?.expression);
  return String(
    preferred?.unicode ||
      preferred?.expression ||
      payload?.trace?.symbols ||
      payload?.method ||
      "—",
  );
}

function inputItems(payload: any): DerivationPresentation["inputs"] {
  const variables = Array.isArray(payload?.trace?.variables)
    ? payload.trace.variables.filter((item: any) => item?.source === "input")
    : [];
  if (variables.length) {
    return variables.slice(0, 8).map((item: any) => ({
      name: String(item.name || ""),
      label: String(
        PARAMETER_LABELS[String(item.name || "")] ||
          item.display_name ||
          humanize(String(item.name || "参数")),
      ),
      value: `${formatDerivationValue(item.value, item.name)}${
        item.unit ? ` ${item.unit}` : ""
      }`,
      source: "用户输入",
    }));
  }
  const sources = payload?.provenance?.parameter_sources || {};
  return Object.entries(sources)
    .filter(([, value]: [string, any]) => value?.source === "user_input")
    .slice(0, 8)
    .map(([name, value]: [string, any]) => ({
      name,
      label: humanize(name),
      value: `${formatDerivationValue(value?.value, name)}${
        value?.unit ? ` ${value.unit}` : ""
      }`,
      source: "用户输入",
    }));
}

export function buildDerivationPresentation(
  payload: any,
): DerivationPresentation {
  const provenance = payload?.provenance || {};
  const unitAudit = provenance.unit_audit;
  const unitEntries = Object.values(unitAudit?.per_symbol || {}) as any[];
  const unitAuditOk = typeof unitAudit?.ok === "boolean" ? unitAudit.ok : null;
  const source = provenance.source || payload?.trace?.source;
  const warnings = Array.isArray(payload?.warnings)
    ? payload.warnings.map(String)
    : [];
  let trustTone: DerivationPresentation["trustTone"] = "success";
  let trustLabel = "公式与单位已核验";
  let trustDetail = "公式匹配、参数完整，计算证据链可追溯。";
  if (unitAuditOk === false) {
    trustTone = "error";
    trustLabel = "单位检查未通过";
    trustDetail = "结果使用前需要修正单位不一致项。";
  } else if (source === "freeform") {
    trustTone = "warning";
    trustLabel = "AI 推导 · 建议复核";
    trustDetail = "符号步骤已通过安全校验，但公式并非审定公式库来源。";
  } else if (warnings.length) {
    trustTone = "warning";
    trustLabel = "计算完成 · 存在提醒";
    trustDetail = "核心计算已完成，请同时阅读警告和适用条件。";
  } else if (unitAuditOk === null) {
    trustLabel = "计算证据链已记录";
    trustDetail = "推导步骤和参数来源可追溯；此记录没有逐项单位审计。";
  }
  return {
    title:
      payload?.trace?.formula_name ||
      payload?.trace?.title ||
      payload?.operation ||
      "UGSci 数学计算",
    formula: formulaText(payload),
    trustLabel,
    trustDetail,
    trustTone,
    results: primitiveResultEntries(payload),
    inputs: inputItems(payload),
    boundaries: [
      ...(Array.isArray(payload?.applicability) ? payload.applicability : []),
      ...(Array.isArray(payload?.assumptions) ? payload.assumptions : []),
    ].map(String),
    warnings,
    stepCount: Array.isArray(payload?.trace?.steps)
      ? payload.trace.steps.length
      : 0,
    passedGateCount: Array.isArray(provenance.gate)
      ? provenance.gate.length
      : 0,
    unitCheckCount: unitEntries.length,
    unitAuditOk,
  };
}

function toneColors(tone: DerivationPresentation["trustTone"]) {
  if (tone === "error") return { color: ERROR, background: ERROR_BG };
  if (tone === "warning") return { color: WARNING, background: WARNING_BG };
  return { color: SUCCESS, background: SUCCESS_BG };
}

function SectionTitle({ children }: { children?: any }) {
  const React = getHost().React;
  return React.createElement(
    "div",
    { style: { fontWeight: 600, color: TEXT, marginBottom: 8 } },
    children,
  );
}

export function DerivationSummary({
  payload,
  onOpenDerivation,
  onOpenEvidence,
  onReplay,
  compact = false,
}: {
  payload: any;
  onOpenDerivation?: () => void;
  onOpenEvidence?: () => void;
  onReplay?: () => void;
  compact?: boolean;
}) {
  const React = getHost().React;
  const summary = buildDerivationPresentation(payload);
  const tone = toneColors(summary.trustTone);
  const primary = summary.results[0];
  const secondary = summary.results.slice(1, compact ? 2 : 4);
  return React.createElement(
    "div",
    { style: { display: "grid", gap: compact ? 9 : 14 } },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          flexWrap: "wrap",
        },
      },
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { style: { color: MUTED, fontSize: 12, marginBottom: 3 } },
          compact ? "计算摘要" : summary.title,
        ),
        primary
          ? React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  flexWrap: "wrap",
                },
              },
              React.createElement(
                "strong",
                {
                  style: {
                    color: TEXT,
                    fontSize: compact ? 22 : 28,
                    fontWeight: 600,
                    overflowWrap: "anywhere",
                  },
                },
                primary.value,
              ),
              primary.unit
                ? React.createElement(
                    "span",
                    { style: { color: MUTED, fontSize: 13 } },
                    primary.unit,
                  )
                : null,
            )
          : React.createElement(
              "strong",
              { style: { color: TEXT } },
              "计算已完成",
            ),
        primary
          ? React.createElement(
              "div",
              { style: { color: MUTED, fontSize: 12, marginTop: 3 } },
              primary.label,
            )
          : null,
      ),
      React.createElement(
        "span",
        {
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            borderRadius: 999,
            padding: "4px 8px",
            color: tone.color,
            background: tone.background,
            fontSize: 12,
            whiteSpace: "nowrap",
          },
        },
        summary.trustTone === "success" ? "✓" : "!",
        summary.trustLabel,
      ),
    ),
    React.createElement(
      "p",
      {
        style: {
          margin: 0,
          color: compact ? MUTED : TEXT,
          fontSize: 13,
          lineHeight: 1.65,
        },
      },
      summary.trustDetail,
    ),
    secondary.length
      ? React.createElement(
          "div",
          {
            style: {
              display: "grid",
              gap: 6,
              paddingTop: 10,
              borderTop: `1px solid ${BORDER}`,
            },
          },
          ...secondary.map((item) =>
            React.createElement(
              "div",
              {
                key: item.key,
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 12,
                },
              },
              React.createElement(
                "span",
                { style: { color: MUTED } },
                item.label,
              ),
              React.createElement(
                "span",
                { style: { color: TEXT, textAlign: "right" } },
                `${item.value}${item.unit ? ` ${item.unit}` : ""}`,
              ),
            ),
          ),
        )
      : null,
    !compact
      ? React.createElement(
          "div",
          {
            style: {
              display: "grid",
              gap: 7,
              paddingTop: 10,
              borderTop: `1px solid ${BORDER}`,
              fontSize: 12,
            },
          },
          React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "72px 1fr",
                gap: 8,
              },
            },
            React.createElement(
              "span",
              { style: { color: MUTED } },
              "使用公式",
            ),
            React.createElement(
              "code",
              { style: { color: TEXT, overflowWrap: "anywhere" } },
              summary.formula,
            ),
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "72px 1fr",
                gap: 8,
              },
            },
            React.createElement(
              "span",
              { style: { color: MUTED } },
              "关键输入",
            ),
            React.createElement(
              "span",
              { style: { color: TEXT } },
              summary.inputs.length
                ? summary.inputs
                    .slice(0, 5)
                    .map((item) => `${item.label}=${item.value}`)
                    .join("；")
                : "未提供可展示的输入摘要",
            ),
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "72px 1fr",
                gap: 8,
              },
            },
            React.createElement(
              "span",
              { style: { color: MUTED } },
              "适用条件",
            ),
            React.createElement(
              "span",
              { style: { color: TEXT } },
              summary.boundaries.slice(0, 2).join("；") || "未声明额外适用条件",
            ),
          ),
        )
      : null,
    React.createElement(
      "div",
      { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
      onOpenDerivation
        ? React.createElement(
            "button",
            {
              type: "button",
              onClick: onOpenDerivation,
              style: {
                border: `1px solid ${PRIMARY}`,
                borderRadius: 7,
                padding: "6px 10px",
                background: PRIMARY,
                color: "var(--ant-color-text-light-solid, #fff)",
                cursor: "pointer",
              },
            },
            "查看推导",
          )
        : null,
      onOpenEvidence
        ? React.createElement(
            "button",
            {
              type: "button",
              onClick: onOpenEvidence,
              style: {
                border: `1px solid ${BORDER}`,
                borderRadius: 7,
                padding: "6px 10px",
                background: SURFACE,
                color: TEXT,
                cursor: "pointer",
              },
            },
            "证据与来源",
          )
        : null,
      onReplay
        ? React.createElement(
            "button",
            {
              type: "button",
              onClick: onReplay,
              style: {
                border: `1px solid ${BORDER}`,
                borderRadius: 7,
                padding: "6px 10px",
                background: SURFACE,
                color: TEXT,
                cursor: "pointer",
              },
            },
            "复现计算",
          )
        : null,
    ),
  );
}

export function OverviewPanel({ payload }: { payload: any }) {
  const React = getHost().React;
  const summary = buildDerivationPresentation(payload);
  return React.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    React.createElement(
      "section",
      null,
      React.createElement(SectionTitle, null, "你最需要知道的"),
      React.createElement(
        "p",
        { style: { margin: 0, color: TEXT, fontSize: 13, lineHeight: 1.7 } },
        `本次使用 ${summary.title}，读取 ${summary.inputs.length} 项输入，记录 ${summary.stepCount} 个推导步骤`,
        summary.passedGateCount
          ? `，并通过 ${summary.passedGateCount} 项计算校验。`
          : "。",
      ),
    ),
    React.createElement(
      "section",
      null,
      React.createElement(SectionTitle, null, "边界与提醒"),
      summary.boundaries.length || summary.warnings.length
        ? React.createElement(
            "ul",
            {
              style: {
                margin: 0,
                paddingLeft: 18,
                color: MUTED,
                fontSize: 12,
                lineHeight: 1.7,
              },
            },
            ...[...summary.warnings, ...summary.boundaries]
              .slice(0, 4)
              .map((item, index) =>
                React.createElement("li", { key: `${index}:${item}` }, item),
              ),
          )
        : React.createElement(
            "p",
            { style: { margin: 0, color: MUTED, fontSize: 12 } },
            "未声明额外边界条件。",
          ),
    ),
  );
}

export function EvidencePanel({ payload }: { payload: any }) {
  const React = getHost().React;
  const summary = buildDerivationPresentation(payload);
  const provenance = payload?.provenance || {};
  const unitEntries = Object.entries(provenance?.unit_audit?.per_symbol || {});
  const parameterSources = Object.entries(provenance?.parameter_sources || {});
  const row = (label: string, value: any, key = label) =>
    React.createElement(
      "div",
      {
        key,
        style: {
          display: "grid",
          gridTemplateColumns: "90px minmax(0, 1fr)",
          gap: 10,
          padding: "8px 0",
          borderBottom: `1px solid ${BORDER}`,
          fontSize: 12,
        },
      },
      React.createElement("span", { style: { color: MUTED } }, label),
      React.createElement(
        "span",
        { style: { color: TEXT, overflowWrap: "anywhere" } },
        value || "—",
      ),
    );
  return React.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    React.createElement(
      "section",
      null,
      React.createElement(SectionTitle, null, "公式身份"),
      row("公式来源", provenance.reference || summary.title),
      row(
        "公式版本",
        `${provenance.formula_id || payload?.trace?.formula_id || "—"} · ${
          provenance.formula_version || payload?.trace?.formula_version || "—"
        }`,
      ),
      row(
        "信任类型",
        provenance.source === "freeform" ? "AI 自由推导" : "UGSci 审定公式",
      ),
    ),
    React.createElement(
      "section",
      null,
      React.createElement(
        SectionTitle,
        null,
        `参数来源（${parameterSources.length}）`,
      ),
      parameterSources.length
        ? React.createElement(
            "div",
            { style: { display: "grid" } },
            ...parameterSources.map(([name, source]: [string, any]) =>
              row(
                humanize(name),
                `${
                  source?.source === "user_input" ? "用户输入" : "推导生成"
                } · ${formatDerivationValue(source?.value, name)}${
                  source?.unit ? ` ${source.unit}` : ""
                }`,
                name,
              ),
            ),
          )
        : React.createElement(
            "p",
            { style: { margin: 0, color: MUTED, fontSize: 12 } },
            "没有参数来源记录。",
          ),
    ),
    React.createElement(
      "section",
      null,
      React.createElement(
        SectionTitle,
        null,
        `单位审计（${summary.unitCheckCount} 项）`,
      ),
      React.createElement(
        "div",
        {
          style: {
            color:
              summary.unitAuditOk === false
                ? ERROR
                : summary.unitAuditOk === true
                ? SUCCESS
                : MUTED,
            fontSize: 12,
            marginBottom: unitEntries.length ? 8 : 0,
          },
        },
        summary.unitAuditOk === false
          ? "存在不一致单位"
          : summary.unitAuditOk === true
          ? "全部单位一致"
          : "此结果没有单位审计数据",
      ),
      unitEntries.length
        ? React.createElement(
            "details",
            null,
            React.createElement(
              "summary",
              { style: { cursor: "pointer", color: MUTED, fontSize: 12 } },
              "查看逐项单位检查",
            ),
            React.createElement(
              "div",
              { style: { marginTop: 6 } },
              ...unitEntries.map(([name, audit]: [string, any]) =>
                row(
                  humanize(name),
                  `${audit?.ok ? "✓" : "✗"} ${audit?.actual || "无量纲"} → ${
                    audit?.expected || "—"
                  }`,
                  `unit:${name}`,
                ),
              ),
            ),
          )
        : null,
    ),
    Array.isArray(provenance.gate) && provenance.gate.length
      ? React.createElement(
          "section",
          null,
          React.createElement(SectionTitle, null, "通过的计算校验"),
          React.createElement(
            "ul",
            {
              style: {
                margin: 0,
                paddingLeft: 18,
                color: MUTED,
                fontSize: 12,
                lineHeight: 1.7,
              },
            },
            ...provenance.gate.map((item: any, index: number) =>
              React.createElement(
                "li",
                { key: `${index}:${item}` },
                String(item),
              ),
            ),
          ),
        )
      : null,
    provenance.replay_token
      ? React.createElement(
          "section",
          null,
          React.createElement(SectionTitle, null, "复现身份"),
          React.createElement(
            "code",
            {
              style: {
                display: "block",
                padding: 10,
                borderRadius: 8,
                background: SOFT,
                color: MUTED,
                fontSize: 11,
                overflowWrap: "anywhere",
              },
            },
            String(
              provenance.input_fingerprint || provenance.replay_token,
            ).slice(0, 96),
          ),
        )
      : null,
  );
}

export function LogsPanel({ payload }: { payload: any }) {
  const React = getHost().React as any;
  const summary = buildDerivationPresentation(payload);
  const [showRaw, setShowRaw] = React.useState(false);
  const replay = payload?.replay;
  const stats = [
    [summary.stepCount, "计算步骤"],
    [summary.passedGateCount, "校验通过"],
    [replay?.elapsedMs != null ? `${replay.elapsedMs} ms` : "—", "复现耗时"],
  ];
  return React.createElement(
    "div",
    { style: { display: "grid", gap: 12 } },
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
          gap: 8,
        },
      },
      ...stats.map(([value, label]) =>
        React.createElement(
          "div",
          {
            key: String(label),
            style: { padding: 10, borderRadius: 8, background: SOFT },
          },
          React.createElement(
            "strong",
            { style: { display: "block", color: TEXT } },
            String(value),
          ),
          React.createElement(
            "span",
            { style: { color: MUTED, fontSize: 11 } },
            String(label),
          ),
        ),
      ),
    ),
    React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowRaw(!showRaw),
        "aria-expanded": showRaw,
        style: {
          justifySelf: "start",
          border: `1px solid ${BORDER}`,
          borderRadius: 7,
          padding: "6px 10px",
          background: SURFACE,
          color: TEXT,
          cursor: "pointer",
        },
      },
      showRaw ? "隐藏原始日志" : "显示原始日志",
    ),
    showRaw
      ? React.createElement(
          "pre",
          {
            style: {
              margin: 0,
              padding: 12,
              borderRadius: 8,
              background: SOFT,
              color: MUTED,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              fontSize: 11,
              lineHeight: 1.55,
            },
          },
          JSON.stringify(payload, null, 2),
        )
      : React.createElement(
          "p",
          { style: { margin: 0, color: MUTED, fontSize: 12 } },
          "原始运行数据默认隐藏，需要诊断或审计时再展开。",
        ),
  );
}
