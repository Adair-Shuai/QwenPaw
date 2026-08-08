/**
 * GenUiRegistry — renders GenUI tree nodes using host antd components.
 *
 * Ported from LeAgent frontend/src/components/canvas/GenUiRegistry.tsx (Apache-2.0).
 * Heavily adapted: uses antd components instead of custom Tailwind components;
 * implements phase-1 component set only.
 */

import type { GenUiNode } from "../types/genUi";
import { dispatchGenUiAction } from "../lib/genUiActionBus";

// ── Host access ────────────────────────────────────────────────────────────

function getHost() {
  return (window as any).QwenPaw?.host;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const s = (v: unknown): string =>
  typeof v === "string" ? v : v != null ? String(v) : "";
const n = (v: unknown): number =>
  typeof v === "number" ? v : typeof v === "string" ? Number(v) || 0 : 0;
const b = (v: unknown): boolean => Boolean(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

// ── Style maps ─────────────────────────────────────────────────────────────

const TEXT_SIZES: Record<string, string> = {
  xs: "12px",
  sm: "13px",
  base: "14px",
  lg: "16px",
};

const TEXT_COLORS: Record<string, string> = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)",
};

const BADGE_STATUSES: Record<string, string> = {
  default: "default",
  primary: "processing",
  success: "success",
  warning: "warning",
  error: "error",
  info: "processing",
};

const TAG_COLORS: Record<string, string> = {
  gray: "default",
  blue: "blue",
  green: "green",
  red: "red",
  yellow: "gold",
  purple: "purple",
};

const PROGRESS_COLORS: Record<string, string> = {
  primary: "#1677ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
};

const ALERT_SEVERITY: Record<string, string> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

// ── Node renderer ──────────────────────────────────────────────────────────

export function GenUiTreeView({ node }: { node: GenUiNode }): React.ReactElement | null {
  const host = getHost();
  if (!host?.React) return null;
  const React = host.React;
  const antd = host.antd || {};
  const antdIcons = host.antdIcons || {};

  const p = node.props || {};
  const children = node.children || [];

  const renderChildren = (): React.ReactNode =>
    children.map((child, i) =>
      React.createElement(GenUiTreeView, { key: child.nodeId || i, node: child }),
    );

  switch (node.kind) {
    // ── Layout ───────────────────────────────────────────────────────────
    case "Stack":
      return React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: `${n(p.gap) || 12}px`,
            alignItems: p.align === "center" ? "center" : p.align === "end" ? "flex-end" : "stretch",
            padding: p.padding ? `${n(p.padding)}px` : undefined,
          },
        },
        renderChildren(),
      );

    case "Row":
      return React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            gap: `${n(p.gap) || 12}px`,
            alignItems: p.align === "center" ? "center" : p.align === "end" ? "flex-end" : "stretch",
            justifyContent: p.justify === "center" ? "center" : p.justify === "end" ? "flex-end" : p.justify === "between" ? "space-between" : p.justify === "around" ? "space-around" : "flex-start",
          },
        },
        renderChildren(),
      );

    case "Grid":
      return React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(Math.max(n(p.columns) || 2, 1), 6)}, 1fr)`,
            gap: `${n(p.gap) || 12}px`,
          },
        },
        renderChildren(),
      );

    case "Spacer":
      return React.createElement("div", {
        style: { height: `${n(p.size) || 16}px` },
      });

    // ── Typography ────────────────────────────────────────────────────────
    case "Text":
      return React.createElement(
        "div",
        {
          style: {
            fontSize: TEXT_SIZES[s(p.size)] || TEXT_SIZES.base,
            color: TEXT_COLORS[s(p.color)] || TEXT_COLORS.default,
            fontWeight: b(p.bold) ? "bold" : "normal",
            lineHeight: 1.6,
          },
        },
        s(p.value),
      );

    case "Heading": {
      const level = Math.min(Math.max(n(p.level) || 2, 1), 4);
      const sizes: Record<number, string> = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return React.createElement(
        "div",
        {
          style: {
            fontSize: sizes[level],
            fontWeight: "bold",
            color: TEXT_COLORS.default,
            margin: "4px 0",
          },
        },
        s(p.value),
      );
    }

    case "Divider":
      return React.createElement(antd.Divider || "hr", {
        style: p.label ? { fontSize: 12 } : undefined,
        ...(p.label ? { children: s(p.label) } : {}),
      });

    // ── Data display ──────────────────────────────────────────────────────
    case "Badge":
      return React.createElement(
        antd.Badge || "span",
        {
          status: BADGE_STATUSES[s(p.variant)] || "default",
          count: s(p.value),
        },
      );

    case "Tag":
      return React.createElement(antd.Tag || "span", {
        color: TAG_COLORS[s(p.color)] || "default",
        children: s(p.label),
      });

    case "Stat":
      return React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 2 } },
        React.createElement(
          "span",
          { style: { fontSize: 12, color: TEXT_COLORS.muted } },
          s(p.label),
        ),
        React.createElement(
          "span",
          { style: { fontSize: 20, fontWeight: "bold", color: TEXT_COLORS.default } },
          s(p.value),
        ),
        p.delta
          ? React.createElement(
              "span",
              {
                style: {
                  fontSize: 12,
                  color:
                    s(p.trend) === "up"
                      ? TEXT_COLORS.success
                      : s(p.trend) === "down"
                        ? TEXT_COLORS.error
                        : TEXT_COLORS.muted,
                },
              },
              s(p.delta),
            )
          : null,
      );

    case "Progress":
      return React.createElement(antd.Progress || "div", {
        percent: n(p.value),
        strokeColor: PROGRESS_COLORS[s(p.color)] || PROGRESS_COLORS.primary,
        format: p.label ? () => s(p.label) : undefined,
        size: "small",
      });

    case "Image":
      return React.createElement(
        "div",
        { style: { margin: "4px 0" } },
        React.createElement("img", {
          src: s(p.src),
          alt: s(p.alt),
          style: {
            maxWidth: "100%",
            borderRadius: b(p.rounded) ? "8px" : undefined,
            maxHeight: p.maxHeight ? `${n(p.maxHeight)}px` : undefined,
            objectFit: (s(p.fit) as any) || "cover",
            aspectRatio: s(p.aspect) || undefined,
          },
        }),
        p.caption
          ? React.createElement(
              "div",
              { style: { fontSize: 12, color: TEXT_COLORS.muted, marginTop: 4 } },
              s(p.caption),
            )
          : null,
      );

    case "Table": {
      const headers = arr(p.headers).map((h) => s(h));
      const rows = children.filter((c) => c.kind === "TableRow");
      const dataSource = rows.map((row, rowIdx) => {
        const cells = (row.children || []).filter((c) => c.kind === "TableCell");
        const rowData: Record<string, unknown> = { key: rowIdx };
        headers.forEach((header, colIdx) => {
          const cell = cells[colIdx];
          rowData[header] = cell?.props?.value ? s(cell.props.value) : "";
        });
        return rowData;
      });
      const columns = headers.map((header) => ({
        title: header,
        dataIndex: header,
        key: header,
      }));
      return React.createElement(antd.Table || "table", {
        dataSource,
        columns,
        size: b(p.compact) ? "small" : "middle",
        pagination: false,
        bordered: false,
        style: { margin: "4px 0" },
      });
    }

    case "List": {
      const items = children.filter((c) => c.kind === "ListItem");
      return React.createElement(
        antd.List || "ul",
        {
          size: "small",
          split: s(p.variant) !== "bordered",
          style: { margin: "4px 0" },
        },
        items.map((item, i) =>
          React.createElement(
            antd.List?.Item || "li",
            { key: i },
            item.props?.icon ? React.createElement("span", { style: { marginRight: 6 } }, s(item.props.icon)) : null,
            s(item.props?.value),
          ),
        ),
      );
    }

    case "CodeBlock":
      return React.createElement(
        "pre",
        {
          style: {
            padding: "12px",
            background: "rgba(0,0,0,0.04)",
            borderRadius: "8px",
            overflow: "auto",
            fontSize: 13,
            lineHeight: 1.5,
            fontFamily: "monospace",
          },
        },
        s(p.code),
      );

    case "Markdown":
      return React.createElement(antd.Typography || "div", {
        children: s(p.content || p.value),
      });

    case "Chart": {
      // Use @ant-design/plots if available, otherwise show a fallback
      const chartType = s(p.chart) || "line";
      const categories = arr(p.categories).map((c) => s(c));
      const series = arr(p.series).map((sItem) => {
        const sr = sItem as Record<string, unknown>;
        return {
          name: s(sr.name),
          values: arr(sr.values).map((v) => n(v)),
        };
      });
      // Simple table fallback if @ant-design/plots is not available
      if (!host.Plots) {
        return React.createElement(
          "div",
          {
            style: {
              padding: "12px",
              border: "1px solid var(--ant-color-border, #d9d9d9)",
              borderRadius: "8px",
              fontSize: 12,
            },
          },
          p.title ? React.createElement("div", { style: { fontWeight: "bold", marginBottom: 8 } }, s(p.title)) : null,
          React.createElement(
            "table",
            { style: { width: "100%", fontSize: 12 } },
            React.createElement(
              "thead",
              null,
              React.createElement(
                "tr",
                null,
                React.createElement("th", { style: { textAlign: "left" } }, "Category"),
                ...series.map((sr, i) =>
                  React.createElement("th", { key: i, style: { textAlign: "right" } }, sr.name),
                ),
              ),
            ),
            React.createElement(
              "tbody",
              null,
              categories.map((cat, catIdx) =>
                React.createElement(
                  "tr",
                  { key: catIdx },
                  React.createElement("td", null, cat),
                  ...series.map((sr, srIdx) =>
                    React.createElement(
                      "td",
                      { key: srIdx, style: { textAlign: "right" } },
                      String(sr.values[catIdx] ?? ""),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      // Use @ant-design/plots
      const Plots = host.Plots;
      const plotConfig = {
        data: categories.map((cat, i) => {
          const row: Record<string, unknown> = { category: cat };
          series.forEach((sr) => {
            row[sr.name] = sr.values[i] ?? 0;
          });
          return row;
        }),
        xField: "category",
        yField: series[0]?.name || "value",
        height: n(p.height) || 300,
        legend: b(p.showLegend) ? { position: "top" } : false,
      };
      const PlotComponent =
        chartType === "bar" ? Plots.Bar :
        chartType === "area" ? Plots.Area :
        chartType === "pie" ? Plots.Pie :
        Plots.Line;
      return React.createElement(PlotComponent, plotConfig);
    }

    case "Icon":
      // Try to find the icon in antd icons
      return React.createElement("span", {
        style: { fontSize: `${n(p.size) || 20}px`, display: "inline-flex" },
        children: s(p.name),
      });

    // ── Cards ─────────────────────────────────────────────────────────────
    case "Card":
      return React.createElement(
        antd.Card || "div",
        {
          title: p.title ? s(p.title) : undefined,
          size: "small",
          style: { margin: "4px 0" },
        },
        p.subtitle
          ? React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted, marginBottom: 8 } }, s(p.subtitle))
          : null,
        renderChildren(),
      );

    case "DataCard":
      return React.createElement(
        antd.Card || "div",
        { size: "small", style: { margin: "4px 0" } },
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
          React.createElement(
            "div",
            null,
            React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.title)),
            React.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, s(p.value)),
            p.description ? React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.description)) : null,
          ),
          p.icon ? React.createElement("span", { style: { fontSize: 32 } }, s(p.icon)) : null,
        ),
        renderChildren(),
      );

    case "MetricCard":
      return React.createElement(
        antd.Card || "div",
        { size: "small", style: { margin: "4px 0" } },
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
          React.createElement(
            "div",
            null,
            React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.title)),
            React.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, s(p.value)),
            p.delta
              ? React.createElement(
                  "span",
                  {
                    style: {
                      fontSize: 12,
                      color: s(p.trend) === "up" ? TEXT_COLORS.success : s(p.trend) === "down" ? TEXT_COLORS.error : TEXT_COLORS.muted,
                    },
                  },
                  `${s(p.delta)} ${p.period ? s(p.period) : ""}`.trim(),
                )
              : null,
          ),
          p.icon ? React.createElement("span", { style: { fontSize: 32 } }, s(p.icon)) : null,
        ),
      );

    case "AlertCard":
      return React.createElement(antd.Alert || "div", {
        type: ALERT_SEVERITY[s(p.severity)] || "info",
        message: p.title ? s(p.title) : undefined,
        description: s(p.message),
        showIcon: true,
        style: { margin: "4px 0" },
      });

    // ── Interactive ───────────────────────────────────────────────────────
    case "Button": {
      const variant = s(p.variant);
      const btnType = variant === "primary" ? "primary" : variant === "danger" ? "primary" : "default";
      const btnDanger = variant === "danger";
      return React.createElement(antd.Button || "button", {
        type: btnType,
        danger: btnDanger,
        size: "small",
        children: s(p.label) || "Action",
        onClick: () => {
          const action = p.action;
          if (action && typeof action === "object") {
            dispatchGenUiAction(action, {});
          } else if (p.actionId) {
            dispatchGenUiAction(p.actionId, { actionId: s(p.actionId) });
          }
        },
      });
    }

    case "Input":
      return React.createElement(antd.Input || "input", {
        placeholder: s(p.placeholder),
        value: s(p.value),
        disabled: true, // Display-only outside Form
        size: "small",
        addonBefore: p.label ? s(p.label) : undefined,
      });

    case "Select":
      return React.createElement(
        antd.Select || "select",
        {
          placeholder: s(p.placeholder),
          value: s(p.value) || undefined,
          disabled: true,
          size: "small",
          style: { width: "100%" },
        },
        arr(p.options).map((opt, i) =>
          React.createElement(antd.Select?.Option || "option", { key: i, value: s(opt) }, s(opt)),
        ),
      );

    // ── Feedback ──────────────────────────────────────────────────────────
    case "Alert":
      return React.createElement(antd.Alert || "div", {
        type: ALERT_SEVERITY[s(p.severity)] || "info",
        message: p.title ? s(p.title) : undefined,
        description: s(p.message),
        showIcon: true,
        style: { margin: "4px 0" },
      });

    case "Callout":
      return React.createElement(antd.Alert || "div", {
        type: s(p.variant) === "tip" ? "success" : s(p.variant) === "warning" ? "warning" : s(p.variant) === "important" ? "error" : "info",
        message: p.title ? s(p.title) : undefined,
        description: s(p.message),
        showIcon: true,
        style: { margin: "4px 0" },
      });

    case "JsonDebug":
      return React.createElement(
        "details",
        { style: { margin: "4px 0", fontSize: 12 } },
        React.createElement("summary", null, s(p.label) || "Debug JSON"),
        React.createElement(
          "pre",
          { style: { fontSize: 12, padding: 8, background: "rgba(0,0,0,0.04)", borderRadius: 4, overflow: "auto" } },
          JSON.stringify(p.data ?? p, null, 2),
        ),
      );

    // ── Unknown ───────────────────────────────────────────────────────────
    default:
      return React.createElement(
        "div",
        {
          style: {
            padding: 8,
            border: "1px dashed var(--ant-color-border, #d9d9d9)",
            borderRadius: 8,
            fontSize: 12,
            color: TEXT_COLORS.muted,
            fontFamily: "monospace",
          },
        },
        `Unknown component: ${node.kind}`,
      );
  }
}
