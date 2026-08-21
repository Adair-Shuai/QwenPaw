/**
 * Left-rail component tree -- folders, search, visibility, selection.
 */

import type { DatasetInfo } from "../contracts/types";
import {
  isDepthOnlyWell,
  isGridDataset,
  isSpatialWell,
  wellDisplayName,
} from "../wellClassification";

export type ComponentGroupId = "grids" | "wells" | "logs" | "surfaces" | "networks" | "other";

export const COMPONENT_GROUPS: ReadonlyArray<{ id: ComponentGroupId; title: string }> = [
  { id: "grids", title: "\u7f51\u683c" },
  { id: "wells", title: "\u4e95" },
  { id: "logs", title: "\u6d4b\u4e95" },
  { id: "surfaces", title: "\u5c42\u9762 / \u5256\u9762" },
  { id: "networks", title: "\u7ba1\u7f51" },
];

export function classifyDatasetGroup(dataset: DatasetInfo): ComponentGroupId {
  if (isGridDataset(dataset)) return "grids";
  if (isSpatialWell(dataset)) return "wells";
  if (isDepthOnlyWell(dataset)) return "logs";
  const source = dataset.source || "";
  if (["surface", "intersection", "well-intersection", "slice"].includes(source)) {
    return "surfaces";
  }
  if (["network", "network-tube"].includes(source)) return "networks";
  return "other";
}

export function datasetMatchesQuery(dataset: DatasetInfo, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const wellName = typeof dataset.metadata?.well_name === "string" ? dataset.metadata.well_name : "";
  return [dataset.id, dataset.name, wellName, dataset.source || "", wellDisplayName(dataset)]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export function datasetListLabel(dataset: DatasetInfo): string {
  if (isSpatialWell(dataset) || isDepthOnlyWell(dataset)) return wellDisplayName(dataset);
  return dataset.name;
}

export interface ComponentTreeRenderOptions {
  query: string;
  activeId: string | null;
  selectedId: string | null;
  visibleIds: Set<string>;
  collapsedGroups: Set<string>;
  onToggleGroup: (groupId: ComponentGroupId) => void;
  onToggleVisible: (dataset: DatasetInfo, visible: boolean) => void;
  onSelect: (dataset: DatasetInfo) => void;
  onFocus: (dataset: DatasetInfo) => void;
  onDelete?: (dataset: DatasetInfo) => void;
  onContextMenu?: (dataset: DatasetInfo, event: MouseEvent) => void;
}

export function renderComponentTree(
  list: HTMLElement,
  datasets: DatasetInfo[],
  options: ComponentTreeRenderOptions,
) {
  list.innerHTML = "";
  const filtered = datasets.filter((dataset) => datasetMatchesQuery(dataset, options.query));
  const grouped = new Map<ComponentGroupId, DatasetInfo[]>();
  for (const group of COMPONENT_GROUPS) grouped.set(group.id, []);
  grouped.set("other", []);
  for (const dataset of filtered) {
    const groupId = classifyDatasetGroup(dataset);
    grouped.get(groupId)?.push(dataset);
  }

  let rendered = 0;
  for (const group of COMPONENT_GROUPS) {
    const items = grouped.get(group.id) || [];
    if (options.query.trim() && items.length === 0) continue;
    rendered += items.length;
    list.appendChild(buildGroup(group.id, group.title, items, options));
  }
  const other = grouped.get("other") || [];
  if (other.length > 0) {
    rendered += other.length;
    list.appendChild(buildGroup("other", "\u5176\u4ed6", other, options));
  }
  if (rendered === 0) {
    const empty = document.createElement("div");
    empty.textContent = options.query.trim() ? "\u6ca1\u6709\u5339\u914d\u7684\u5bf9\u8c61" : "\u6682\u65e0\u5bf9\u8c61";
    empty.style.cssText = "padding:10px 8px;color:#484f58;";
    list.appendChild(empty);
  }
}

function buildGroup(
  groupId: ComponentGroupId,
  title: string,
  datasets: DatasetInfo[],
  options: ComponentTreeRenderOptions,
): HTMLElement {
  const collapsed = options.collapsedGroups.has(groupId);
  const group = document.createElement("div");
  group.dataset.groupId = groupId;
  group.style.cssText = "margin-bottom:6px;";

  const header = document.createElement("button");
  header.type = "button";
  header.style.cssText = [
    "display:flex;align-items:center;gap:6px;width:100%;",
    "background:transparent;border:0;color:#8b949e;cursor:pointer;",
    "font:600 11px/1.2 -apple-system,sans-serif;letter-spacing:.04em;",
    "padding:6px 4px;text-align:left;",
  ].join("");
  const chevron = document.createElement("span");
  chevron.textContent = collapsed ? ">" : "v";
  chevron.style.cssText = "width:10px;color:#6e7681;";
  const label = document.createElement("span");
  label.textContent = title.toUpperCase();
  const count = document.createElement("span");
  count.textContent = String(datasets.length);
  count.style.cssText = "margin-left:auto;color:#484f58;font-weight:500;";
  header.append(chevron, label, count);
  header.addEventListener("click", () => options.onToggleGroup(groupId));
  group.appendChild(header);

  if (collapsed) return group;

  if (datasets.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "\u7a7a";
    empty.style.cssText = "padding:2px 8px 8px 22px;color:#484f58;font-size:11px;";
    group.appendChild(empty);
    return group;
  }

  for (const dataset of datasets) {
    group.appendChild(buildItem(dataset, options));
  }
  return group;
}

function buildItem(dataset: DatasetInfo, options: ComponentTreeRenderOptions): HTMLElement {
  const item = document.createElement("div");
  const active = dataset.id === options.activeId;
  const selected = dataset.id === options.selectedId;
  const depthOnly = isDepthOnlyWell(dataset);
  item.dataset.datasetId = dataset.id;
  item.dataset.selected = String(selected || active);
  item.style.cssText = [
    "display:flex;align-items:flex-start;gap:6px;",
    "padding:5px 6px 5px 8px;margin:1px 0;border-radius:5px;cursor:pointer;",
    selected || active ? "background:rgba(31,111,235,.22);color:#e6edf3;" : "background:transparent;color:#8b949e;",
    selected || active ? "box-shadow:inset 2px 0 #58a6ff;" : "box-shadow:none;",
  ].join("");

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = options.visibleIds.has(dataset.id);
  check.style.cssText = "margin:3px 0 0;flex:0 0 auto;";
  if (depthOnly) {
    check.checked = false;
    check.disabled = true;
    check.title = "\u7eaf\u6df1\u5ea6\u6d4b\u4e95\u65e0\u6cd5\u5728\u4e09\u7ef4\u89c6\u56fe\u663e\u793a";
  } else {
    check.title = "\u663e\u793a/\u9690\u85cf " + datasetListLabel(dataset);
  }
  check.setAttribute("aria-label", "\u663e\u793a/\u9690\u85cf " + datasetListLabel(dataset));
  check.addEventListener("click", (event) => event.stopPropagation());
  check.addEventListener("change", () => options.onToggleVisible(dataset, check.checked));

  const text = document.createElement("div");
  text.style.cssText = "min-width:0;flex:1;";
  const name = document.createElement("div");
  name.textContent = depthOnly ? datasetListLabel(dataset) + "\uff08\u4ec5\u6df1\u5ea6\uff09" : datasetListLabel(dataset);
  name.style.cssText = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;line-height:1.3;";
  const meta = document.createElement("div");
  meta.textContent = datasetMeta(dataset);
  meta.style.cssText = "color:#6e7681;font-size:10px;margin-top:1px;";
  text.append(name, meta);

  item.append(check, text);
  if (options.onDelete) {
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "\u00d7";
    del.title = "\u79fb\u9664 " + datasetListLabel(dataset);
    del.setAttribute("aria-label", "\u79fb\u9664 " + datasetListLabel(dataset));
    del.style.cssText = "flex:0 0 auto;width:18px;height:18px;margin-top:2px;padding:0;border:0;background:transparent;color:#6e7681;cursor:pointer;font-size:14px;line-height:18px;";
    del.addEventListener("click", (event) => {
      event.stopPropagation();
      options.onDelete!(dataset);
    });
    del.addEventListener("mouseenter", () => { del.style.color = "#f85149"; });
    del.addEventListener("mouseleave", () => { del.style.color = "#6e7681"; });
    item.appendChild(del);
  }
  item.title = depthOnly
    ? dataset.name + " \u00b7 \u4ec5\u6df1\u5ea6\uff0c\u6253\u5f00\u300c\u6d4b\u4e95\u300d\u9875\u7b7e"
    : dataset.name + " \u00b7 " + dataset.n_cells.toLocaleString() + " cells";
  item.addEventListener("click", () => options.onSelect(dataset));
  item.addEventListener("dblclick", (event) => {
    event.preventDefault();
    options.onFocus(dataset);
  });
  item.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
    options.onContextMenu?.(dataset, event);
  });
  item.addEventListener("mouseenter", () => {
    if (item.dataset.selected !== "true") item.style.color = "#58a6ff";
  });
  item.addEventListener("mouseleave", () => {
    if (item.dataset.selected !== "true") item.style.color = "#8b949e";
  });
  return item;
}

function datasetMeta(dataset: DatasetInfo): string {
  if (isDepthOnlyWell(dataset)) return "\u6d4b\u4e95\u66f2\u7ebf";
  if (isSpatialWell(dataset)) return "\u4e95\u8f68\u8ff9";
  if (dataset.grid_dims && dataset.grid_dims.length >= 3) {
    return dataset.grid_dims[0] + " x " + dataset.grid_dims[1] + " x " + dataset.grid_dims[2];
  }
  if (dataset.n_cells > 0) return dataset.n_cells.toLocaleString() + " cells";
  return dataset.source || "\u5bf9\u8c61";
}
