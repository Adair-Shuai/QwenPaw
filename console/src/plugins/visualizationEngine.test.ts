import { ThreeViewerEngine } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/engines/ThreeViewerEngine";
// @ts-expect-error Three.js ships runtime JS; plugin-specific typings are used by its own typecheck.
import * as THREE from "../../../plugins/bundle/ugsci/ui/node_modules/three/build/three.module.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ViewerStore } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/stores/viewerState";
import { viewerPersistenceKey } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/stores/persistence";
import { ViewRouter } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/app/view-router";
import { fireEvent, within } from "@testing-library/react";
import { decodeGeometry, geometryPrimitive, scalarAssociation } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/rendering/datasetGeometry";
import { computeScalarColors } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/rendering/scalarColors";
import { WorkerManager } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/workers/workerManager";
import type { DatasetInfo, ViewerMountOptions } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/contracts/types";

vi.mock("../../../plugins/bundle/ugsci/ui/node_modules/three/build/three.module.js", async (original) => ({
  ...await original<Record<string, unknown>>(),
  WebGLRenderer: class {
    domElement = document.createElement("canvas");
    info = { render: { calls: 0, triangles: 0 }, memory: { geometries: 0 } };
    renderLists = { dispose: vi.fn() };
    setSize = vi.fn(); setPixelRatio = vi.fn(); render = vi.fn(); dispose = vi.fn();
  },
}));

const dataset = (overrides: Partial<DatasetInfo> = {}): DatasetInfo => ({
  id: "net", name: "测试管网", source: "network", n_vertices: 4, n_indices: 4, n_cells: 2,
  files: { positions: "net.f32", indices: "net.u32", cell_ids: "ids.u32", scalars: { pressure: "pressure.f32" } },
  metadata: { geometry_primitive: "lines", scalar_association: "cell" }, ...overrides,
});
const positions = () => new Float32Array([0, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0]);
const indices = () => new Uint32Array([0, 1, 2, 3]);
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("simulation field refresh", () => {
  it("refreshes real scalar resources while preserving camera, palette and historical report step", async () => {
    const { engine, ds } = await engineHarness();
    const initial = { ...ds, metadata: { ...ds.metadata, revision: 1 },
      time_steps: [{ index: 0, step_number: 10, scalars: { pressure: "p10.f32" } }] };
    engine.manifest.datasets = [initial];
    await engine.executeCommand("open", { datasetId: ds.id });
    await engine.executeCommand("set-timestep", { timeStep: 1 });
    engine.camera.position.set(10, 20, 30);
    engine.controls.target.set(2, 3, 4);
    engine.camera.zoom = 2;
    engine.currentColormap = "plasma";
    const updated = { ...initial, metadata: { ...initial.metadata, revision: 2 },
      time_steps: [...initial.time_steps, { index: 1, step_number: 20, scalars: { pressure: "p20.f32" } }] };
    engine.fetchJson = vi.fn(async () => ({ version: 1, datasets: [updated] }));
    await engine.executeCommand("refresh-dataset", { datasetId: ds.id, followLatest: false });
    expect(engine.currentTimeStep).toBe(1);
    expect(engine.currentDataset.metadata.revision).toBe(2);
    expect(engine.currentColormap).toBe("plasma");
    expect(engine.camera.position.toArray()).toEqual([10, 20, 30]);
    expect(engine.controls.target.toArray()).toEqual([2, 3, 4]);
    expect(engine.camera.zoom).toBe(2);
    expect(engine.fetchBinary).toHaveBeenCalledWith("p10.f32", expect.anything());
    await engine.executeCommand("refresh-dataset", { datasetId: ds.id, followLatest: true });
    expect(engine.currentTimeStep).toBe(2);
    expect(engine.fetchBinary).toHaveBeenCalledWith("p20.f32", expect.anything());
    expect(engine.geometry.getAttribute("color").array.every(Number.isFinite)).toBe(true);
  });

  it("ignores late refreshes after scope changes and never takes over another selected model", async () => {
    const { engine, ds } = await engineHarness();
    await engine.executeCommand("open", { datasetId: ds.id });
    let resolve!: (value: unknown) => void;
    engine.fetchJson = vi.fn(() => new Promise((done) => { resolve = done; }));
    const pending = engine.executeCommand("refresh-dataset", { datasetId: ds.id });
    await Promise.resolve(); await Promise.resolve();
    engine.lifetimeController = new AbortController();
    resolve({ version: 1, datasets: [{ ...ds, metadata: { revision: 99 } }] });
    await pending;
    expect(engine.currentDataset.metadata.revision).not.toBe(99);
    engine.fetchJson = vi.fn(async () => ({ version: 1, datasets: [ds, { ...ds, id: "another" }] }));
    await engine.executeCommand("refresh-dataset", { datasetId: "another", followLatest: true });
    expect(engine.currentDataset.id).toBe(ds.id);
  });
});

describe("visualization geometry and scalar contracts", () => {
  it("preserves explicit tube triangles, cell attributes and point log attributes", () => {
    expect(geometryPrimitive(dataset({ source: "network-tube", metadata: { geometry_primitive: "triangles" } }))).toBe("triangles");
    expect(geometryPrimitive(dataset({ source: "network-tube", metadata: {} }))).toBe("triangles");
    expect(scalarAssociation(dataset(), "pressure", 2, 4)).toBe("cell");
    expect(scalarAssociation(dataset({ properties: { pressure: { label: "压力", association: "point", count: 4, unit: null } } }), "pressure", 4, 4)).toBe("point");
  });
  it("rejects corrupt binary lengths, nonfinite coordinates and out-of-range indices before upload", () => {
    expect(decodeGeometry(dataset(), positions().buffer, indices().buffer, new Uint32Array([8, 9]).buffer).cellIds).toEqual(new Uint32Array([8, 9]));
    expect(() => decodeGeometry(dataset(), new ArrayBuffer(7), indices().buffer)).toThrow("字节长度");
    expect(() => decodeGeometry(dataset(), positions().buffer, new Uint32Array([0, 1, 4, 2]).buffer)).toThrow("顶点范围");
    const invalid = positions(); invalid[0] = NaN;
    expect(() => decodeGeometry(dataset(), invalid.buffer, indices().buffer)).toThrow("非有限值");
    expect(() => decodeGeometry(dataset(), positions().buffer, indices().buffer, new Uint32Array([1]).buffer)).toThrow("单元编号数量");
    const log = dataset({ source: "las", n_vertices: 1, n_indices: 0, n_cells: 0, metadata: { scalar_association: "point", geometry_primitive: "lines" } });
    expect(decodeGeometry(log, new Float32Array([0, 0, -100]).buffer, new ArrayBuffer(0), new ArrayBuffer(0)).positions).toHaveLength(3);
  });
  it("keeps missing values neutral and excludes them from scalar ranges on cells and points", () => {
    const result = computeScalarColors(new Float32Array([NaN, 20]), indices(), "viridis", 4);
    expect(result).toMatchObject({ smin: 20, smax: 20, validCount: 1 });
    expect(Array.from(result.colors).every(Number.isFinite)).toBe(true);
    expect(result.colors[0]).toBeCloseTo(0.45);
    const points = computeScalarColors(new Float32Array([2, NaN, 8, Infinity]), indices(), "viridis", 4, "point");
    expect(points).toMatchObject({ smin: 2, smax: 8, validCount: 2 });
    expect(points.colors[3]).toBeCloseTo(0.45);
    expect(() => computeScalarColors(new Float32Array([1, 2, 3]), indices(), "viridis", 4)).toThrow("拓扑");
  });
  it("keeps stores, selections, color ranges and disposal resets isolated between viewers", () => {
    const left = new ViewerStore(), right = new ViewerStore();
    const change = vi.fn(); right.subscribe(change);
    left.setDataset(dataset()); left.setSelection({ type: "segment", id: "a" });
    left.getState().colorMap.range[0] = 99;
    expect(right.getState().dataset).toBeNull();
    expect(right.getState().selected).toBeNull();
    expect(right.getState().colorMap.range).toEqual([0, 1]);
    right.setDataset(dataset({ id: "right" })); change.mockClear();
    left.reset();
    expect(right.getState().dataset?.id).toBe("right");
    expect(change).not.toHaveBeenCalled();
  });
});

function workerHarness(mode: "normal" | "crash" | "hang" = "normal") {
  let code = "";
  const terminate = vi.fn(), revoke = vi.fn();
  vi.stubGlobal("Blob", class { constructor(parts: string[]) { code = parts.join(""); } });
  vi.stubGlobal("URL", { createObjectURL: () => "blob:test", revokeObjectURL: revoke });
  vi.stubGlobal("Worker", class {
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onerror: (() => void) | null = null;
    onmessageerror: (() => void) | null = null;
    terminate = terminate;
    private workerScope: { onmessage?: (event: { data: unknown }) => void; postMessage: (data: unknown) => void };
    constructor() {
      this.workerScope = { postMessage: (data) => queueMicrotask(() => this.onmessage?.({ data })) };
      new Function("self", code)(this.workerScope);
    }
    postMessage(data: unknown) {
      if (mode === "crash") queueMicrotask(() => this.onerror?.());
      else if (mode === "normal") this.workerScope.onmessage?.({ data });
    }
  });
  return { terminate, revoke };
}

describe("visualization CPU worker lifecycle", () => {
  it("runs the same real scalar coloring in the worker and main-thread fallback", async () => {
    const { terminate, revoke } = workerHarness();
    const worker = new WorkerManager();
    const values = new Float32Array([NaN, 12]);
    const result = await worker.computeColors(values.buffer, indices().buffer, "viridis", 4, true);
    expect(result).toEqual(computeScalarColors(values, indices(), "viridis", 4));
    worker.dispose(); worker.dispose();
    expect(terminate).toHaveBeenCalledOnce(); expect(revoke).toHaveBeenCalledOnce();
  });
  it("settles all pending work after a worker crash or timeout", async () => {
    workerHarness("crash");
    const crashed = new WorkerManager();
    await expect(crashed.computeColors(new Float32Array([1, 2]).buffer, indices().buffer, "viridis", 4, true)).resolves.toBeNull();
    expect(crashed.isAvailable()).toBe(false);
    vi.useFakeTimers(); workerHarness("hang");
    const stalled = new WorkerManager();
    const pending = stalled.computeColors(new Float32Array([1, 2]).buffer, indices().buffer, "viridis", 4, true);
    await vi.advanceTimersByTimeAsync(30_000);
    await expect(pending).resolves.toBeNull();
    expect(stalled.isAvailable()).toBe(false);
  });
});

// Import the actual engine. Only GPU/window surfaces are replaced by the harness;
// loading, validation, scalar application, commands and lifecycle remain real.
async function engineHarness() {
  const engine = Object.create(ThreeViewerEngine.prototype);
  const sidebar = document.createElement("div");
  sidebar.innerHTML = '<select id="vis-dataset"></select><select id="vis-property"></select><select id="vis-timestep"></select>';
  const ds = dataset();
  const store = new ViewerStore();
  Object.assign(engine, {
    store, ready: Promise.resolve(), disposed: false,
    options: { apiBase: "/api" }, manifest: { version: 1, datasets: [ds] },
    currentDataset: null, currentProperty: "pressure", currentColormap: "viridis", currentTimeStep: 0,
    loadGeneration: 0, colorRequest: 0, catalogGeneration: 0, datasetLoading: false,
    geometry: null, mesh: null, hexEdgeLines: null, cellIds: null, baseIndices: null,
    overlayMeshes: new Map(), overlayLoading: new Set(), overlayVisibility: new Map(),
    origin: [0, 0, 0], modelRoot: new THREE.Group(), scene: new THREE.Scene(),
    perspectiveCamera: new THREE.PerspectiveCamera(), orthoCamera: new THREE.OrthographicCamera(),
    camera: new THREE.PerspectiveCamera(), controls: { update: vi.fn(), target: new THREE.Vector3() },
    sidebar, objectTree: document.createElement("div"), detailsEl: document.createElement("div"), infoEl: document.createElement("div"),
    renderer: { renderLists: { dispose: vi.fn() }, info: { render: { calls: 2, triangles: 4 } } },
    workerManager: { isAvailable: () => false }, slicePlayer: { setDims: vi.fn() },
    viewRouter: new ViewRouter(sidebar, undefined, store), opacity: 0.8,
    abortController: null, lifetimeController: new AbortController(),
    filterPropertyExclude: false, filterBounds: null, filterUndoStack: [], filterRedoStack: [],
    wellPlanPoints: new Map(), onSelectionCallback: null,
  });
  for (const method of ["resetFilters", "updateLegend", "renderHistogram", "updateGridMapBounds", "applyCameraProjection", "frameBox", "setWellLabelsVisible", "updateObjectTree", "updateInspectorObject", "updateReadoutHud", "refreshWellMap", "highlightSelection"]) engine[method] = vi.fn();
  engine.fetchBinary = vi.fn(async (filename: string) => {
    if (filename === "net.f32") return positions().buffer;
    if (filename === "net.u32") return indices().buffer;
    if (filename === "ids.u32") return new Uint32Array([0, 1]).buffer;
    return new Float32Array([12, 25]).buffer;
  });
  return { engine, THREE, ds };
}

describe("real visualization engine operations", () => {
  it("builds stable persistence namespaces without credentials and retains legacy unscoped keys", () => {
    const scope: ViewerMountOptions = {
      apiBase: "https://user:url-secret@example.test/api/?token=query-secret#fragment-secret",
      authToken: "auth-secret",
      headers: { "X-Agent-Id": "selected, alpha", "X-Chat-Id": "chat", "Authorization": "Bearer header-secret" },
    };
    const key = viewerPersistenceKey(scope, "scene");
    expect(key).toBe(viewerPersistenceKey({
      apiBase: "https://example.test/api",
      headers: { "x-chat-id": "chat", "x-agent-id": "alpha", "X-Api-Key": "another-secret" },
    }, "scene"));
    expect(decodeURIComponent(key)).not.toMatch(/secret|token|user:/);
    const changes: Partial<ViewerMountOptions>[] = [
      { apiBase: "https://other.test/api" },
      { headers: { "X-Agent-Id": "beta", "X-Chat-Id": "chat" } },
      { headers: { "X-Agent-Id": "alpha", "X-Chat-Id": "another-chat" } },
      { headers: { "X-Agent-Id": "alpha", "X-Chat-Id": "chat", "X-Session-Project-Dir": "C:/project,one" } },
      { persistenceKey: "card-a" },
    ];
    for (const change of changes) expect(viewerPersistenceKey({ ...scope, ...change }, "scene")).not.toBe(key);
    expect(viewerPersistenceKey({ apiBase: "/api", headers: { Authorization: "Bearer secret" } }, "scene")).toBe("ugsci.visualization.scene");
    expect(viewerPersistenceKey({ apiBase: "/api" }, "userView")).toBe("ugsci.visualization.userView");
    expect(viewerPersistenceKey({ apiBase: "/api", persistenceKey: "standalone-card" }, "scene")).not.toBe("ugsci.visualization.scene");
  });
  it("saves and restores scenes and cameras independently across real engines and custom card namespaces", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const request = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/manifest")) return new Response(JSON.stringify({ version: 1, datasets: [dataset()] }));
      if (url.endsWith("/net.f32")) return new Response(positions().buffer);
      if (url.endsWith("/net.u32")) return new Response(indices().buffer);
      if (url.endsWith("/ids.u32")) return new Response(new Uint32Array([0, 1]).buffer);
      return new Response(new Float32Array([12, 25]).buffer);
    });
    const options: ViewerMountOptions[] = [
      { apiBase: "/api", headers: { "X-Agent-Id": "alpha" } },
      { apiBase: "/api", headers: { "X-Agent-Id": "beta" } },
      { apiBase: "/api", headers: { "X-Agent-Id": "alpha" }, persistenceKey: "card-a" },
      { apiBase: "/api", headers: { "X-Agent-Id": "alpha" }, persistenceKey: "card-b" },
    ].map((item) => ({ ...item, request, autoLoad: false }));
    const roots = options.map(() => document.createElement("div"));
    document.body.append(...roots);
    const engines = options.map((item, index) => new ThreeViewerEngine(roots[index], item));
    localStorage.clear();
    localStorage.setItem("ugsci.visualization.scene", '{"datasetId":"unknown-legacy-owner"}');
    localStorage.setItem("ugsci.visualization.userView", '{"position":[900,900,900]}');
    try {
      await Promise.all(engines.map((engine) => engine.ready));
      for (const engine of engines) {
        await (engine as any).restoreScene();
        expect(engine.store.getState().dataset).toBeNull();
        (engine as any).recallUserView();
        expect((engine as any).camera.position.toArray()).not.toEqual([900, 900, 900]);
      }
      for (const [index, engine] of engines.entries()) {
        await engine.executeCommand("open", { datasetId: "net" });
        (engine as any).camera.position.set(index + 2, index + 4, index + 6);
        (engine as any).saveScene();
        (engine as any).storeUserView();
      }
      expect(new Set(options.map((item) => viewerPersistenceKey(item, "scene"))).size).toBe(4);
      for (const [index, engine] of engines.entries()) {
        const position = [index + 2, index + 4, index + 6];
        const saved = JSON.parse(localStorage.getItem(viewerPersistenceKey(options[index], "scene"))!);
        expect(saved.camera.position).toEqual(position);
        (engine as any).camera.position.set(0, 0, 0);
        (engine as any).recallUserView();
        expect((engine as any).camera.position.toArray()).toEqual(position.map((value) => expect.closeTo(value, 8)));
        (engine as any).camera.position.set(1, 1, 1);
        await (engine as any).restoreScene();
        expect((engine as any).detailsEl.textContent).not.toContain("场景恢复失败");
        expect((engine as any).camera.position.toArray()).toEqual(position.map((value) => expect.closeTo(value, 8)));
      }
      engines[2].update({ persistenceKey: "card-c" });
      (engines[2] as any).camera.position.set(100, 100, 100);
      (engines[2] as any).recallUserView();
      expect((engines[2] as any).camera.position.toArray()).toEqual([100, 100, 100]);
      expect(localStorage.getItem("ugsci.visualization.scene")).toBe('{"datasetId":"unknown-legacy-owner"}');
      expect(localStorage.getItem("ugsci.visualization.userView")).toBe('{"position":[900,900,900]}');
    } finally {
      engines.forEach((engine) => engine.dispose()); roots.forEach((root) => root.remove());
      localStorage.clear();
    }
  });
  it("cancels a deferred scene restoration when Agent scope changes without altering the new restoration", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    let resolveAlpha: ((value: Response) => void) | undefined;
    let resolveBeta: ((value: Response) => void) | undefined;
    let deferBeta = false;
    const request = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const agent = new Headers(init?.headers).get("X-Agent-Id");
      if (url.endsWith("/manifest")) return new Response(JSON.stringify({ version: 1, datasets: [dataset({ id: `${agent}-net` })] }));
      if (url.endsWith("/net.f32")) {
        // Deliberately ignore AbortSignal to exercise a late host transport.
        if (agent === "alpha") return new Promise<Response>((resolve) => { resolveAlpha = resolve; });
        if (deferBeta) return new Promise<Response>((resolve) => { resolveBeta = resolve; });
        return new Response(positions().buffer);
      }
      if (url.endsWith("/net.u32")) return new Response(indices().buffer);
      if (url.endsWith("/ids.u32")) return new Response(new Uint32Array([0, 1]).buffer);
      return new Response(new Float32Array([12, 25]).buffer);
    });
    const options: ViewerMountOptions = { apiBase: "/api", headers: { "X-Agent-Id": "alpha" }, request, autoLoad: false };
    const root = document.createElement("div"); document.body.append(root);
    const engine = new ThreeViewerEngine(root, options);
    const state = engine as any;
    localStorage.clear();
    try {
      await engine.ready;
      localStorage.setItem(viewerPersistenceKey(options, "scene"), JSON.stringify({
        datasetId: "alpha-net", property: "pressure", colormap: "plasma", opacity: 0.2,
        wireframe: true, timeStep: 0, zScale: 9, ortho: true,
        camera: { position: [21, 22, 23], target: [1, 2, 3], up: [0, 1, 0] },
      }));
      const oldRestore = state.restoreScene();
      await vi.waitFor(() => expect(resolveAlpha).toBeDefined());
      expect(state.restoringScene).toBe(true);
      engine.update({ headers: { "X-Agent-Id": "beta" } });
      await engine.ready;
      expect(state.restoringScene).toBe(false);
      await engine.executeCommand("open", { datasetId: "beta-net" });
      await engine.executeCommand("set-opacity", { opacity: 0.75 });
      state.camera.position.set(2, 4, 6);
      state.saveScene();
      const expectedColormap = state.currentColormap;
      deferBeta = true;
      const newRestore = state.restoreScene();
      await vi.waitFor(() => expect(resolveBeta).toBeDefined());
      expect(state.restoringScene).toBe(true);

      resolveAlpha!(new Response(positions().buffer));
      await oldRestore;
      expect(state.restoringScene).toBe(true);
      expect(engine.store.getState().dataset?.id).toBe("beta-net");
      expect(state.currentColormap).toBe(expectedColormap);
      expect(state.opacity).toBe(0.75);
      expect(state.zScale).toBe(1);
      expect(state.camera.position.toArray()).toEqual([2, 4, 6]);
      expect(state.detailsEl.textContent).not.toContain("场景恢复失败");

      resolveBeta!(new Response(positions().buffer));
      await newRestore;
      expect(state.restoringScene).toBe(false);
      expect(state.infoEl.textContent).toBe("场景已恢复");
      expect(state.opacity).toBe(0.75);
      expect(state.camera.position.toArray()).toEqual([2, 4, 6].map((value) => expect.closeTo(value, 8)));
    } finally {
      resolveAlpha?.(new Response(positions().buffer)); resolveBeta?.(new Response(positions().buffer));
      engine.dispose(); root.remove(); localStorage.clear();
    }
  });
  it("fits the complete model inside the visible viewport between expanded panels", async () => {
    const { engine, THREE } = await engineHarness();
    engine.container = document.createElement("div");
    Object.defineProperties(engine.container, { clientWidth: { value: 1250 }, clientHeight: { value: 850 } });
    engine.objectTreeCollapsed = false; engine.sidebarCollapsed = false;
    engine.camera = new THREE.PerspectiveCamera(50, 1250 / 850, 0.1, 20000);
    engine.perspectiveCamera = engine.camera;
    const box = new THREE.Box3(new THREE.Vector3(-500, -500, -100), new THREE.Vector3(500, 500, 100));
    for (const view of ["iso", "top", "north"]) {
      for (const collapsed of [false, true]) {
        engine.objectTreeCollapsed = collapsed; engine.sidebarCollapsed = collapsed;
        (ThreeViewerEngine.prototype as any).frameBox.call(engine, box, view);
        engine.camera.lookAt(engine.controls.target); engine.camera.updateMatrixWorld();
        for (const x of [-500, 500]) for (const y of [-500, 500]) for (const z of [-100, 100]) {
          const projected = new THREE.Vector3(x, y, z).project(engine.camera);
          const pixelX = (projected.x + 1) * 625;
          const pixelY = (1 - projected.y) * 425;
          expect(pixelX).toBeGreaterThanOrEqual(collapsed ? 44 : 264);
          expect(pixelX).toBeLessThanOrEqual(collapsed ? 1206 : 942);
          expect(pixelY).toBeGreaterThanOrEqual(80);
          expect(pixelY).toBeLessThanOrEqual(780);
        }
      }
    }
  });
  it("mounts two real engines with independent stores and keeps the surviving engine usable after disposal", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const request = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/commands")) return new Response('{"commands":[]}');
      if (url.endsWith("/manifest")) return new Response(JSON.stringify({ version: 1, datasets: [dataset()] }));
      if (url.endsWith("/net.f32")) return new Response(positions().buffer);
      if (url.endsWith("/net.u32")) return new Response(indices().buffer);
      if (url.endsWith("/ids.u32")) return new Response(new Uint32Array([0, 1]).buffer);
      return new Response(new Float32Array([12, 25]).buffer);
    });
    const leftRoot = document.createElement("div"), rightRoot = document.createElement("div");
    document.body.append(leftRoot, rightRoot);
    const left = new ThreeViewerEngine(leftRoot, { apiBase: "/api", request, autoLoad: false });
    const right = new ThreeViewerEngine(rightRoot, { apiBase: "/api", request, autoLoad: false });
    try {
      await Promise.all([left.ready, right.ready]);
      expect(request.mock.calls.some(([url]) => String(url).includes("/commands"))).toBe(false);
      await left.executeCommand("open", { datasetId: "net" });
      expect(left.store.getState().dataset?.id).toBe("net");
      expect(left.store.getState().activeView).toBe("network");
      expect(within(leftRoot).getByRole("tab", { name: "管网" })).toHaveAttribute("aria-selected", "true");
      expect(within(leftRoot).getByRole("tab", { name: "储层 3D" })).toHaveAttribute("aria-selected", "false");
      expect(right.store.getState().dataset).toBeNull();
      left.dispose(); left.dispose();
      expect(leftRoot.childElementCount).toBe(0);
      await right.executeCommand("open", { datasetId: "net" });
      expect(right.store.getState().dataset?.id).toBe("net");
      expect(rightRoot.querySelector("canvas")).not.toBeNull();
      const commandRoot = document.createElement("div");
      const fullPage = new ThreeViewerEngine(commandRoot, { apiBase: "/api", request, autoLoad: false, enableCommands: true });
      try {
        await fullPage.ready;
        expect(request.mock.calls.some(([url]) => String(url).includes("/commands"))).toBe(true);
      } finally { fullPage.dispose(); }
    } finally {
      left.dispose(); right.dispose(); leftRoot.remove(); rightRoot.remove();
    }
  });
  it("retains loaded scalars for filtering and exposes selected objects to the embedding host", async () => {
    const { engine } = await engineHarness();
    const selected = vi.fn(); engine.options.onSelection = selected;
    await engine.executeCommand("open", { datasetId: "net" });
    expect(engine.currentScalarValues).toEqual(new Float32Array([12, 25]));
    expect(engine.geometry.getAttribute("color").count).toBe(4);
    expect(engine.store.getState().loading.stage).toBe("ready");
    expect(selected).toHaveBeenCalledWith({ type: "segment", id: "net" });
    engine.sidebar.insertAdjacentHTML("beforeend", '<input id="vis-filter-prop-min" value="20"><input id="vis-filter-prop-max" value="30">');
    engine.applyFilters();
    expect(Array.from(engine.geometry.getIndex().array)).toEqual([2, 3]);
    engine.disposeCurrentMesh();
  });
  it("silently synchronizes loaded tube, depth-log and spatial-well views without selecting a different dataset", async () => {
    const { engine } = await engineHarness();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const onTabChange = vi.fn();
    const tabHost = document.createElement("div");
    engine.viewRouter = new ViewRouter(tabHost, onTabChange, engine.store);
    tabHost.append(engine.viewRouter.createTabs());
    engine.wellLogEl = document.createElement("canvas");
    engine.wellMapRoot = document.createElement("div");
    const tube = dataset({ id: "tube", source: "network-tube", n_indices: 6, metadata: { geometry_primitive: "triangles", scalar_association: "cell" } });
    const log = dataset({ id: "log", source: "las", metadata: { placement: "depth-only", geometry_primitive: "lines", scalar_association: "cell" } });
    const spatial = dataset({ id: "spatial", source: "wellbore", metadata: { placement: "spatial", geometry_primitive: "lines", scalar_association: "cell" } });
    engine.manifest.datasets = [tube, log, spatial];
    engine.fetchBinary.mockImplementation(async (filename: string) => {
      if (filename === "net.f32") return positions().buffer;
      if (filename === "net.u32") return (engine.currentDataset.id === "tube" ? new Uint32Array([0, 1, 2, 0, 2, 3]) : indices()).buffer;
      if (filename === "ids.u32") return new Uint32Array([0, 1]).buffer;
      return new Float32Array([12, 25]).buffer;
    });
    try {
      await engine.executeCommand("open", { datasetId: "tube" });
      expect(engine.store.getState().activeView).toBe("network");
      expect(engine.store.getState().selected).toMatchObject({ type: "segment", id: "tube" });
      expect(engine.mesh.userData.kind).toBe("segment");
      expect(within(tabHost).getByRole("tab", { name: "管网" })).toHaveAttribute("aria-selected", "true");
      await engine.executeCommand("open", { datasetId: "log" });
      expect(engine.store.getState().activeView).toBe("welllog");
      expect(engine.mesh).toBeNull();
      expect(engine.wellLogEl.style.display).toBe("block");
      expect(engine.wellMapRoot.style.display).toBe("none");
      await engine.executeCommand("open", { datasetId: "spatial" });
      expect(engine.store.getState().activeView).toBe("wellbore");
      expect(engine.mesh).not.toBeNull();
      expect(engine.wellLogEl.style.display).toBe("none");
      expect(engine.wellMapRoot.style.display).toBe("block");
      expect(onTabChange).not.toHaveBeenCalled();
    } finally { engine.disposeCurrentMesh(); }
  });
  it("keeps the selected grid and log when their tab is revisited and includes surface sections", async () => {
    const { engine } = await engineHarness();
    const firstGrid = dataset({ id: "grid-1", source: "egrid", grid_dims: [1, 1, 1] });
    const secondGrid = { ...firstGrid, id: "grid-2" };
    const firstLog = dataset({ id: "log-1", source: "las" });
    const secondLog = { ...firstLog, id: "log-2" };
    const surface = dataset({ id: "surface", source: "surface" });
    engine.manifest.datasets = [firstGrid, secondGrid, firstLog, secondLog, surface];
    engine.loadDataset = vi.fn();
    engine.currentDataset = secondGrid;
    await engine.applyActiveView("reservoir");
    engine.currentDataset = secondLog;
    await engine.applyActiveView("welllog");
    engine.currentDataset = surface;
    await engine.applyActiveView("intersection");
    expect(engine.loadDataset).not.toHaveBeenCalled();
    engine.currentDataset = null;
    await engine.applyActiveView("intersection");
    expect(engine.loadDataset).toHaveBeenCalledExactlyOnceWith("surface");
  });
  it("supports keyboard view tabs and silent synchronization without activation callbacks", () => {
    const container = document.createElement("div");
    document.body.append(container);
    const changed = vi.fn();
    const store = new ViewerStore();
    const router = new ViewRouter(container, changed, store);
    container.append(router.createTabs());
    try {
      expect(changed).not.toHaveBeenCalled();
      router.switchTo("network", false);
      expect(store.getState().activeView).toBe("network");
      expect(changed).not.toHaveBeenCalled();
      const networkTab = within(container).getByRole("tab", { name: "管网" });
      fireEvent.keyDown(networkTab, { key: "ArrowLeft" });
      expect(changed).toHaveBeenCalledExactlyOnceWith("welllog");
      expect(within(container).getByRole("tab", { name: "测井" })).toHaveFocus();
      expect(networkTab.tabIndex).toBe(-1);
    } finally { container.remove(); }
  });
  it("preserves all three explicit network segments and correctly recognizes legacy degenerates", async () => {
    const { engine } = await engineHarness();
    const pairs = new Uint32Array([0, 1, 1, 2, 2, 3]);
    expect(engine.lineRenderIndices(dataset(), pairs, 4)).toBe(pairs);
    expect(engine.lineRenderIndices(dataset({ metadata: {} }), pairs, 4)).toBe(pairs);
    expect(engine.lineRenderIndices(dataset({ metadata: {} }), new Uint32Array([0, 1, 0, 1, 2, 1, 2, 3, 2]), 4)).toEqual(pairs);
  });
  it("colors the actual well tube geometry and keeps all-missing legends honest", async () => {
    const { engine, THREE } = await engineHarness();
    const well = dataset({ source: "wellbore", metadata: { placement: "spatial" } });
    const pointColors = new THREE.BufferAttribute(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1]), 3);
    const object = engine.buildWellObject(well, positions(), pointColors);
    const tube = object.children.find((node: { name: string }) => node.name === "oilgas-well-tube");
    expect(tube.material.vertexColors).toBe(true);
    expect(tube.geometry.getAttribute("color").count).toBe(tube.geometry.getAttribute("position").count);
    expect(Array.from(tube.geometry.getAttribute("color").array).every((value) => Number.isFinite(value))).toBe(true);
    engine.setObjectHighlight(object, true);
    expect(tube.material.color.getHex()).toBe(0xffffff);
    engine.setObjectHighlight(object, false);
    expect(tube.material.color.getHex()).toBe(0xffffff);
    engine.legendEl = document.createElement("div");
    engine.legendEl.innerHTML = '<div data-legend-title></div><div data-legend-range></div><div data-legend-gradient></div>';
    engine.scalarValidCount = 0; engine.scalarMin = 0; engine.scalarMax = 1;
    // This harness stubs only rendering chrome; execute the actual legend method.
    (ThreeViewerEngine.prototype as any).updateLegend.call(engine);
    expect(engine.legendEl.textContent).toContain("全部缺测");
    expect(engine.legendEl.textContent).not.toContain("0.000");
    engine.disposeObject3D(object);
  });
  it("waits for initialization before open and rejects invalid geometry instead of acknowledging success", async () => {
    const { engine } = await engineHarness();
    let ready!: () => void;
    engine.ready = new Promise<void>((resolve) => { ready = resolve; });
    const opening = engine.executeCommand("open", { datasetId: "net" });
    await Promise.resolve(); expect(engine.fetchBinary).not.toHaveBeenCalled();
    ready(); await opening;
    engine.fetchBinary = vi.fn(async () => new ArrayBuffer(7));
    await expect(engine.executeCommand("open", { datasetId: "net" })).rejects.toThrow("字节长度");
    expect(engine.store.getState().loading.stage).toBe("failed");
    expect(engine.mesh).toBeNull();
  });
  it("does not resurrect an overlay after a dataset change or a visibility-off request", async () => {
    const { engine, ds } = await engineHarness();
    let complete!: (value: ArrayBuffer) => void;
    engine.fetchBinary = vi.fn((filename: string) => filename.endsWith(".f32")
      ? new Promise<ArrayBuffer>((resolve) => { complete = resolve; }) : Promise.resolve(indices().buffer));
    const loading = engine.toggleDatasetVisibility(ds, true);
    await engine.toggleDatasetVisibility(ds, false);
    complete(positions().buffer); await loading;
    expect(engine.overlayMeshes.size).toBe(0);
    const stale = engine.toggleDatasetVisibility(ds, true);
    engine.loadGeneration++;
    complete(positions().buffer); await stale;
    expect(engine.modelRoot.children).toHaveLength(0);
  });
  it("ignores late catalog completion after disposal and supports explicit empty embedded startup", async () => {
    const { engine, ds } = await engineHarness();
    let complete!: (value: unknown) => void;
    engine.fetchJson = () => new Promise((resolve) => { complete = resolve; });
    const loading = engine.refreshCatalog();
    engine.disposed = true;
    complete({ version: 1, datasets: [dataset({ id: "late" })] }); await loading;
    expect(engine.manifest.datasets[0].id).toBe("net");
    engine.disposed = false;
    engine.fetchJson = async () => ({ version: 1, datasets: [ds] });
    await engine.refreshCatalog(undefined, false);
    expect(engine.fetchBinary).not.toHaveBeenCalled();
  });
  it("returns measured benchmark results only when measurement finishes and cancels on request", async () => {
    const { engine } = await engineHarness();
    let frame: FrameRequestCallback | undefined, now = 1;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frame = callback; return 7; });
    const cancel = vi.fn(); vi.stubGlobal("cancelAnimationFrame", cancel);
    engine.request = vi.fn(async () => new Response("{}"));
    let resolved = false;
    const pending = engine.runBenchmark().then((value: unknown) => { resolved = true; return value; });
    now = 17; frame!(now); await Promise.resolve(); expect(resolved).toBe(false);
    now = 33; frame!(now); now = 5017; frame!(now);
    await expect(pending).resolves.toMatchObject({ drawCalls: 2, triangles: 4, duration: 5016 });
    expect(engine.request).toHaveBeenCalledOnce();
    const aborted = engine.runBenchmark(); const rejection = expect(aborted).rejects.toMatchObject({ name: "AbortError" });
    engine.cancelBenchmark(); await rejection;
    expect(cancel).toHaveBeenCalledWith(7);
  });
});
