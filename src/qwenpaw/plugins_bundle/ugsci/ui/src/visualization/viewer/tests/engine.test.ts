/**
 * Frontend test suite for the oilgas-visualization viewer.
 *
 * Tests the core data structures and logic without requiring
 * a WebGL context. Run with: npx vitest
 */

import { describe, it, expect } from "vitest";
import { ACCEPTANCE_THRESHOLDS } from "../benchmark/benchmark";

describe("Benchmark thresholds", () => {
  it("should have realistic acceptance thresholds", () => {
    expect(ACCEPTANCE_THRESHOLDS.synthetic_m_p50_fps).toBeGreaterThanOrEqual(30);
    expect(ACCEPTANCE_THRESHOLDS.synthetic_m_p95_frame).toBeLessThanOrEqual(50);
    expect(ACCEPTANCE_THRESHOLDS.leak_retained).toBeLessThanOrEqual(100);
    expect(ACCEPTANCE_THRESHOLDS.bootstrap_size).toBeLessThanOrEqual(150 * 1024);
  });
});

describe("Colormap", () => {
  it("should interpolate colors correctly", () => {
    const { colormap } = createTestColormap();
    const c0 = colormap("viridis", 0);
    expect(c0[0]).toBeCloseTo(0.267, 2);

    const c1 = colormap("viridis", 1);
    expect(c1[0]).toBeCloseTo(0.993, 2);

    const cMid = colormap("viridis", 0.5);
    // The Viridis red channel is not monotonic; at t=0.5 this is the
    // midpoint between palette entries 6 and 7.
    expect(cMid[0]).toBeCloseTo(0.146, 3);
    expect(cMid[1]).toBeCloseTo(0.702, 3);
    expect(cMid[2]).toBeCloseTo(0.4925, 3);
  });
});

describe("Hex topology", () => {
  it("reorders Eclipse pairing corners to VTK hex winding", async () => {
    const { maybeRemapHexPositions, usesEclipsePairing, isHexCellMesh } = await import("../hexTopology");
    const pairing = new Float32Array([
      0, 0, 0,  1, 0, 0,  0, 1, 0,  1, 1, 0,
      0, 0, 1,  1, 0, 1,  0, 1, 1,  1, 1, 1,
    ]);
    expect(isHexCellMesh(8, 1)).toBe(true);
    expect(usesEclipsePairing(pairing, 1)).toBe(true);
    expect(maybeRemapHexPositions(pairing, 1)).toBe(true);
    expect(usesEclipsePairing(pairing, 1)).toBe(false);
    expect(Array.from(pairing.slice(6, 9))).toEqual([1, 1, 0]);
  });

  it("fans non-planar hex faces from the OPM face centroid", async () => {
    const {
      HEX_FILL_INDICES_PER_CELL,
      HEX_FILL_VERTS_PER_CELL,
      tessellateHexOpmFan,
    } = await import("../hexTopology");
    const corners = new Float32Array([
      0, 0, 0,  1, 0, 0,  1, 1, 0,  0, 1, 0,
      0, 0, 1,  1, 0, 1,  1, 1, 1.4,  0, 1, 1,
    ]);
    const fan = tessellateHexOpmFan(corners, 1);
    expect(fan.positions.length).toBe(HEX_FILL_VERTS_PER_CELL * 3);
    expect(fan.indices.length).toBe(HEX_FILL_INDICES_PER_CELL);
    const topBase = 5;
    const n0 = [fan.normals[topBase * 3], fan.normals[topBase * 3 + 1], fan.normals[topBase * 3 + 2]];
    for (let vertex = 1; vertex < 5; vertex++) {
      expect(fan.normals[(topBase + vertex) * 3]).toBeCloseTo(n0[0], 5);
      expect(fan.normals[(topBase + vertex) * 3 + 1]).toBeCloseTo(n0[1], 5);
      expect(fan.normals[(topBase + vertex) * 3 + 2]).toBeCloseTo(n0[2], 5);
    }
    expect(Array.from(fan.indices.slice(12, 24))).toEqual([
      topBase + 4, topBase, topBase + 1,
      topBase + 4, topBase + 1, topBase + 2,
      topBase + 4, topBase + 2, topBase + 3,
      topBase + 4, topBase + 3, topBase,
    ]);
  });

  it("uses (0,0,1) for a collapsed face normal", async () => {
    const { tessellateHexOpmFan } = await import("../hexTopology");
    const collapsed = new Float32Array([
      0, 0, 0,  0, 0, 0,  0, 0, 0,  0, 0, 0,
      0, 0, 1,  1, 0, 1,  1, 1, 1,  0, 1, 1,
    ]);
    const fan = tessellateHexOpmFan(collapsed, 1);
    expect(fan.normals[0]).toBe(0);
    expect(fan.normals[1]).toBe(0);
    expect(fan.normals[2]).toBe(1);
  });

  it("loads compact 14-vert disk meshes through the viewer pipeline", async () => {
    const {
      HEX_COMPACT_VERTS_PER_CELL,
      HEX_FILL_INDICES_PER_CELL,
      HEX_FILL_VERTS_PER_CELL,
      VTK_HEX_EDGES,
      buildHexEdgeIndex,
      extractHexCorners,
      prepareHexView,
    } = await import("../hexTopology");
    const pairing = new Float32Array([
      0, 0, 0,  1, 0, 0,  0, 1, 0,  1, 1, 0,
      0, 0, 1,  1, 0, 1,  0, 1, 1,  1, 1, 1,
    ]);
    const compact = new Float32Array(HEX_COMPACT_VERTS_PER_CELL * 3);
    compact.set(pairing.subarray(0, 24), 0);
    for (let face = 0; face < 6; face++) {
      compact[24 + face * 3] = 0.5;
      compact[24 + face * 3 + 1] = 0.5;
      compact[24 + face * 3 + 2] = face < 1 ? 0 : 1;
    }
    const view = prepareHexView(compact, 1);
    expect(view).not.toBeNull();
    expect(view!.remapped).toBe(true);
    expect(Array.from(view!.corners.slice(6, 9))).toEqual([1, 1, 0]);
    expect(view!.fill.positions.length).toBe(HEX_FILL_VERTS_PER_CELL * 3);
    expect(view!.fill.indices.length).toBe(HEX_FILL_INDICES_PER_CELL);
    const corners = extractHexCorners(compact, 1);
    expect(corners.length).toBe(24);
    const edges = buildHexEdgeIndex([0]);
    expect(edges.length).toBe(VTK_HEX_EDGES.length * 2);
    expect(Math.max(...Array.from(edges))).toBeLessThan(8);
  });
});

describe("Dataset manifest structure", () => {
  it("should have correct file descriptor shape", () => {
    const manifest = {
      version: 1,
      datasets: [{
        id: "test",
        name: "Test",
        n_vertices: 8,
        n_cells: 1,
        n_indices: 36,
        files: {
          positions: "test_positions.f32",
          indices: "test_indices.u32",
          cell_ids: "test_cell_ids.u32",
          scalars: { porosity: "test_scalars_porosity.f32" },
        },
      }],
    };
    expect(manifest.version).toBe(1);
    expect(manifest.datasets).toHaveLength(1);
    expect(manifest.datasets[0].files.scalars.porosity).toBeDefined();
  });
});

// Helper to test colormap logic without importing the viewer
function createTestColormap() {
  const colormaps: Record<string, number[][]> = {
    viridis: [
      [0.267, 0.005, 0.329], [0.282, 0.140, 0.457], [0.254, 0.265, 0.530],
      [0.207, 0.372, 0.553], [0.164, 0.471, 0.558], [0.138, 0.567, 0.550],
      [0.135, 0.659, 0.518], [0.157, 0.745, 0.467], [0.215, 0.813, 0.398],
      [0.350, 0.851, 0.333], [0.536, 0.851, 0.261], [0.737, 0.813, 0.185],
      [0.921, 0.737, 0.089], [0.993, 0.906, 0.144],
    ],
  };

  function colormap(name: string, t: number): [number, number, number] {
    const cm = colormaps[name] || colormaps.viridis;
    const idx = Math.max(0, Math.min(cm.length - 1, Math.floor(t * (cm.length - 1))));
    const next = Math.min(cm.length - 1, idx + 1);
    const frac = t * (cm.length - 1) - idx;
    return [
      cm[idx][0] + (cm[next][0] - cm[idx][0]) * frac,
      cm[idx][1] + (cm[next][1] - cm[idx][1]) * frac,
      cm[idx][2] + (cm[next][2] - cm[idx][2]) * frac,
    ];
  }

  return { colormap };
}

describe("Well placement", () => {
  it("treats UTM-scale XY as spatial even when vertical", async () => {
    const { trajectoryPlacement, wellPlacement, isGridDataset, isDepthOnlyWell } = await import("../wellClassification");
    expect(trajectoryPlacement([500000, 500000], [4000000, 4000000])).toBe("spatial");
    expect(trajectoryPlacement([0, 0], [0, 0])).toBe("depth-only");
    expect(wellPlacement({
      id: "las_1",
      name: "LAS: A",
      n_vertices: 2,
      n_cells: 1,
      n_indices: 2,
      source: "las",
      files: { positions: "", indices: "", cell_ids: "", scalars: {} },
    })).toBe("depth-only");
    expect(wellPlacement({
      id: "well_1",
      name: "Well: A-1",
      n_vertices: 2,
      n_cells: 2,
      n_indices: 2,
      source: "wellbore",
      files: { positions: "", indices: "", cell_ids: "", scalars: {} },
      metadata: { placement: "spatial", spatial: true },
    })).toBe("spatial");
    expect(isDepthOnlyWell({
      id: "las_1",
      name: "LAS: A",
      n_vertices: 2,
      n_cells: 1,
      n_indices: 2,
      source: "las",
      files: { positions: "", indices: "", cell_ids: "", scalars: {} },
    })).toBe(true);
    expect(isGridDataset({
      id: "grid",
      name: "Grid",
      n_vertices: 8,
      n_cells: 1,
      n_indices: 36,
      source: "cmg",
      grid_dims: [2, 2, 2],
      files: { positions: "", indices: "", cell_ids: "", scalars: {} },
    })).toBe(true);
  });

  it("downsamples polylines and keeps a visible tube radius", async () => {
    const { downsamplePolyline, uniquePolyline, visualWellRadius } = await import("../wellClassification");
    const dense = Array.from({ length: 1000 }, (_, index) => [index, 0, -index] as [number, number, number]);
    expect(downsamplePolyline(dense, 10)).toHaveLength(10);
    expect(uniquePolyline([0, 0, 0, 0, 0, 0, 1, 0, -10])).toEqual([[0, 0, 0], [1, 0, -10]]);
    expect(visualWellRadius([[0, 0, 0], [1000, 0, -1000]])).toBeGreaterThanOrEqual(1.5);
    expect(visualWellRadius([[0, 0, 0], [1000, 0, -1000]])).toBeLessThanOrEqual(80);
  });
});

function dummyDataset(partial: Record<string, unknown>) {
  return {
    id: "id",
    name: "name",
    n_vertices: 8,
    n_cells: 1,
    n_indices: 36,
    files: { positions: "", indices: "", cell_ids: "", scalars: {} },
    ...partial,
  } as import("../contracts/types").DatasetInfo;
}

describe("Component tree grouping", () => {
  it("classifies grids, wells, logs, surfaces and networks", async () => {
    const { classifyDatasetGroup, datasetMatchesQuery } = await import("../ui/componentTree");
    expect(classifyDatasetGroup(dummyDataset({ source: "cmg", grid_dims: [2, 2, 2] }))).toBe("grids");
    expect(classifyDatasetGroup(dummyDataset({
      source: "wellbore",
      metadata: { placement: "spatial", spatial: true },
    }))).toBe("wells");
    expect(classifyDatasetGroup(dummyDataset({ source: "las" }))).toBe("logs");
    expect(classifyDatasetGroup(dummyDataset({ source: "intersection" }))).toBe("surfaces");
    expect(classifyDatasetGroup(dummyDataset({ source: "network" }))).toBe("networks");
    expect(datasetMatchesQuery(dummyDataset({ name: "Hugin fm", id: "surf_1" }), "hugin")).toBe(true);
    expect(datasetMatchesQuery(dummyDataset({ name: "Hugin fm", id: "surf_1" }), "nope")).toBe(false);
  });
});

describe("Well map projection", () => {
  it("round-trips pixel mapping and hits the nearest well", async () => {
    const { wellMapTransform, hitTestWellMap, unionBounds } = await import("../ui/wellMap");
    const points = [
      { id: "a", name: "A", x: 0, y: 0 },
      { id: "b", name: "B", x: 1000, y: 500 },
    ];
    const bounds = unionBounds(points);
    expect(bounds).not.toBeNull();
    const transform = wellMapTransform(bounds!, 228, 176);
    const [px, py] = transform.toPixel(1000, 500);
    const [x, y] = transform.fromPixel(px, py);
    expect(x).toBeCloseTo(1000, 0);
    expect(y).toBeCloseTo(500, 0);
    expect(hitTestWellMap(points, bounds!, 228, 176, px, py)).toBe("b");
  });
});

describe("Chrome layout", () => {
  it("puts the tree on the left and inspector on the right", async () => {
    const { chromeInsets, LAYOUT } = await import("../ui/layout");
    expect(chromeInsets(false, false)).toEqual({
      left: LAYOUT.treeWidth,
      right: LAYOUT.inspectorWidth,
    });
    expect(chromeInsets(true, true)).toEqual({
      left: LAYOUT.treeCollapsed,
      right: LAYOUT.inspectorCollapsed,
    });
    expect(LAYOUT.slicePlayerHeight).toBe(32);
  });
});

describe("Inspector tabs", () => {
  it("exposes Controls, Actions and Addons", async () => {
    const { INSPECTOR_TABS } = await import("../ui/inspectorTabs");
    expect(INSPECTOR_TABS.map((tab) => tab.id)).toEqual(["controls", "actions", "addons"]);
    expect(INSPECTOR_TABS.map((tab) => tab.label)).toEqual(["Controls", "Actions", "Addons"]);
  });
});

describe("Import filename rules", () => {
  it("accepts reservoir and well files and ranks the primary grid first", async () => {
    const { classifyPickedFiles, isImportableFilename } = await import("../ui/importFormats");
    expect(isImportableFilename("NORNE.EGRID")).toBe(true);
    expect(isImportableFilename("notes.txt")).toBe(false);
    const picked = classifyPickedFiles([
      new File([""], "case.INIT"),
      new File([""], "case.EGRID"),
      new File([""], "case.UNRST"),
    ]);
    expect(picked?.primary.name).toBe("case.EGRID");
    expect(picked?.companion?.name).toBe("case.INIT");
    expect(picked?.extra.map((file) => file.name)).toEqual(["case.UNRST"]);
  });
});

describe("Colormap CSS", () => {
  it("builds a rainbow CSS gradient", async () => {
    const { colormapCssGradient, COLORMAPS } = await import("../rendering/colormaps");
    expect(COLORMAPS.rainbow.length).toBeGreaterThan(3);
    expect(colormapCssGradient("rainbow")).toContain("linear-gradient");
  });
});

describe("Named views", () => {
  it("places the camera on the requested geographic axis", async () => {
    const THREE = await import("three");
    const { namedViewPose, viewDistanceForBox } = await import("../ui/standardViews");
    const { sliceRangeText } = await import("../ui/slicePlayer");
    const target = new THREE.Vector3(10, 20, 30);
    const top = namedViewPose("top", target, 100);
    expect(top.position.z).toBeCloseTo(130);
    expect(top.up.y).toBeCloseTo(1);
    const north = namedViewPose("north", target, 50);
    expect(north.position.y).toBeCloseTo(70);
    expect(north.up.z).toBeCloseTo(1);
    const east = namedViewPose("east", target, 50);
    expect(east.position.x).toBeCloseTo(60);
    const box = new THREE.Box3(new THREE.Vector3(-10, -10, -10), new THREE.Vector3(10, 10, 10));
    expect(viewDistanceForBox(box, 1, 50)).toBeGreaterThan(10);
    expect(sliceRangeText(4)).toBe("4:4");
  });
});

describe("Object context menu", () => {
  it("disables object actions when nothing is picked", async () => {
    const { objectContextItems } = await import("../ui/contextMenu");
    const empty = objectContextItems(false);
    expect(empty.find((item) => item.id === "delete")?.disabled).toBe(true);
    expect(empty.find((item) => item.id === "show-all")?.disabled).toBeFalsy();
    const picked = objectContextItems(true);
    expect(picked.every((item) => !item.disabled)).toBe(true);
  });
});
