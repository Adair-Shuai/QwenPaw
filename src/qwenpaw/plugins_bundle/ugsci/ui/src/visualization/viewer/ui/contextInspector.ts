import { datasetProfile } from "../capabilities/datasetProfile";
import type { DatasetInfo } from "../contracts/types";
import type { InspectorTabId, InspectorTabs } from "./inspectorTabs";

export interface InspectorContext {
  /** The object named by the inspector card, which may be an overlay. */
  dataset: DatasetInfo | null;
  /** Existing analysis callbacks act on the engine's currentDataset. */
  currentIsSelected: boolean;
}

export interface ContextInspector {
  /** Counts describe applicable rows, independently of the active tab. */
  update(context: InspectorContext): Record<InspectorTabId, number>;
}

interface SectionDefinition {
  id: string;
  tab: InspectorTabId;
  label: string;
  controls: readonly string[];
}

const SECTIONS: readonly SectionDefinition[] = [
  {
    id: "appearance",
    tab: "controls",
    label: "显示与着色",
    controls: ["property", "colorRamp", "opacity", "wireframe"],
  },
  {
    id: "time",
    tab: "controls",
    label: "动态结果",
    controls: ["timeStep", "play"],
  },
  {
    id: "object",
    tab: "controls",
    label: "对象管理",
    controls: ["dataset", "deleteObject"],
  },
  {
    id: "property-filter",
    tab: "actions",
    label: "属性筛选",
    controls: ["propertyRange", "excludeRange"],
  },
  {
    id: "grid-filter",
    tab: "actions",
    label: "网格范围",
    controls: ["filterIJK", "isolateK", "kLayer"],
  },
  {
    id: "clipping",
    tab: "actions",
    label: "空间裁切",
    controls: ["clipPlane", "clipDepth"],
  },
  {
    id: "section",
    tab: "actions",
    label: "垂直剖面",
    controls: ["polyline", "zRange", "intersection"],
  },
  {
    id: "well-section",
    tab: "actions",
    label: "沿井剖面",
    controls: ["wellSectionGrid", "wellSectionWell", "wellSection"],
  },
  {
    id: "slice",
    tab: "actions",
    label: "网格切片",
    controls: ["slice", "extractSlice"],
  },
  {
    id: "statistics",
    tab: "actions",
    label: "统计与导出",
    controls: ["stats", "exportCsv"],
  },
  {
    id: "camera",
    tab: "addons",
    label: "场景视角",
    controls: ["zScale", "orthographic"],
  },
  {
    id: "scene-display",
    tab: "addons",
    label: "显示辅助",
    controls: [
      "axes",
      "floorGrid",
      "wellLabels",
      "legend",
      "histogram",
      "wellMap",
      "compass",
      "background",
    ],
  },
  {
    id: "scene-files",
    tab: "addons",
    label: "导入与场景导出",
    controls: ["importFile", "importWorkspace", "capture", "exportScene"],
  },
];

function applicable(
  name: string,
  tab: InspectorTabId,
  context: InspectorContext,
): boolean {
  // Navigation belongs to the object tree. Keep the hidden select available to
  // existing load/state synchronization without exposing a second entry point.
  if (name === "dataset") return false;
  if (name === "deleteObject") return context.dataset !== null;
  // These rows affect the scene, including when an overlay or no object is
  // selected. They must not inherit the current analysis object's restrictions.
  if (tab === "addons") return true;
  const { dataset, currentIsSelected } = context;
  if (!dataset || !currentIsSelected) return false;
  const profile = datasetProfile(dataset);
  const scalarFiles = Object.keys(dataset.files.scalars || {});
  const hasScalars =
    scalarFiles.length > 0 ||
    Boolean(
      dataset.time_steps?.some(
        (step) => Object.keys(step.scalars || {}).length > 0,
      ),
    );
  const structuredGrid =
    profile.isGrid &&
    dataset.grid_dims?.length === 3 &&
    dataset.grid_dims.every((size) => Number.isInteger(size) && size > 0);
  const cellFiltering =
    !["well", "welllog"].includes(profile.kind) &&
    dataset.n_cells > 0 &&
    dataset.n_indices > 0 &&
    dataset.n_indices % dataset.n_cells === 0;
  switch (name) {
    case "property":
    case "colorRamp":
    case "stats":
      return hasScalars;
    case "timeStep":
    case "play":
      return Boolean(dataset.time_steps?.length);
    case "opacity":
      return profile.spatialOverlay;
    case "wireframe":
      return (
        profile.spatialOverlay &&
        (profile.kind === "well" || profile.primitive === "triangles")
      );
    case "propertyRange":
    case "excludeRange":
      return cellFiltering && hasScalars;
    case "filterIJK":
    case "isolateK":
    case "kLayer":
    case "slice":
    case "extractSlice":
      return Boolean(structuredGrid);
    case "clipPlane":
    case "clipDepth":
      // Well tubes use an Object3D group; the existing clipping callback only
      // operates on a primary Mesh/Line material, not the group's children.
      return !["well", "welllog"].includes(profile.kind);
    case "polyline":
    case "zRange":
    case "intersection":
      return profile.kind === "reservoir" || Boolean(structuredGrid);
    case "wellSectionGrid":
    case "wellSectionWell":
    case "wellSection":
      return profile.isGrid || profile.kind === "well";
    default:
      return true;
  }
}

const organized = new WeakMap<HTMLElement, ContextInspector>();

/** Move existing rows without replacing controls, values, or event listeners.
 * The engine owns the selected-object card and any explicit "open" action.
 */
export function organizeInspectorControls(
  panes: InspectorTabs["panes"],
): ContextInspector {
  const existing = organized.get(panes.controls);
  if (existing) return existing;
  const rows = Object.entries(panes).flatMap(([tab, pane]) =>
    Array.from(pane.querySelectorAll<HTMLElement>("[data-control-name]")).map(
      (row) => ({
        row,
        name: row.dataset.controlName || "",
        tab: tab as InspectorTabId,
        display: row.style.display,
      }),
    ),
  );
  const definitions = [
    ...SECTIONS,
    ...Object.keys(panes).map((tab) => ({
      id: `other-${tab}`,
      tab: tab as InspectorTabId,
      label: "其他设置",
      controls: rows
        .filter(
          (item) =>
            item.tab === tab &&
            !SECTIONS.some((section) => section.controls.includes(item.name)),
        )
        .map((item) => item.name),
    })),
  ];
  const sections = definitions.flatMap((definition) => {
    const members = definition.controls.flatMap((name) =>
      rows.filter((item) => item.name === name),
    );
    if (!members.length) return [];
    const root = document.createElement("section");
    root.dataset.inspectorSection = definition.id;
    root.setAttribute("aria-label", definition.label);
    root.style.cssText = "margin:0 0 12px;";
    const heading = document.createElement("h3");
    heading.textContent = definition.label;
    heading.style.cssText =
      "margin:0;padding:5px 2px;color:#c9d1d9;font:600 11px/1.4 -apple-system,sans-serif;border-bottom:1px solid #30363d;";
    root.append(heading, ...members.map((member) => member.row));
    return [{ root, definition, members }];
  });
  for (const pane of Object.values(panes)) {
    for (const table of pane.querySelectorAll("[data-control-table]")) {
      if (!table.querySelector("[data-control-name]")) table.remove();
    }
  }
  // Leave caller-owned notices and diagnostics in place after these groups.
  for (const tab of Object.keys(panes) as InspectorTabId[]) {
    panes[tab].prepend(
      ...sections
        .filter((section) => section.definition.tab === tab)
        .map((section) => section.root),
    );
  }
  const inspector: ContextInspector = {
    update(context) {
      const counts: Record<InspectorTabId, number> = {
        controls: 0,
        actions: 0,
        addons: 0,
      };
      for (const { root, definition, members } of sections) {
        let visible = 0;
        for (const member of members) {
          const show = applicable(member.name, definition.tab, context);
          member.row.hidden = !show;
          member.row.style.display = show ? member.display : "none";
          if (show) visible++;
        }
        root.hidden = visible === 0;
        root.style.display = visible ? "block" : "none";
        counts[definition.tab] += visible;
      }
      return counts;
    },
  };
  organized.set(panes.controls, inspector);
  inspector.update({ dataset: null, currentIsSelected: false });
  return inspector;
}
