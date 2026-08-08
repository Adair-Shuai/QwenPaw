/**
 * GenUiRegistry — renders GenUI tree nodes using host antd components.
 * Ported from LeAgent (Apache-2.0). Phase-1 component set.
 */

import type { GenUiNode } from "../types/genUi";
import { dispatchGenUiAction } from "../lib/genUiActionBus";

const s = (v: unknown): string => (typeof v === "string" ? v : v != null ? String(v) : "");
const n = (v: unknown): number => (typeof v === "number" ? v : typeof v === "string" ? Number(v) || 0 : 0);
const b = (v: unknown): boolean => Boolean(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

const TEXT_SIZES: Record<string, string> = { xs: "12px", sm: "13px", base: "14px", lg: "16px" };
const TEXT_COLORS: Record<string, string> = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)", default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)", success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)", error: "var(--ant-color-error, #ff4d4f)",
};

export function GenUiTreeView({ node }: { node: GenUiNode }): React.ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  if (!host?.React) return null;
  const React = host.React;
  const antd = host.antd || {};

  const p = node.props || {};
  const children = node.children || [];
  const renderChildren = () => children.map((c, i) => React.createElement(GenUiTreeView, { key: c.nodeId || i, node: c }));

  switch (node.kind) {
    case "Stack": return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: `${n(p.gap) || 12}px`, padding: p.padding ? `${n(p.padding)}px` : undefined } }, renderChildren());
    case "Row": return React.createElement("div", { style: { display: "flex", flexDirection: "row", gap: `${n(p.gap) || 12}px` } }, renderChildren());
    case "Grid": return React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(n(p.columns) || 2, 1), 6)}, 1fr)`, gap: `${n(p.gap) || 12}px` } }, renderChildren());
    case "Spacer": return React.createElement("div", { style: { height: `${n(p.size) || 16}px` } });
    case "Text": return React.createElement("div", { style: { fontSize: TEXT_SIZES[s(p.size)] || TEXT_SIZES.base, color: TEXT_COLORS[s(p.color)] || TEXT_COLORS.default, fontWeight: b(p.bold) ? "bold" : "normal", lineHeight: 1.6 } }, s(p.value));
    case "Heading": { const lvl = Math.min(Math.max(n(p.level) || 2, 1), 4); const sizes: Record<number, string> = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" }; return React.createElement("div", { style: { fontSize: sizes[lvl], fontWeight: "bold", margin: "4px 0" } }, s(p.value)); }
    case "Divider": return React.createElement(antd.Divider || "hr", p.label ? { children: s(p.label) } : {});
    case "Badge": return React.createElement(antd.Badge || "span", { count: s(p.value), status: "default" });
    case "Tag": return React.createElement(antd.Tag || "span", { color: s(p.color) || "default", children: s(p.label) });
    case "Stat": return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, React.createElement("span", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.label)), React.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, s(p.value)), p.delta ? React.createElement("span", { style: { fontSize: 12, color: s(p.trend) === "up" ? TEXT_COLORS.success : s(p.trend) === "down" ? TEXT_COLORS.error : TEXT_COLORS.muted } }, s(p.delta)) : null);
    case "Progress": return React.createElement(antd.Progress || "div", { percent: n(p.value), size: "small" });
    case "Image": return React.createElement("div", null, React.createElement("img", { src: s(p.src), alt: s(p.alt), style: { maxWidth: "100%", borderRadius: b(p.rounded) ? "8px" : undefined, maxHeight: p.maxHeight ? `${n(p.maxHeight)}px` : undefined } }), p.caption ? React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.caption)) : null);
    case "Table": {
      const headers = arr(p.headers).map((h) => s(h));
      const rows = children.filter((c) => c.kind === "TableRow");
      const dataSource = rows.map((row, ri) => { const cells = (row.children || []).filter((c) => c.kind === "TableCell"); const rd: Record<string, unknown> = { key: ri }; headers.forEach((h, ci) => { rd[h] = cells[ci]?.props?.value ? s(cells[ci].props.value) : ""; }); return rd; });
      const columns = headers.map((h) => ({ title: h, dataIndex: h, key: h }));
      return React.createElement(antd.Table || "table", { dataSource, columns, size: b(p.compact) ? "small" : "middle", pagination: false, style: { margin: "4px 0" } });
    }
    case "List": { const items = children.filter((c) => c.kind === "ListItem"); return React.createElement(antd.List || "ul", { size: "small", style: { margin: "4px 0" } }, items.map((item, i) => React.createElement(antd.List?.Item || "li", { key: i }, s(item.props?.value)))); }
    case "CodeBlock": return React.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, s(p.code));
    case "Markdown": return React.createElement(antd.Typography || "div", { children: s(p.content || p.value) });
    case "Chart": return React.createElement(GenUiChart, { props: p });
    case "Card": return React.createElement(antd.Card || "div", { title: p.title ? s(p.title) : undefined, size: "small", style: { margin: "4px 0" } }, renderChildren());
    case "DataCard": return React.createElement(antd.Card || "div", { size: "small", style: { margin: "4px 0" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, React.createElement("div", null, React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.title)), React.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, s(p.value))), p.icon ? React.createElement("span", { style: { fontSize: 32 } }, s(p.icon)) : null));
    case "MetricCard": return React.createElement(antd.Card || "div", { size: "small", style: { margin: "4px 0" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, React.createElement("div", null, React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.title)), React.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, s(p.value)), p.delta ? React.createElement("span", { style: { fontSize: 12, color: s(p.trend) === "up" ? TEXT_COLORS.success : s(p.trend) === "down" ? TEXT_COLORS.error : TEXT_COLORS.muted } }, `${s(p.delta)} ${p.period ? s(p.period) : ""}`.trim()) : null), p.icon ? React.createElement("span", { style: { fontSize: 32 } }, s(p.icon)) : null));
    case "AlertCard": case "Alert": return React.createElement(antd.Alert || "div", { type: s(p.severity) === "success" ? "success" : s(p.severity) === "warning" ? "warning" : s(p.severity) === "error" ? "error" : "info", message: p.title ? s(p.title) : undefined, description: s(p.message), showIcon: true, style: { margin: "4px 0" } });
    case "Callout": return React.createElement(antd.Alert || "div", { type: s(p.variant) === "tip" ? "success" : s(p.variant) === "warning" ? "warning" : s(p.variant) === "important" ? "error" : "info", message: p.title ? s(p.title) : undefined, description: s(p.message), showIcon: true });
    case "Button": return React.createElement(antd.Button || "button", { type: s(p.variant) === "primary" ? "primary" : "default", size: "small", children: s(p.label) || "Action", onClick: () => { if (p.action && typeof p.action === "object") dispatchGenUiAction(p.action); else if (p.actionId) dispatchGenUiAction(p.actionId); } });
    case "Input": return React.createElement(antd.Input || "input", { placeholder: s(p.placeholder), value: s(p.value), disabled: true, size: "small" });
    case "Select": return React.createElement(antd.Select || "select", { placeholder: s(p.placeholder), value: s(p.value) || undefined, disabled: true, size: "small", style: { width: "100%" } }, arr(p.options).map((o, i) => React.createElement(antd.Select?.Option || "option", { key: i, value: s(o) }, s(o))));
    case "JsonDebug": return React.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, React.createElement("summary", null, s(p.label) || "Debug JSON"), React.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(p.data ?? p, null, 2)));
    default: return React.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: TEXT_COLORS.muted, fontFamily: "monospace" } }, `Unknown component: ${node.kind}`);
  }
}

// ── Chart renderer (SVG-based, no external deps) ─────────────────────────
const CHART_COLORS = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];

function GenUiChart({ props: p }: { props: Record<string, unknown> }): React.ReactElement | null {
  const React = (window as any).QwenPaw?.host?.React;
  if (!React) return null;

  const chartType = s(p.chart) || "line";
  const title = s(p.title);
  const categories = arr(p.categories).map((c) => s(c));
  const seriesRaw = arr(p.series);
  const height = n(p.height) || 200;
  const showLegend = p.showLegend !== false;
  const width = 400;

  // Parse series: each {name, values}
  const series: { name: string; values: number[] }[] = seriesRaw.map((sr, i) => {
    const r = sr as Record<string, unknown>;
    const vals = arr(r.values).map((v) => n(v));
    return { name: s(r.name) || `Series ${i + 1}`, values: vals };
  });

  if (categories.length === 0 || series.length === 0) {
    return React.createElement("div", { style: { padding: 12, color: TEXT_COLORS.muted, fontSize: 12 } }, "Chart: no data");
  }

  // Pie chart is special
  if (chartType === "pie") {
    const total = series[0].values.reduce((a, b) => a + b, 0) || 1;
    const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 - 20;
    let cumAngle = -Math.PI / 2;
    const slices = series[0].values.map((val, i) => {
      const angle = (val / total) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(cumAngle), y1 = cy + r * Math.sin(cumAngle);
      const x2 = cx + r * Math.cos(cumAngle + angle), y2 = cy + r * Math.sin(cumAngle + angle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      cumAngle += angle;
      return { path, color: CHART_COLORS[i % CHART_COLORS.length], label: categories[i] || `#${i + 1}`, val };
    });
    return React.createElement("div", { style: { margin: "4px 0" } },
      title ? React.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, title) : null,
      React.createElement("svg", { width, height, style: { maxWidth: "100%" } },
        ...slices.map((sl, i) => React.createElement("path", { key: i, d: sl.path, fill: sl.color, stroke: "#fff", strokeWidth: 1 })),
      ),
      showLegend ? React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...slices.map((sl, i) => React.createElement("span", { key: i, style: { display: "flex", alignItems: "center", gap: 4 } },
          React.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: sl.color } }),
          `${sl.label}: ${sl.val}`,
        )),
      ) : null,
    );
  }

  // Line / Bar / Area charts
  const maxVal = Math.max(...series.flatMap((sr) => sr.values), 1);
  const barW = categories.length > 0 ? (width - 40) / (categories.length * series.length) - 2 : 0;
  const xStep = categories.length > 1 ? (width - 40) / (categories.length - 1) : 0;

  const yScale = (v: number) => height - 20 - (v / maxVal) * (height - 40);
  const xPos = (i: number) => 30 + i * xStep;

  return React.createElement("div", { style: { margin: "4px 0" } },
    title ? React.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, title) : null,
    React.createElement("svg", { width, height, style: { maxWidth: "100%" } },
      // Y-axis grid lines
      ...[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = height - 20 - t * (height - 40);
        return React.createElement("line", { key: `g${i}`, x1: 30, y1: y, x2: width - 10, y2: y, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      // X-axis labels
      ...categories.map((cat, i) => React.createElement("text", { key: `x${i}`, x: xPos(i), y: height - 6, fontSize: 10, fill: TEXT_COLORS.muted, textAnchor: "middle" }, cat.length > 6 ? cat.slice(0, 6) + "…" : cat)),
      // Series
      ...series.map((sr, si) => {
        const color = CHART_COLORS[si % CHART_COLORS.length];
        if (chartType === "bar") {
          return sr.values.map((val, vi) => React.createElement("rect", {
            key: `b${si}-${vi}`, x: xPos(vi) + si * (barW + 2) - barW / 2,
            y: yScale(val), width: barW, height: height - 20 - yScale(val), fill: color, rx: 2,
          }));
        }
        // line / area
        const points = sr.values.map((val, vi) => `${xPos(vi)},${yScale(val)}`).join(" ");
        const elems = [React.createElement("polyline", { key: `l${si}`, points, fill: "none", stroke: color, strokeWidth: 2 })];
        if (chartType === "area") {
          const areaPoints = `${xPos(0)},${height - 20} ${points} ${xPos(sr.values.length - 1)},${height - 20}`;
          elems.unshift(React.createElement("polygon", { key: `a${si}`, points: areaPoints, fill: color, opacity: 0.15 }));
        }
        return elems;
      }),
    ),
    showLegend ? React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...series.map((sr, si) => React.createElement("span", { key: si, style: { display: "flex", alignItems: "center", gap: 4 } },
        React.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: CHART_COLORS[si % CHART_COLORS.length] } }),
        sr.name,
      )),
    ) : null,
  );
}
