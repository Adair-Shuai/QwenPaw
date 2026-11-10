import { afterEach, expect, it, vi } from "vitest";
import { within } from "@testing-library/react";
import { ThreeViewerEngine } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/engines/ThreeViewerEngine";
import type { DatasetInfo } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/contracts/types";

// Retain real Three geometry, materials, controls, factories and the engine.
// The headless test environment only substitutes the GPU renderer boundary.
vi.mock(
  "../../../plugins/bundle/ugsci/ui/node_modules/three/build/three.module.js",
  async (original) => ({
    ...(await original<Record<string, unknown>>()),
    WebGLRenderer: class {
      domElement = document.createElement("canvas");
      info = { render: { calls: 0, triangles: 0 }, memory: { geometries: 0 } };
      renderLists = { dispose: vi.fn() };
      setSize = vi.fn();
      setPixelRatio = vi.fn();
      render = vi.fn();
      dispose = vi.fn();
    },
  }),
);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("loads every domain through real engine instances and preserves overlays, views, colors and independent disposal", async () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const resources = new Map<string, ArrayBuffer>();
  const datasets: DatasetInfo[] = [];
  const add = (
    id: string,
    source: string,
    xyz: number[],
    triangles: number[],
    ids: number[],
    metadata: Record<string, unknown>,
    grid_dims?: number[],
  ) => {
    const pointValues = metadata.scalar_association === "point";
    const values = Float32Array.from(
      { length: pointValues ? xyz.length / 3 : ids.length },
      (_, i) => (i === 0 ? 0 : i === 1 ? NaN : i * 10),
    );
    const files = {
      positions: `${id}.f32`,
      indices: `${id}.u32`,
      cell_ids: `${id}.ids`,
      scalars: { pressure: `${id}.pressure.f32` },
    };
    resources.set(files.positions, new Float32Array(xyz).buffer);
    resources.set(files.indices, new Uint32Array(triangles).buffer);
    resources.set(files.cell_ids, new Uint32Array(ids).buffer);
    resources.set(files.scalars.pressure, values.buffer);
    datasets.push({
      id,
      name: id,
      source,
      n_vertices: xyz.length / 3,
      n_indices: triangles.length,
      n_cells: ids.length,
      metadata,
      grid_dims,
      files,
    });
  };
  add(
    "grid",
    "synthetic",
    [
      1000, 2000, 0, 1010, 2000, 0, 1010, 2010, 0, 1000, 2010, 0, 1000, 2000,
      -10, 1010, 2000, -10, 1010, 2010, -10, 1000, 2010, -10,
    ],
    [
      0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 3, 2, 6, 3, 6, 7, 0,
      3, 7, 0, 7, 4, 1, 5, 6, 1, 6, 2,
    ],
    [42],
    { geometry_primitive: "triangles", scalar_association: "cell" },
    [1, 1, 1],
  );
  const trajectory = [
    1000, 2000, 10, 1001, 2001, -20, 1005, 2002, -40, 1007, 2003, -60,
  ];
  add("well", "trajectory", trajectory, [0, 1, 1, 2, 2, 3], [7, 8, 9], {
    placement: "spatial",
    geometry_primitive: "lines",
    scalar_association: "point",
  });
  add("network", "network", trajectory, [0, 1, 1, 2, 2, 3], [17, 18, 19], {
    geometry_primitive: "lines",
    scalar_association: "cell",
  });
  add("tube", "network-tube", trajectory, [0, 1, 2, 0, 2, 3], [21, 22], {
    geometry_primitive: "triangles",
    scalar_association: "cell",
  });
  add(
    "surface",
    "surface",
    [1000, 2000, 0, 1010, 2000, 0, 1000, 2010, 0],
    [0, 1, 2],
    [31],
    { geometry_primitive: "triangles", scalar_association: "cell" },
  );
  add("log", "las", [0, 0, 0, 0, 0, -10, 0, 0, -20, 0, 0, -30], [], [], {
    placement: "depth-only",
    geometry_primitive: "lines",
    scalar_association: "point",
  });
  const request = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/manifest"))
      return new Response(JSON.stringify({ version: 1, datasets }));
    const file = decodeURIComponent(url.slice(url.lastIndexOf("/") + 1));
    const data = resources.get(file);
    return data
      ? new Response(data.slice(0))
      : new Response("{}", { status: 404 });
  });
  const root = document.createElement("div");
  const otherRoot = document.createElement("div");
  document.body.append(root, otherRoot);
  const selection = vi.fn();
  const engine = new ThreeViewerEngine(root, {
    apiBase: "/visualization",
    request,
    autoLoad: false,
    onSelection: selection,
  });
  const other = new ThreeViewerEngine(otherRoot, {
    apiBase: "/visualization",
    request,
    autoLoad: false,
  });
  const state = engine;
  try {
    await Promise.all([engine.ready, other.ready]);
    await engine.executeCommand("open", { datasetId: "grid" });
    expect(state["currentObject"]!.hexCorners).not.toBeNull();
    expect(state["currentObject"]!.edges!.geometry.getIndex()!.count).toBe(24);
    expect(state["overlayObjects"].size).toBe(1);
    const overlay = state["overlayObjects"].get("well")!;
    expect(overlay.object!.getObjectByName("oilgas-well-tube")).toBeDefined();
    expect(overlay.origin).toEqual(state["currentObject"]!.origin);
    const overlayDisposed = vi.spyOn(overlay.geometry, "dispose");
    const gridDisposed = vi.spyOn(state["geometry"]!, "dispose");
    for (const [id, view, label] of [
      ["well", "wellbore", "井筒 3D"],
      ["network", "network", "管网"],
      ["tube", "network", "管网"],
      ["surface", "intersection", "剖面"],
      ["log", "welllog", "测井"],
    ]) {
      await engine.executeCommand("open", { datasetId: id });
      expect(engine.store.getState().dataset?.id).toBe(id);
      expect(engine.store.getState().activeView).toBe(view);
      expect(within(root).getByRole("tab", { name: label })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(
        state["geometry"]!.getAttribute("color").array.every(Number.isFinite),
      ).toBe(true);
      if (id === "well")
        expect(
          (
            state["mesh"]!.getObjectByName(
              "oilgas-well-tube",
            ) as import("three").Mesh
          ).geometry.getAttribute("color"),
        ).toBeDefined();
      if (id === "network")
        expect(
          (state["mesh"] as import("three").LineSegments).isLineSegments,
        ).toBe(true);
      if (id === "tube")
        expect((state["mesh"] as import("three").Mesh).isMesh).toBe(true);
      if (id === "log") {
        expect(state["mesh"]!).toBeNull();
        expect(state["overlayObjects"].size).toBe(0);
        expect(state["wellLogEl"]!.style.display).toBe("block");
      }
    }
    expect(gridDisposed).toHaveBeenCalledTimes(1);
    expect(overlayDisposed).toHaveBeenCalledTimes(1);
    expect(selection).toHaveBeenLastCalledWith({ type: "well", id: "log" });
    engine.dispose();
    engine.dispose();
    await other.executeCommand("open", { datasetId: "network" });
    expect(other.store.getState().dataset?.id).toBe("network");
    expect(root.childElementCount).toBe(0);
    expect(otherRoot.querySelector("canvas")).not.toBeNull();
  } finally {
    engine.dispose();
    other.dispose();
    root.remove();
    otherRoot.remove();
  }
});
