/** Browser-native GenUI export helpers without runtime dependencies. */

import type { GenUiNode } from "../types/genUi";

export async function exportGenUiPng(element: HTMLElement, filename: string): Promise<void> {
  const root = element.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(root.width * scale); canvas.height = Math.ceil(Math.max(root.height, element.scrollHeight) * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas is unavailable");
  context.scale(scale, scale); context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
  for (const child of Array.from(element.querySelectorAll<HTMLElement>("*"))) {
    const rect = child.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const style = getComputedStyle(child); const x = rect.left - root.left; const y = rect.top - root.top;
    if (style.backgroundColor && style.backgroundColor !== "rgba(0, 0, 0, 0)") { context.fillStyle = style.backgroundColor; context.fillRect(x, y, rect.width, rect.height); }
    if (style.borderTopWidth !== "0px") { context.strokeStyle = style.borderTopColor; context.strokeRect(x, y, rect.width, rect.height); }
  }
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text; const text = textNode.textContent?.trim(); if (!text) continue;
    const range = document.createRange(); range.selectNodeContents(textNode); const rect = range.getBoundingClientRect();
    const parent = textNode.parentElement; if (!parent || !rect.width) continue;
    const style = getComputedStyle(parent); context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`; context.fillStyle = style.color || "#111"; context.textBaseline = "top";
    context.fillText(text, rect.left - root.left, rect.top - root.top, Math.max(1, root.width - (rect.left - root.left)));
  }
  for (const input of Array.from(element.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input,textarea"))) {
    if (!input.value) continue; const rect = input.getBoundingClientRect(); const style = getComputedStyle(input);
    context.font = `${style.fontSize} ${style.fontFamily}`; context.fillStyle = style.color || "#111"; context.fillText(input.value, rect.left - root.left + 8, rect.top - root.top + 6);
  }
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG encoding failed")), "image/png"));
  const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.download = `${filename}.png`; link.href = url; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  console.info("[ugsci.genui] PNG export created", { filename, bytes: blob.size });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '\"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const standaloneRuntime = String.raw`
(function () {
  "use strict";
  var tree = JSON.parse(document.getElementById("genui-tree-data").textContent || "null");
  var values = JSON.parse(document.getElementById("genui-values-data").textContent || "{}");
  var root = document.getElementById("genui-root");
  var charts = [];
  var text = function (v) { return typeof v === "string" ? v : v == null ? "" : String(v); };
  var number = function (v) { var x = Number(v); return Number.isFinite(x) ? x : 0; };
  var array = function (v) { return Array.isArray(v) ? v : []; };
  function fieldName(node) {
    var p = node.props || {};
    if (p.name != null && text(p.name)) return text(p.name);
    var label = text(p.label);
    var match = label.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
    return match ? match[1].toLowerCase() : label || node.nodeId;
  }
  function node(tag, className, content) {
    var result = document.createElement(tag);
    if (className) result.className = className;
    if (content != null) result.textContent = text(content);
    return result;
  }
  function appendChildren(target, children) {
    array(children).forEach(function (child) { target.appendChild(render(child)); });
    return target;
  }
  function field(source) {
    var p = source.props || {}, kind = source.kind, name = fieldName(source);
    var shell = node("label", "field");
    if (p.label && kind !== "Switch") shell.appendChild(node("span", "field-label", text(p.label) + (p.required ? " *" : "")));
    var control;
    if (kind === "Textarea") {
      control = node("textarea"); control.rows = number(p.rows) || 3; control.placeholder = text(p.placeholder);
    } else if (kind === "Select") {
      control = node("select");
      array(p.options).forEach(function (option) {
        var item = node("option");
        item.value = typeof option === "object" && option ? text(option.value) : text(option);
        item.textContent = typeof option === "object" && option ? text(option.label) : text(option);
        control.appendChild(item);
      });
    } else {
      control = node("input");
      control.type = kind === "Slider" ? "range" : kind === "Switch" ? "checkbox" : kind === "NumberInput" ? "number" : kind === "FileInput" ? "file" : "text";
      if (p.min != null) control.min = text(p.min); if (p.max != null) control.max = text(p.max); if (p.step != null) control.step = text(p.step);
      if (kind === "FileInput") { if (p.accept) control.accept = text(p.accept); control.multiple = Boolean(p.multiple); }
      else control.placeholder = text(p.placeholder);
    }
    var initial = Object.prototype.hasOwnProperty.call(values, name) ? values[name] : (p.value != null ? p.value : p.checked != null ? p.checked : "");
    if (kind === "Switch") control.checked = Boolean(initial); else if (kind !== "FileInput") control.value = text(initial);
    var valueLabel = kind === "Slider" ? node("output", "slider-value", initial) : null;
    var update = function () {
      if (kind === "Switch") values[name] = control.checked;
      else if (kind === "NumberInput" || kind === "Slider") values[name] = number(control.value);
      else if (kind === "FileInput") values[name] = Array.prototype.map.call(control.files || [], function (file) { return { name: file.name, size: file.size, type: file.type }; });
      else values[name] = control.value;
      if (valueLabel) valueLabel.textContent = text(values[name]);
      renderCharts();
    };
    control.addEventListener(kind === "Select" || kind === "Switch" || kind === "FileInput" ? "change" : "input", update);
    if (kind === "Switch") { var line = node("span", "switch-line"); line.append(control, node("span", "", p.label)); shell.appendChild(line); }
    else if (kind === "Slider") { var slider = node("span", "slider-line"); slider.append(control, valueLabel); shell.appendChild(slider); }
    else shell.appendChild(control);
    if (p.description) shell.appendChild(node("small", "description", p.description));
    return shell;
  }
  function chart(source) {
    var holder = node("div", "chart");
    charts.push({ holder: holder, props: source.props || {} });
    return holder;
  }
  function renderChart(target, p) {
    target.replaceChildren();
    if (p.title) target.appendChild(node("div", "chart-title", p.title));
    var categories = array(p.categories).map(text), raw = array(p.series), generator = p.generator && typeof p.generator === "object" ? p.generator : {};
    var coefficientNames = array(generator.coefficients).map(text);
    if (text(generator.type) === "polynomial" || coefficientNames.length) {
      var names = coefficientNames.length ? coefficientNames : ["a", "b", "c", "d", "e"];
      var xmin = typeof generator.xMin === "number" ? generator.xMin : -3, xmax = typeof generator.xMax === "number" ? generator.xMax : 3;
      var samples = Math.min(Math.max(number(generator.samples) || 61, 10), 400), xs = [];
      for (var i = 0; i < samples; i++) xs.push(xmin + (xmax - xmin) * i / (samples - 1));
      var coefficients = names.map(function (name) { return number(values[name]); });
      categories = xs.map(function (x) { return String(Number(x.toFixed(2))); });
      raw = [{ name: text(generator.label) || "f(x)", values: xs.map(function (x) { return coefficients.reduce(function (sum, coefficient, index) { return sum + coefficient * Math.pow(x, coefficients.length - index - 1); }, 0); }) }];
    }
    var series = raw.map(function (item, index) { item = item || {}; return { name: text(item.name) || "Series " + (index + 1), values: array(item.values).map(number) }; });
    if (!categories.length || !series.length) { target.appendChild(node("div", "muted", "Chart: no data")); return; }
    var width = 640, height = number(p.height) || 240, svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + width + " " + height); svg.setAttribute("role", "img"); svg.setAttribute("aria-label", text(p.title) || "Chart");
    var all = [].concat.apply([], series.map(function (item) { return item.values; })), max = Math.max.apply(Math, all.concat([0])), min = Math.min.apply(Math, all.concat([0])), range = max - min || 1;
    var y = function (v) { return height - 24 - ((v - min) / range) * (height - 44); }, x = function (i) { return 30 + i * (width - 50) / Math.max(categories.length - 1, 1); };
    var axis = document.createElementNS(svg.namespaceURI, "line"); axis.setAttribute("x1", "30"); axis.setAttribute("x2", String(width - 15)); axis.setAttribute("y1", String(y(0))); axis.setAttribute("y2", String(y(0))); axis.setAttribute("stroke", "#d9d9d9"); svg.appendChild(axis);
    var colors = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"];
    series.forEach(function (item, seriesIndex) {
      var points = item.values.map(function (v, i) { return x(i) + "," + y(v); }).join(" ");
      var line = document.createElementNS(svg.namespaceURI, "polyline"); line.setAttribute("points", points); line.setAttribute("fill", text(p.chart) === "area" ? colors[seriesIndex % colors.length] + "22" : "none"); line.setAttribute("stroke", colors[seriesIndex % colors.length]); line.setAttribute("stroke-width", "2"); line.setAttribute("data-series", item.name); svg.appendChild(line);
    });
    target.appendChild(svg);
    if (p.showLegend !== false) { var legend = node("div", "legend"); series.forEach(function (item, i) { var entry = node("span"); var dot = node("i"); dot.style.background = colors[i % colors.length]; entry.append(dot, document.createTextNode(item.name)); legend.appendChild(entry); }); target.appendChild(legend); }
  }
  function renderCharts() { charts.forEach(function (item) { renderChart(item.holder, item.props); }); }
  function render(source) {
    if (!source || typeof source !== "object") return node("div");
    var p = source.props || {}, children = source.children || [], result;
    if (["Input", "NumberInput", "Select", "Textarea", "Switch", "Slider", "FileInput"].indexOf(source.kind) >= 0) return field(source);
    if (source.kind === "Chart") return chart(source);
    if (source.kind === "Heading") { result = node("h" + Math.min(Math.max(number(p.level) || 2, 1), 4), "", p.value); return result; }
    if (source.kind === "Text") return node("div", p.bold ? "text bold" : "text", p.value);
    if (source.kind === "CodeBlock") return node("pre", "code", p.code);
    if (source.kind === "Divider") { result = node("div", "divider"); if (p.label) result.appendChild(node("span", "", p.label)); return result; }
    if (source.kind === "Spacer") { result = node("div"); result.style.height = (number(p.size) || 16) + "px"; return result; }
    if (source.kind === "Tabs") {
      result = node("div", "tabs"); var buttons = node("div", "tab-buttons"), panels = node("div"); var tabs = children.filter(function (c) { return c.kind === "TabItem"; });
      tabs.forEach(function (tab, index) { var button = node("button", index ? "" : "active", tab.props && tab.props.tab); var panel = appendChildren(node("div", index ? "tab-panel hidden" : "tab-panel"), tab.children); button.addEventListener("click", function () { Array.prototype.forEach.call(buttons.children, function (b) { b.classList.remove("active"); }); Array.prototype.forEach.call(panels.children, function (p) { p.classList.add("hidden"); }); button.classList.add("active"); panel.classList.remove("hidden"); }); buttons.appendChild(button); panels.appendChild(panel); }); result.append(buttons, panels); return result;
    }
    if (source.kind === "Accordion") { result = node("div"); children.filter(function (c) { return c.kind === "AccordionItem"; }).forEach(function (item) { var details = node("details"); details.append(node("summary", "", item.props && item.props.header), appendChildren(node("div", "accordion-body"), item.children)); result.appendChild(details); }); return result; }
    if (source.kind === "Button" || source.kind === "InteractiveButton" || source.kind === "ToggleButton" || source.kind === "LinkButton") {
      result = node("button", source.kind === "LinkButton" ? "link-button" : "button", p.label || "Action"); result.disabled = Boolean(p.disabled);
      result.addEventListener("click", function () { if (source.kind === "ToggleButton") result.classList.toggle("active"); else if (source.kind === "LinkButton" && /^https?:\/\//.test(text(p.href))) window.open(text(p.href), "_blank", "noopener,noreferrer"); else { var status = result.nextElementSibling; if (!status || !status.classList.contains("offline-status")) { status = node("small", "offline-status", "离线导出不支持发送消息或提交到 QwenPaw"); result.after(status); } } }); return result;
    }
    if (source.kind === "Image") { result = node("figure"); var image = node("img"); image.src = text(p.src); image.alt = text(p.alt); result.appendChild(image); if (p.caption) result.appendChild(node("figcaption", "", p.caption)); return result; }
    if (source.kind === "Badge" || source.kind === "Tag" || source.kind === "Chip") return node("span", "tag", p.value || p.label);
    if (source.kind === "Progress") { result = node("progress"); result.max = 100; result.value = number(p.value); return result; }
    if (source.kind === "JsonDebug") { result = node("details"); result.append(node("summary", "", p.label || "Debug JSON"), node("pre", "code", JSON.stringify(p.data == null ? p : p.data, null, 2))); return result; }
    var classMap = { Stack: "stack", Row: "row", Grid: "grid", Card: "card", DataCard: "card", MetricCard: "card", Alert: "alert", AlertCard: "alert", Callout: "alert", KpiBoard: "stack", FeatureGrid: "grid", Form: "stack" };
    result = node("div", classMap[source.kind] || "component");
    if (source.kind === "Grid" || source.kind === "FeatureGrid") result.style.gridTemplateColumns = "repeat(" + Math.min(Math.max(number(p.columns) || 2, 1), 6) + ", minmax(0,1fr))";
    if (source.kind === "Card" && p.title) result.appendChild(node("div", "card-title", p.title));
    if ((source.kind === "Alert" || source.kind === "AlertCard" || source.kind === "Callout") && (p.title || p.message)) { if (p.title) result.appendChild(node("strong", "", p.title)); if (p.message) result.appendChild(node("div", "", p.message)); }
    else appendChildren(result, children);
    return result;
  }
  root.appendChild(render(tree));
  renderCharts();
  window.__GENUI_EXPORT__ = { tree: tree, values: values, refresh: renderCharts };
})();`;

/** Download the current GenUI card as an interactive standalone HTML file. */
export function exportGenUiHtml(
  _element: HTMLElement,
  tree: GenUiNode,
  values: Record<string, unknown>,
  filename: string,
  title = filename,
): void {

  const documentHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    #genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
    .stack { display: flex; flex-direction: column; gap: 12px; } .row { display: flex; gap: 12px; align-items: center; } .grid { display: grid; gap: 12px; }
    .card { padding: 14px; border: 1px solid #e5e7eb; border-radius: 10px; } .card-title,.chart-title { margin-bottom: 8px; font-weight: 600; }
    .field { display: flex; flex-direction: column; gap: 5px; margin: 5px 0; } .field-label,.description { color: #667085; font-size: 12px; }
    input,select,textarea,button { font: inherit; } input:not([type=range]):not([type=checkbox]),select,textarea { width: 100%; padding: 7px 9px; border: 1px solid #d0d5dd; border-radius: 6px; }
    input[type=range] { flex: 1; accent-color: #1677ff; } .slider-line,.switch-line { display: flex; align-items: center; gap: 10px; } .slider-value { min-width: 42px; font-size: 12px; }
    button { padding: 6px 12px; border: 1px solid #d0d5dd; border-radius: 6px; background: #fff; cursor: pointer; } button.active,.button:hover { color: #1677ff; border-color: #1677ff; }
    .tabs { margin: 6px 0; } .tab-buttons { display: flex; gap: 4px; border-bottom: 1px solid #e5e7eb; } .tab-buttons button { border: 0; border-radius: 0; } .tab-buttons button.active { border-bottom: 2px solid #1677ff; } .tab-panel { padding: 12px 2px; } .hidden { display: none; }
    details { border-bottom: 1px solid #e5e7eb; } summary { padding: 9px 0; cursor: pointer; font-weight: 600; } .accordion-body { padding: 0 0 10px 12px; }
    .chart svg { display: block; width: 100%; height: auto; min-height: 180px; } .legend { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; } .legend span { display: flex; align-items: center; gap: 4px; } .legend i { width: 10px; height: 10px; border-radius: 2px; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #f0f5ff; color: #1677ff; } .alert { padding: 10px 12px; border: 1px solid #91caff; border-radius: 8px; background: #e6f4ff; }
    .code { padding: 12px; overflow: auto; border-radius: 8px; background: #f2f4f7; } .divider { display: flex; align-items: center; margin: 10px 0; border-top: 1px solid #e5e7eb; } .divider span { padding-right: 8px; background: white; transform: translateY(-50%); }
    figure { margin: 0; } img { max-width: 100%; } .bold { font-weight: 700; } .offline-status { display: block; margin-top: 5px; color: #b54708; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body><main id="genui-root"></main>
<script id="genui-tree-data" type="application/json">${scriptJson(tree)}</script>
<script id="genui-values-data" type="application/json">${scriptJson(values)}</script>
<script>${standaloneRuntime}</script></body>
</html>`;
  const blob = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `${filename}.html`;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  console.info("[ugsci.genui] HTML export created", { filename, bytes: blob.size });
}

export function printGenUiPdf(element: HTMLElement, title: string): void {
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) throw new Error("print window was blocked");
  popup.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:system-ui;padding:24px}@media print{button{display:none}}</style></head><body>${element.outerHTML}</body></html>`);
  popup.document.close();
  popup.addEventListener("load", () => { popup.focus(); popup.print(); popup.close(); }, { once: true });
}
