/** Shared GenUI view-model helpers used by the live tree and HTML export. */

export const FORM_FIELD_KINDS = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput",
] as const;

export const CHART_COLORS = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];

export const ACTION_BUTTON_KINDS = new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton",
]);

export function asText(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asBool(value: unknown): boolean {
  return Boolean(value);
}

export function fieldName(node: { nodeId?: string; props?: Record<string, unknown> }): string {
  const props = node.props || {};
  const explicit = asText(props.name);
  if (explicit) return explicit;
  const label = asText(props.label);
  const coefficient = label.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return coefficient ? coefficient[1].toLowerCase() : label || asText(node.nodeId);
}

export function isFieldKind(kind: string): boolean {
  return (FORM_FIELD_KINDS as readonly string[]).includes(kind);
}

export function clampHeadingLevel(value: unknown): 1 | 2 | 3 | 4 {
  return Math.min(Math.max(asNumber(value) || 2, 1), 4) as 1 | 2 | 3 | 4;
}

export function clampColumns(value: unknown, fallback: number, max = 6): number {
  const parsed = asNumber(value);
  return Math.min(Math.max(parsed > 0 ? parsed : fallback, 1), max);
}

export function aspectRatioCss(ratio: unknown): string {
  const text = asText(ratio) || "16:9";
  const parts = text.split(":");
  const width = Number(parts[0]);
  const height = Number(parts[1]);
  return width > 0 && height > 0 ? `${width} / ${height}` : "16 / 9";
}

export function isHttpUrl(value: unknown): boolean {
  return /^https?:\/\//i.test(asText(value).trim());
}

export function layoutBoxStyle(
  kind: string,
  props: Record<string, unknown>,
): Record<string, string> {
  const style: Record<string, string> = {};
  const gap = `${asNumber(props.gap) || 12}px`;
  if (kind === "Stack") {
    style.display = "flex";
    style.flexDirection = "column";
    style.gap = gap;
    if (props.padding != null) style.padding = `${asNumber(props.padding)}px`;
  } else if (kind === "Row") {
    style.display = "flex";
    style.flexDirection = "row";
    style.gap = gap;
    if (props.align) style.alignItems = asText(props.align);
    if (props.justify) style.justifyContent = asText(props.justify);
  } else if (kind === "Grid" || kind === "FeatureGrid" || kind === "KpiBoard" || kind === "ImageGallery") {
    const fallback = kind === "KpiBoard" ? 3 : kind === "FeatureGrid" ? 2 : kind === "ImageGallery" ? 3 : 2;
    const max = kind === "FeatureGrid" ? 4 : 6;
    style.display = "grid";
    style.gridTemplateColumns = `repeat(${clampColumns(props.columns, fallback, max)}, minmax(0, 1fr))`;
    style.gap = kind === "ImageGallery" ? `${asNumber(props.gap) || 8}px` : gap;
  } else if (kind === "ScrollArea") {
    style.maxHeight = `${asNumber(props.maxHeight) || 300}px`;
    style.overflowY = "auto";
    if (props.padding != null) style.padding = `${asNumber(props.padding)}px`;
  } else if (kind === "AspectBox") {
    style.aspectRatio = aspectRatioCss(props.ratio);
    style.overflow = "hidden";
    style.borderRadius = "8px";
    style.display = "flex";
    style.justifyContent = "center";
    style.alignItems = "center";
  } else if (kind === "Spacer") {
    style.height = `${asNumber(props.size) || 16}px`;
  }
  return style;
}

export type ChartSeries = { name: string; values: number[] };

export type ChartModel = {
  title: string;
  chartType: string;
  categories: string[];
  series: ChartSeries[];
  height: number;
  showLegend: boolean;
  empty: boolean;
};

export function resolveChartModel(
  props: Record<string, unknown>,
  values?: Record<string, unknown> | null,
): ChartModel {
  function text(value: unknown): string {
    return typeof value === "string" ? value : value == null ? "" : String(value);
  }
  function number(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }
  function array(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }
  const generator = props.generator && typeof props.generator === "object"
    ? props.generator as Record<string, unknown>
    : {};
  const coefficientNames = array(generator.coefficients).map(text).filter(Boolean);
  const canGenerate = text(generator.type) === "polynomial" || coefficientNames.length > 0;
  let categories = array(props.categories).map(text);
  let seriesRaw = array(props.series);
  if (canGenerate && values) {
    const names = coefficientNames.length > 0 ? coefficientNames : ["a", "b", "c", "d", "e"];
    const xMin = typeof generator.xMin === "number" ? generator.xMin : -3;
    const xMax = typeof generator.xMax === "number" ? generator.xMax : 3;
    const samples = Math.min(Math.max(number(generator.samples) || 61, 10), 400);
    const xs = Array.from({ length: samples }, (_, index) => xMin + (xMax - xMin) * index / Math.max(samples - 1, 1));
    const coefficients = names.map((name) => number(values[name]));
    categories = xs.map((x) => Number(x.toFixed(2)).toString());
    seriesRaw = [{
      name: text(generator.label) || "f(x)",
      values: xs.map((x) => coefficients.reduce((sum, coefficient, index) => (
        sum + coefficient * Math.pow(x, coefficients.length - index - 1)
      ), 0)),
    }];
  }
  const series = seriesRaw.map((item, index) => {
    const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      name: text(row.name) || `Series ${index + 1}`,
      values: array(row.values).map(number),
    };
  });
  return {
    title: text(props.title),
    chartType: text(props.chart) || "line",
    categories,
    series,
    height: number(props.height) || 200,
    showLegend: props.showLegend !== false,
    empty: categories.length === 0 || series.length === 0,
  };
}

export function paintChartElement(
  target: HTMLElement,
  model: ChartModel,
  width = 640,
): void {
  const colors = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];
  target.replaceChildren();
  if (model.title) {
    const title = document.createElement("div");
    title.className = "chart-title";
    title.textContent = model.title;
    target.appendChild(title);
  }
  if (model.empty) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "Chart: no data";
    target.appendChild(empty);
    return;
  }
  const height = model.height || 240;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", model.title || "Chart");
  if (model.chartType === "pie") {
    const pieValues = model.series[0].values.map((value) => Math.abs(value));
    const total = pieValues.reduce((sum, value) => sum + value, 0) || 1;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    let angle = -Math.PI / 2;
    pieValues.forEach((value, index) => {
      const sweep = value / total * Math.PI * 2;
      const x1 = cx + radius * Math.cos(angle);
      const y1 = cy + radius * Math.sin(angle);
      const x2 = cx + radius * Math.cos(angle + sweep);
      const y2 = cy + radius * Math.sin(angle + sweep);
      const path = document.createElementNS(svg.namespaceURI, "path");
      path.setAttribute("d", `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`);
      path.setAttribute("fill", colors[index % colors.length]);
      svg.appendChild(path);
      angle += sweep;
    });
    target.appendChild(svg);
    if (model.showLegend) {
      const legend = document.createElement("div");
      legend.className = "legend";
      pieValues.forEach((value, index) => {
        const entry = document.createElement("span");
        const dot = document.createElement("i");
        dot.style.background = colors[index % colors.length];
        entry.append(dot, document.createTextNode(`${model.categories[index] || `#${index + 1}`}: ${value}`));
        legend.appendChild(entry);
      });
      target.appendChild(legend);
    }
    return;
  }
  const all = model.series.flatMap((item) => item.values);
  const max = Math.max(...all, 0);
  const min = Math.min(...all, 0);
  const range = max - min || 1;
  const y = (value: number) => height - 24 - ((value - min) / range) * (height - 44);
  const x = (index: number) => 30 + index * (width - 50) / Math.max(model.categories.length - 1, 1);
  const axis = document.createElementNS(svg.namespaceURI, "line");
  axis.setAttribute("x1", "30");
  axis.setAttribute("x2", String(width - 15));
  axis.setAttribute("y1", String(y(0)));
  axis.setAttribute("y2", String(y(0)));
  axis.setAttribute("stroke", "#d9d9d9");
  svg.appendChild(axis);
  model.series.forEach((item, seriesIndex) => {
    const color = colors[seriesIndex % colors.length];
    if (model.chartType === "bar") {
      const groupWidth = (width - 50) / Math.max(model.categories.length, 1);
      const barWidth = Math.max(1, groupWidth / model.series.length - 3);
      item.values.forEach((value, index) => {
        const rect = document.createElementNS(svg.namespaceURI, "rect");
        const top = Math.min(y(value), y(0));
        const bottom = Math.max(y(value), y(0));
        rect.setAttribute("x", String(30 + index * groupWidth + seriesIndex * (barWidth + 2)));
        rect.setAttribute("y", String(top));
        rect.setAttribute("width", String(barWidth));
        rect.setAttribute("height", String(Math.max(1, bottom - top)));
        rect.setAttribute("fill", color);
        svg.appendChild(rect);
      });
      return;
    }
    const points = item.values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
    const line = document.createElementNS(svg.namespaceURI, "polyline");
    line.setAttribute("points", points);
    line.setAttribute("fill", model.chartType === "area" ? `${color}22` : "none");
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
  });
  target.appendChild(svg);
  if (model.showLegend) {
    const legend = document.createElement("div");
    legend.className = "legend";
    model.series.forEach((item, index) => {
      const entry = document.createElement("span");
      const dot = document.createElement("i");
      dot.style.background = colors[index % colors.length];
      entry.append(dot, document.createTextNode(item.name));
      legend.appendChild(entry);
    });
    target.appendChild(legend);
  }
}

export type ResolvedGenUiIcon =
  | { kind: "svg"; paths: string[] }
  | { kind: "emoji"; text: string }
  | { kind: "empty" };

const GENUI_ICON_PATHS: Record<string, string[]> = {
  check: ["M20 6 9 17l-5-5"],
  warning: [
    "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    "M12 9v4",
    "M12 17h.01",
  ],
  info: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 16v-4",
    "M12 8h.01",
  ],
  error: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M15 9l-6 6",
    "M9 9l6 6",
  ],
  chart: ["M3 3v18h18", "M7 16V8", "M12 16v-5", "M17 16V4"],
  image: [
    "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
    "M8 14l2.5-3 2.5 3 3.5-4.5L20 16",
  ],
};

const GENUI_ICON_ALIASES: Record<string, string> = {
  check: "check",
  success: "check",
  "check-circle": "check",
  warning: "warning",
  alert: "warning",
  "alert-triangle": "warning",
  info: "info",
  information: "info",
  "info-circle": "info",
  error: "error",
  "x-circle": "error",
  "close-circle": "error",
  chart: "chart",
  "bar-chart": "chart",
  "bar-chart-2": "chart",
  image: "image",
  photo: "image",
  picture: "image",
};

export function resolveGenUiIcon(name: unknown): ResolvedGenUiIcon {
  const raw = asText(name).trim();
  if (!raw) return { kind: "empty" };
  const key = raw.toLowerCase().replace(/\s+/g, "-");
  const canonical = GENUI_ICON_ALIASES[key];
  if (canonical) return { kind: "svg", paths: GENUI_ICON_PATHS[canonical] };
  // Lucide-style identifiers are not a font. Unknown names stay decorative-empty.
  if (/^[\w.-]+$/.test(raw)) return { kind: "empty" };
  return raw.length <= 8 ? { kind: "emoji", text: raw.slice(0, 8) } : { kind: "empty" };
}

export function paintGenUiIcon(
  target: HTMLElement,
  name: unknown,
  options: { size?: number; color?: string } = {},
): void {
  const icon = resolveGenUiIcon(name);
  const size = options.size && options.size > 0 ? options.size : 16;
  target.setAttribute("aria-hidden", "true");
  target.replaceChildren();
  if (icon.kind === "emoji") {
    target.textContent = icon.text;
    target.style.fontSize = `${size}px`;
    if (options.color) target.style.color = options.color;
    return;
  }
  if (icon.kind === "empty") return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", options.color || "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("focusable", "false");
  svg.style.display = "block";
  for (const d of icon.paths) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  }
  target.appendChild(svg);
}
