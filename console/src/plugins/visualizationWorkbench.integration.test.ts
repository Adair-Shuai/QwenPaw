import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, waitFor, within } from "@testing-library/react";
import type { Material, Mesh } from "three";
import { ThreeViewerEngine } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/engines/ThreeViewerEngine";
import type { DatasetInfo } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/contracts/types";
import type { DatasetObject } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/scene/datasetObject";
import { HEX_FILL_INDICES_PER_CELL } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/hexTopology";

// Geometry, materials, controls, domain factories and the mounted engine are real.
// Only the GPU boundary is substituted because jsdom does not provide WebGL.
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

const engines: ThreeViewerEngine[] = [];
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});
afterEach(() => {
  engines.splice(0).forEach((engine) => engine.dispose());
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function fixture({ verticalGrid = false }: { verticalGrid?: boolean } = {}) {
  const resources = new Map<string, ArrayBuffer>();
  const datasets: DatasetInfo[] = [];
  const add = (
    id: string,
    source: string,
    xyz: number[],
    indices: number[],
    ids: number[],
    metadata: Record<string, unknown>,
    values: number[],
    grid_dims?: number[],
  ) => {
    const files = {
      positions: `${id}.f32`,
      indices: `${id}.u32`,
      cell_ids: `${id}.ids`,
      scalars: { pressure: `${id}.pressure.f32` },
    };
    resources.set(files.positions, new Float32Array(xyz).buffer);
    resources.set(files.indices, new Uint32Array(indices).buffer);
    resources.set(files.cell_ids, new Uint32Array(ids).buffer);
    resources.set(files.scalars.pressure, new Float32Array(values).buffer);
    const dataset: DatasetInfo = {
      id,
      name: id,
      source,
      metadata,
      grid_dims,
      files,
      n_vertices: xyz.length / 3,
      n_indices: indices.length,
      n_cells: ids.length,
    };
    datasets.push(dataset);
    return dataset;
  };
  const positions: number[] = [];
  const indices: number[] = [];
  const cellTriangles = [
    0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 3, 2, 6, 3, 6, 7, 0,
    3, 7, 0, 7, 4, 1, 5, 6, 1, 6, 2,
  ];
  for (let cell = 0; cell < 2; cell++) {
    const x = 1000 + (verticalGrid ? 0 : cell * 10);
    const z = verticalGrid ? -cell * 10 : 0;
    positions.push(
      x,
      2000,
      z,
      x + 10,
      2000,
      z,
      x + 10,
      2010,
      z,
      x,
      2010,
      z,
      x,
      2000,
      z - 10,
      x + 10,
      2000,
      z - 10,
      x + 10,
      2010,
      z - 10,
      x,
      2010,
      z - 10,
    );
    indices.push(...cellTriangles.map((index) => index + cell * 8));
  }
  const grid = add(
    "grid",
    "synthetic",
    positions,
    indices,
    [0, 1],
    {
      geometry_primitive: "triangles",
      scalar_association: "cell",
    },
    [100, 200],
    verticalGrid ? [1, 1, 2] : [2, 1, 1],
  );
  grid.files.scalars.porosity = "grid.porosity.f32";
  resources.set("grid.porosity.f32", new Float32Array([0.1, 0.25]).buffer);
  grid.time_steps = [
    {
      index: 0,
      step_number: 10,
      scalars: { porosity: "grid.porosity.step-10.f32" },
    },
  ];
  resources.set(
    "grid.porosity.step-10.f32",
    new Float32Array([0.15, 0.35]).buffer,
  );
  add(
    "well",
    "trajectory",
    [1005, 2005, 5, 1005, 2005, -20, 1008, 2005, -40],
    [0, 1, 1, 2],
    [7, 8],
    {
      placement: "spatial",
      geometry_primitive: "lines",
      scalar_association: "point",
    },
    [10, 20, 30],
  );
  add(
    "network",
    "network",
    [1100, 2100, 0, 1110, 2110, -5, 1120, 2100, 0],
    [0, 1, 1, 2],
    [17, 18],
    {
      geometry_primitive: "lines",
      scalar_association: "cell",
    },
    [60, 70],
  );
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
  return { request };
}

function mount(request: typeof fetch, key: string) {
  const root = document.body.appendChild(document.createElement("div"));
  const selection = vi.fn();
  const engine = new ThreeViewerEngine(root, {
    apiBase: "/visualization",
    request,
    autoLoad: false,
    persistenceKey: key,
    onSelection: selection,
  });
  engines.push(engine);
  const row = (id: string) =>
    root.querySelector<HTMLElement>(`[data-dataset-id="${id}"]`)!;
  const click = (id: string, action: "选择" | "打开分析") =>
    fireEvent.click(
      within(row(id)).getByRole("button", { name: `${action} ${id}` }),
    );
  const control = <T extends HTMLElement>(id: string) =>
    root.querySelector<T>(`#${id}`)!;
  return { root, engine, state: engine, row, click, control, selection };
}

describe("visualization workbench selection and scene ownership", () => {
  it("inspects without replacing analysis and preserves scene handles plus saved analysis settings on explicit open", async () => {
    const { request } = fixture();
    const { root, engine, state, row, click, control, selection } = mount(
      request,
      "scene-preservation",
    );
    await engine.ready;
    await engine.executeCommand("open", { datasetId: "grid" });
    const grid: DatasetObject = state["currentObject"]!;
    const well: DatasetObject = state["overlayObjects"].get("well")!;
    const handles = new Map<DatasetObject, ReturnType<typeof vi.spyOn>>();
    const geometries = new Map<DatasetObject, ReturnType<typeof vi.spyOn>>();
    const track = (handle: DatasetObject) => {
      if (!handles.has(handle)) {
        handles.set(handle, vi.spyOn(handle, "dispose"));
        geometries.set(handle, vi.spyOn(handle.geometry, "dispose"));
      }
    };
    track(grid);
    track(well);
    fireEvent.change(control<HTMLSelectElement>("vis-property"), {
      target: { value: "porosity" },
    });
    fireEvent.change(control<HTMLSelectElement>("vis-timestep"), {
      target: { value: "1" },
    });
    await waitFor(() =>
      expect(state["currentScalarValues"]![1]).toBeCloseTo(0.35),
    );
    fireEvent.click(
      within(state["sidebar"] as HTMLElement).getByRole("tab", {
        name: /^分析/,
      }),
    );
    expect(control("vis-filter-i")).toBeVisible();
    fireEvent.change(control<HTMLInputElement>("vis-filter-i"), {
      target: { value: "2:2" },
    });
    expect(grid.geometry.getIndex()!.count).toBe(HEX_FILL_INDICES_PER_CELL);
    expect(state["visibleCellOffsets"]).toEqual([1]);
    const filters = engine.store.getState().filters;
    const requestsBeforeSelection = request.mock.calls.length;

    for (const id of ["well", "network"]) {
      click(id, "选择");
      expect(engine.store.getState().selected?.id).toBe(id);
      expect(engine.store.getState().dataset?.id).toBe("grid");
      expect(state["currentObject"]!).toBe(grid);
      expect(state["overlayObjects"].get("well")!).toBe(well);
      expect(engine.store.getState().filters).toEqual(filters);
      expect(grid.geometry.getIndex()!.count).toBe(HEX_FILL_INDICES_PER_CELL);
      expect(control("vis-inspector-context")).toHaveTextContent(
        "已选中查看。打开分析后",
      );
      expect(control<HTMLButtonElement>("vis-open-analysis")).toBeVisible();
      expect(selection).toHaveBeenLastCalledWith({
        type: id === "well" ? "well" : "segment",
        id,
      });
    }
    expect(request.mock.calls.length).toBe(requestsBeforeSelection);
    expect(state["overlayObjects"].has("network")).toBe(false);
    fireEvent.click(within(row("network")).getByRole("checkbox"));
    await waitFor(() =>
      expect(state["overlayObjects"].has("network")).toBe(true),
    );
    const networkOverlay: DatasetObject =
      state["overlayObjects"].get("network")!;
    track(networkOverlay);
    expect(state["currentObject"]!).toBe(grid);
    expect(engine.store.getState().filters).toEqual(filters);
    fireEvent.click(within(root).getByRole("tab", { name: "场景图层" }));
    expect(root.querySelectorAll("[data-dataset-id]")).toHaveLength(3);
    fireEvent.click(within(row("well")).getByRole("checkbox"));
    expect(row("well")).toBeNull();
    expect(well.object?.visible).toBe(false);
    expect(handles.get(well)).not.toHaveBeenCalled();
    fireEvent.click(within(root).getByRole("tab", { name: "数据目录" }));
    fireEvent.click(within(row("well")).getByRole("checkbox"));
    expect(state["overlayObjects"].get("well")!).toBe(well);
    expect(well.object?.visible).toBe(true);

    click("network", "打开分析");
    await waitFor(() => {
      expect(engine.store.getState().dataset?.id).toBe("network");
      expect(state["datasetLoading"]).toBe(false);
      expect(state["currentObject"]?.object).not.toBeNull();
      expect(state["overlayObjects"].get("grid")!).toBe(grid);
    });
    const network: DatasetObject = state["currentObject"]!;
    track(network);
    expect(state["overlayObjects"].get("well")!).toBe(well);
    expect(handles.get(grid)).not.toHaveBeenCalled();
    expect(handles.get(well)).not.toHaveBeenCalled();
    expect(geometries.get(grid)).not.toHaveBeenCalled();
    expect(geometries.get(well)).not.toHaveBeenCalled();
    expect(grid.object?.parent).toBe(state["modelRoot"]);
    expect(well.object?.parent).toBe(state["modelRoot"]);
    for (const handle of [grid, well]) {
      expect(handle.object?.position.toArray()).toEqual(
        handle.origin.map((value, axis) => value - state["origin"][axis]),
      );
    }
    expect(grid.geometry.getIndex()!.count).toBe(HEX_FILL_INDICES_PER_CELL);
    expect(control<HTMLSelectElement>("vis-property").value).toBe("pressure");

    click("grid", "打开分析");
    await waitFor(() => {
      expect(engine.store.getState().dataset?.id).toBe("grid");
      expect(engine.store.getState().timeStep).toBe(1);
      expect(control<HTMLInputElement>("vis-filter-i").value).toBe("2:2");
      expect(state["currentObject"]!.geometry.getIndex()!.count).toBe(
        HEX_FILL_INDICES_PER_CELL,
      );
    });
    track(state["currentObject"]!);
    expect(engine.store.getState().property?.name).toBe("porosity");
    expect(control<HTMLSelectElement>("vis-property").value).toBe("porosity");
    expect(control<HTMLSelectElement>("vis-timestep").value).toBe("1");
    expect(engine.store.getState().filters).toEqual(filters);
    expect(state["currentScalarValues"]![1]).toBeCloseTo(0.35);
    expect(state["overlayObjects"].get("well")!).toBe(well);
    expect(state["overlayObjects"].get("network")!).toBe(network);
    engine.dispose();
    engine.dispose();
    for (const dispose of handles.values())
      expect(dispose).toHaveBeenCalledTimes(1);
    for (const dispose of geometries.values())
      expect(dispose).toHaveBeenCalledTimes(1);
    expect(root.childElementCount).toBe(0);
  });

  it("keeps selection, layer visibility, analysis switches and disposal isolated between mounted workbenches", async () => {
    const { request } = fixture();
    const first = mount(request, "first-workbench");
    const second = mount(request, "second-workbench");
    await Promise.all([first.engine.ready, second.engine.ready]);
    await Promise.all([
      first.engine.executeCommand("open", { datasetId: "grid" }),
      second.engine.executeCommand("open", { datasetId: "network" }),
    ]);
    const secondHandle: DatasetObject = second.state["currentObject"]!;
    const secondDispose = vi.spyOn(secondHandle.geometry, "dispose");
    first.click("well", "选择");
    fireEvent.click(within(first.row("well")).getByRole("checkbox"));
    expect(first.engine.store.getState().selected?.id).toBe("well");
    expect(second.engine.store.getState().selected?.id).toBe("network");
    expect(second.state["currentObject"]!).toBe(secondHandle);
    expect(second.state["overlayObjects"].size).toBe(0);
    expect(within(second.row("network")).getByText("当前分析")).toBeVisible();

    first.click("network", "打开分析");
    await waitFor(() => {
      expect(first.engine.store.getState().dataset?.id).toBe("network");
      expect(first.state["datasetLoading"]).toBe(false);
    });
    expect(second.state["currentObject"]!).toBe(secondHandle);
    expect(secondDispose).not.toHaveBeenCalled();
    first.engine.dispose();
    expect(first.root.childElementCount).toBe(0);
    expect(second.root.querySelector("canvas")).not.toBeNull();
    expect(secondDispose).not.toHaveBeenCalled();

    fireEvent.click(within(second.row("grid")).getByRole("checkbox"));
    await waitFor(() =>
      expect(second.state["overlayObjects"].has("grid")).toBe(true),
    );
    expect(second.state["currentObject"]!).toBe(secondHandle);
    expect(second.engine.store.getState().dataset?.id).toBe("network");
    second.engine.dispose();
    expect(secondDispose).toHaveBeenCalledTimes(1);
  });

  it("preserves per-layer clipping through origin and vertical-scale changes and restores clipping plus K-layer controls", async () => {
    const { request } = fixture({ verticalGrid: true });
    const { engine, state, click, control } = mount(request, "layer-clipping");
    await engine.ready;
    await engine.executeCommand("open", { datasetId: "grid" });
    const grid: DatasetObject = state["currentObject"]!;
    const materials = (handle: DatasetObject): Material[] => {
      const result = new Set<Material>();
      handle.object!.traverse((object) => {
        const material = (object as Mesh).material;
        if (Array.isArray(material))
          material.forEach((item) => result.add(item));
        else if (material) result.add(material);
      });
      return [...result];
    };
    const expectGridPlane = (handle: DatasetObject, scale: number) => {
      // The fixture spans global Z=-20..0; 75% clipping must cross Z=-15.
      // Convert these known source points through the scene, independently of
      // the preserved object's local origin, offset and clipping implementation.
      state["modelRoot"].updateWorldMatrix(true, true);
      const worldPoint = (z: number) =>
        handle.geometry
          .boundingBox!.min.clone()
          .set(
            1005 - state["origin"][0],
            2005 - state["origin"][1],
            z - state["origin"][2],
          )
          .applyMatrix4(state["modelRoot"].matrixWorld);
      const renderedMaterials = materials(handle);
      expect(renderedMaterials.length).toBeGreaterThan(0);
      for (const material of renderedMaterials) {
        expect(material.clippingPlanes).toHaveLength(1);
        const plane = material.clippingPlanes![0];
        expect(plane.distanceToPoint(worldPoint(-15))).toBeCloseTo(0);
        expect(plane.distanceToPoint(worldPoint(-17))).toBeCloseTo(2 * scale);
        expect(plane.distanceToPoint(worldPoint(-13))).toBeCloseTo(-2 * scale);
      }
    };
    fireEvent.input(control<HTMLInputElement>("vis-clip-depth"), {
      target: { value: "75" },
    });
    fireEvent.click(control<HTMLInputElement>("vis-clip"));
    fireEvent.click(control<HTMLInputElement>("vis-isolate-k"));
    fireEvent.input(control<HTMLInputElement>("vis-k-layer"), {
      target: { value: "2" },
    });
    expect(control<HTMLInputElement>("vis-filter-k").value).toBe("2:2");
    expect(state["visibleCellOffsets"]).toEqual([1]);
    expect(grid.geometry.getIndex()!.count).toBe(HEX_FILL_INDICES_PER_CELL);
    expectGridPlane(grid, 1);

    click("network", "打开分析");
    await waitFor(() => {
      expect(engine.store.getState().dataset?.id).toBe("network");
      expect(state["datasetLoading"]).toBe(false);
      expect(state["currentObject"]?.object).not.toBeNull();
    });
    const network: DatasetObject = state["currentObject"]!;
    expect(state["overlayObjects"].get("grid")!).toBe(grid);
    expect(state["origin"][2]).not.toBe(grid.origin[2]);
    expect(control<HTMLInputElement>("vis-clip")).not.toBeChecked();
    expectGridPlane(grid, 1);
    for (const material of materials(network))
      expect(material.clippingPlanes || []).toHaveLength(0);

    fireEvent.input(control<HTMLInputElement>("vis-z-scale"), {
      target: { value: "300" },
    });
    expect(state["modelRoot"].scale.z).toBe(3);
    expectGridPlane(grid, 3);
    fireEvent.input(control<HTMLInputElement>("vis-clip-depth"), {
      target: { value: "40" },
    });
    fireEvent.click(control<HTMLInputElement>("vis-clip"));
    for (const material of materials(network)) {
      expect(material.clippingPlanes).toHaveLength(1);
      expect(material.clippingPlanes![0]).not.toBe(
        materials(grid)[0].clippingPlanes![0],
      );
    }
    expectGridPlane(grid, 3);
    fireEvent.click(control<HTMLInputElement>("vis-clip"));
    for (const material of materials(network))
      expect(material.clippingPlanes).toHaveLength(0);
    expect(state["renderer"].localClippingEnabled).toBe(true);
    expectGridPlane(grid, 3);

    click("grid", "打开分析");
    await waitFor(() => {
      expect(engine.store.getState().dataset?.id).toBe("grid");
      expect(control<HTMLInputElement>("vis-clip")).toBeChecked();
      expect(control<HTMLInputElement>("vis-clip-depth").value).toBe("75");
      expect(control<HTMLInputElement>("vis-isolate-k")).toBeChecked();
      expect(control<HTMLInputElement>("vis-k-layer").value).toBe("2");
      expect(control<HTMLInputElement>("vis-filter-k").value).toBe("2:2");
      expect(state["visibleCellOffsets"]).toEqual([1]);
    });
    expect(state["currentObject"]!.geometry.getIndex()!.count).toBe(
      HEX_FILL_INDICES_PER_CELL,
    );
    expectGridPlane(state["currentObject"]!, 3);
    expect(state["overlayObjects"].get("network")!).toBe(network);
    for (const material of materials(network))
      expect(material.clippingPlanes).toHaveLength(0);
  });
});
