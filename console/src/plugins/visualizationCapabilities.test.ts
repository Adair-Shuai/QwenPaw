import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, within } from "@testing-library/react";
import type { DatasetInfo } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/contracts/types";
import {
  datasetProfile,
  datasetSourcesForView,
  datasetSupportsView,
  preferredDatasetView,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/capabilities/datasetProfile";
import { ViewRouter } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/app/view-router";
import { ViewerStore } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/stores/viewerState";
import { renderComponentTree } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/componentTree";
import {
  decodeGeometry,
  geometryPrimitive,
  scalarAssociation,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/rendering/datasetGeometry";
import {
  isDepthOnlyWell,
  isGridDataset,
  isSpatialWell,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/wellClassification";

afterEach(() => {
  document.body.replaceChildren();
});

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

function workbench(datasets: DatasetInfo[]) {
  const root = document.body.appendChild(document.createElement("div"));
  const list = root.appendChild(document.createElement("div"));
  const store = new ViewerStore();
  const onTabChange = vi.fn();
  const router = new ViewRouter(root, onTabChange, store);
  root.appendChild(router.createTabs());
  const toggleVisible = vi.fn();
  renderComponentTree(list, datasets, {
    query: "",
    activeId: null,
    selectedId: null,
    visibleIds: new Set(),
    collapsedGroups: new Set(),
    onToggleGroup: vi.fn(),
    onToggleVisible: toggleVisible,
    onFocus: vi.fn(),
    onSelect: (selected) => {
      store.setDataset(selected);
      router.switchTo(
        preferredDatasetView(selected, router.getActiveView()),
        false,
      );
    },
  });
  return { root, list, store, router, onTabChange, toggleVisible };
}

describe("visualization dataset capabilities", () => {
  it("groups every spatial well alias as a selectable well and routes the actual tree selection", () => {
    const wells = ["wellbore", "well", "trajectory"].map((source) =>
      dataset(`${source}-one`, source),
    );
    const { root, list, store, onTabChange, toggleVisible } = workbench(wells);
    const wellGroup = list.querySelector<HTMLElement>(
      '[data-group-id="wells"]',
    )!;
    for (const well of wells) {
      const checkbox = within(wellGroup).getByRole("checkbox", {
        name: `显示/隐藏 ${well.name}`,
      });
      expect(checkbox).toBeEnabled();
      fireEvent.click(checkbox);
      expect(toggleVisible).toHaveBeenLastCalledWith(well, true);
      fireEvent.click(
        within(wellGroup).getByRole("button", { name: `选择 ${well.name}` }),
      );
      expect(store.getState().dataset).toBe(well);
      expect(
        within(root).getByRole("tab", { name: "井筒 3D" }),
      ).toHaveAttribute("aria-selected", "true");
      expect(isSpatialWell(well)).toBe(true);
      expect(datasetSourcesForView("wellbore")).toContain(well.source);
      expect(scalarAssociation(well, "pressure", 4, 4)).toBe("point");
    }
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it("keeps depth-only well aliases and unplaced logs out of spatial visibility", () => {
    const logs = [
      dataset("unplaced-las", "las"),
      dataset("unplaced-dlis", "dlis"),
      dataset("depth-trajectory", "trajectory", {
        metadata: { placement: "depth-only" },
      }),
      dataset("depth-well", "well", { metadata: { spatial: false } }),
    ];
    const { root, list, store, toggleVisible } = workbench(logs);
    const logGroup = list.querySelector<HTMLElement>('[data-group-id="logs"]')!;
    for (const log of logs) {
      expect(
        within(logGroup).getByRole("checkbox", {
          name: `显示/隐藏 ${log.name}`,
        }),
      ).toBeDisabled();
      fireEvent.click(
        within(logGroup).getByRole("button", { name: `选择 ${log.name}` }),
      );
      expect(store.getState().dataset).toBe(log);
      expect(within(root).getByRole("tab", { name: "测井" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(isDepthOnlyWell(log)).toBe(true);
      expect(datasetSupportsView(log, "wellbore")).toBe(false);
    }
    expect(toggleVisible).not.toHaveBeenCalled();
  });

  it("retains a spatial log in its selected log view while surfaces and networks use their existing tabs", () => {
    const spatialLog = dataset("placed-las", "las", {
      metadata: { placement: "spatial" },
    });
    const surface = dataset("surface-one", "surface");
    const section = dataset("section-one", "well-intersection");
    const network = dataset("network-one", "network-tube");
    const { root, list, store, router, onTabChange } = workbench([
      spatialLog,
      surface,
      section,
      network,
    ]);
    router.switchTo("welllog", false);
    fireEvent.click(
      within(root).getByRole("button", { name: "选择 placed-las" }),
    );
    expect(store.getState().activeView).toBe("welllog");
    expect(isSpatialWell(spatialLog)).toBe(true);
    expect(datasetSupportsView(spatialLog, "wellbore")).toBe(true);
    expect(
      within(
        list.querySelector<HTMLElement>('[data-group-id="wells"]')!,
      ).getByRole("checkbox"),
    ).toBeEnabled();
    for (const item of [surface, section]) {
      fireEvent.click(
        within(
          list.querySelector<HTMLElement>('[data-group-id="surfaces"]')!,
        ).getByRole("button", { name: `选择 ${item.name}` }),
      );
      expect(within(root).getByRole("tab", { name: "剖面" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    }
    fireEvent.click(
      within(
        list.querySelector<HTMLElement>('[data-group-id="networks"]')!,
      ).getByRole("button", { name: "选择 network-one" }),
    );
    expect(within(root).getByRole("tab", { name: "管网" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(onTabChange).not.toHaveBeenCalled();
    fireEvent.keyDown(within(root).getByRole("tab", { name: "管网" }), {
      key: "ArrowLeft",
    });
    expect(onTabChange).toHaveBeenCalledExactlyOnceWith("welllog");
    expect(within(root).getByRole("tab", { name: "测井" })).toHaveFocus();
  });

  it("opens a dimensioned slice in the section view even when the current view is reservoir", () => {
    const slice = dataset("layer-slice", "slice", { grid_dims: [2, 2, 1] });
    const { root, store, router, onTabChange } = workbench([slice]);
    expect(router.getActiveView()).toBe("reservoir");
    // Tab eligibility and the view selected after loading are different policies.
    expect(datasetSupportsView(slice, "reservoir")).toBe(true);
    fireEvent.click(
      within(root).getByRole("button", { name: "选择 layer-slice" }),
    );
    expect(store.getState().dataset).toBe(slice);
    expect(store.getState().activeView).toBe("intersection");
    expect(within(root).getByRole("tab", { name: "剖面" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it("keeps legacy source-less and unknown manifests in the reservoir tree and view", () => {
    const legacy = [dataset("old-grid"), dataset("vendor-grid", "vendor-v1")];
    const { root, list, store } = workbench(legacy);
    const group = list.querySelector<HTMLElement>('[data-group-id="grids"]')!;
    for (const item of legacy) {
      fireEvent.click(
        within(group).getByRole("button", { name: `选择 ${item.name}` }),
      );
      expect(store.getState().dataset).toBe(item);
      expect(
        within(root).getByRole("tab", { name: "储层 3D" }),
      ).toHaveAttribute("aria-selected", "true");
      expect(isGridDataset(item)).toBe(true);
    }
    // Existing dimensions take precedence for grouping, even on old inconsistent manifests.
    expect(
      isGridDataset(
        dataset("old-dimensions", "surface", { grid_dims: [1, 1, 1] }),
      ),
    ).toBe(true);
  });

  it("preserves explicit geometry and scalar metadata while validating the decoded buffers", () => {
    const tube = dataset("tube", "network", {
      metadata: { geometry_primitive: "triangles", scalar_association: "cell" },
      properties: {
        pointPressure: {
          label: "Pressure",
          association: "point",
          count: 4,
          unit: "Pa",
        },
      },
    });
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]);
    const triangles = new Uint32Array([0, 1, 2, 0, 2, 3]);
    const cells = new Uint32Array([0, 1]);
    expect(datasetProfile(tube).selectionType).toBe("segment");
    expect(geometryPrimitive(tube)).toBe("triangles");
    expect(
      decodeGeometry(tube, positions.buffer, triangles.buffer, cells.buffer)
        .indices,
    ).toEqual(triangles);
    expect(scalarAssociation(tube, "cellPressure", 4, 4)).toBe("cell");
    expect(scalarAssociation(tube, "pointPressure", 4, 4)).toBe("point");
    const malformed = { ...tube, n_indices: 4 };
    expect(() =>
      decodeGeometry(
        malformed,
        positions.buffer,
        new Uint32Array([0, 1, 2, 3]).buffer,
        cells.buffer,
      ),
    ).toThrow("几何索引数量与图元类型不一致");
    expect(geometryPrimitive(dataset("legacy-network", "network"))).toBe(
      "lines",
    );
    expect(geometryPrimitive(dataset("tube-source", "network-tube"))).toBe(
      "triangles",
    );
  });
});
