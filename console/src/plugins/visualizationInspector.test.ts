import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, within } from "@testing-library/react";
import type { DatasetInfo } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/contracts/types";
import {
  appendControlRow,
  createControlTable,
  createBoolSwitch,
  createInspectorTabs,
  type InspectorTabId,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/inspectorTabs";
import { organizeInspectorControls } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/contextInspector";

afterEach(() => document.body.replaceChildren());

const originalRows: Record<InspectorTabId, string[]> = {
  controls: [
    "dataset",
    "property",
    "timeStep",
    "play",
    "colorRamp",
    "opacity",
    "wireframe",
    "filterIJK",
    "propertyRange",
    "excludeRange",
    "isolateK",
    "kLayer",
    "zScale",
    "orthographic",
    "clipPlane",
    "clipDepth",
  ],
  actions: [
    "polyline",
    "zRange",
    "intersection",
    "wellSectionGrid",
    "wellSectionWell",
    "wellSection",
    "slice",
    "extractSlice",
    "capture",
    "stats",
    "exportCsv",
    "exportScene",
    "importFile",
    "importWorkspace",
    "deleteObject",
  ],
  addons: [
    "axes",
    "floorGrid",
    "wellLabels",
    "legend",
    "histogram",
    "wellMap",
    "compass",
    "background",
  ],
};

function dataset(source = "eclipse", extra: Partial<DatasetInfo> = {}) {
  return {
    id: source,
    name: source,
    source,
    n_cells: 2,
    n_vertices: 16,
    n_indices: 72,
    files: {
      positions: "positions.f32",
      indices: "indices.u32",
      cell_ids: "ids.u32",
      scalars: { pressure: "pressure.f32" },
    },
    ...extra,
  } satisfies DatasetInfo;
}

function inspector() {
  const root = document.body.appendChild(document.createElement("div"));
  const tabs = createInspectorTabs();
  root.append(tabs.tabBar, ...Object.values(tabs.panes));
  const controls = new Map<string, HTMLInputElement>();
  const rows = new Map<string, HTMLElement>();
  const changed = vi.fn();
  for (const tab of Object.keys(originalRows) as InspectorTabId[]) {
    const table = createControlTable();
    tabs.panes[tab].append(table.table);
    for (const name of originalRows[tab]) {
      const input = document.createElement("input");
      input.value = `${name}-value`;
      input.addEventListener("change", changed);
      controls.set(name, input);
      rows.set(name, appendControlRow(table.body, name, input));
    }
  }
  const diagnostics = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "诊断";
  diagnostics.append(summary);
  tabs.panes.addons.append(diagnostics);
  const handle = organizeInspectorControls(tabs.panes);
  return { root, tabs, controls, rows, handle, changed, diagnostics };
}

function visible(rows: Map<string, HTMLElement>, names: string[]) {
  for (const name of names)
    expect(rows.get(name), name).not.toHaveAttribute("hidden");
}

function hidden(rows: Map<string, HTMLElement>, names: string[]) {
  for (const name of names)
    expect(rows.get(name), name).toHaveAttribute("hidden");
}

describe("contextual visualization inspector", () => {
  it("synchronizes disabled switch buttons and ignores disabled interaction until reenabled", () => {
    const changed = vi.fn();
    const root = createBoolSwitch("disabled-example", false, changed);
    document.body.append(root);
    const input = root.querySelector<HTMLInputElement>("input")!;
    const on = within(root).getByRole("button", { name: "开启" });
    const off = within(root).getByRole("button", { name: "关闭" });
    input.disabled = true;
    input.dispatchEvent(new Event("ugsci-sync"));
    expect(on).toBeDisabled();
    expect(off).toBeDisabled();
    fireEvent.click(on);
    input.dispatchEvent(new Event("change"));
    expect(input.checked).toBe(false);
    expect(changed).not.toHaveBeenCalled();
    input.disabled = false;
    input.dispatchEvent(new Event("ugsci-sync"));
    expect(on).toBeEnabled();
    expect(off).toBeEnabled();
    fireEvent.click(on);
    expect(input.checked).toBe(true);
    expect(on).toHaveAttribute("aria-pressed", "true");
    expect(changed).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("keeps stable tab IDs and original control keys while using object, analysis and scene labels", () => {
    const first = inspector();
    const second = inspector();
    const tabs = within(first.tabs.tabBar);
    const object = tabs.getByRole("tab", { name: /^对象/ });
    expect(object).toHaveAttribute("data-tab", "controls");
    expect(object).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(object, { key: "ArrowRight" });
    expect(tabs.getByRole("tab", { name: /^分析/ })).toHaveFocus();
    expect(first.tabs.active()).toBe("actions");
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(tabs.getByRole("tab", { name: /^场景/ })).toHaveFocus();
    expect(first.tabs.active()).toBe("addons");
    expect(second.tabs.active()).toBe("controls");
    expect(first.rows.get("property")).toHaveAttribute(
      "data-control-name",
      "property",
    );
    expect(first.controls.get("property")).toHaveAttribute(
      "aria-label",
      "着色属性",
    );
    const ids = Array.from(document.querySelectorAll("[id]")).map(
      (node) => node.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("groups current grid controls without replacing nodes, listeners or entered values", () => {
    const { root, tabs, controls, rows, handle, changed, diagnostics } =
      inspector();
    const counts = handle.update({
      dataset: dataset("eclipse", {
        grid_dims: [2, 1, 1],
        time_steps: [
          { index: 0, step_number: 1, scalars: { pressure: "step.f32" } },
        ],
      }),
      currentIsSelected: true,
    });
    visible(rows, [
      "property",
      "timeStep",
      "play",
      "opacity",
      "wireframe",
      "filterIJK",
      "propertyRange",
      "slice",
      "wellSection",
    ]);
    hidden(rows, ["dataset"]);
    expect(
      rows.get("filterIJK")?.closest("[data-inspector-section]"),
    ).toHaveAttribute("data-inspector-section", "grid-filter");
    expect(tabs.panes.actions.contains(rows.get("filterIJK")!)).toBe(true);
    expect(tabs.panes.addons.contains(rows.get("zScale")!)).toBe(true);
    expect(tabs.panes.addons.contains(rows.get("capture")!)).toBe(true);
    expect(tabs.panes.controls.contains(rows.get("deleteObject")!)).toBe(true);
    expect(root.querySelectorAll("[data-control-name]")).toHaveLength(
      Object.values(originalRows).flat().length,
    );
    expect(root.querySelectorAll("[data-control-table]")).toHaveLength(0);
    expect(controls.get("property")?.value).toBe("property-value");
    fireEvent.change(controls.get("property")!, {
      target: { value: "temperature" },
    });
    expect(changed).toHaveBeenCalledTimes(1);
    expect(tabs.panes.addons.lastElementChild).toBe(diagnostics);
    for (const tab of Object.keys(counts) as InspectorTabId[]) {
      const shown = Array.from(
        tabs.panes[tab].querySelectorAll<HTMLElement>("[data-control-name]"),
      ).filter((row) => !row.hidden);
      expect(counts[tab]).toBe(shown.length);
    }
  });

  it.each(["surface", "intersection", "network"])(
    "keeps %s analysis and scene controls without unrelated grid operations",
    (source) => {
      const { rows, handle } = inspector();
      handle.update({ dataset: dataset(source), currentIsSelected: true });
      visible(rows, [
        "property",
        "colorRamp",
        "opacity",
        "propertyRange",
        "clipPlane",
        "stats",
        "exportCsv",
      ]);
      hidden(rows, [
        "filterIJK",
        "isolateK",
        "kLayer",
        "slice",
        "extractSlice",
        "polyline",
        "wellSectionGrid",
        "wellSectionWell",
        "wellSection",
        "timeStep",
        "play",
      ]);
    },
  );

  it("retains IJK operations for a dimensioned slice but rejects missing or invalid dimensions", () => {
    const { rows, handle } = inspector();
    handle.update({
      dataset: dataset("slice", { grid_dims: [2, 1, 1] }),
      currentIsSelected: true,
    });
    visible(rows, ["filterIJK", "isolateK", "kLayer", "slice", "extractSlice"]);
    for (const grid_dims of [undefined, [2, 0, 1], [2, 1], [2, 1.5, 1]]) {
      handle.update({
        dataset: dataset("eclipse", { grid_dims }),
        currentIsSelected: true,
      });
      hidden(rows, [
        "filterIJK",
        "isolateK",
        "kLayer",
        "slice",
        "extractSlice",
      ]);
      visible(rows, ["property", "stats", "exportCsv"]);
    }
  });

  it("keeps well and depth-log attributes available while limiting geometry operations to their supported targets", () => {
    const { rows, handle } = inspector();
    handle.update({ dataset: dataset("wellbore"), currentIsSelected: true });
    visible(rows, [
      "property",
      "opacity",
      "wireframe",
      "wellSectionGrid",
      "wellSectionWell",
      "wellSection",
      "stats",
      "exportCsv",
    ]);
    hidden(rows, [
      "filterIJK",
      "slice",
      "propertyRange",
      "excludeRange",
      "clipPlane",
      "polyline",
    ]);
    handle.update({
      dataset: dataset("las", { metadata: { placement: "depth-only" } }),
      currentIsSelected: true,
    });
    visible(rows, ["property", "colorRamp", "stats", "exportCsv"]);
    hidden(rows, [
      "opacity",
      "wireframe",
      "wellSection",
      "clipPlane",
      "propertyRange",
      "filterIJK",
    ]);
    visible(rows, [
      "axes",
      "wellLabels",
      "wellMap",
      "zScale",
      "orthographic",
      "legend",
      "histogram",
    ]);
  });

  it("hides current-dataset actions when an overlay is selected and preserves global access with no object", () => {
    const { rows, handle, tabs } = inspector();
    const context = {
      dataset: dataset("eclipse", { grid_dims: [2, 1, 1] }),
      currentIsSelected: false,
    };
    let counts = handle.update(context);
    hidden(rows, [
      "property",
      "opacity",
      "wireframe",
      "colorRamp",
      "filterIJK",
      "propertyRange",
      "stats",
      "exportCsv",
      "wellSection",
    ]);
    visible(rows, [
      "deleteObject",
      "zScale",
      "orthographic",
      "axes",
      "floorGrid",
      "legend",
      "histogram",
      "capture",
      "exportScene",
      "importFile",
      "importWorkspace",
    ]);
    expect(counts.controls).toBe(1);
    expect(counts.actions).toBe(0);
    expect(
      tabs.panes.actions.querySelectorAll("section:not([hidden])"),
    ).toHaveLength(0);
    counts = handle.update({ dataset: null, currentIsSelected: false });
    hidden(rows, ["deleteObject"]);
    expect(counts.controls).toBe(0);
    expect(counts.actions).toBe(0);
    expect(counts.addons).toBe(14);
    visible(rows, [
      "importFile",
      "background",
      "compass",
      "wellLabels",
      "wellMap",
    ]);
  });

  it("restores applicable rows with their original values and keeps separate inspectors independent", () => {
    const first = inspector();
    const second = inspector();
    const grid = dataset("eclipse", { grid_dims: [2, 1, 1] });
    first.handle.update({ dataset: grid, currentIsSelected: true });
    second.handle.update({
      dataset: dataset("surface"),
      currentIsSelected: true,
    });
    first.controls.get("filterIJK")!.value = "2:2";
    first.handle.update({
      dataset: dataset("wellbore"),
      currentIsSelected: false,
    });
    first.handle.update({ dataset: grid, currentIsSelected: true });
    expect(first.controls.get("filterIJK")?.value).toBe("2:2");
    visible(first.rows, ["filterIJK"]);
    hidden(second.rows, ["filterIJK"]);
    visible(second.rows, ["stats"]);
    const count = first.root.querySelectorAll(
      "[data-inspector-section]",
    ).length;
    expect(organizeInspectorControls(first.tabs.panes)).toBe(first.handle);
    expect(
      first.root.querySelectorAll("[data-inspector-section]"),
    ).toHaveLength(count);
  });
});
