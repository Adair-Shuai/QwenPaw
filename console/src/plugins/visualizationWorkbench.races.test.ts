import type {
  Mesh,
  BufferGeometry,
  MeshBasicMaterial,
  MeshPhongMaterial,
} from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, waitFor, within } from "@testing-library/react";
import { ThreeViewerEngine } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/engines/ThreeViewerEngine";
import type { DatasetInfo } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/contracts/types";
import type { DatasetObject } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/scene/datasetObject";

// Keep the mounted workbench, transport, geometry and materials real. jsdom only
// needs a replacement for the GPU boundary; responses below control network order.
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
const pendingResponses: Array<() => void> = [];

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
  pendingResponses.splice(0).forEach((release) => release());
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function fixture() {
  const resources = new Map<string, ArrayBuffer>();
  const datasets = ["A", "B", "C"].map((id, index): DatasetInfo => {
    const files = {
      positions: `${id}.f32`,
      indices: `${id}.u32`,
      cell_ids: `${id}.ids`,
      scalars: { pressure: `${id}.pressure.f32` },
    };
    const x = 1000 + index * 100;
    resources.set(
      files.positions,
      new Float32Array([x, 2000, 0, x + 10, 2000, 0, x, 2010, -10]).buffer,
    );
    resources.set(files.indices, new Uint32Array([0, 1, 2]).buffer);
    resources.set(files.cell_ids, new Uint32Array([100 + index]).buffer);
    resources.set(
      files.scalars.pressure,
      new Float32Array([10 + index]).buffer,
    );
    return {
      id,
      name: id,
      source: "surface",
      files,
      metadata: { geometry_primitive: "triangles", scalar_association: "cell" },
      n_vertices: 3,
      n_indices: 3,
      n_cells: 1,
    };
  });
  datasets[0].time_steps = [0, 1].map((index) => {
    const file = `A.step-${index}.pressure.f32`;
    resources.set(file, new Float32Array([20 + index]).buffer);
    return { index, step_number: 10 + index, scalars: { pressure: file } };
  });
  for (const id of ["well", "network"]) {
    const files = {
      positions: `${id}.f32`,
      indices: `${id}.u32`,
      cell_ids: `${id}.ids`,
      scalars: { pressure: `${id}.pressure.f32` },
    };
    resources.set(
      files.positions,
      new Float32Array([1100, 2000, 0, 1110, 2010, -10, 1120, 2000, -20])
        .buffer,
    );
    resources.set(files.indices, new Uint32Array([0, 1, 1, 2]).buffer);
    resources.set(files.cell_ids, new Uint32Array([200, 201]).buffer);
    resources.set(
      files.scalars.pressure,
      new Float32Array(id === "well" ? [30, 40, 50] : [30, 40]).buffer,
    );
    datasets.push({
      id,
      name: id,
      source: id === "well" ? "trajectory" : "network",
      files,
      metadata: {
        placement: "spatial",
        geometry_primitive: "lines",
        scalar_association: id === "well" ? "point" : "cell",
      },
      n_vertices: 3,
      n_indices: 4,
      n_cells: 2,
    });
  }
  resources.set("log.u32", new Uint32Array().buffer);
  resources.set("log.ids", new Uint32Array().buffer);
  datasets.push({
    id: "log",
    name: "log",
    source: "las",
    metadata: {
      placement: "depth-only",
      geometry_primitive: "lines",
      scalar_association: "point",
    },
    n_vertices: 3,
    n_indices: 0,
    n_cells: 0,
    files: {
      positions: "well.f32",
      indices: "log.u32",
      cell_ids: "log.ids",
      scalars: { pressure: "well.pressure.f32" },
    },
    time_steps: [
      { index: 0, step_number: 1, scalars: { pressure: "well.pressure.f32" } },
    ],
  });
  const holds = new Map<
    string,
    Array<{
      started: ReturnType<typeof deferred<AbortSignal | undefined>>;
      response: ReturnType<typeof deferred<Response>>;
    }>
  >();
  const responseFor = (file: string) => {
    const bytes = resources.get(file);
    return bytes
      ? new Response(bytes.slice(0))
      : new Response("{}", { status: 404 });
  };
  const holdNext = (file: string) => {
    const started = deferred<AbortSignal | undefined>();
    const response = deferred<Response>();
    const queue = holds.get(file) || [];
    queue.push({ started, response });
    holds.set(file, queue);
    const release = (override?: Response) =>
      response.resolve(override || responseFor(file));
    pendingResponses.push(() => release());
    return { started: started.promise, release };
  };
  const request = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/manifest"))
        return new Response(JSON.stringify({ version: 1, datasets }));
      const file = decodeURIComponent(url.slice(url.lastIndexOf("/") + 1));
      const hold = holds.get(file)?.shift();
      if (hold) {
        hold.started.resolve(init?.signal || undefined);
        // Deliberately deliver late responses even after cancellation, as a scoped
        // host transport may already have read them. Generation guards must win.
        return hold.response.promise;
      }
      return responseFor(file);
    },
  );
  return { datasets, resources, holdNext, request };
}

function mount(request: typeof fetch) {
  const root = document.body.appendChild(document.createElement("div"));
  const engine = new ThreeViewerEngine(root, {
    apiBase: "/visualization",
    request,
    autoLoad: false,
  });
  engines.push(engine);
  const state = engine;
  const row = (id: string) =>
    root.querySelector<HTMLElement>(`[data-dataset-id="${id}"]`)!;
  const click = (id: string, action: "选择" | "打开分析") =>
    fireEvent.click(
      within(row(id)).getByRole("button", { name: `${action} ${id}` }),
    );
  const control = <T extends HTMLElement>(id: string) =>
    root.querySelector<T>(`#${id}`)!;
  return { root, engine, state, row, click, control };
}

describe("visualization workbench loading races", () => {
  it("limits the footer reset to the selected current analysis without changing another layer", async () => {
    const { request } = fixture();
    const { engine, state, row, click, control } = mount(request);
    await engine.ready;
    await engine.executeCommand("open", { datasetId: "A" });
    await engine.executeCommand("set-opacity", { opacity: 0.4 });
    fireEvent.change(control<HTMLInputElement>("vis-filter-prop-min"), {
      target: { value: "9" },
    });
    const primary: DatasetObject = state["currentObject"]!;
    fireEvent.click(within(row("B")).getByRole("checkbox"));
    await waitFor(() => expect(state["overlayObjects"].has("B")).toBe(true));
    const layer: DatasetObject = state["overlayObjects"].get("B")!;
    const primaryOpacity = (
      primary.object as Mesh<
        BufferGeometry,
        MeshBasicMaterial | MeshPhongMaterial
      >
    ).material.opacity;
    const layerOpacity = (
      layer.object as Mesh<
        BufferGeometry,
        MeshBasicMaterial | MeshPhongMaterial
      >
    ).material.opacity;
    const filters = engine.store.getState().filters;
    click("B", "选择");
    const reset = control<HTMLButtonElement>("vis-reset-analysis");
    expect(reset).toHaveTextContent("重置当前分析");
    expect(reset).toBeDisabled();
    const requestCount = request.mock.calls.length;
    fireEvent.click(reset);
    expect(
      (
        primary.object as Mesh<
          BufferGeometry,
          MeshBasicMaterial | MeshPhongMaterial
        >
      ).material.opacity,
    ).toBe(primaryOpacity);
    expect(
      (
        layer.object as Mesh<
          BufferGeometry,
          MeshBasicMaterial | MeshPhongMaterial
        >
      ).material.opacity,
    ).toBe(layerOpacity);
    expect(control<HTMLInputElement>("vis-filter-prop-min").value).toBe("9");
    expect(engine.store.getState().filters).toEqual(filters);
    expect(request).toHaveBeenCalledTimes(requestCount);
    click("A", "选择");
    expect(reset).toBeEnabled();
    fireEvent.click(reset);
    await waitFor(() =>
      expect(control<HTMLInputElement>("vis-filter-prop-min").value).toBe(""),
    );
    expect(
      (
        primary.object as Mesh<
          BufferGeometry,
          MeshBasicMaterial | MeshPhongMaterial
        >
      ).material.opacity,
    ).toBe(0.85);
    expect(
      (
        layer.object as Mesh<
          BufferGeometry,
          MeshBasicMaterial | MeshPhongMaterial
        >
      ).material.opacity,
    ).toBe(layerOpacity);
    expect(state["filterPropertyRange"]).toEqual([-Infinity, Infinity]);
    expect(state["visibleCellOffsets"]).toEqual([0]);
    await waitFor(() =>
      expect(engine.store.getState().filters).toEqual(
        expect.arrayContaining([
          {
            type: "property-range",
            enabled: false,
            min: -Infinity,
            max: Infinity,
          },
        ]),
      ),
    );
  });

  it("disables object visibility for empty catalogs and depth-only logs and clears playback on empty refresh", async () => {
    const empty = fixture();
    empty.datasets.splice(0);
    const blank = mount(empty.request);
    await blank.engine.ready;
    const visibilityButtons = (input: HTMLInputElement) =>
      within(input.parentElement!).getAllByRole("button");
    const blankSwitch = blank.control<HTMLInputElement>(
      "vis-inspector-visible",
    );
    expect(blankSwitch).toBeDisabled();
    expect(blankSwitch.checked).toBe(false);
    for (const button of visibilityButtons(blankSwitch)) {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(blank.state["currentObject"]).toBeNull();
    expect(blank.control("vis-reset-analysis")).toBeDisabled();
    blank.engine.dispose();
    blank.root.remove();

    const logs = fixture();
    const log = mount(logs.request);
    await log.engine.ready;
    await log.engine.executeCommand("open", { datasetId: "log" });
    const logSwitch = log.control<HTMLInputElement>("vis-inspector-visible");
    expect(log.state["wellLogEl"]).toBeVisible();
    expect(logSwitch).toBeDisabled();
    expect(logSwitch.checked).toBe(false);
    expect(within(log.row("log")).getByRole("checkbox")).toBeDisabled();
    for (const button of visibilityButtons(logSwitch)) {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(logSwitch.checked).toBe(false);
    expect(log.state["overlayVisibility"].has("log")).toBe(false);
    fireEvent.click(log.control("vis-time-play"));
    expect(log.state["timestepTimer"]).not.toBeNull();
    const clearRect = vi.fn();
    Object.defineProperty(log.state["wellLogEl"], "getContext", {
      configurable: true,
      value: () => ({ clearRect }),
    });
    logs.datasets.splice(0);
    await log.state["refreshCatalog"]();
    expect(log.state["timestepTimer"]).toBeNull();
    expect(log.state["sliceTimer"]).toBeNull();
    expect(log.state["wellLogEl"]).not.toBeVisible();
    expect(clearRect).toHaveBeenCalledExactlyOnceWith(
      0,
      0,
      log.state["wellLogEl"]!.width,
      log.state["wellLogEl"]!.height,
    );
    expect(log.state["slicePlayer"].root).not.toBeVisible();
    expect(log.engine.store.getState().selected).toBeNull();
    expect(log.control("vis-reset-analysis")).toBeDisabled();
    expect(log.control("vis-open-analysis")).not.toBeVisible();
    expect(logSwitch).toBeDisabled();
    expect(logSwitch.checked).toBe(false);
    for (const button of visibilityButtons(logSwitch))
      expect(button).toBeDisabled();
  });

  it("stops grid time and slice playback when the refreshed catalog becomes empty", async () => {
    const { datasets, resources, request } = fixture();
    const positions: number[] = [];
    const indices: number[] = [];
    const cellTriangles = [
      0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 3, 2, 6, 3, 6, 7, 0,
      3, 7, 0, 7, 4, 1, 5, 6, 1, 6, 2,
    ];
    for (let cell = 0; cell < 2; cell++) {
      const z = -cell * 10;
      positions.push(
        1000,
        2000,
        z,
        1010,
        2000,
        z,
        1010,
        2010,
        z,
        1000,
        2010,
        z,
        1000,
        2000,
        z - 10,
        1010,
        2000,
        z - 10,
        1010,
        2010,
        z - 10,
        1000,
        2010,
        z - 10,
      );
      indices.push(...cellTriangles.map((index) => index + cell * 8));
    }
    Object.assign(datasets[0], {
      source: "eclipse",
      grid_dims: [1, 1, 2],
      n_vertices: 16,
      n_indices: 72,
      n_cells: 2,
    });
    resources.set("A.f32", new Float32Array(positions).buffer);
    resources.set("A.u32", new Uint32Array(indices).buffer);
    resources.set("A.ids", new Uint32Array([100, 101]).buffer);
    resources.set("A.pressure.f32", new Float32Array([10, 11]).buffer);
    for (const index of [0, 1])
      resources.set(
        `A.step-${index}.pressure.f32`,
        new Float32Array([20 + index, 30 + index]).buffer,
      );
    const { engine, state, control } = mount(request);
    await engine.ready;
    await engine.executeCommand("open", { datasetId: "A" });
    vi.useFakeTimers();
    fireEvent.click(control("vis-time-play"));
    fireEvent.click(
      within(state["slicePlayer"].root as HTMLElement).getByRole("button", {
        name: "沿 K 方向切片",
      }),
    );
    fireEvent.click(
      within(state["slicePlayer"].root as HTMLElement).getByRole("button", {
        name: "沿 I/J/K 播放",
      }),
    );
    expect(state["timestepTimer"]).not.toBeNull();
    expect(state["sliceTimer"]).not.toBeNull();
    const command = vi.spyOn(engine, "executeCommand");
    datasets.splice(0);
    await state["refreshCatalog"]();
    expect(state["timestepTimer"]).toBeNull();
    expect(state["sliceTimer"]).toBeNull();
    expect(state["slicePlayer"].root).not.toBeVisible();
    expect(control("vis-time-play")).toHaveTextContent("播放时间步");
    expect(state["currentObject"]).toBeNull();
    const requestCount = request.mock.calls.length;
    await vi.advanceTimersByTimeAsync(2100);
    expect(command).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(requestCount);
  });

  it("keeps an existing layer hidden when its visibility changes during another analysis load", async () => {
    const { datasets, holdNext, request } = fixture();
    const { engine, state, row, click } = mount(request);
    await engine.ready;
    await engine.executeCommand("open", { datasetId: "A" });
    fireEvent.click(within(row("C")).getByRole("checkbox"));
    await waitFor(() => expect(state["overlayObjects"].has("C")).toBe(true));
    const layer: DatasetObject = state["overlayObjects"].get("C")!;
    const dispose = vi.spyOn(layer.geometry, "dispose");
    expect(layer.object?.visible).toBe(true);

    const pending = holdNext("B.f32");
    click("B", "选择");
    const loading = state["openAnalysisDataset"](datasets[1]);
    await pending.started;
    fireEvent.click(within(row("C")).getByRole("checkbox"));
    expect(layer.object?.visible).toBe(false);
    pending.release();
    await loading;

    expect(state["currentDataset"]!.id).toBe("B");
    expect(
      state["currentObject"]!.geometry.getAttribute("position").count,
    ).toBe(3);
    expect(state["overlayObjects"].get("C"))!.toBe(layer);
    expect(state["overlayVisibility"].get("C")).toBe(false);
    expect(layer.object?.visible).toBe(false);
    expect(within(row("C")).getByRole("checkbox")).not.toBeChecked();
    expect(dispose).not.toHaveBeenCalled();
  });

  it("offers a working retry on the selected object card after an analysis request fails", async () => {
    const { holdNext, request } = fixture();
    const { engine, state, click, control } = mount(request);
    await engine.ready;
    await engine.executeCommand("open", { datasetId: "A" });
    const previous: DatasetObject = state["currentObject"]!;
    const previousDispose = vi.spyOn(previous.geometry, "dispose");
    click("B", "选择");
    const pending = holdNext("B.f32");
    fireEvent.click(control("vis-open-analysis"));
    await pending.started;
    expect(control("vis-open-analysis")).toBeDisabled();
    pending.release(
      new Response(JSON.stringify({ detail: "synthetic unavailable" }), {
        status: 503,
      }),
    );
    await waitFor(() => {
      expect(engine.store.getState().loading.stage).toBe("failed");
      expect(control("vis-open-analysis")).toBeVisible();
      expect(control("vis-open-analysis")).toBeEnabled();
    });
    expect(state["currentObject"]).toBeNull();
    expect(control("vis-inspector-context")).not.toHaveTextContent(
      "当前分析对象",
    );
    expect(state["overlayObjects"].get("A"))!.toBe(previous);
    expect(previous.object?.visible).toBe(true);

    fireEvent.click(control("vis-open-analysis"));
    await waitFor(() => {
      expect(engine.store.getState().loading.stage).toBe("ready");
      expect(
        state["currentObject"]?.geometry.getAttribute("position").count,
      ).toBe(3);
      expect(control("vis-open-analysis")).not.toBeVisible();
    });
    expect(engine.store.getState().dataset?.id).toBe("B");
    expect(control("vis-inspector-context")).toHaveTextContent("当前分析对象");
    expect(state["currentScalarValues"]![0]).toBe(11);
    expect(previousDispose).not.toHaveBeenCalled();
  });

  it("rejects earlier A and B completions while the latest A generation owns analysis and geometry", async () => {
    const { datasets, holdNext, request } = fixture();
    const { engine, state } = mount(request);
    await engine.ready;
    await engine.executeCommand("open", { datasetId: "A" });
    await engine.executeCommand("set-opacity", { opacity: 0.4 });
    await state["openAnalysisDataset"](datasets[2]);
    await engine.executeCommand("set-opacity", { opacity: 0.8 });

    const oldA = holdNext("A.pressure.f32");
    const openingOldA = state["openAnalysisDataset"](datasets[0]);
    const oldASignal = await oldA.started;
    const oldB = holdNext("B.f32");
    const openingB = state["openAnalysisDataset"](datasets[1]);
    const oldBSignal = await oldB.started;
    const latestA = holdNext("A.f32");
    const openingLatestA = state["openAnalysisDataset"](datasets[0]);
    await latestA.started;
    const generation = state["loadGeneration"];
    const geometryPrototype = Object.getPrototypeOf(
      state["overlayObjects"].get("C")!.geometry,
    );
    const staleDispose = vi.spyOn(geometryPrototype, "dispose");
    expect(oldASignal?.aborted).toBe(true);
    expect(oldBSignal?.aborted).toBe(true);

    oldA.release();
    await openingOldA;
    expect(staleDispose).toHaveBeenCalledTimes(1);
    expect(state["loadGeneration"]).toBe(generation);
    expect(state["datasetLoading"]).toBe(true);
    expect(state["currentObject"]).toBeNull();
    expect(state["opacity"]).toBe(0.8);
    expect(engine.store.getState().loading.stage).toBe("loading-dataset");

    latestA.release();
    await openingLatestA;
    const current: DatasetObject = state["currentObject"]!;
    const disposeCurrent = vi.spyOn(current, "dispose");
    expect(state["opacity"]).toBe(0.4);
    expect(state["currentScalarValues"]![0]).toBe(10);
    expect(current.geometry.getAttribute("color").count).toBe(3);
    expect(current.object?.parent).toBe(state["modelRoot"]);
    const currentColors = Array.from(
      current.geometry.getAttribute("color").array,
    );
    oldB.release();
    await openingB;
    expect(state["currentObject"]).toBe(current);
    expect(state["loadGeneration"]).toBe(generation);
    expect(state["currentDataset"]!.id).toBe("A");
    expect(state["datasetLoading"]).toBe(false);
    expect(engine.store.getState().loading.stage).toBe("ready");
    expect(Array.from(current.geometry.getAttribute("color").array)).toEqual(
      currentColors,
    );
    expect(disposeCurrent).not.toHaveBeenCalled();
    expect(staleDispose).toHaveBeenCalledTimes(1);
  });

  it("stops old time-step playback as soon as a different analysis starts loading", async () => {
    const { datasets, holdNext, request } = fixture();
    const { engine, state, control } = mount(request);
    await engine.ready;
    await engine.executeCommand("open", { datasetId: "A" });
    vi.useFakeTimers();
    const command = vi.spyOn(engine, "executeCommand");
    fireEvent.click(control("vis-time-play"));
    expect(state["timestepTimer"]).not.toBeNull();
    expect(control("vis-time-play")).toHaveTextContent("暂停时间步");
    await vi.advanceTimersByTimeAsync(700);
    expect(state["currentTimeStep"]).toBe(1);
    expect(state["currentScalarValues"]![0]).toBe(20);
    expect(command).toHaveBeenCalledWith("set-timestep", { timeStep: 1 });

    const pending = holdNext("B.f32");
    const loading = state["openAnalysisDataset"](datasets[1]);
    await pending.started;
    expect(state["timestepTimer"]).toBeNull();
    expect(control("vis-time-play")).toHaveTextContent("播放时间步");
    command.mockClear();
    await vi.advanceTimersByTimeAsync(2100);
    expect(command).not.toHaveBeenCalled();
    expect(state["currentTimeStep"]).toBe(0);
    pending.release();
    await loading;
    const requestsAfterLoad = request.mock.calls.length;
    await vi.advanceTimersByTimeAsync(2100);
    expect(command).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(requestsAfterLoad);
    expect(engine.store.getState().timeStep).toBe(0);
    expect(state["currentScalarValues"]![0]).toBe(11);
  });

  it("rejects delayed cell details after selecting a well or opening network analysis", async () => {
    const { holdNext, request } = fixture();
    const { engine, state, click, root } = mount(request);
    await engine.ready;
    await engine.executeCommand("open", { datasetId: "A" });
    const raycast = vi.spyOn(state["raycaster"], "intersectObjects");
    const pickCurrent = () => {
      const positions = state["geometry"]!.getAttribute("position");
      const point = state["mesh"]!.position.clone().set(
        positions.getX(0),
        positions.getY(0),
        positions.getZ(0),
      );
      state["mesh"]!.updateMatrixWorld(true);
      state["mesh"]!.localToWorld(point);
      raycast.mockReturnValue([
        {
          object: state["mesh"]!,
          point,
          faceIndex: 0,
          distance: state["camera"].position.distanceTo(point),
        },
      ]);
      return state["onCanvasClick"](new MouseEvent("click"));
    };
    const staleDetails = () =>
      new Response(
        JSON.stringify({
          cell_id: 1234567,
          ijk: [9, 9, 9],
          center: [1, 2, 3],
          properties: { pressure: 987654 },
        }),
      );

    const selectedLater = holdNext("100?time_step=0");
    const firstPick = pickCurrent();
    await selectedLater.started;
    expect(engine.store.getState().selected).toMatchObject({
      type: "cell",
      datasetId: "A",
      id: "100",
    });
    click("well", "选择");
    const wellSelection = engine.store.getState().selected;
    expect(wellSelection).toEqual({ type: "well", id: "well" });
    const firstDetails = state["detailsEl"].textContent;
    selectedLater.release(staleDetails());
    await firstPick;
    expect(engine.store.getState().selected).toEqual(wellSelection);
    expect(root.querySelector("[data-object-name]")).toHaveTextContent("well");
    expect(state["detailsEl"].textContent).toBe(firstDetails);
    expect(state["detailsEl"]).not.toBeVisible();

    const openedLater = holdNext("100?time_step=0");
    const secondPick = pickCurrent();
    await openedLater.started;
    expect(engine.store.getState().selected?.id).toBe("100");
    click("network", "打开分析");
    await waitFor(() => {
      expect(engine.store.getState().dataset?.id).toBe("network");
      expect(state["datasetLoading"]).toBe(false);
      expect(engine.store.getState().selected?.id).toBe("network");
    });
    const networkSelection = engine.store.getState().selected;
    const networkObject = state["currentObject"];
    openedLater.release(staleDetails());
    await secondPick;
    expect(engine.store.getState().selected).toEqual(networkSelection);
    expect(state["currentObject"]).toBe(networkObject);
    expect(root.querySelector("[data-object-name]")).toHaveTextContent(
      "network",
    );
    expect(state["detailsEl"]).not.toHaveTextContent("Cell 1234567");
    expect(state["detailsEl"]).not.toBeVisible();

    // A response for the latest pick still reaches the real details panel.
    const accepted = holdNext("200?time_step=0");
    const latestPick = pickCurrent();
    await accepted.started;
    accepted.release(
      new Response(
        JSON.stringify({
          cell_id: 200,
          properties: { pressure: 30 },
        }),
      ),
    );
    await latestPick;
    expect(engine.store.getState().selected).toMatchObject({
      type: "segment",
      datasetId: "network",
      id: "200",
    });
    expect(state["detailsEl"]).toBeVisible();
    expect(state["detailsEl"]).toHaveTextContent("Cell 200");
  });

  it("preserves isolate and show-all visibility when reopening cached analysis", async () => {
    const { datasets, request } = fixture();
    const { engine, state, row, click, root } = mount(request);
    await engine.ready;
    await engine.executeCommand("open", { datasetId: "A" });
    await engine.executeCommand("set-opacity", { opacity: 0.4 });
    for (const id of ["B", "C"]) {
      fireEvent.click(within(row(id)).getByRole("checkbox"));
      await waitFor(() => expect(state["overlayObjects"].has(id)).toBe(true));
    }
    const retained: DatasetObject = state["overlayObjects"].get("C")!;
    const dispose = vi.spyOn(retained.geometry, "dispose");
    click("B", "选择");
    fireEvent.keyDown(root, { key: "i" });
    await waitFor(() => {
      expect(state["mesh"]!.visible).toBe(false);
      expect(state["overlayObjects"].get("B")!.object!.visible).toBe(true);
      expect(retained.object?.visible).toBe(false);
      expect(state["overlayVisibility"].get("C")).toBe(false);
      expect(within(row("C")).getByRole("checkbox")).not.toBeChecked();
    });

    await state["openAnalysisDataset"](datasets[1]);
    expect(state["analysisStates"].has("A")).toBe(true);
    expect(state["mesh"]!.visible).toBe(true);
    expect(state["overlayObjects"].get("A")!.object!.visible).toBe(false);
    expect(state["overlayObjects"].get("C"))!.toBe(retained);
    expect(retained.object?.visible).toBe(false);
    expect(within(row("C")).getByRole("checkbox")).not.toBeChecked();

    fireEvent.keyDown(root, { key: "a" });
    for (const id of ["A", "B", "C"]) {
      expect(state["overlayVisibility"].get(id)).toBe(true);
      expect(within(row(id)).getByRole("checkbox")).toBeChecked();
    }
    expect(retained.object?.visible).toBe(true);
    await state["openAnalysisDataset"](datasets[0]);
    expect(state["currentDataset"]!.id).toBe("A");
    expect(state["opacity"]).toBe(0.4);
    expect(state["mesh"]!.visible).toBe(true);
    expect(state["overlayObjects"].get("B")!.object!.visible).toBe(true);
    expect(state["overlayObjects"].get("C"))!.toBe(retained);
    expect(retained.object?.visible).toBe(true);
    for (const id of ["A", "B", "C"]) {
      expect(state["overlayVisibility"].get(id)).toBe(true);
      expect(within(row(id)).getByRole("checkbox")).toBeChecked();
    }
    expect(dispose).not.toHaveBeenCalled();
  });
});
