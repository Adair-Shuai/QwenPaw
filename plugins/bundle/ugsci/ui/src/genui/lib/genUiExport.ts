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

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("media encoding failed"));
    reader.readAsDataURL(blob);
  });
}

async function imageToDataUrl(image: HTMLImageElement): Promise<string | null> {
  const src = image.currentSrc || image.src;
  if (!src) return null;
  if (src.startsWith("data:")) return src;
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    return await blobToDataUrl(await response.blob());
  } catch {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context || !canvas.width || !canvas.height) return null;
      context.drawImage(image, 0, 0);
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }
}

type EmbeddedMedia = {
  sources: Record<string, string>;
  missing: string[];
};

async function collectEmbeddedMedia(element: HTMLElement): Promise<EmbeddedMedia> {
  const sources: Record<string, string> = {};
  const missing: string[] = [];
  const images = Array.from(element.querySelectorAll<HTMLImageElement>("img[data-genui-media-source]"));
  await Promise.all(images.map(async (image) => {
    const source = image.dataset.genuiMediaSource || "";
    const dataUrl = await imageToDataUrl(image);
    if (!source) return;
    if (dataUrl) sources[source] = dataUrl;
    else missing.push(source);
  }));
  return { sources, missing: Array.from(new Set(missing)) };
}

const standaloneRuntime = String.raw`
(function () {
  "use strict";
  var tree = JSON.parse(document.getElementById("genui-tree-data").textContent || "null");
  var values = JSON.parse(document.getElementById("genui-values-data").textContent || "{}");
  var mediaPayload = JSON.parse(document.getElementById("genui-media-data").textContent || "{}");
  var media = mediaPayload.sources || {};
  var missingMedia = mediaPayload.missing || [];
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
  function labelValue(target, label, value) {
    if (label) target.appendChild(node("div", "muted small", label));
    target.appendChild(node("div", "display-value", value));
    return target;
  }
  function mediaImage(source, alt, className) {
    source = text(source);
    if (missingMedia.indexOf(source) >= 0) {
      var fallback = node("div", "media-unavailable " + (className || ""), "此媒体未能离线嵌入");
      fallback.setAttribute("role", "img"); fallback.setAttribute("aria-label", text(alt));
      return fallback;
    }
    var image = node("img", className || "");
    image.src = media[source] || source;
    image.alt = text(alt);
    return image;
  }
  function markdown(value) {
    var source = text(value), target = node("div", "markdown"), lines = source.split(/\r?\n/), list = null;
    lines.forEach(function (line) {
      var heading = line.match(/^(#{1,4})\s+(.*)$/), item = line.match(/^\s*[-*]\s+(.*)$/);
      if (heading) { list = null; target.appendChild(node("h" + heading[1].length, "", heading[2])); }
      else if (item) { if (!list) { list = node("ul"); target.appendChild(list); } list.appendChild(node("li", "", item[1])); }
      else if (!line.trim()) { list = null; target.appendChild(node("br")); }
      else { list = null; target.appendChild(node("p", "", line)); }
    });
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
    var colors = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"];
    if (text(p.chart) === "pie") {
      var pieValues = series[0].values.map(function (v) { return Math.abs(v); }), total = pieValues.reduce(function (sum, value) { return sum + value; }, 0) || 1;
      var cx = width / 2, cy = height / 2, radius = Math.min(width, height) / 2 - 20, angle = -Math.PI / 2;
      pieValues.forEach(function (value, index) { var sweep = value / total * Math.PI * 2, x1 = cx + radius * Math.cos(angle), y1 = cy + radius * Math.sin(angle), x2 = cx + radius * Math.cos(angle + sweep), y2 = cy + radius * Math.sin(angle + sweep); var path = document.createElementNS(svg.namespaceURI, "path"); path.setAttribute("d", "M " + cx + " " + cy + " L " + x1 + " " + y1 + " A " + radius + " " + radius + " 0 " + (sweep > Math.PI ? 1 : 0) + " 1 " + x2 + " " + y2 + " Z"); path.setAttribute("fill", colors[index % colors.length]); path.setAttribute("data-slice", categories[index] || String(index)); svg.appendChild(path); angle += sweep; });
      target.appendChild(svg);
      if (p.showLegend !== false) { var pieLegend = node("div", "legend"); pieValues.forEach(function (value, i) { var entry = node("span"), dot = node("i"); dot.style.background = colors[i % colors.length]; entry.append(dot, document.createTextNode((categories[i] || "#" + (i + 1)) + ": " + value)); pieLegend.appendChild(entry); }); target.appendChild(pieLegend); }
      return;
    }
    var all = [].concat.apply([], series.map(function (item) { return item.values; })), max = Math.max.apply(Math, all.concat([0])), min = Math.min.apply(Math, all.concat([0])), range = max - min || 1;
    var y = function (v) { return height - 24 - ((v - min) / range) * (height - 44); }, x = function (i) { return 30 + i * (width - 50) / Math.max(categories.length - 1, 1); };
    var axis = document.createElementNS(svg.namespaceURI, "line"); axis.setAttribute("x1", "30"); axis.setAttribute("x2", String(width - 15)); axis.setAttribute("y1", String(y(0))); axis.setAttribute("y2", String(y(0))); axis.setAttribute("stroke", "#d9d9d9"); svg.appendChild(axis);
    series.forEach(function (item, seriesIndex) {
      if (text(p.chart) === "bar") {
        var groupWidth = (width - 50) / Math.max(categories.length, 1), barWidth = Math.max(1, groupWidth / series.length - 3);
        item.values.forEach(function (value, index) { var rect = document.createElementNS(svg.namespaceURI, "rect"), top = Math.min(y(value), y(0)), bottom = Math.max(y(value), y(0)); rect.setAttribute("x", String(30 + index * groupWidth + seriesIndex * (barWidth + 2))); rect.setAttribute("y", String(top)); rect.setAttribute("width", String(barWidth)); rect.setAttribute("height", String(Math.max(1, bottom - top))); rect.setAttribute("fill", colors[seriesIndex % colors.length]); rect.setAttribute("data-series", item.name); svg.appendChild(rect); });
      } else {
        var points = item.values.map(function (v, i) { return x(i) + "," + y(v); }).join(" ");
        var line = document.createElementNS(svg.namespaceURI, "polyline"); line.setAttribute("points", points); line.setAttribute("fill", text(p.chart) === "area" ? colors[seriesIndex % colors.length] + "22" : "none"); line.setAttribute("stroke", colors[seriesIndex % colors.length]); line.setAttribute("stroke-width", "2"); line.setAttribute("data-series", item.name); svg.appendChild(line);
      }
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
    if (source.kind === "Markdown") return markdown(p.content || p.value);
    if (source.kind === "CodeBlock") return node("pre", "code", p.code);
    if (source.kind === "SectionHeader") { result = node("div", "section-header"); if (p.icon) result.appendChild(node("span", "section-icon", p.icon)); var sectionText = node("div"); sectionText.appendChild(node("strong", "", p.title)); if (p.subtitle) sectionText.appendChild(node("div", "muted small", p.subtitle)); result.appendChild(sectionText); return result; }
    if (source.kind === "KeyValueList") { result = node("dl", "key-values"); array(p.items).forEach(function (item) { item = item || {}; result.append(node("dt", "", item.key), node("dd", "", item.value)); }); return result; }
    if (source.kind === "Divider") { result = node("div", "divider"); if (p.label) result.appendChild(node("span", "", p.label)); return result; }
    if (source.kind === "Spacer") { result = node("div"); result.style.height = (number(p.size) || 16) + "px"; return result; }
    if (source.kind === "Tabs") {
      result = node("div", "tabs"); var buttons = node("div", "tab-buttons"), panels = node("div"); var tabs = children.filter(function (c) { return c.kind === "TabItem"; });
      tabs.forEach(function (tab, index) { var button = node("button", index ? "" : "active", tab.props && tab.props.tab); var panel = appendChildren(node("div", index ? "tab-panel hidden" : "tab-panel"), tab.children); button.addEventListener("click", function () { Array.prototype.forEach.call(buttons.children, function (b) { b.classList.remove("active"); }); Array.prototype.forEach.call(panels.children, function (p) { p.classList.add("hidden"); }); button.classList.add("active"); panel.classList.remove("hidden"); }); buttons.appendChild(button); panels.appendChild(panel); }); result.append(buttons, panels); return result;
    }
    if (source.kind === "Accordion") { result = node("div"); children.filter(function (c) { return c.kind === "AccordionItem"; }).forEach(function (item) { var details = node("details"); details.append(node("summary", "", item.props && item.props.header), appendChildren(node("div", "accordion-body"), item.children)); result.appendChild(details); }); return result; }
    if (source.kind === "Form") {
      result = node("div", "stack form");
      if (p.title) result.appendChild(node("div", "card-title", p.title));
      appendChildren(result, children);
      var submit = node("button", "button", p.submitLabel || "提交");
      submit.addEventListener("click", function () { var status = result.querySelector(".offline-status"); if (!status) result.appendChild(node("small", "offline-status", "这是离线导出页面，表单值会保留在当前页面中，但不会提交到 QwenPaw。")); });
      result.appendChild(submit);
      return result;
    }
    if (source.kind === "Button" || source.kind === "InteractiveButton" || source.kind === "ToggleButton" || source.kind === "LinkButton") {
      result = node("button", source.kind === "LinkButton" ? "link-button" : "button", p.label || "Action"); result.disabled = Boolean(p.disabled);
      result.addEventListener("click", function () { if (source.kind === "ToggleButton") result.classList.toggle("active"); else if (source.kind === "LinkButton" && /^https?:\/\//.test(text(p.href))) window.open(text(p.href), "_blank", "noopener,noreferrer"); else { var status = result.nextElementSibling; if (!status || !status.classList.contains("offline-status")) { status = node("small", "offline-status", "离线导出不支持发送消息或提交到 QwenPaw"); result.after(status); } } }); return result;
    }
    if (source.kind === "Image") { result = node("figure"); result.appendChild(mediaImage(p.src, p.alt)); if (p.caption) result.appendChild(node("figcaption", "", p.caption)); return result; }
    if (source.kind === "ImageGallery") { result = node("div", "image-gallery"); result.style.gridTemplateColumns = "repeat(" + Math.min(Math.max(number(p.columns) || 3, 1), 6) + ", minmax(0,1fr))"; children.filter(function (child) { return child.kind === "Image"; }).forEach(function (child) { result.appendChild(render(child)); }); return result; }
    if (source.kind === "Avatar") { if (p.src) return mediaImage(p.src, p.name, "avatar"); return node("span", "avatar avatar-fallback", text(p.name).charAt(0).toUpperCase()); }
    if (source.kind === "ProfileCard") { result = node("div", "card profile"); result.append(p.avatar ? mediaImage(p.avatar, p.name, "avatar") : node("span", "avatar avatar-fallback", text(p.name).charAt(0).toUpperCase()), labelValue(node("div"), p.name, p.role)); if (p.bio) result.appendChild(node("div", "small", p.bio)); return result; }
    if (source.kind === "MediaCard") { result = node("div", "card"); if (p.src) result.appendChild(mediaImage(p.src, p.title, "media-card-image")); var mediaBody = node("div", "card-body"); if (p.title) mediaBody.appendChild(node("strong", "", p.title)); if (p.caption) mediaBody.appendChild(node("div", "muted small", p.caption)); result.appendChild(mediaBody); return result; }
    if (source.kind === "Badge" || source.kind === "Tag" || source.kind === "Chip") return node("span", "tag", p.value || p.label);
    if (source.kind === "Progress") { result = node("progress"); result.max = 100; result.value = number(p.value); return result; }
    if (source.kind === "Stat") { result = node("div", "stat"); result.append(node("span", "muted small", p.label), node("strong", "stat-value", p.value)); if (p.delta) result.appendChild(node("span", "small trend-" + text(p.trend), p.delta)); return result; }
    if (source.kind === "DataCard" || source.kind === "MetricCard") { result = node("div", "card metric-card"); var metricText = labelValue(node("div"), p.title, p.value); if (p.delta) metricText.appendChild(node("div", "small trend-" + text(p.trend), text(p.delta) + (p.period ? " " + text(p.period) : ""))); result.appendChild(metricText); if (p.icon) result.appendChild(node("span", "metric-icon", p.icon)); return result; }
    if (source.kind === "WeatherCard") { result = node("div", "card row"); if (p.icon) result.appendChild(node("span", "metric-icon", p.icon)); var weatherBody = node("div"); weatherBody.appendChild(node("div", "display-value", p.temperature)); if (p.condition) weatherBody.appendChild(node("div", "muted", p.condition)); if (p.location) weatherBody.appendChild(node("div", "muted small", p.location)); result.appendChild(weatherBody); return result; }
    if (source.kind === "QuoteCard") { result = node("blockquote", "card quote"); result.append(node("div", "", "“" + text(p.quote) + "”"), node("footer", "muted small", "— " + text(p.author) + (p.role ? ", " + text(p.role) : ""))); return result; }
    if (source.kind === "TimelineCard") { result = node("div", "card timeline"); result.append(node("i", "timeline-dot status-" + text(p.status)), labelValue(node("div"), p.title, p.date)); if (p.description) result.appendChild(node("div", "small", p.description)); return result; }
    if (source.kind === "Stepper") { result = node("ol", "stepper"); array(p.steps).forEach(function (step, index) { result.appendChild(node("li", index <= number(p.current) ? "active" : "", step)); }); return result; }
    if (source.kind === "Table") { result = node("table", "data-table"); var head = node("thead"), headRow = node("tr"); array(p.headers).forEach(function (header) { headRow.appendChild(node("th", "", header)); }); head.appendChild(headRow); var body = node("tbody"); children.filter(function (child) { return child.kind === "TableRow"; }).forEach(function (row) { var tr = node("tr", row.props && row.props.highlight ? "highlight" : ""); array(row.children).filter(function (cell) { return cell.kind === "TableCell"; }).forEach(function (cell) { var td = node("td", cell.props && cell.props.bold ? "bold" : "", cell.props && cell.props.value); if (cell.props && cell.props.align) td.style.textAlign = text(cell.props.align); tr.appendChild(td); }); body.appendChild(tr); }); result.append(head, body); return result; }
    if (source.kind === "List") { result = node(p.ordered ? "ol" : "ul", "data-list"); children.filter(function (child) { return child.kind === "ListItem"; }).forEach(function (item) { result.appendChild(node("li", "", (item.props && item.props.icon ? text(item.props.icon) + " " : "") + text(item.props && item.props.value))); }); return result; }
    if (source.kind === "ChipGroup") { result = node("div", "chips"); array(p.items).forEach(function (item) { result.appendChild(node("span", "tag", item)); }); return result; }
    if (source.kind === "Skeleton") { result = node("div", "skeletons"); for (var skeletonIndex = 0; skeletonIndex < (number(p.rows) || 3); skeletonIndex++) result.appendChild(node("i", "skeleton")); return result; }
    if (source.kind === "Icon") return node("span", "icon", p.name);
    if (source.kind === "JsonDebug") { result = node("details"); result.append(node("summary", "", p.label || "Debug JSON"), node("pre", "code", JSON.stringify(p.data == null ? p : p.data, null, 2))); return result; }
    if (source.kind === "KpiBoard") { result = node("div", "stack"); if (p.title) result.appendChild(node("div", "card-title", p.title)); var kpiGrid = node("div", "grid"); kpiGrid.style.gridTemplateColumns = "repeat(" + Math.min(Math.max(number(p.columns) || 3, 1), 6) + ", minmax(0,1fr))"; appendChildren(kpiGrid, children); result.appendChild(kpiGrid); return result; }
    var classMap = { Stack: "stack", Row: "row", Grid: "grid", Card: "card", Alert: "alert", AlertCard: "alert", Callout: "alert", FeatureGrid: "grid", ScrollArea: "scroll-area", AspectBox: "aspect-box" };
    if (!Object.prototype.hasOwnProperty.call(classMap, source.kind)) return node("div", "unknown-component", "Unknown component: " + text(source.kind));
    result = node("div", classMap[source.kind]);
    if (source.kind === "Grid" || source.kind === "FeatureGrid") result.style.gridTemplateColumns = "repeat(" + Math.min(Math.max(number(p.columns) || 2, 1), 6) + ", minmax(0,1fr))";
    if (source.kind === "Stack" || source.kind === "Row" || source.kind === "Grid" || source.kind === "FeatureGrid") result.style.gap = (number(p.gap) || 12) + "px";
    if (source.kind === "Stack" && p.padding) result.style.padding = number(p.padding) + "px";
    if (source.kind === "Row") { if (p.align) result.style.alignItems = text(p.align); if (p.justify) result.style.justifyContent = text(p.justify); }
    if (source.kind === "ScrollArea") { result.style.maxHeight = (number(p.maxHeight) || 300) + "px"; if (p.padding) result.style.padding = number(p.padding) + "px"; }
    if (source.kind === "AspectBox") { var ratio = text(p.ratio) || "16:9", parts = ratio.split(":"); result.style.aspectRatio = (number(parts[0]) || 16) + " / " + (number(parts[1]) || 9); }
    if (source.kind === "Card" && p.title) result.appendChild(node("div", "card-title", p.title));
    if (source.kind === "Card" && p.subtitle) result.appendChild(node("div", "muted small card-subtitle", p.subtitle));
    if ((source.kind === "Alert" || source.kind === "AlertCard" || source.kind === "Callout") && (p.title || p.message)) { if (p.title) result.appendChild(node("strong", "", p.title)); if (p.message) result.appendChild(node("div", "", p.message)); }
    else appendChildren(result, children);
    return result;
  }
  root.appendChild(render(tree));
  renderCharts();
  window.__GENUI_EXPORT__ = { tree: tree, values: values, refresh: renderCharts };
})();`;

/** Download the current GenUI card as an interactive standalone HTML file. */
export async function exportGenUiHtml(
  element: HTMLElement,
  tree: GenUiNode,
  values: Record<string, unknown>,
  filename: string,
  title = filename,
): Promise<void> {
  const embeddedMedia = await collectEmbeddedMedia(element);

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
    .media-card-image { width: 100%; max-height: 240px; object-fit: cover; border-radius: 8px; } .card-body { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; } .media-unavailable { min-height: 96px; display: flex; align-items: center; justify-content: center; padding: 12px; border: 1px dashed #f79009; border-radius: 8px; color: #b54708; background: #fffaeb; }
    .metric-card { display: flex; justify-content: space-between; align-items: center; } .metric-icon,.section-icon { font-size: 28px; } .section-header { display: flex; align-items: center; gap: 8px; } .profile { display: flex; gap: 12px; align-items: center; }
    .key-values { display: grid; grid-template-columns: minmax(100px, 1fr) minmax(120px, 2fr); gap: 5px 12px; margin: 0; } .key-values dt { color: #667085; } .key-values dd { margin: 0; font-weight: 500; text-align: right; }
    .data-table { width: 100%; border-collapse: collapse; } .data-table th,.data-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; } .data-table .highlight { background: #f0f5ff; }
    .chips { display: flex; flex-wrap: wrap; gap: 4px; } .skeletons { display: flex; flex-direction: column; gap: 8px; } .skeleton { height: 12px; border-radius: 6px; background: #eaecf0; } .scroll-area { overflow-y: auto; } .aspect-box { overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .unknown-component { padding: 8px; border: 1px dashed #d0d5dd; border-radius: 8px; color: #667085; font: 12px ui-monospace, monospace; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body><main id="genui-root"></main>
<script id="genui-tree-data" type="application/json">${scriptJson(tree)}</script>
<script id="genui-values-data" type="application/json">${scriptJson(values)}</script>
<script id="genui-media-data" type="application/json">${scriptJson(embeddedMedia)}</script>
<script>${standaloneRuntime}</script></body>
</html>`;
  const blob = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `${filename}.html`;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (embeddedMedia.missing.length) console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename, missing: embeddedMedia.missing });
  console.info("[ugsci.genui] HTML export created", { filename, bytes: blob.size, embeddedMedia: Object.keys(embeddedMedia.sources).length, missingMedia: embeddedMedia.missing.length });
}

export function printGenUiPdf(element: HTMLElement, title: string): void {
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) throw new Error("print window was blocked");
  popup.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:system-ui;padding:24px}@media print{button{display:none}}</style></head><body>${element.outerHTML}</body></html>`);
  popup.document.close();
  popup.addEventListener("load", () => { popup.focus(); popup.print(); popup.close(); }, { once: true });
}
