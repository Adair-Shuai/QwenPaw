/**
 * GenUiRegistry — renders GenUI tree nodes using host antd components.
 * Ported from LeAgent (Apache-2.0). Phase-1 + Phase-2 component set.
 */

import type { GenUiNode } from "../types/genUi";
import { dispatchGenUiAction } from "../lib/genUiActionBus";
import {
  resolveMediaUrl,
  getCachedMediaUrl,
  getMediaResolutionError,
  isDirectUrl,
} from "../lib/genUiMedia";
import { fieldName, getInteractionContext } from "./GenUiInteraction";

// React is obtained from window.QwenPaw.host.React at runtime.
// These aliases avoid `import from "react"` which fails to resolve in
// the packaging mirror directory (no node_modules).
type ReactNode = any;
type ReactElement = any;

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

let formContext: any = null;
function getFormContext(React: any): any {
  if (!formContext) formContext = React.createContext(null as any);
  return formContext;
}

function GenUiForm({ node }: { node: GenUiNode }): ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React; const antd = host?.antd || {};
  if (!React) return null;
  const p = node.props || {};
  const [values, setValues] = React.useState({} as Record<string, unknown>);
  const [status, setStatus] = React.useState(null as null | { ok: boolean; message: string });
  const initialValues = React.useMemo(() => {
    const result: Record<string, unknown> = {};
    for (const child of node.children || []) {
      const cp = child.props || {}; const name = fieldName(child);
      if (cp.value !== undefined) result[name] = cp.value;
      else if (cp.checked !== undefined) result[name] = cp.checked;
    }
    return result;
  }, [node]);
  React.useEffect(() => setValues((old: Record<string, unknown>) => ({ ...initialValues, ...old })), [initialValues]);
  const api = React.useMemo(() => ({ values, setValue: (name: string, value: unknown) => {
    setStatus(null);
    setValues((old: Record<string, unknown>) => ({ ...old, [name]: value }));
  } }), [values]);
  const submit = () => {
    const missing = (node.children || []).filter((child) => child.props?.required).find((child) => {
      const name = fieldName(child); const value = values[name];
      return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
    });
    if (missing) {
      setStatus({ ok: false, message: `${s(missing.props?.label) || s(missing.props?.name) || "必填项"}不能为空` });
      return;
    }
    const action = p.action && typeof p.action === "object" ? p.action as any : { type: "submit_form", payload: {} };
    setStatus(dispatchGenUiAction(action, { formValues: values, formId: s(p.formId) || node.nodeId }));
  };
  return React.createElement(getFormContext(React).Provider, { value: api },
    React.createElement("div", { style: { margin: "4px 0" } },
      p.title ? React.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, s(p.title)) : null,
      ...(node.children || []).map((child, index) => React.createElement(GenUiTreeView, { key: child.nodeId || index, node: child })),
      React.createElement(antd.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: submit }, s(p.submitLabel) || "提交"),
      status ? React.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: status.ok ? TEXT_COLORS.success : TEXT_COLORS.error } }, status.message) : null,
    ),
  );
}

function GenUiField({ node, fieldType }: { node: GenUiNode; fieldType: string }): ReactElement | null {
  const host = (window as any).QwenPaw?.host; const React = host?.React; const antd = host?.antd || {};
  if (!React) return null;
  const p = node.props || {}; const form = React.useContext(getFormContext(React));
  const interaction = React.useContext(getInteractionContext(React));
  const ctx = form || interaction;
  const [standaloneValue, setStandaloneValue] = React.useState(p.value ?? p.checked ?? "");
  const name = fieldName(node); const initial = p.value ?? p.checked ?? "";
  const value = ctx ? (ctx.values?.[name] ?? initial) : standaloneValue;
  const change = (next: any) => {
    const normalized = next?.target ? (fieldType === "Switch" ? next.target.checked : next.target.value) : next;
    if (ctx) ctx.setValue(name, normalized); else setStandaloneValue(normalized);
  };
  const shell = (control: any) => React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    p.label && fieldType !== "Switch" ? React.createElement("label", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.label), p.required ? React.createElement("span", { style: { color: TEXT_COLORS.error } }, " *") : null) : null,
    control,
    p.description ? React.createElement("span", { style: { fontSize: 11, color: TEXT_COLORS.muted } }, s(p.description)) : null,
  );
  const ariaLabel = s(p.label) || s(p.placeholder) || name;
  if (fieldType === "Input") return shell(React.createElement(antd.Input || "input", { "aria-label": ariaLabel, placeholder: s(p.placeholder), value, onChange: change, size: "small" }));
  if (fieldType === "NumberInput") return shell(React.createElement(antd.InputNumber || "input", { "aria-label": ariaLabel, value, min: p.min, max: p.max, step: p.step, onChange: change, size: "small", style: { width: "100%" } }));
  if (fieldType === "Textarea") return shell(React.createElement(antd.Input?.TextArea || "textarea", { "aria-label": ariaLabel, placeholder: s(p.placeholder), value, rows: n(p.rows) || 3, onChange: change, style: { width: "100%" } }));
  if (fieldType === "Select") return shell(React.createElement(antd.Select || "select", { "aria-label": ariaLabel, placeholder: s(p.placeholder), value: value || undefined, onChange: change, size: "small", style: { width: "100%" } }, arr(p.options).map((option, index) => React.createElement(antd.Select?.Option || "option", { key: index, value: typeof option === "object" ? s((option as any).value) : s(option) }, typeof option === "object" ? s((option as any).label) : s(option)))));
  if (fieldType === "Switch") return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, React.createElement(antd.Switch || "input", { type: "checkbox", checked: Boolean(value), onChange: change, size: "small" }), React.createElement("span", null, s(p.label)));
  if (fieldType === "Slider") return shell(React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, React.createElement(antd.Slider || "input", { type: "range", value: n(value), min: p.min ?? 0, max: p.max ?? 100, step: p.step ?? 1, onChange: change, style: { flex: 1 } }), React.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, s(value))));
  if (fieldType === "FileInput") return React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    React.createElement("span", null, s(p.label) || "选择文件"),
    React.createElement("input", { type: "file", multiple: b(p.multiple), accept: s(p.accept) || undefined, onChange: (event: any) => ctx?.setValue(name, Array.from(event.target.files || []).map((file: any) => ({ name: file.name, size: file.size, type: file.type }))) }),
  );
  return null;
}

function GenUiActionButton({ node, link = false, toggle = false }: { node: GenUiNode; link?: boolean; toggle?: boolean }): ReactElement | null {
  const host = (window as any).QwenPaw?.host; const React = host?.React; const antd = host?.antd || {};
  if (!React) return null;
  const p = node.props || {}; const form = React.useContext(getFormContext(React));
  const [checked, setChecked] = React.useState(b(p.checked));
  const [status, setStatus] = React.useState(null as null | { ok: boolean; message: string });
  const click = () => {
    if (toggle) setChecked((value: boolean) => !value);
    if (p.action && typeof p.action === "object") {
      setStatus(dispatchGenUiAction(p.action, { formValues: form?.values, formId: form ? "form" : undefined }));
    } else if (link && typeof p.href === "string" && /^(https?:\/\/|\/)/.test(p.href)) {
      window.open(p.href, "_blank", "noopener,noreferrer");
    }
  };
  return React.createElement("span", { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    React.createElement(antd.Button || "button", { type: link ? "link" : (toggle ? checked : s(p.variant) === "primary") ? "primary" : "default", size: "small", disabled: b(p.disabled), loading: b(p.loading), onClick: click }, s(p.label) || "Action"),
    status ? React.createElement("span", { role: "status", style: { fontSize: 11, color: status.ok ? TEXT_COLORS.success : TEXT_COLORS.error } }, status.message) : null,
  );
}

// ── ErrorBoundary ──────────────────────────────────────────────────────────

function GenUiErrorBoundary({ node, children }: { node: GenUiNode; children: ReactNode }): ReactNode {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React;
  if (!React) return null;

  class ErrorBoundary extends React.Component<{ node: GenUiNode; children: ReactNode }, { hasError: boolean }, { kind: string }> {
    constructor(props: { node: GenUiNode; children: ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(err: unknown) {
      console.error("[ugsci.genui] Component error for kind '%s':", this.props.node.kind, err);
    }
    render() {
      if ((this.state as { hasError: boolean }).hasError) {
        return React.createElement("div", {
          style: { padding: 8, border: "1px dashed var(--ant-color-error, #ff4d4f)", borderRadius: 8, fontSize: 12, color: TEXT_COLORS.error, fontFamily: "monospace" },
        }, `⚠️ Component error: ${this.props.node.kind}`);
      }
      return this.props.children;
    }
  }
  return React.createElement(ErrorBoundary, { node }, children);
}

// ── Main tree renderer ─────────────────────────────────────────────────────

export function GenUiTreeView({ node }: { node: GenUiNode }): ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  if (!host?.React) return null;
  const React = host.React;
  const antd = host.antd || {};

  const p = node.props || {};
  const children = node.children || [];
  const renderChildren = () => children.map((c, i) =>
    React.createElement(GenUiTreeView, { key: c.nodeId || i, node: c })
  );

  // Wrap each component in an ErrorBoundary for isolation
  return React.createElement(GenUiErrorBoundary, { node },
    renderNode(React, antd, node, p, children, renderChildren)
  ) as ReactElement;
}

function renderNode(React: any, antd: any, node: GenUiNode, p: Record<string, unknown>, children: GenUiNode[], renderChildren: () => any[]): ReactElement | null {
  switch (node.kind) {
    // ── Layout ───────────────────────────────────────────────────────────
    case "Stack": return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: `${n(p.gap) || 12}px`, padding: p.padding ? `${n(p.padding)}px` : undefined } }, renderChildren());
    case "Row": return React.createElement("div", { style: { display: "flex", flexDirection: "row", gap: `${n(p.gap) || 12}px`, alignItems: s(p.align) || undefined, justifyContent: s(p.justify) || undefined } }, renderChildren());
    case "Grid": return React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(n(p.columns) || 2, 1), 6)}, 1fr)`, gap: `${n(p.gap) || 12}px` } }, renderChildren());
    case "Spacer": return React.createElement("div", { style: { height: `${n(p.size) || 16}px` } });
    case "ScrollArea": return React.createElement("div", { style: { maxHeight: p.maxHeight ? `${n(p.maxHeight)}px` : "300px", overflowY: "auto", padding: p.padding ? `${n(p.padding)}px` : undefined } }, renderChildren());
    case "AspectBox": {
      const ratio = s(p.ratio) || "16:9"; const [rw, rh] = ratio.split(":").map(Number);
      const ratioVal = rw && rh ? `${rh}/${rw}` : "9/16";
      return React.createElement("div", { style: { aspectRatio: ratioVal, overflow: "hidden", borderRadius: 8, display: "flex", justifyContent: "center", alignItems: "center" } }, renderChildren());
    }

    // ── Text ─────────────────────────────────────────────────────────────
    case "Text": return React.createElement("div", { style: { fontSize: TEXT_SIZES[s(p.size)] || TEXT_SIZES.base, color: TEXT_COLORS[s(p.color)] || TEXT_COLORS.default, fontWeight: b(p.bold) ? "bold" : "normal", lineHeight: 1.6 } }, s(p.value));
    case "Heading": { const lvl = Math.min(Math.max(n(p.level) || 2, 1), 4); const sizes: Record<number, string> = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" }; return React.createElement("div", { style: { fontSize: sizes[lvl], fontWeight: "bold", margin: "4px 0" } }, s(p.value)); }
    case "Divider": return React.createElement(antd.Divider || "hr", p.label ? { children: s(p.label) } : {});
    case "Markdown": {
      const host = (window as any).QwenPaw?.host;
      const ReactMarkdown = host?.ReactMarkdown;
      if (ReactMarkdown) {
        const remarkPlugins = host?.remarkGfm ? [host.remarkGfm] : [];
        return React.createElement("div", { className: "qwenpaw-genui-markdown" },
          React.createElement(ReactMarkdown, { children: s(p.content || p.value), remarkPlugins }),
        );
      }
      // Fallback: render as preformatted text if ReactMarkdown not available
      return React.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, s(p.content || p.value));
    }
    case "CodeBlock": return React.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, s(p.code));
    case "SectionHeader": return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, p.icon ? React.createElement("span", { style: { fontSize: 20 } }, s(p.icon)) : null, React.createElement("div", null, React.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, s(p.title)), p.subtitle ? React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.subtitle)) : null));
    case "KeyValueList": {
      const items = arr(p.items);
      return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...items.map((item: any, i: number) => React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: i < items.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          React.createElement("span", { style: { color: TEXT_COLORS.muted, fontSize: 13 } }, s(item.key)),
          React.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, s(item.value)),
        )),
      );
    }

    // ── Status / Display ────────────────────────────────────────────────
    case "Badge": return React.createElement(antd.Tag || "span", { color: s(p.variant) || "default", children: s(p.value) });
    case "Tag": return React.createElement(antd.Tag || "span", { color: s(p.color) || "default", children: s(p.label) });
    case "Stat": return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, React.createElement("span", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.label)), React.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, s(p.value)), p.delta ? React.createElement("span", { style: { fontSize: 12, color: s(p.trend) === "up" ? TEXT_COLORS.success : s(p.trend) === "down" ? TEXT_COLORS.error : TEXT_COLORS.muted } }, s(p.delta)) : null);
    case "Progress": return React.createElement(antd.Progress || "div", { percent: n(p.value), size: "small" });
    case "Skeleton": {
      const rows = n(p.rows) || 3;
      return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: rows }).map((_, i) => React.createElement(antd.Skeleton || "div", { key: i, active: b(p.active), title: false, paragraph: { rows: 1 } }),
        ),
      );
    }
    case "Avatar": return React.createElement(GenUiMediaAvatar, {
      src: s(p.src),
      name: s(p.name),
      size: n(p.size) || 32,
    });
    case "Icon": return React.createElement("span", { style: { fontSize: n(p.size) || 16, color: TEXT_COLORS[s(p.color)] || TEXT_COLORS.default } }, s(p.name));

    // ── Cards ───────────────────────────────────────────────────────────
    case "Card": return React.createElement(antd.Card || "div", { title: p.title ? s(p.title) : undefined, size: "small", style: { margin: "4px 0" } }, renderChildren());
    case "DataCard": return React.createElement(antd.Card || "div", { size: "small", style: { margin: "4px 0" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, React.createElement("div", null, React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.title)), React.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, s(p.value))), p.icon ? React.createElement("span", { style: { fontSize: 32 } }, s(p.icon)) : null));
    case "MetricCard": return React.createElement(antd.Card || "div", { size: "small", style: { margin: "4px 0" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, React.createElement("div", null, React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.title)), React.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, s(p.value)), p.delta ? React.createElement("span", { style: { fontSize: 12, color: s(p.trend) === "up" ? TEXT_COLORS.success : s(p.trend) === "down" ? TEXT_COLORS.error : TEXT_COLORS.muted } }, `${s(p.delta)} ${p.period ? s(p.period) : ""}`.trim()) : null), p.icon ? React.createElement("span", { style: { fontSize: 32 } }, s(p.icon)) : null));
    case "AlertCard": case "Alert": return React.createElement(antd.Alert || "div", { type: s(p.severity) === "success" ? "success" : s(p.severity) === "warning" ? "warning" : s(p.severity) === "error" ? "error" : "info", message: p.title ? s(p.title) : undefined, description: s(p.message), showIcon: true, style: { margin: "4px 0" } });
    case "Callout": return React.createElement(antd.Alert || "div", { type: s(p.variant) === "tip" ? "success" : s(p.variant) === "warning" ? "warning" : s(p.variant) === "important" ? "error" : "info", message: p.title ? s(p.title) : undefined, description: s(p.message), showIcon: true });
    case "WeatherCard": return React.createElement(antd.Card || "div", { size: "small", style: { margin: "4px 0", display: "flex", alignItems: "center", gap: 16 } }, p.icon ? React.createElement("span", { style: { fontSize: 40 } }, s(p.icon)) : null, React.createElement("div", null, React.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, s(p.temperature)), React.createElement("div", { style: { color: TEXT_COLORS.muted } }, s(p.condition)), React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.location))));
    case "ProfileCard": return React.createElement(antd.Card || "div", { size: "small", style: { margin: "4px 0" } }, React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center" } }, React.createElement(GenUiMediaAvatar, { src: s(p.avatar), name: s(p.name), size: 48 }), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 600 } }, s(p.name)), React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.role)), p.bio ? React.createElement("div", { style: { fontSize: 12, marginTop: 4 } }, s(p.bio)) : null)));
    case "MediaCard": return React.createElement(antd.Card || "div", { size: "small", style: { margin: "4px 0", overflow: "hidden" } }, React.createElement(GenUiMediaImage, { src: s(p.src), alt: s(p.title), style: { width: "100%", maxHeight: 200, objectFit: "cover" } }), React.createElement("div", { style: { padding: "8px 12px" } }, React.createElement("div", { style: { fontWeight: 600 } }, s(p.title)), p.caption ? React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.caption)) : null));
    case "QuoteCard": return React.createElement(antd.Card || "div", { size: "small", style: { margin: "4px 0", fontStyle: "italic" } }, React.createElement("div", { style: { fontSize: 14, lineHeight: 1.6 } }, `"${s(p.quote)}"`), React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted, marginTop: 8 } }, `— ${s(p.author)}${p.role ? `, ${s(p.role)}` : ""}`));
    case "TimelineCard": return React.createElement(antd.Card || "div", { size: "small", style: { margin: "4px 0" } }, React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, React.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: s(p.status) === "done" ? TEXT_COLORS.success : s(p.status) === "pending" ? TEXT_COLORS.warning : TEXT_COLORS.primary, marginTop: 4, flexShrink: 0 } }), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 600 } }, s(p.title)), p.date ? React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.date)) : null, p.description ? React.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, s(p.description)) : null)));
    case "KpiBoard": return React.createElement("div", { style: { margin: "4px 0" } }, p.title ? React.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, s(p.title)) : null, React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(n(p.columns) || 3, 1), 6)}, 1fr)`, gap: 12 } }, renderChildren()));
    case "FeatureGrid": return React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(n(p.columns) || 2, 1), 4)}, 1fr)`, gap: `${n(p.gap) || 12}px`, margin: "4px 0" } }, renderChildren());
    case "Stepper": {
      const steps = arr(p.steps).map((st) => s(st));
      const current = n(p.current);
      return React.createElement(antd.Steps || "div", { current, size: "small", style: { margin: "4px 0" } },
        ...steps.map((label: string, i: number) => React.createElement(antd.Steps?.Item || "div", { key: i, title: label })),
      );
    }

    // ── Table / List ────────────────────────────────────────────────────
    case "Table": {
      const headers = arr(p.headers).map((h) => s(h));
      const rows = children.filter((c) => c.kind === "TableRow");
      const dataSource = rows.map((row, ri) => {
        const cells = (row.children || []).filter((c) => c.kind === "TableCell");
        const rd: Record<string, unknown> = { key: ri };
        headers.forEach((h, ci) => {
          const value = cells[ci]?.props?.value;
          rd[h] = value === undefined || value === null ? "" : s(value);
        });
        return rd;
      });
      const columns = headers.map((h) => ({ title: h, dataIndex: h, key: h }));
      return React.createElement(antd.Table || "table", { dataSource, columns, size: b(p.compact) ? "small" : "middle", pagination: false, style: { margin: "4px 0" } });
    }
    case "List": {
      const items = children.filter((c) => c.kind === "ListItem");
      return React.createElement(antd.List || "ul", { size: "small", style: { margin: "4px 0" } },
        items.map((item, i) => React.createElement(antd.List?.Item || "li", { key: i }, item.props?.icon ? React.createElement("span", { style: { marginRight: 6 } }, s(item.props.icon)) : null, s(item.props?.value))));
    }
    case "ImageGallery": {
      const images = children.filter((c) => c.kind === "Image");
      return React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(n(p.columns) || 3, 1), 6)}, 1fr)`, gap: `${n(p.gap) || 8}px`, margin: "4px 0" } },
        ...images.map((img, i) => {
          const ip = img.props || {};
          return React.createElement(GenUiMediaImage, { key: i, src: s(ip.src), alt: s(ip.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        }),
      );
    }

    // ── Media ───────────────────────────────────────────────────────────
    case "Image": return React.createElement("div", null, React.createElement(GenUiMediaImage, { src: s(p.src), alt: s(p.alt), style: { maxWidth: "100%", borderRadius: b(p.rounded) ? "8px" : undefined, maxHeight: p.maxHeight ? `${n(p.maxHeight)}px` : undefined } }), p.caption ? React.createElement("div", { style: { fontSize: 12, color: TEXT_COLORS.muted } }, s(p.caption)) : null);
    case "Chart": return React.createElement(GenUiChart, { props: p });

    // ── Interactive ─────────────────────────────────────────────────────
    case "Button": case "InteractiveButton": return React.createElement(GenUiActionButton, { node });
    case "ToggleButton": return React.createElement(GenUiActionButton, { node, toggle: true });
    case "LinkButton": return React.createElement(GenUiActionButton, { node, link: true });
    case "Input": case "NumberInput": case "Select": case "Textarea": case "Switch": case "Slider": case "FileInput": return React.createElement(GenUiField, { node, fieldType: node.kind });
    case "Form": return React.createElement(GenUiForm, { node });
    case "Chip": return React.createElement(antd.Tag || "span", { color: s(p.color) || "default", closable: true, onClose: () => {}, children: s(p.label) });
    case "ChipGroup": {
      const items = arr(p.items);
      return React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...items.map((item, i) => React.createElement(antd.Tag || "span", { key: i }, s(item))));
    }

    // ── Tabs / Accordion ────────────────────────────────────────────────
    case "Tabs": {
      const tabItems = children.filter((c) => c.kind === "TabItem");
      const items = tabItems.map((tab) => ({
        key: s(tab.props?.key) || s(tab.props?.tab),
        label: s(tab.props?.tab),
        children: (tab.children || []).map((c, i) => React.createElement(GenUiTreeView, { key: c.nodeId || i, node: c })),
      }));
      if (antd.Tabs) return React.createElement(antd.Tabs, { items, defaultActiveKey: s(p.activeKey) || items[0]?.key });
      return React.createElement("div", null, ...items.map((item, i) => React.createElement("div", { key: i }, React.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, item.label), item.children)));
    }
    case "TabItem": return React.createElement("div", null, renderChildren());
    case "Accordion": {
      const accItems = children.filter((c) => c.kind === "AccordionItem");
      if (antd.Collapse) {
        const panels = accItems.map((item) => ({
          key: s(item.props?.key) || s(item.props?.header),
          label: s(item.props?.header),
          children: (item.children || []).map((c, i) => React.createElement(GenUiTreeView, { key: c.nodeId || i, node: c })),
        }));
        return React.createElement(antd.Collapse, { items: panels });
      }
      return React.createElement("div", null, ...accItems.map((item, i) => React.createElement("details", { key: i }, React.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, s(item.props?.header)), React.createElement("div", { style: { paddingLeft: 12 } }, (item.children || []).map((c, j) => React.createElement(GenUiTreeView, { key: c.nodeId || j, node: c }))))));
    }
    case "AccordionItem": return React.createElement("div", null, renderChildren());

    // ── Debug ───────────────────────────────────────────────────────────
    case "JsonDebug": return React.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, React.createElement("summary", null, s(p.label) || "Debug JSON"), React.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(p.data ?? p, null, 2)));

    // ── Unknown (safe placeholder) ──────────────────────────────────────
    default: return React.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: TEXT_COLORS.muted, fontFamily: "monospace" } }, `Unknown component: ${node.kind}`);
  }
}

// ── Chart renderer (SVG-based, no external deps) ─────────────────────────
const CHART_COLORS = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];

function GenUiChart({ props: p }: { props: Record<string, unknown> }): ReactElement | null {
  const React = (window as any).QwenPaw?.host?.React;
  if (!React) return null;

  const interaction = React.useContext(getInteractionContext(React));

  const chartType = s(p.chart) || "line";
  const title = s(p.title);
  let categories = arr(p.categories).map((c) => s(c));
  let seriesRaw = arr(p.series);
  const height = n(p.height) || 200;
  const showLegend = p.showLegend !== false;
  const width = 400;

  const generator = p.generator && typeof p.generator === "object" ? p.generator as Record<string, unknown> : {};
  const coefficientNames = arr(generator.coefficients).map(s);
  const inferredNames = ["a", "b", "c", "d", "e"];
  const names = coefficientNames.length > 0 ? coefficientNames : inferredNames;
  const canGeneratePolynomial = (s(generator.type) === "polynomial" || coefficientNames.length > 0 || inferredNames.every((name) => interaction?.values?.[name] !== undefined));
  if (canGeneratePolynomial && interaction) {
    const xMin = typeof generator.xMin === "number" ? generator.xMin : -3;
    const xMax = typeof generator.xMax === "number" ? generator.xMax : 3;
    const samples = Math.min(Math.max(n(generator.samples) || 61, 10), 400);
    const xs = Array.from({ length: samples }, (_, index) => xMin + (xMax - xMin) * index / (samples - 1));
    const coefficients = names.map((name) => n(interaction.values?.[name]));
    categories = xs.map((x) => Number(x.toFixed(2)).toString());
    seriesRaw = [{ name: s(generator.label) || "f(x)", values: xs.map((x) => coefficients.reduce((sum, coefficient, index) => sum + coefficient * Math.pow(x, coefficients.length - index - 1), 0)) }];
  }

  const series: { name: string; values: number[] }[] = seriesRaw.map((sr, i) => {
    const r = sr as Record<string, unknown>;
    const vals = arr(r.values).map((v) => n(v));
    return { name: s(r.name) || `Series ${i + 1}`, values: vals };
  });

  if (categories.length === 0 || series.length === 0) {
    return React.createElement("div", { style: { padding: 12, color: TEXT_COLORS.muted, fontSize: 12 } }, "Chart: no data");
  }

  // Pie chart
  if (chartType === "pie") {
    // Use absolute values for pie chart — negative values don't make sense
    // for pie slices, but we handle them gracefully by taking abs()
    const pieValues = series[0].values.map((v) => Math.abs(v));
    const total = pieValues.reduce((a, b) => a + b, 0) || 1;
    const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 - 20;
    let cumAngle = -Math.PI / 2;
    const slices = pieValues.map((val, i) => {
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
  const allValues = series.flatMap((sr) => sr.values);
  const maxVal = Math.max(...allValues, 0);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;
  const groupW = categories.length > 0 ? (width - 40) / categories.length : 0;
  const barW = series.length > 0 ? Math.max(1, groupW / series.length - 2) : 0;
  const xStep = categories.length > 1 ? (width - 40) / (categories.length - 1) : 0;
  const labelEvery = Math.max(1, Math.ceil(categories.length / 8));
  const yScale = (v: number) => height - 20 - ((v - minVal) / range) * (height - 40);
  const zeroY = yScale(0);
  const xPos = (i: number) => 30 + i * xStep;

  return React.createElement("div", { style: { margin: "4px 0" } },
    title ? React.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, title) : null,
    React.createElement("svg", { width, height, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = height - 20 - t * (height - 40);
        return React.createElement("line", { key: `g${i}`, x1: 30, y1: y, x2: width - 10, y2: y, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...categories.map((cat, i) => (i % labelEvery === 0 || i === categories.length - 1) ? React.createElement("text", { key: `x${i}`, x: xPos(i), y: height - 6, fontSize: 10, fill: TEXT_COLORS.muted, textAnchor: "middle" }, cat.length > 6 ? cat.slice(0, 6) + "…" : cat) : null),
      ...series.map((sr, si) => {
        const color = CHART_COLORS[si % CHART_COLORS.length];
        if (chartType === "bar") {
          return sr.values.map((val, vi) => React.createElement("rect", {
            key: `b${si}-${vi}`,
            x: 30 + vi * groupW + si * (barW + 2) + 1,
            y: Math.min(yScale(val), zeroY),
            width: barW,
            height: Math.abs(zeroY - yScale(val)),
            fill: color,
            rx: 2,
          }));
        }
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

// ── Media Image component (async URL resolution) ──────────────────────────

/**
 * GenUiMediaImage — wraps <img> with async workspace media URL resolution.
 *
 * For direct URLs (http, data, blob), renders immediately.
 * For workspace/absolute paths, resolves via genUiMedia adapter and
 * shows a placeholder while loading.
 */
function GenUiMediaImage(props: {
  src: string;
  alt?: string;
  style?: Record<string, unknown>;
}): ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React;
  if (!React) return null;

  const { useState, useEffect } = React;
  const [resolvedUrl, setResolvedUrl] = useState(
    (getCachedMediaUrl(props.src) || (isDirectUrl(props.src) ? props.src : null)) as string | null,
  );
  const [resolutionError, setResolutionError] = useState(
    getMediaResolutionError(props.src),
  );

  useEffect(() => {
    if (!props.src) return;
    if (isDirectUrl(props.src)) {
      setResolvedUrl(props.src);
      setResolutionError(null);
      return;
    }
    // Check cache first
    const cached = getCachedMediaUrl(props.src);
    if (cached) {
      setResolvedUrl(cached);
      setResolutionError(null);
      return;
    }
    setResolvedUrl(null);
    setResolutionError(null);
    // Async resolve
    let cancelled = false;
    resolveMediaUrl(props.src).then((url) => {
      if (!cancelled) {
        setResolvedUrl(url);
        setResolutionError(url ? null : getMediaResolutionError(props.src));
      }
    });
    return () => { cancelled = true; };
  }, [props.src]);

  if (!resolvedUrl) {
    return React.createElement(
      "div",
      {
        role: resolutionError ? "alert" : "status",
        style: {
          ...(props.style || {}),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 80,
          padding: 12,
          textAlign: "center",
          color: resolutionError ? TEXT_COLORS.error : TEXT_COLORS.muted,
          fontSize: 12,
          background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
          borderRadius: 8,
        },
      },
      resolutionError ? `媒体加载失败：${resolutionError}` : "正在解析图片…",
    );
  }

  return React.createElement("img", {
    src: resolvedUrl,
    alt: props.alt || "",
    style: props.style || {},
    onError: () => {
      console.warn("[ugsci.genui] Image failed to load:", props.src);
    },
  });
}

/** Render an avatar through the media adapter without exposing local paths. */
function GenUiMediaAvatar(props: {
  src: string;
  name?: string;
  size: number;
}): ReactElement | null {
  const host = (window as any).QwenPaw?.host;
  const React = host?.React;
  const antd = host?.antd || {};
  if (!React) return null;
  if (!props.src) {
    return React.createElement(
      antd.Avatar || "div",
      { size: props.size },
      props.name?.charAt(0)?.toUpperCase() || "",
    );
  }
  return React.createElement(GenUiMediaImage, {
    src: props.src,
    alt: props.name,
    style: {
      width: props.size,
      height: props.size,
      borderRadius: "50%",
      objectFit: "cover",
    },
  });
}
