import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderComponentTree,
  updateComponentTreeSelection,
  type ComponentTreeRenderOptions,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/componentTree";
import type { DatasetInfo } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/contracts/types";

afterEach(() => document.body.replaceChildren());

function dataset(
  id: string,
  source?: string,
  extra: Partial<DatasetInfo> = {},
): DatasetInfo {
  return {
    id,
    name: id,
    source,
    n_vertices: 4,
    n_cells: 2,
    n_indices: 6,
    files: { positions: "p", indices: "i", cell_ids: "c", scalars: {} },
    ...extra,
  };
}

function catalog(
  datasets: DatasetInfo[],
  overrides: Partial<ComponentTreeRenderOptions> = {},
) {
  const list = document.body.appendChild(document.createElement("div"));
  const options: ComponentTreeRenderOptions = {
    query: "",
    activeId: null,
    selectedId: null,
    visibleIds: new Set(),
    collapsedGroups: new Set(),
    onToggleGroup: vi.fn(),
    onToggleVisible: vi.fn(),
    onSelect: vi.fn(),
    onFocus: vi.fn(),
    ...overrides,
  };
  const render = () => renderComponentTree(list, datasets, options);
  render();
  const row = (id: string) =>
    Array.from(list.querySelectorAll<HTMLElement>("[data-dataset-id]")).find(
      (item) => item.dataset.datasetId === id,
    )!;
  return { list, options, render, row };
}

describe("visualization catalog and visible layers", () => {
  it("shows only populated data groups and keeps search independent of saved folds", () => {
    const grid = dataset("reservoir", undefined, { name: "储层模型" });
    const well = dataset("trajectory-7", "trajectory", {
      metadata: { well_name: "北区七号井" },
    });
    const collapsedGroups = new Set(["wells"]);
    const { list, options, render } = catalog([grid, well], {
      collapsedGroups,
    });
    expect(list.dataset.catalogMode).toBe("data");
    expect(
      Array.from(list.querySelectorAll<HTMLElement>("[data-group-id]")).map(
        (group) => group.dataset.groupId,
      ),
    ).toEqual(["grids", "wells"]);
    expect(
      within(list).queryByRole("button", { name: "选择 北区七号井" }),
    ).toBeNull();
    const header = within(list).getByRole("button", { name: /井/ });
    expect(header).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(header);
    expect(options.onToggleGroup).toHaveBeenCalledExactlyOnceWith("wells");

    options.query = "北区";
    render();
    expect(
      within(list).getByRole("button", { name: "选择 北区七号井" }),
    ).toBeVisible();
    expect(
      list.querySelector('[data-group-id="wells"] > button'),
    ).toHaveAttribute("aria-expanded", "true");
    expect(list.querySelector('[data-group-id="grids"]')).toBeNull();
    expect(collapsedGroups).toEqual(new Set(["wells"]));

    options.query = "";
    render();
    expect(
      within(list).queryByRole("button", { name: "选择 北区七号井" }),
    ).toBeNull();
  });

  it("lists only visible spatial layers and removes hidden rows on the next render", () => {
    const grid = dataset("grid");
    const hidden = dataset("hidden-network", "network");
    const spatialLog = dataset("spatial-log", "las", {
      metadata: { placement: "spatial" },
    });
    const depthLog = dataset("depth-log", "las");
    const { list, options, render, row } = catalog(
      [grid, hidden, spatialLog, depthLog],
      {
        mode: "layers",
        activeId: hidden.id,
        visibleIds: new Set([grid.id, spatialLog.id, depthLog.id, "stale-id"]),
      },
    );
    expect(row(grid.id)).toBeVisible();
    expect(row(spatialLog.id)).toBeVisible();
    expect(row(hidden.id)).toBeUndefined();
    expect(row(depthLog.id)).toBeUndefined();
    expect(list.querySelectorAll("[data-dataset-id]")).toHaveLength(2);
    options.onToggleVisible = vi.fn((item, visible) => {
      if (!visible) options.visibleIds.delete(item.id);
      render();
    });
    fireEvent.click(within(row(grid.id)).getByRole("checkbox"));
    expect(options.onToggleVisible).toHaveBeenCalledExactlyOnceWith(
      grid,
      false,
    );
    expect(row(grid.id)).toBeUndefined();
    expect(list.querySelector('[data-group-id="grids"]')).toBeNull();
    expect(options.onSelect).not.toHaveBeenCalled();

    options.query = hidden.id;
    render();
    expect(list.textContent).toBe("没有匹配的图层");
    options.query = "";
    options.visibleIds.clear();
    render();
    expect(list.textContent).toBe("暂无可见空间图层");
  });

  it("keeps selection independent of the active analysis and opens only through its explicit action", () => {
    const grid = dataset("grid");
    const network = dataset("network", "network");
    const surface = dataset("surface", "surface");
    const { list, options, render, row } = catalog([grid, network, surface], {
      activeId: grid.id,
      selectedId: network.id,
      onOpen: vi.fn(),
    });
    expect(row(grid.id)).toHaveAttribute("data-selected", "false");
    expect(within(row(grid.id)).getByText("当前分析")).toBeVisible();
    expect(
      within(row(grid.id)).getByRole("button", { name: "选择 grid" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(row(network.id)).toHaveAttribute("data-selected", "true");
    expect(within(row(network.id)).queryByText("当前分析")).toBeNull();

    options.onSelect = vi.fn((item) => {
      options.selectedId = item.id;
      render();
    });
    options.onOpen = vi.fn((item) => {
      options.activeId = item.id;
      render();
    });
    fireEvent.click(
      within(row(surface.id)).getByRole("button", { name: "选择 surface" }),
    );
    expect(options.onSelect).toHaveBeenCalledExactlyOnceWith(surface);
    expect(options.onOpen).not.toHaveBeenCalled();
    expect(row(surface.id)).toHaveAttribute("data-selected", "true");
    expect(within(row(grid.id)).getByText("当前分析")).toBeVisible();

    fireEvent.click(
      within(row(network.id)).getByRole("button", { name: "打开分析 network" }),
    );
    expect(options.onOpen).toHaveBeenCalledExactlyOnceWith(network);
    expect(options.onSelect).toHaveBeenCalledTimes(1);
    expect(row(surface.id)).toHaveAttribute("data-selected", "true");
    expect(within(row(network.id)).getByText("当前分析")).toBeVisible();
    expect(list.querySelectorAll("[data-analysis-active]")).toHaveLength(1);
  });

  it("updates selection in place while retaining keyboard focus and the full double-click sequence", async () => {
    const user = userEvent.setup();
    const grid = dataset("grid");
    const well = dataset("well", "trajectory");
    const { list, options, row } = catalog([grid, well], {
      activeId: grid.id,
      selectedId: grid.id,
      visibleIds: new Set([grid.id, well.id]),
      onOpen: vi.fn(),
    });
    const otherCatalog = catalog([grid], { selectedId: grid.id });
    const gridEntry = row(grid.id);
    const wellEntry = row(well.id);
    const activeBadge = within(gridEntry).getByText("当前分析");
    const select = within(wellEntry).getByRole("button", { name: "选择 well" });
    const keyboardSelect = vi.fn((item: DatasetInfo) => {
      updateComponentTreeSelection(list, item.id);
      expect(row(well.id)).toBe(wellEntry);
      expect(select.isConnected).toBe(true);
    });
    options.onSelect = keyboardSelect;

    select.focus();
    await user.keyboard("{Enter}");
    expect(keyboardSelect).toHaveBeenCalledExactlyOnceWith(well);
    expect(document.activeElement).toBe(select);
    expect(select).toHaveAttribute("aria-pressed", "true");
    expect(gridEntry).toHaveAttribute("data-selected", "false");
    expect(wellEntry).toHaveAttribute("data-selected", "true");
    expect(within(gridEntry).getByText("当前分析")).toBe(activeBadge);
    expect(within(wellEntry).getByRole("checkbox")).toBeChecked();
    expect(otherCatalog.row(grid.id)).toHaveAttribute("data-selected", "true");

    // userEvent emits pointer/mouse presses and both clicks before dblclick;
    // replacing the row during the first selection would detach this target.
    const sequence: string[] = [];
    for (const type of ["click", "dblclick"])
      select.addEventListener(type, () => sequence.push(type));
    await user.dblClick(select);
    expect(sequence).toEqual(["click", "click", "dblclick"]);
    expect(keyboardSelect).toHaveBeenCalledTimes(3);
    expect(options.onFocus).toHaveBeenCalledExactlyOnceWith(well);
    expect(options.onOpen).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(select);
    expect(row(well.id)).toBe(wellEntry);

    updateComponentTreeSelection(list, null);
    expect(select).toHaveAttribute("aria-pressed", "false");
    expect(wellEntry).toHaveAttribute("data-selected", "false");
    expect(wellEntry.style.background).toBe("transparent");
    expect(wellEntry.style.boxShadow).toBe("none");
    expect(document.activeElement).toBe(select);
    expect(within(gridEntry).getByText("当前分析")).toBe(activeBadge);
  });

  it("shows declared parent provenance and searchable sources without inferring name-based relationships", () => {
    const parent = dataset("model-42", undefined, { name: "母模型" });
    const child = dataset("slice-9", "slice", {
      name: "K 层切片",
      metadata: { parent_dataset: parent.id },
    });
    const sameName = dataset("unrelated", "slice", { name: child.name });
    const missingParent = dataset("orphan-section", "intersection", {
      metadata: { parent_dataset: "absent-model" },
    });
    const invalidParent = dataset("invalid-parent", "slice", {
      metadata: { parent_dataset: { id: parent.id } },
    });
    const selfParent = dataset("self-parent", "slice", {
      metadata: { parent_dataset: "self-parent" },
    });
    const { list, row, options, render } = catalog([
      parent,
      child,
      sameName,
      missingParent,
      invalidParent,
      selfParent,
    ]);
    expect(within(row(child.id)).getByText("派生自：母模型")).toHaveAttribute(
      "data-parent-dataset",
      parent.id,
    );
    expect(
      within(row(missingParent.id)).getByText(
        "派生自：absent-model（未在目录中）",
      ),
    ).toBeVisible();
    for (const item of [sameName, invalidParent, selfParent])
      expect(row(item.id).querySelector("[data-parent-dataset]")).toBeNull();

    options.query = "母模型";
    render();
    expect(list.querySelectorAll("[data-dataset-id]")).toHaveLength(2);
    expect(row(parent.id)).toBeVisible();
    expect(row(child.id)).toBeVisible();
    expect(row(sameName.id)).toBeUndefined();
  });

  it("keeps depth-only logs openable while preventing their spatial visibility", () => {
    const log = dataset("depth-only", "dlis");
    const { row, options } = catalog([log], {
      visibleIds: new Set([log.id]),
      onOpen: vi.fn(),
    });
    const checkbox = within(row(log.id)).getByRole("checkbox");
    expect(checkbox).toBeDisabled();
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(options.onToggleVisible).not.toHaveBeenCalled();
    fireEvent.click(
      within(row(log.id)).getByRole("button", { name: "打开分析 depth-only" }),
    );
    expect(options.onOpen).toHaveBeenCalledExactlyOnceWith(log);
    expect(options.onSelect).not.toHaveBeenCalled();
  });

  it("preserves legacy selection and isolates keyboard open, focus, visibility, deletion and context actions", async () => {
    const user = userEvent.setup();
    const grid = dataset("grid");
    const { row, options } = catalog([grid], {
      onDelete: vi.fn(),
      onContextMenu: vi.fn(),
    });
    const entry = row(grid.id);
    const select = within(entry).getByRole("button", { name: "选择 grid" });
    select.focus();
    await user.keyboard("{Enter}");
    expect(options.onSelect).toHaveBeenCalledExactlyOnceWith(grid);
    const open = within(entry).getByRole("button", { name: "打开分析 grid" });
    open.focus();
    await user.keyboard("{Enter}");
    expect(options.onSelect).toHaveBeenCalledTimes(2);
    fireEvent.doubleClick(select);
    expect(options.onFocus).toHaveBeenCalledExactlyOnceWith(grid);
    fireEvent.doubleClick(open);
    expect(options.onFocus).toHaveBeenCalledTimes(1);

    fireEvent.click(within(entry).getByRole("checkbox"));
    expect(options.onToggleVisible).toHaveBeenCalledExactlyOnceWith(grid, true);
    fireEvent.click(within(entry).getByRole("button", { name: "移除 grid" }));
    expect(options.onDelete).toHaveBeenCalledExactlyOnceWith(grid);
    const menu = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    entry.dispatchEvent(menu);
    expect(menu.defaultPrevented).toBe(true);
    expect(options.onContextMenu).toHaveBeenCalledExactlyOnceWith(grid, menu);
    expect(options.onSelect).toHaveBeenCalledTimes(2);
  });
});
