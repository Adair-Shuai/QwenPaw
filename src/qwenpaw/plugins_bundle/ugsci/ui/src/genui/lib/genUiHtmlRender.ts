/** Build a standalone GenUI HTML document from the shared view-model. */

import type { GenUiNode } from "../types/genUi";
import {
  ACTION_BUTTON_KINDS,
  asArray,
  asBool,
  asNumber,
  asText,
  clampHeadingLevel,
  fieldName,
  isFieldKind,
  isHttpUrl,
  layoutBoxStyle,
  paintChartElement,
  paintGenUiIcon,
  resolveChartModel,
} from "./genUiModel";

export type EmbeddedMedia = {
  sources: Record<string, string>;
  missing: string[];
};

type RenderCtx = {
  values: Record<string, unknown>;
  media: Record<string, string>;
  missing: Set<string>;
};

const EXPORT_CSS = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
.stack { display: flex; flex-direction: column; gap: 12px; } .row { display: flex; gap: 12px; align-items: center; } .grid { display: grid; gap: 12px; }
.card { padding: 14px; border: 1px solid #e5e7eb; border-radius: 10px; } .card-title,.chart-title { margin-bottom: 8px; font-weight: 600; } .card-subtitle { margin-top: -5px; margin-bottom: 8px; }
.field { display: flex; flex-direction: column; gap: 5px; margin: 5px 0; } .field-label,.description { color: #667085; font-size: 12px; }
input,select,textarea,button { font: inherit; } input:not([type=range]):not([type=checkbox]),select,textarea { width: 100%; padding: 7px 9px; border: 1px solid #d0d5dd; border-radius: 6px; }
input[type=range] { flex: 1; accent-color: #1677ff; } .slider-line,.switch-line { display: flex; align-items: center; gap: 10px; } .slider-value { min-width: 42px; font-size: 12px; }
button { padding: 6px 12px; border: 1px solid #d0d5dd; border-radius: 6px; background: #fff; cursor: pointer; } button.active,.button:hover { color: #1677ff; border-color: #1677ff; }
.tabs { margin: 6px 0; } .tab-buttons { display: flex; gap: 4px; border-bottom: 1px solid #e5e7eb; } .tab-buttons button { border: 0; border-radius: 0; } .tab-buttons button.active { border-bottom: 2px solid #1677ff; } .tab-panel { padding: 12px 2px; } .hidden { display: none; }
details { border-bottom: 1px solid #e5e7eb; } summary { padding: 9px 0; cursor: pointer; font-weight: 600; } .accordion-body { padding: 0 0 10px 12px; }
.chart svg { display: block; width: 100%; height: auto; min-height: 180px; } .legend { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; } .legend span { display: flex; align-items: center; gap: 4px; } .legend i { width: 10px; height: 10px; border-radius: 2px; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #f0f5ff; color: #1677ff; } .alert { padding: 10px 12px; border: 1px solid #91caff; border-radius: 8px; background: #e6f4ff; }
.code { padding: 12px; overflow: auto; border-radius: 8px; background: #f2f4f7; } .divider { display: flex; align-items: center; margin: 10px 0; border-top: 1px solid #e5e7eb; } .divider span { padding-right: 8px; background: white; transform: translateY(-50%); }
figure { margin: 0; } img { max-width: 100%; } .bold { font-weight: 700; } .muted { color: #667085; } .small { font-size: 12px; } .display-value,.stat-value { font-size: 24px; font-weight: 700; } .offline-status { display: block; margin-top: 5px; color: #b54708; }
.image-gallery { display: grid; gap: 8px; } .avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; display: inline-flex; align-items: center; justify-content: center; } .avatar-fallback { background: #e6f4ff; color: #1677ff; font-weight: 700; }
.icon { display: inline-flex; align-items: center; justify-content: center; } .icon svg { display: block; }
.media-unavailable { min-height: 96px; display: flex; align-items: center; justify-content: center; padding: 12px; border: 1px dashed #f79009; border-radius: 8px; color: #b54708; background: #fffaeb; }
.metric-card { display: flex; justify-content: space-between; align-items: center; } .metric-icon,.section-icon { font-size: 28px; } .section-header { display: flex; align-items: center; gap: 8px; } .profile { display: flex; gap: 12px; align-items: center; }
.key-values { display: grid; grid-template-columns: minmax(100px, 1fr) minmax(120px, 2fr); gap: 5px 12px; margin: 0; } .key-values dt { color: #667085; } .key-values dd { margin: 0; font-weight: 500; text-align: right; }
.data-table { width: 100%; border-collapse: collapse; } .data-table th,.data-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; } .data-table .highlight { background: #f0f5ff; }
.chips { display: flex; flex-wrap: wrap; gap: 4px; } .skeletons { display: flex; flex-direction: column; gap: 8px; } .skeleton { height: 12px; border-radius: 6px; background: #eaecf0; } .scroll-area { overflow-y: auto; } .aspect-box { overflow: hidden; display: flex; align-items: center; justify-content: center; }
.unknown-component { padding: 8px; border: 1px dashed #d0d5dd; border-radius: 8px; color: #667085; font: 12px ui-monospace, monospace; }
@media print { body { padding: 0; } }`;

const LAYOUT_CLASS: Record<string, string> = {
  Stack: "stack",
  Row: "row",
  Grid: "grid",
  Card: "card",
  Alert: "alert",
  AlertCard: "alert",
  Callout: "alert",
  FeatureGrid: "grid",
  ScrollArea: "scroll-area",
  AspectBox: "aspect-box",
  Form: "stack form",
  KpiBoard: "stack",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    if (character === "&") return "&amp;";
    if (character === "<") return "&lt;";
    if (character === ">") return "&gt;";
    if (character === '"') return "&quot;";
    return "&#39;";
  });
}

export function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function el(tag: string, className = "", text?: unknown): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null && text !== "") node.textContent = asText(text);
  return node;
}

function applyStyle(node: HTMLElement, style: Record<string, string>): void {
  Object.assign(node.style, style);
}

function appendNodes(target: HTMLElement, children: GenUiNode[] | undefined, ctx: RenderCtx): HTMLElement {
  for (const child of children || []) target.appendChild(renderExportNode(child, ctx));
  return target;
}

function labelValue(target: HTMLElement, label: unknown, value: unknown): HTMLElement {
  if (label) target.appendChild(el("div", "muted small", label));
  target.appendChild(el("div", "display-value", value));
  return target;
}

function mediaImage(source: unknown, alt: unknown, className: string, ctx: RenderCtx): HTMLElement {
  const src = asText(source);
  if (ctx.missing.has(src)) {
    const fallback = el("div", `media-unavailable ${className}`.trim(), "此媒体未能离线嵌入");
    fallback.setAttribute("role", "img");
    fallback.setAttribute("aria-label", asText(alt));
    return fallback;
  }
  const image = el("img", className) as HTMLImageElement;
  image.src = ctx.media[src] || src;
  image.alt = asText(alt);
  return image;
}

function avatar(src: unknown, name: unknown, ctx: RenderCtx): HTMLElement {
  if (src) return mediaImage(src, name, "avatar", ctx);
  return el("span", "avatar avatar-fallback", asText(name).charAt(0).toUpperCase());
}

function renderMarkdown(value: unknown): HTMLElement {
  const target = el("div", "markdown");
  let list: HTMLElement | null = null;
  for (const line of asText(value).split(/\r?\n/)) {
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const item = line.match(/^\s*[-*]\s+(.*)$/);
    if (heading) {
      list = null;
      target.appendChild(el(`h${heading[1].length}`, "", heading[2]));
    } else if (item) {
      if (!list) {
        list = el("ul");
        target.appendChild(list);
      }
      list.appendChild(el("li", "", item[1]));
    } else if (!line.trim()) {
      list = null;
      target.appendChild(document.createElement("br"));
    } else {
      list = null;
      target.appendChild(el("p", "", line));
    }
  }
  return target;
}

function renderField(node: GenUiNode, ctx: RenderCtx): HTMLElement {
  const props = node.props || {};
  const kind = node.kind;
  const name = fieldName(node);
  const shell = el("label", "field");
  if (props.label && kind !== "Switch") {
    shell.appendChild(el("span", "field-label", `${asText(props.label)}${props.required ? " *" : ""}`));
  }
  let control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  if (kind === "Textarea") {
    const textarea = el("textarea") as HTMLTextAreaElement;
    textarea.rows = asNumber(props.rows) || 3;
    textarea.placeholder = asText(props.placeholder);
    control = textarea;
  } else if (kind === "Select") {
    const select = el("select") as HTMLSelectElement;
    for (const option of asArray(props.options)) {
      const item = el("option") as HTMLOptionElement;
      const record = option && typeof option === "object" ? option as Record<string, unknown> : null;
      item.value = record ? asText(record.value) : asText(option);
      item.textContent = record ? asText(record.label) : asText(option);
      select.appendChild(item);
    }
    control = select;
  } else {
    const input = el("input") as HTMLInputElement;
    input.type = kind === "Slider" ? "range" : kind === "Switch" ? "checkbox" : kind === "NumberInput" ? "number" : kind === "FileInput" ? "file" : "text";
    if (props.min != null) input.min = asText(props.min);
    if (props.max != null) input.max = asText(props.max);
    if (props.step != null) input.step = asText(props.step);
    if (kind === "FileInput") {
      if (props.accept) input.accept = asText(props.accept);
      input.multiple = asBool(props.multiple);
    } else {
      input.placeholder = asText(props.placeholder);
    }
    control = input;
  }
  const initial = Object.prototype.hasOwnProperty.call(ctx.values, name)
    ? ctx.values[name]
    : (props.value != null ? props.value : props.checked != null ? props.checked : "");
  if (kind === "Switch") {
    const input = control as HTMLInputElement;
    input.checked = asBool(initial);
    if (input.checked) input.setAttribute("checked", "");
    else input.removeAttribute("checked");
  } else if (kind === "Textarea") {
    control.value = asText(initial);
    control.textContent = asText(initial);
  } else if (kind === "Select") {
    const selected = asText(initial);
    control.value = selected;
    for (const option of Array.from((control as HTMLSelectElement).options)) {
      if (option.value === selected) option.setAttribute("selected", "");
      else option.removeAttribute("selected");
    }
  } else if (kind !== "FileInput") {
    control.value = asText(initial);
    control.setAttribute("value", asText(initial));
  }
  control.setAttribute("data-genui-field", name);
  control.setAttribute("data-genui-kind", kind);
  if (kind === "Switch") {
    const line = el("span", "switch-line");
    line.append(control, el("span", "", props.label));
    shell.appendChild(line);
  } else if (kind === "Slider") {
    const line = el("span", "slider-line");
    line.append(control, el("output", "slider-value", initial));
    shell.appendChild(line);
  } else {
    shell.appendChild(control);
  }
  if (props.description) shell.appendChild(el("small", "description", props.description));
  return shell;
}

function renderExportNode(node: GenUiNode, ctx: RenderCtx): HTMLElement {
  // Kind coverage is contract-tested against schema._COMPONENT_CATALOG
  // (plus FORM_FIELD_KINDS / ACTION_BUTTON_KINDS in genUiModel.ts).
  if (!node || typeof node !== "object") return el("div");
  const props = node.props || {};
  const children = node.children || [];
  if (isFieldKind(node.kind)) return renderField(node, ctx);
  if (node.kind === "Chart") {
    const holder = el("div", "chart");
    holder.setAttribute("data-genui-chart", JSON.stringify(props));
    paintChartElement(holder, resolveChartModel(props, ctx.values));
    return holder;
  }
  if (node.kind === "Heading") return el(`h${clampHeadingLevel(props.level)}`, "", props.value);
  if (node.kind === "Text") return el("div", asBool(props.bold) ? "text bold" : "text", props.value);
  if (node.kind === "Markdown") return renderMarkdown(props.content || props.value);
  if (node.kind === "CodeBlock") return el("pre", "code", props.code);
  if (node.kind === "SectionHeader") {
    const result = el("div", "section-header");
    if (props.icon) result.appendChild(el("span", "section-icon", props.icon));
    const body = el("div");
    body.appendChild(el("strong", "", props.title));
    if (props.subtitle) body.appendChild(el("div", "muted small", props.subtitle));
    result.appendChild(body);
    return result;
  }
  if (node.kind === "KeyValueList") {
    const result = el("dl", "key-values");
    for (const item of asArray(props.items)) {
      const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
      result.append(el("dt", "", row.key), el("dd", "", row.value));
    }
    return result;
  }
  if (node.kind === "Divider") {
    const result = el("div", "divider");
    if (props.label) result.appendChild(el("span", "", props.label));
    return result;
  }
  if (node.kind === "Spacer") {
    const result = el("div");
    applyStyle(result, layoutBoxStyle("Spacer", props));
    return result;
  }
  if (node.kind === "Tabs") {
    const result = el("div", "tabs");
    result.setAttribute("data-genui-tabs", "1");
    const buttons = el("div", "tab-buttons");
    const panels = el("div");
    const tabs = children.filter((child) => child.kind === "TabItem");
    tabs.forEach((tab, index) => {
      buttons.appendChild(el("button", index ? "" : "active", tab.props?.tab));
      panels.appendChild(appendNodes(el("div", index ? "tab-panel hidden" : "tab-panel"), tab.children, ctx));
    });
    result.append(buttons, panels);
    return result;
  }
  if (node.kind === "Accordion") {
    const result = el("div");
    for (const item of children.filter((child) => child.kind === "AccordionItem")) {
      const details = el("details");
      details.append(el("summary", "", item.props?.header), appendNodes(el("div", "accordion-body"), item.children, ctx));
      result.appendChild(details);
    }
    return result;
  }
  if (node.kind === "Form") {
    const result = el("div", "stack form");
    if (props.title) result.appendChild(el("div", "card-title", props.title));
    appendNodes(result, children, ctx);
    const submit = el("button", "button", asText(props.submitLabel) || "提交");
    submit.setAttribute("data-genui-submit", "1");
    result.appendChild(submit);
    return result;
  }
  if (ACTION_BUTTON_KINDS.has(node.kind)) {
    const result = el("button", node.kind === "LinkButton" ? "link-button" : "button", asText(props.label) || "Action");
    if (asBool(props.disabled)) (result as HTMLButtonElement).disabled = true;
    result.setAttribute("data-genui-action", node.kind);
    if (node.kind === "LinkButton" && isHttpUrl(props.href)) {
      result.setAttribute("data-genui-href", asText(props.href).trim());
    }
    return result;
  }
  if (node.kind === "Image") {
    const result = el("figure");
    result.appendChild(mediaImage(props.src, props.alt, "", ctx));
    if (props.caption) result.appendChild(el("figcaption", "", props.caption));
    return result;
  }
  if (node.kind === "ImageGallery") {
    const result = el("div", "image-gallery");
    applyStyle(result, layoutBoxStyle("ImageGallery", props));
    for (const child of children.filter((item) => item.kind === "Image")) {
      result.appendChild(renderExportNode(child, ctx));
    }
    return result;
  }
  if (node.kind === "Avatar") return avatar(props.src, props.name, ctx);
  if (node.kind === "Badge" || node.kind === "Tag" || node.kind === "Chip") {
    return el("span", "tag", props.value || props.label);
  }
  if (node.kind === "Progress") {
    const result = el("progress") as HTMLProgressElement;
    result.max = 100;
    result.value = asNumber(props.value);
    return result;
  }
  if (node.kind === "Stat") {
    const result = el("div", "stat");
    result.append(el("span", "muted small", props.label), el("strong", "stat-value", props.value));
    if (props.delta) result.appendChild(el("span", `small trend-${asText(props.trend)}`, props.delta));
    return result;
  }
  if (node.kind === "DataCard" || node.kind === "MetricCard") {
    const result = el("div", "card metric-card");
    const text = labelValue(el("div"), props.title, props.value);
    if (props.delta) {
      text.appendChild(el("div", `small trend-${asText(props.trend)}`, `${asText(props.delta)}${props.period ? ` ${asText(props.period)}` : ""}`));
    }
    result.appendChild(text);
    if (props.icon) result.appendChild(el("span", "metric-icon", props.icon));
    return result;
  }
  if (node.kind === "TimelineCard") {
    const result = el("div", "card timeline");
    result.append(el("i", `timeline-dot status-${asText(props.status)}`), labelValue(el("div"), props.title, props.date));
    if (props.description) result.appendChild(el("div", "small", props.description));
    return result;
  }
  if (node.kind === "Stepper") {
    const result = el("ol", "stepper");
    asArray(props.steps).forEach((step, index) => {
      result.appendChild(el("li", index <= asNumber(props.current) ? "active" : "", step));
    });
    return result;
  }
  if (node.kind === "Table") {
    const result = el("table", "data-table");
    const head = el("thead");
    const headRow = el("tr");
    for (const header of asArray(props.headers)) headRow.appendChild(el("th", "", header));
    head.appendChild(headRow);
    const body = el("tbody");
    for (const row of children.filter((child) => child.kind === "TableRow")) {
      const tr = el("tr", row.props?.highlight ? "highlight" : "");
      for (const cell of (row.children || []).filter((item) => item.kind === "TableCell")) {
        const td = el("td", cell.props?.bold ? "bold" : "", cell.props?.value);
        if (cell.props?.align) td.style.textAlign = asText(cell.props.align);
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }
    result.append(head, body);
    return result;
  }
  if (node.kind === "List") {
    const result = el(asBool(props.ordered) ? "ol" : "ul", "data-list");
    for (const item of children.filter((child) => child.kind === "ListItem")) {
      result.appendChild(el("li", "", `${item.props?.icon ? `${asText(item.props.icon)} ` : ""}${asText(item.props?.value)}`));
    }
    return result;
  }
  if (node.kind === "ChipGroup") {
    const result = el("div", "chips");
    for (const item of asArray(props.items)) result.appendChild(el("span", "tag", item));
    return result;
  }
  if (node.kind === "Skeleton") {
    const result = el("div", "skeletons");
    for (let index = 0; index < (asNumber(props.rows) || 3); index += 1) result.appendChild(el("i", "skeleton"));
    return result;
  }
  if (node.kind === "Icon") {
    const result = el("span", "icon");
    paintGenUiIcon(result, props.name, { size: asNumber(props.size) || 16 });
    return result;
  }
  if (node.kind === "JsonDebug") {
    const result = el("details");
    result.append(
      el("summary", "", asText(props.label) || "Debug JSON"),
      el("pre", "code", JSON.stringify(props.data == null ? props : props.data, null, 2)),
    );
    return result;
  }
  if (node.kind === "KpiBoard") {
    const result = el("div", "stack");
    if (props.title) result.appendChild(el("div", "card-title", props.title));
    const grid = el("div", "grid");
    applyStyle(grid, layoutBoxStyle("KpiBoard", props));
    appendNodes(grid, children, ctx);
    result.appendChild(grid);
    return result;
  }
  if (!Object.prototype.hasOwnProperty.call(LAYOUT_CLASS, node.kind)) {
    return el("div", "unknown-component", `Unknown component: ${asText(node.kind)}`);
  }
  const result = el("div", LAYOUT_CLASS[node.kind]);
  applyStyle(result, layoutBoxStyle(node.kind, props));
  if (node.kind === "Card" && props.title) result.appendChild(el("div", "card-title", props.title));
  if (node.kind === "Card" && props.subtitle) result.appendChild(el("div", "muted small card-subtitle", props.subtitle));
  if ((node.kind === "Alert" || node.kind === "AlertCard" || node.kind === "Callout") && (props.title || props.message)) {
    if (props.title) result.appendChild(el("strong", "", props.title));
    if (props.message) result.appendChild(el("div", "", props.message));
  } else {
    appendNodes(result, children, ctx);
  }
  return result;
}

function functionSource(fn: Function, name: string): string {
  const raw = Function.prototype.toString.call(fn).replace(/^export\s+/, "").trim();
  if (!raw.includes("{")) throw new Error(`cannot serialize ${name}`);
  return `var ${name} = (${raw});`;
}

function standaloneRuntime(): string {
  return `(function () {
  "use strict";
  ${functionSource(resolveChartModel, "resolveChartModel")}
  ${functionSource(paintChartElement, "paintChartElement")}
  var values = JSON.parse(document.getElementById("genui-values-data").textContent || "{}");
  function refreshCharts() {
    document.querySelectorAll("[data-genui-chart]").forEach(function (holder) {
      var props = JSON.parse(holder.getAttribute("data-genui-chart") || "{}");
      paintChartElement(holder, resolveChartModel(props, values));
    });
  }
  document.querySelectorAll("[data-genui-field]").forEach(function (control) {
    var name = control.getAttribute("data-genui-field");
    var kind = control.getAttribute("data-genui-kind");
    var output = control.parentElement && control.parentElement.querySelector("output");
    var update = function () {
      if (kind === "Switch") values[name] = control.checked;
      else if (kind === "NumberInput" || kind === "Slider") values[name] = Number(control.value);
      else if (kind === "FileInput") values[name] = Array.prototype.map.call(control.files || [], function (file) { return { name: file.name, size: file.size, type: file.type }; });
      else values[name] = control.value;
      if (output) output.textContent = String(values[name]);
      refreshCharts();
    };
    if (Object.prototype.hasOwnProperty.call(values, name) && kind !== "FileInput") {
      if (kind === "Switch") control.checked = Boolean(values[name]);
      else control.value = String(values[name] == null ? "" : values[name]);
      if (output) output.textContent = String(values[name]);
    }
    control.addEventListener(kind === "Select" || kind === "Switch" || kind === "FileInput" ? "change" : "input", update);
  });
  refreshCharts();
  document.querySelectorAll("[data-genui-tabs]").forEach(function (root) {
    var buttons = root.querySelector(".tab-buttons");
    var panels = buttons && buttons.nextElementSibling;
    if (!buttons || !panels) return;
    Array.prototype.forEach.call(buttons.children, function (button, index) {
      button.addEventListener("click", function () {
        Array.prototype.forEach.call(buttons.children, function (item) { item.classList.remove("active"); });
        Array.prototype.forEach.call(panels.children, function (item) { item.classList.add("hidden"); });
        button.classList.add("active");
        if (panels.children[index]) panels.children[index].classList.remove("hidden");
      });
    });
  });
  document.querySelectorAll("[data-genui-submit]").forEach(function (button) {
    button.addEventListener("click", function () {
      var form = button.parentElement;
      if (form && !form.querySelector(".offline-status")) {
        var status = document.createElement("small");
        status.className = "offline-status";
        status.textContent = "这是离线导出页面，表单值会保留在当前页面中，但不会提交到 QwenPaw。";
        form.appendChild(status);
      }
    });
  });
  document.querySelectorAll("[data-genui-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      var kind = button.getAttribute("data-genui-action");
      var href = button.getAttribute("data-genui-href") || "";
      if (kind === "ToggleButton") button.classList.toggle("active");
      else if (kind === "LinkButton" && /^https?:\\/\\//.test(href)) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        var status = button.nextElementSibling;
        if (!status || !status.classList.contains("offline-status")) {
          status = document.createElement("small");
          status.className = "offline-status";
          status.textContent = "离线导出不支持发送消息或提交到 QwenPaw";
          button.after(status);
        }
      }
    });
  });
  window.__GENUI_EXPORT__ = { values: values, refresh: refreshCharts };
})();`;
}

export function renderExportTree(
  tree: GenUiNode,
  values: Record<string, unknown> = {},
  media: EmbeddedMedia = { sources: {}, missing: [] },
): HTMLElement {
  const root = el("main");
  root.id = "genui-root";
  root.appendChild(renderExportNode(tree, {
    values,
    media: media.sources || {},
    missing: new Set(media.missing || []),
  }));
  return root;
}

export function buildGenUiHtmlDocument(
  tree: GenUiNode,
  values: Record<string, unknown> = {},
  media: EmbeddedMedia = { sources: {}, missing: [] },
  title = "GenUI",
): string {
  const root = renderExportTree(tree, values, media);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(String(title || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${EXPORT_CSS}
  </style>
</head>
<body>${root.outerHTML}
<script id="genui-values-data" type="application/json">${scriptJson(values)}</script>
<script>${standaloneRuntime()}</script></body>
</html>`;
}
