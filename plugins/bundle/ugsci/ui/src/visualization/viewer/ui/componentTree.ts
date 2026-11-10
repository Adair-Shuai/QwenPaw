/**
 * Left-rail component tree -- folders, search, visibility, selection.
 */

import type { DatasetInfo } from "../contracts/types";
import { isDepthOnlyWell, isSpatialWell } from "../wellClassification";
import {
  DATASET_GROUPS,
  datasetProfile,
  type DatasetGroupId,
} from "../capabilities/datasetProfile";
import {
  datasetListLabel,
  organizeCatalog,
  type CatalogEntry,
  type CatalogMode,
} from "./catalogOrganization";

export { datasetListLabel, datasetMatchesQuery } from "./catalogOrganization";

export type ComponentGroupId = DatasetGroupId;

export const COMPONENT_GROUPS = DATASET_GROUPS;

export function classifyDatasetGroup(dataset: DatasetInfo): ComponentGroupId {
  return datasetProfile(dataset).group;
}

export interface ComponentTreeRenderOptions {
  mode?: CatalogMode;
  query: string;
  activeId: string | null;
  selectedId: string | null;
  visibleIds: Set<string>;
  collapsedGroups: Set<string>;
  onToggleGroup: (groupId: ComponentGroupId) => void;
  onToggleVisible: (dataset: DatasetInfo, visible: boolean) => void;
  onSelect: (dataset: DatasetInfo) => void;
  onOpen?: (dataset: DatasetInfo) => void;
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
  list.dataset.catalogMode = options.mode || "data";
  const groups = organizeCatalog(datasets, options);
  for (const group of groups)
    list.appendChild(buildGroup(group.id, group.title, group.entries, options));
  if (groups.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = options.query.trim()
      ? options.mode === "layers"
        ? "没有匹配的图层"
        : "没有匹配的对象"
      : options.mode === "layers"
      ? "暂无可见空间图层"
      : "暂无对象";
    empty.style.cssText = "padding:10px 8px;color:#484f58;";
    list.appendChild(empty);
  }
}

/** Selection changes must retain focused controls and the native double-click target. */
export function updateComponentTreeSelection(
  list: HTMLElement,
  selectedId: string | null,
): void {
  for (const item of list.querySelectorAll<HTMLElement>("[data-dataset-id]"))
    setItemSelection(item, item.dataset.datasetId === selectedId);
}

function setItemSelection(item: HTMLElement, selected: boolean): void {
  item.dataset.selected = String(selected);
  item
    .querySelector<HTMLButtonElement>("[data-catalog-select]")
    ?.setAttribute("aria-pressed", String(selected));
  item.style.background = selected ? "rgba(31,111,235,.22)" : "transparent";
  item.style.color = selected ? "#e6edf3" : "#8b949e";
  item.style.boxShadow = selected ? "inset 2px 0 #58a6ff" : "none";
}

function buildGroup(
  groupId: ComponentGroupId,
  title: string,
  entries: CatalogEntry[],
  options: ComponentTreeRenderOptions,
): HTMLElement {
  // Search results must remain visible without changing the user's saved folds.
  const collapsed =
    !options.query.trim() && options.collapsedGroups.has(groupId);
  const group = document.createElement("div");
  group.dataset.groupId = groupId;
  group.style.cssText = "margin-bottom:6px;";

  const header = document.createElement("button");
  header.type = "button";
  header.setAttribute("aria-expanded", String(!collapsed));
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
  count.textContent = String(entries.length);
  count.style.cssText = "margin-left:auto;color:#484f58;font-weight:500;";
  header.append(chevron, label, count);
  header.addEventListener("click", () => options.onToggleGroup(groupId));
  group.appendChild(header);

  if (collapsed) return group;

  for (const entry of entries) group.appendChild(buildItem(entry, options));
  return group;
}

function buildItem(
  { dataset, parent }: CatalogEntry,
  options: ComponentTreeRenderOptions,
): HTMLElement {
  const item = document.createElement("div");
  item.setAttribute("role", "group");
  item.setAttribute("aria-label", datasetListLabel(dataset));
  const active = dataset.id === options.activeId;
  const selected = dataset.id === options.selectedId;
  const depthOnly = isDepthOnlyWell(dataset);
  item.dataset.datasetId = dataset.id;
  item.dataset.active = String(active);
  item.style.cssText = [
    "display:flex;align-items:flex-start;gap:6px;",
    "padding:5px 6px 5px 8px;margin:1px 0;border-radius:5px;cursor:pointer;",
  ].join("");

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = options.visibleIds.has(dataset.id);
  check.style.cssText = "margin:3px 0 0;flex:0 0 auto;";
  if (!datasetProfile(dataset).spatialOverlay) {
    check.checked = false;
    check.disabled = true;
    check.title =
      "\u7eaf\u6df1\u5ea6\u6d4b\u4e95\u65e0\u6cd5\u5728\u4e09\u7ef4\u89c6\u56fe\u663e\u793a";
  } else {
    check.title = "\u663e\u793a/\u9690\u85cf " + datasetListLabel(dataset);
  }
  check.setAttribute(
    "aria-label",
    "\u663e\u793a/\u9690\u85cf " + datasetListLabel(dataset),
  );
  check.addEventListener("click", (event) => event.stopPropagation());
  check.addEventListener("dblclick", (event) => event.stopPropagation());
  check.addEventListener("change", () => {
    if (check.disabled) {
      check.checked = false;
      return;
    }
    options.onToggleVisible(dataset, check.checked);
  });

  const text = document.createElement("button");
  text.type = "button";
  text.dataset.catalogSelect = "true";
  text.setAttribute("aria-label", "选择 " + datasetListLabel(dataset));
  text.style.cssText =
    "min-width:0;flex:1;border:0;padding:0;background:transparent;text-align:left;color:inherit;cursor:pointer;";
  const name = document.createElement("div");
  name.textContent = depthOnly
    ? datasetListLabel(dataset) + "\uff08\u4ec5\u6df1\u5ea6\uff09"
    : datasetListLabel(dataset);
  name.style.cssText =
    "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;line-height:1.3;";
  const meta = document.createElement("div");
  meta.textContent = datasetMeta(dataset);
  meta.style.cssText = "color:#6e7681;font-size:10px;margin-top:1px;";
  if (active) {
    const badge = document.createElement("span");
    badge.textContent = "当前分析";
    badge.dataset.analysisActive = "true";
    badge.style.cssText =
      "display:inline-block;margin-left:5px;padding:1px 4px;border-radius:3px;background:rgba(31,111,235,.2);color:#79c0ff;font-size:9px;white-space:nowrap;";
    meta.appendChild(badge);
  }
  text.append(name, meta);
  if (parent) {
    const relation = document.createElement("div");
    relation.dataset.parentDataset = parent.id;
    relation.textContent = `派生自：${parent.label}${
      parent.available ? "" : "（未在目录中）"
    }`;
    relation.title = `来源数据集：${parent.label}（${parent.id}）`;
    relation.style.cssText =
      "color:#8b949e;font-size:10px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    text.appendChild(relation);
  }

  item.append(check, text);
  const open = document.createElement("button");
  open.type = "button";
  open.textContent = "↗";
  open.title = "打开分析 " + datasetListLabel(dataset);
  open.setAttribute("aria-label", open.title);
  open.style.cssText =
    "display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:22px;height:22px;margin-top:1px;padding:0;border:1px solid #30363d;border-radius:4px;background:transparent;color:#8b949e;cursor:pointer;font-size:14px;";
  open.addEventListener("click", (event) => {
    event.stopPropagation();
    (options.onOpen || options.onSelect)(dataset);
  });
  open.addEventListener("dblclick", (event) => event.stopPropagation());
  item.appendChild(open);
  if (options.onDelete) {
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "\u00d7";
    del.title = "\u79fb\u9664 " + datasetListLabel(dataset);
    del.setAttribute("aria-label", "\u79fb\u9664 " + datasetListLabel(dataset));
    del.style.cssText =
      "flex:0 0 auto;width:18px;height:18px;margin-top:2px;padding:0;border:0;background:transparent;color:#6e7681;cursor:pointer;font-size:14px;line-height:18px;";
    del.addEventListener("click", (event) => {
      event.stopPropagation();
      options.onDelete!(dataset);
    });
    del.addEventListener("dblclick", (event) => event.stopPropagation());
    del.addEventListener("mouseenter", () => {
      del.style.color = "#f85149";
    });
    del.addEventListener("mouseleave", () => {
      del.style.color = "#6e7681";
    });
    item.appendChild(del);
  }
  item.title = depthOnly
    ? dataset.name +
      " \u00b7 \u4ec5\u6df1\u5ea6\uff0c\u6253\u5f00\u300c\u6d4b\u4e95\u300d\u9875\u7b7e"
    : dataset.name + " \u00b7 " + dataset.n_cells.toLocaleString() + " 单元";
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
  setItemSelection(item, selected);
  return item;
}

function datasetMeta(dataset: DatasetInfo): string {
  if (isDepthOnlyWell(dataset)) return "\u6d4b\u4e95\u66f2\u7ebf";
  if (isSpatialWell(dataset)) return "\u4e95\u8f68\u8ff9";
  if (dataset.grid_dims && dataset.grid_dims.length >= 3) {
    return (
      dataset.grid_dims[0] +
      " x " +
      dataset.grid_dims[1] +
      " x " +
      dataset.grid_dims[2]
    );
  }
  if (dataset.n_cells > 0) return dataset.n_cells.toLocaleString() + " 单元";
  return dataset.source || "\u5bf9\u8c61";
}
