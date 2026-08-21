/**
 * Oil & Gas Visualization — Viewer Runtime (IIFE entry).
 *
 * Features:
 * - Three.js WebGL rendering with OrbitControls
 * - Web Worker for binary data decoding and color computation
 * - Dataset switching, property coloring, cell picking
 * - Colormap, opacity, wireframe controls
 * - I/J/K, region, property-range filters
 * - Component tree (grid/well/surface/network) with search and delete
 * - Local file import, workspace-tree import, drag-and-drop
 * - Right-hand inspector, readout HUD, plan-view well map
 * - Named views, orthographic camera, Z exaggeration, I/J/K slice player
 * - North arrow / scale bar, context menu, isolate/hide/show-all
 * - Time step switching (UNRST dynamic properties)
 * - Cross-view selection sync via store
 * - Coordinate origin rebase
 * - FPS/frame/draw calls/heap HUD
 * - Benchmark and leak test
 * - Authenticated API calls
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { ViewRouter } from "./app/view-router";
import { mountViewer } from "./mount";
import { registerEngineFactory } from "./engines/registry";
import { viewerStore } from "./stores/viewerState";
import { colormapCssGradient, COLORMAP_NAMES, sampleColormap as colormap } from "./rendering/colormaps";
import { applyChromeOffsets, LAYOUT } from "./ui/layout";
import {
  type ComponentGroupId,
  renderComponentTree,
} from "./ui/componentTree";
import {
  createWellMapPanel,
  drawWellMap,
  hitTestWellMap,
  unionBounds,
  type MapBounds,
  type WellMapPoint,
} from "./ui/wellMap";
import { createReadoutPanel, updateReadout } from "./ui/readout";
import {
  appendControlRow,
  createBoolSwitch,
  createControlTable,
  createInspectorTabs,
  inspectorActionButton,
} from "./ui/inspectorTabs";
import {
  bindDropImport,
  createHiddenFileInput,
  importLocalFiles,
  openWorkspacePicker,
  type ImportDialogHost,
} from "./ui/importDialog";
import {
  applyOrthographicFrustum,
  cameraAzimuthRad,
  metersPerPixel,
  namedViewPose,
  USER_VIEW_KEY,
  viewDistanceForBox,
  type NamedView,
} from "./ui/standardViews";
import { objectContextItems, showContextMenu } from "./ui/contextMenu";
import { createSlicePlayer, sliceRangeText, type SlicePlayer } from "./ui/slicePlayer";
import { createCompassHud, type CompassHud } from "./ui/compass";
import { createViewCluster } from "./ui/viewCluster";
import {
  createShortcutsOverlay,
  hideShortcutsOverlay,
  toggleShortcutsOverlay,
} from "./ui/shortcutsOverlay";
import {
  isDepthOnlyWell,
  isGridDataset,
  isSpatialWell,
  uniquePolyline,
  wellDisplayName,
} from "./wellClassification";
import { buildWellTubeMesh } from "./wellTubeGeometry";
import {
  buildHexEdgeIndex,
  extractHexCorners,
  isHexCellMesh,
  isHexCornerMesh,
  maybeRemapHexPositions,
  tessellateHexOpmFan,
} from "./hexTopology";
import { WorkerManager } from "./workers/workerManager";
import { ViewerCommandBridge } from "./commands/commandBridge";
import type {
  DatasetInfo,
  DatasetManifest,
  DomainSelection,
  ViewerHandle,
  ViewerMountOptions,
} from "./contracts/types";

// ─── Viewer Engine ──────────────────────────────────────────────────────────

class ThreeViewerEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private modelRoot: THREE.Group;
  private perspectiveCamera: THREE.PerspectiveCamera;
  private orthoCamera: THREE.OrthographicCamera;
  private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private controls: OrbitControls;
  private gridHelper: THREE.GridHelper;
  private axesHelper: THREE.AxesHelper;
  private mesh: THREE.Object3D | null = null;
  private labelRenderer: CSS2DRenderer;
  private hexEdgeLines: THREE.LineSegments | null = null;
  private hexCornerPositions: Float32Array | null = null;
  private isHexMesh = false;
  /** Secondary objects (wells, surfaces and networks) shown alongside the active dataset. */
  private overlayMeshes = new Map<string, THREE.Object3D>();
  private overlayLoading = new Set<string>();
  private geometry: THREE.BufferGeometry | null = null;
  private cellIds: Uint32Array | null = null;
  private baseIndices: Uint32Array | null = null;
  private visibleCellOffsets: number[] = [];
  private currentScalarValues: Float32Array | Uint32Array | null = null;
  private cellCenters: Float32Array | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private container: HTMLElement;
  private animationId: number | null = null;
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private fpsInterval = 0;
  private abortController: AbortController | null = null;
  private loadGeneration = 0;
  private colorRequest = 0;
  private commandBridge: ViewerCommandBridge;
  private timestepTimer: number | null = null;
  private datasetLoading = false;

  private manifest: DatasetManifest | null = null;
  private currentDataset: DatasetInfo | null = null;
  private currentProperty = "porosity";
  private currentColormap = "viridis";
  private wireframe = false;
  private opacity = 0.85;
  private currentTimeStep = 0;
  private apiBase: string;
  private authToken: string | undefined;
  private readonly viewerId = `viewer-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  private origin: [number, number, number] = [0, 0, 0];

  // Filters
  private filterI: [number, number] = [0, Infinity];
  private filterJ: [number, number] = [0, Infinity];
  private filterK: [number, number] = [0, Infinity];
  private filterPropertyRange: [number, number] = [-Infinity, Infinity];
  private filterPropertyExclude = false;
  private filterBounds: [number, number, number, number, number, number] | null = null;
  private zScale = 1;
  private useOrtho = false;
  private wellLabelsVisible = true;
  private sliceTimer: number | null = null;
  private filterUndoStack: string[] = [];
  private filterRedoStack: string[] = [];
  private lastFilterState = "";
  private restoringScene = false;
  private measureMode = false;
  private measurePoints: THREE.Vector3[] = [];
  private clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  private wellLogEl: HTMLCanvasElement | null = null;
  private histogramEl: HTMLCanvasElement | null = null;

  // Worker
  private workerManager = new WorkerManager();

  // UI
  private sidebar: HTMLElement;
  private hudEl: HTMLElement;
  private infoEl: HTMLElement;
  private objectTree: HTMLElement;
  private detailsEl: HTMLElement;
  private legendEl: HTMLElement;
  private toolbarEl: HTMLElement;
  private viewRouter: ViewRouter;
  private sidebarCollapsed = false;
  private objectTreeCollapsed = false;
  private readoutEl: HTMLElement;
  private wellMapRoot: HTMLElement;
  private wellMapCanvas: HTMLCanvasElement;
  private wellPlanPoints = new Map<string, WellMapPoint>();
  private gridMapBounds: MapBounds | null = null;
  private treeQuery = "";
  private collapsedGroups = new Set<string>();
  private selectedObjectId: string | null = null;
  private hoverCoords: [number, number, number] | null = null;
  private fileInput: HTMLInputElement | null = null;
  private dropUnbind: (() => void) | null = null;
  private slicePlayer!: SlicePlayer;
  private compassHud!: CompassHud;
  private viewClusterEl!: HTMLElement;
  private shortcutsEl!: HTMLElement;
  private importBusy = false;
  private highlightedOverlayId: string | null = null;
  private storeUnsubscribe: (() => void) | null = null;
  private scalarMin = 0;
  private scalarMax = 1;

  // Selection sync callback (for cross-view sync)
  private onSelectionCallback: ((sel: { type: string; id: string; coords?: [number, number, number] }) => void) | null = null;

  constructor(container: HTMLElement, options: ViewerMountOptions) {
    this.container = container;
    this.apiBase = options.apiBase;
    this.authToken = options.authToken;

    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.localClippingEnabled = true;
    container.appendChild(this.renderer.domElement);
    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(w, h);
    Object.assign(this.labelRenderer.domElement.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
    });
    container.appendChild(this.labelRenderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d1117);
    this.scene.fog = new THREE.Fog(0x0d1117, 2000, 8000);
    this.modelRoot = new THREE.Group();
    this.modelRoot.name = "oilgas-model";
    this.scene.add(this.modelRoot);

    this.perspectiveCamera = new THREE.PerspectiveCamera(50, w / h, 1, 20000);
    this.perspectiveCamera.position.set(3000, 3000, 3000);
    this.orthoCamera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 20000);
    this.orthoCamera.position.copy(this.perspectiveCamera.position);
    this.camera = this.perspectiveCamera;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

    const ambient = new THREE.AmbientLight(0x404060, 1.5);
    this.scene.add(ambient);
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dir1.position.set(1000, 1000, 1000);
    this.scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0x8090ff, 0.5);
    dir2.position.set(-500, -500, -500);
    this.scene.add(dir2);
    this.gridHelper = new THREE.GridHelper(5000, 50, 0x30363d, 0x21262d);
    this.gridHelper.rotation.x = Math.PI / 2;
    this.scene.add(this.gridHelper);
    this.axesHelper = new THREE.AxesHelper(2000);
    this.scene.add(this.axesHelper);
    this.raycaster.params.Line = { threshold: 12 };

    this.renderer.domElement.addEventListener("click", this.onCanvasClick);
    this.renderer.domElement.addEventListener("pointermove", this.onCanvasPointerMove);
    this.renderer.domElement.addEventListener("pointerleave", this.onCanvasPointerLeave);
    this.renderer.domElement.addEventListener("dblclick", this.onCanvasDblClick);
    this.renderer.domElement.addEventListener("contextmenu", this.onCanvasContextMenu);
    window.addEventListener("resize", this.onResize);

    this.sidebar = this.buildSidebar();
    this.objectTree = this.buildObjectTree();
    this.hudEl = this.buildHud();
    this.infoEl = this.buildInfoBar();
    this.detailsEl = this.buildDetailsPanel();
    this.legendEl = this.buildLegend();
    this.histogramEl = this.buildHistogram();
    this.wellLogEl = this.buildWellLogPanel();
    this.toolbarEl = this.buildToolbar();
    this.readoutEl = this.buildReadout();
    const wellMap = createWellMapPanel();
    this.wellMapRoot = wellMap.root;
    this.wellMapCanvas = wellMap.canvas;
    this.wellMapCanvas.addEventListener("click", this.onWellMapClick);
    this.container.appendChild(this.wellMapRoot);
    this.slicePlayer = createSlicePlayer({
      onAxis: (axis) => this.applySliceAxis(axis),
      onIndex: (axis, index) => this.applySliceIndex(axis, index),
      onPlay: (playing) => this.setSlicePlaying(playing),
    });
    this.container.appendChild(this.slicePlayer.root);
    this.compassHud = createCompassHud();
    this.container.appendChild(this.compassHud.root);
    this.viewClusterEl = createViewCluster((view) => this.applyNamedView(view));
    this.container.appendChild(this.viewClusterEl);
    this.shortcutsEl = createShortcutsOverlay();
    this.container.appendChild(this.shortcutsEl);
    this.viewRouter = new ViewRouter(this.container, (view) => {
      void this.applyActiveView(view);
    });
    const viewTabs = this.viewRouter.createTabs();
    viewTabs.className = "oilgas-view-tabs";
    Object.assign(viewTabs.style, { top: "48px", left: "276px", right: "288px", overflowX: "auto" });
    this.container.appendChild(viewTabs);
    this.storeUnsubscribe = viewerStore.subscribe(() => this.syncChromeFromStore());
    this.updatePanelOffsets();

    this.commandBridge = new ViewerCommandBridge({
      apiBase: this.apiBase,
      authToken: this.authToken,
      viewerId: this.viewerId,
      execute: (command, args) => this.executeCommand(command, args),
      onCommandError: (message) => {
        this.infoEl.textContent = `Agent 命令失败: ${message}`;
      },
    });

    this.fileInput = createHiddenFileInput((files) => {
      void this.handlePickedFiles(files);
    });
    this.container.appendChild(this.fileInput);
    this.container.tabIndex = 0;
    this.container.addEventListener("keydown", this.onViewerKeyDown);
    this.dropUnbind = bindDropImport(this.container, (files) => {
      void this.handlePickedFiles(files);
    });

    this.startLoop();
    this.init();
    this.commandBridge.start();
  }

  // ─── Auth helpers ──────────────────────────────────────────────────
  private authHeaders(): Record<string, string> {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }

  private async fetchJson(path: string, signal?: AbortSignal): Promise<any> {
    const resp = await fetch(`${this.apiBase}${path}`, { headers: this.authHeaders(), signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  private async fetchBinary(filename: string, signal?: AbortSignal): Promise<ArrayBuffer> {
    // Try Worker first, fall back to main thread
    const url = `${this.apiBase}/resource/${filename}`;
    if (this.workerManager.isAvailable()) {
      const result = await this.workerManager.decode(url, this.authToken);
      if (result) return new Uint8Array(result.buffer).slice().buffer;
    }
    const resp = await fetch(url, { headers: this.authHeaders(), signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.arrayBuffer();
  }

  // ─── UI Construction ────────────────────────────────────────────────

  private buildSidebar(): HTMLElement {
    const sidebar = document.createElement("div");
    Object.assign(sidebar.style, {
      position: "absolute", top: "0", right: "0", bottom: "0", left: "auto",
      width: String(LAYOUT.inspectorWidth) + "px", background: "rgba(13,17,23,0.96)",
      borderLeft: "1px solid #30363d", borderRight: "0", overflow: "hidden",
      padding: "0", boxSizing: "border-box", zIndex: "100",
      fontFamily: "-apple-system, sans-serif", color: "#c9d1d9", fontSize: "13px",
      display: "flex", flexDirection: "column",
    } as CSSStyleDeclaration);
    sidebar.className = "oilgas-panel oilgas-inspector-panel";

    const collapseBtn = document.createElement("button");
    collapseBtn.type = "button";
    collapseBtn.textContent = "<";
    collapseBtn.title = "收起属性面板";
    collapseBtn.setAttribute("aria-label", "收起属性面板");
    Object.assign(collapseBtn.style, this.iconButtonStyle);
    collapseBtn.style.position = "absolute";
    collapseBtn.style.top = "8px";
    collapseBtn.style.left = "6px";
    collapseBtn.style.right = "auto";
    collapseBtn.style.zIndex = "2";
    collapseBtn.addEventListener("click", () => this.toggleSidebar(collapseBtn));
    sidebar.appendChild(collapseBtn);

    const body = document.createElement("div");
    body.id = "vis-inspector-body";
    body.style.cssText = "flex:1;min-height:0;display:flex;flex-direction:column;padding:12px 10px 8px;overflow:hidden;";

    const title = document.createElement("div");
    Object.assign(title.style, {
      fontSize: "15px", fontWeight: "600", marginBottom: "10px",
      color: "#58a6ff", padding: "0 0 8px 28px",
      borderBottom: "1px solid #30363d",
    });
    title.textContent = "属性";
    body.appendChild(title);

    const objectCard = document.createElement("div");
    objectCard.id = "vis-inspector-object";
    objectCard.style.cssText = "margin:0 0 10px;padding:8px;background:#161b22;border:1px solid #30363d;border-radius:7px;flex:0 0 auto;";
    const objectName = document.createElement("div");
    objectName.dataset.objectName = "true";
    objectName.style.cssText = "font-weight:600;color:#e6edf3;margin-bottom:4px;";
    objectName.textContent = "未选中对象";
    const objectMeta = document.createElement("div");
    objectMeta.dataset.objectMeta = "true";
    objectMeta.style.cssText = "font-size:11px;color:#8b949e;margin-bottom:6px;";
    objectMeta.textContent = "在组件树或三维视图中点选";
    const visibleSwitch = createBoolSwitch("vis-inspector-visible", true, (value) => {
      const dataset = this.datasetById(this.selectedObjectId || this.currentDataset?.id || "");
      if (dataset) void this.toggleDatasetVisibility(dataset, value);
    });
    const visibleRow = document.createElement("div");
    visibleRow.style.cssText = "display:grid;grid-template-columns:42% 1fr;gap:8px;align-items:center;";
    const visibleName = document.createElement("div");
    visibleName.textContent = "visible";
    visibleName.style.cssText = "color:#8b949e;font-size:11px;";
    visibleRow.append(visibleName, visibleSwitch);
    objectCard.append(objectName, objectMeta, visibleRow);
    body.appendChild(objectCard);

    const tabs = createInspectorTabs();
    body.appendChild(tabs.tabBar);

    const panes = document.createElement("div");
    panes.style.cssText = "flex:1;min-height:0;overflow:auto;";
    const controlsTable = createControlTable();
    const actionsTable = createControlTable();
    tabs.panes.controls.appendChild(controlsTable.table);
    tabs.panes.actions.appendChild(actionsTable.table);
    panes.append(tabs.panes.controls, tabs.panes.actions, tabs.panes.addons);
    body.appendChild(panes);

    const compact = (el: HTMLElement) => {
      Object.assign(el.style, this.selectStyle, { marginBottom: "0" } as CSSStyleDeclaration);
      return el;
    };

    const dsSelect = document.createElement("select");
    compact(dsSelect);
    dsSelect.id = "vis-dataset";
    dsSelect.setAttribute("aria-label", "数据集");
    dsSelect.addEventListener("change", () => this.loadDataset(dsSelect.value));
    appendControlRow(controlsTable.body, "dataset", dsSelect);

    const propSelect = document.createElement("select");
    compact(propSelect);
    propSelect.id = "vis-property";
    propSelect.setAttribute("aria-label", "属性");
    for (const p of ["porosity", "permeability", "facies"]) {
      const opt = document.createElement("option");
      opt.value = p; opt.textContent = p;
      propSelect.appendChild(opt);
    }
    propSelect.addEventListener("change", () => {
      this.currentProperty = propSelect.value;
      viewerStore.setProperty({
        name: this.currentProperty,
        displayName: this.currentProperty,
        range: [this.scalarMin, this.scalarMax],
      });
      this.reloadPropertyColors();
    });
    appendControlRow(controlsTable.body, "property", propSelect);

    const tsSelect = document.createElement("select");
    compact(tsSelect);
    tsSelect.id = "vis-timestep";
    tsSelect.setAttribute("aria-label", "时间步");
    tsSelect.innerHTML = '<option value="0">静态</option>';
    tsSelect.addEventListener("change", () => {
      this.currentTimeStep = parseInt(tsSelect.value);
      viewerStore.setTimeStep(this.currentTimeStep);
      this.reloadPropertyColors();
    });
    appendControlRow(controlsTable.body, "timeStep", tsSelect);

    const playBtn = inspectorActionButton("播放时间步");
    playBtn.title = "播放/暂停动态结果时间步";
    playBtn.style.marginBottom = "0";
    playBtn.addEventListener("click", () => {
      if (this.timestepTimer !== null) {
        window.clearInterval(this.timestepTimer);
        this.timestepTimer = null;
        playBtn.textContent = "播放时间步";
        this.infoEl.textContent = "已暂停时间步播放";
        return;
      }
      const options = Array.from(tsSelect.options).filter((option) => option.value !== "0");
      if (options.length < 1) {
        this.infoEl.textContent = "当前数据集没有可播放的时间步";
        return;
      }
      playBtn.textContent = "暂停时间步";
      this.timestepTimer = window.setInterval(() => {
        const next = this.currentTimeStep >= options.length ? 1 : this.currentTimeStep + 1;
        void this.executeCommand("set-timestep", { timeStep: next });
      }, 700);
    });
    appendControlRow(controlsTable.body, "play", playBtn);

    const cmSelect = document.createElement("select");
    compact(cmSelect);
    cmSelect.id = "vis-colormap";
    cmSelect.setAttribute("aria-label", "色图");
    for (const cm of COLORMAP_NAMES) {
      const opt = document.createElement("option");
      opt.value = cm; opt.textContent = cm;
      cmSelect.appendChild(opt);
    }
    cmSelect.addEventListener("change", () => {
      this.currentColormap = cmSelect.value;
      viewerStore.setColorMap({ name: this.currentColormap });
      this.reloadPropertyColors();
    });
    appendControlRow(controlsTable.body, "colorRamp", cmSelect);

    const opacityWrap = document.createElement("div");
    const opacitySlider = document.createElement("input");
    opacitySlider.type = "range"; opacitySlider.min = "10"; opacitySlider.max = "100"; opacitySlider.value = "85";
    opacitySlider.id = "vis-opacity";
    Object.assign(opacitySlider.style, { width: "100%", margin: "0" });
    const opacityValue = document.createElement("div");
    opacityValue.id = "vis-opacity-value";
    opacityValue.style.cssText = "font-size:11px;color:#8b949e;font-family:monospace;text-align:right;";
    opacityValue.textContent = "0.85";
    opacitySlider.addEventListener("input", () => {
      this.applyOpacity(parseInt(opacitySlider.value, 10) / 100);
    });
    opacityWrap.append(opacitySlider, opacityValue);
    appendControlRow(controlsTable.body, "opacity", opacityWrap);

    appendControlRow(
      controlsTable.body,
      "wireframe",
      createBoolSwitch("vis-wireframe", false, (value) => {
        this.wireframe = value;
        this.applyWireframeMode();
      }),
    );

    const filterDiv = document.createElement("div");
    filterDiv.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;";
    for (const axis of ["I", "J", "K"]) {
      const input = document.createElement("input");
      input.type = "text"; input.placeholder = axis;
      input.id = "vis-filter-" + axis.toLowerCase();
      input.style.cssText = "width:100%;padding:4px;background:#161b22;border:1px solid #30363d;border-radius:4px;color:#c9d1d9;font-size:11px;text-align:center;box-sizing:border-box;";
      input.addEventListener("input", () => this.applyFilters());
      input.addEventListener("change", () => this.applyFilters());
      filterDiv.appendChild(input);
    }
    appendControlRow(controlsTable.body, "filterIJK", filterDiv);

    const propRangeDiv = document.createElement("div");
    propRangeDiv.style.cssText = "display:flex;gap:4px;";
    const minInput = document.createElement("input");
    minInput.type = "number"; minInput.placeholder = "min"; minInput.step = "0.01";
    minInput.id = "vis-filter-prop-min";
    compact(minInput);
    minInput.addEventListener("input", () => this.applyFilters());
    minInput.addEventListener("change", () => this.applyFilters());
    const maxInput = document.createElement("input");
    maxInput.type = "number"; maxInput.placeholder = "max"; maxInput.step = "0.01";
    maxInput.id = "vis-filter-prop-max";
    compact(maxInput);
    maxInput.addEventListener("input", () => this.applyFilters());
    maxInput.addEventListener("change", () => this.applyFilters());
    propRangeDiv.append(minInput, maxInput);
    appendControlRow(controlsTable.body, "propertyRange", propRangeDiv);
    appendControlRow(
      controlsTable.body,
      "excludeRange",
      createBoolSwitch("vis-filter-prop-exclude", false, (checked) => {
        this.filterPropertyExclude = checked;
        this.applyFilters();
      }),
    );

    const isolateK = document.createElement("input");
    isolateK.type = "range"; isolateK.min = "1"; isolateK.max = "1"; isolateK.value = "1";
    isolateK.id = "vis-k-layer";
    Object.assign(isolateK.style, { width: "100%", margin: "0" });
    isolateK.addEventListener("input", () => {
      const kFilter = this.sidebar.querySelector("#vis-filter-k") as HTMLInputElement | null;
      const isolate = (this.sidebar.querySelector("#vis-isolate-k") as HTMLInputElement | null)?.checked;
      if (kFilter && isolate) {
        kFilter.value = isolateK.value + ":" + isolateK.value;
        this.applyFilters();
      }
    });
    appendControlRow(
      controlsTable.body,
      "isolateK",
      createBoolSwitch("vis-isolate-k", false, (checked) => {
        const kFilter = this.sidebar.querySelector("#vis-filter-k") as HTMLInputElement | null;
        if (!kFilter) return;
        kFilter.value = checked ? isolateK.value + ":" + isolateK.value : "";
        this.applyFilters();
      }),
    );
    appendControlRow(controlsTable.body, "kLayer", isolateK);

    const zScaleWrap = document.createElement("div");
    const zScaleSlider = document.createElement("input");
    zScaleSlider.type = "range";
    zScaleSlider.min = "10";
    zScaleSlider.max = "800";
    zScaleSlider.value = "100";
    zScaleSlider.id = "vis-z-scale";
    Object.assign(zScaleSlider.style, { width: "100%", margin: "0" });
    const zScaleValue = document.createElement("div");
    zScaleValue.id = "vis-z-scale-value";
    zScaleValue.style.cssText = "font-size:11px;color:#8b949e;font-family:monospace;text-align:right;";
    zScaleValue.textContent = "1.00x";
    zScaleSlider.addEventListener("input", () => {
      this.setZScale(parseInt(zScaleSlider.value, 10) / 100);
    });
    zScaleWrap.append(zScaleSlider, zScaleValue);
    appendControlRow(controlsTable.body, "zScale", zScaleWrap);
    appendControlRow(
      controlsTable.body,
      "orthographic",
      createBoolSwitch("vis-ortho", false, (checked) => this.setOrthographic(checked)),
    );

    const clipSlider = document.createElement("input");
    clipSlider.type = "range"; clipSlider.min = "0"; clipSlider.max = "100"; clipSlider.value = "50";
    clipSlider.id = "vis-clip-depth";
    Object.assign(clipSlider.style, { width: "100%", margin: "0" });
    const applyClip = () => {
      const clipCheck = this.sidebar.querySelector("#vis-clip") as HTMLInputElement | null;
      this.applyClipPlane(Boolean(clipCheck?.checked), Number(clipSlider.value) / 100);
    };
    clipSlider.addEventListener("input", applyClip);
    appendControlRow(
      controlsTable.body,
      "clipPlane",
      createBoolSwitch("vis-clip", false, () => applyClip()),
    );
    appendControlRow(controlsTable.body, "clipDepth", clipSlider);

    const polylineInput = document.createElement("input");
    polylineInput.type = "text";
    polylineInput.placeholder = "x,y; x,y; ...";
    polylineInput.id = "vis-polyline";
    compact(polylineInput);
    appendControlRow(actionsTable.body, "polyline", polylineInput);

    const zRangeDiv = document.createElement("div");
    zRangeDiv.style.cssText = "display:flex;gap:4px;";
    const zMinInput = document.createElement("input");
    zMinInput.type = "number"; zMinInput.placeholder = "z min"; zMinInput.value = "0";
    zMinInput.id = "vis-section-z-min";
    compact(zMinInput);
    const zMaxInput = document.createElement("input");
    zMaxInput.type = "number"; zMaxInput.placeholder = "z max"; zMaxInput.value = "5000";
    zMaxInput.id = "vis-section-z-max";
    compact(zMaxInput);
    zRangeDiv.append(zMinInput, zMaxInput);
    appendControlRow(actionsTable.body, "zRange", zRangeDiv);

    const sectionBtn = inspectorActionButton("生成垂直剖面");
    sectionBtn.style.marginBottom = "0";
    sectionBtn.addEventListener("click", () => this.createIntersectionFromUI());
    appendControlRow(actionsTable.body, "intersection", sectionBtn);

    const wellSecBtn = inspectorActionButton("沿井生成剖面");
    wellSecBtn.style.marginBottom = "0";
    wellSecBtn.addEventListener("click", () => { void this.createWellSectionFromUI(); });
    appendControlRow(actionsTable.body, "wellSection", wellSecBtn);

    const sliceRow = document.createElement("div");
    sliceRow.style.cssText = "display:flex;gap:4px;";
    const axisSelect = document.createElement("select");
    axisSelect.id = "vis-slice-axis";
    compact(axisSelect);
    for (const axis of ["k", "i", "j"]) {
      const opt = document.createElement("option");
      opt.value = axis;
      opt.textContent = axis.toUpperCase();
      axisSelect.appendChild(opt);
    }
    const sliceIndex = document.createElement("input");
    sliceIndex.type = "number"; sliceIndex.min = "1"; sliceIndex.value = "1";
    sliceIndex.id = "vis-slice-index";
    compact(sliceIndex);
    sliceRow.append(axisSelect, sliceIndex);
    appendControlRow(actionsTable.body, "slice", sliceRow);

    const sliceBtn = inspectorActionButton("提取切片");
    sliceBtn.style.marginBottom = "0";
    sliceBtn.addEventListener("click", () => { void this.createSliceFromUI(); });
    appendControlRow(actionsTable.body, "extractSlice", sliceBtn);

    const ssBtn = inspectorActionButton("截图", { tone: "primary" });
    ssBtn.style.marginBottom = "0";
    ssBtn.addEventListener("click", () => this.captureScreenshot());
    appendControlRow(actionsTable.body, "capture", ssBtn);

    const statsBtn = inspectorActionButton("属性统计");
    statsBtn.style.marginBottom = "0";
    statsBtn.addEventListener("click", () => this.showDatasetStats());
    appendControlRow(actionsTable.body, "stats", statsBtn);

    const exportBtn = inspectorActionButton("导出属性 CSV");
    exportBtn.style.marginBottom = "0";
    exportBtn.addEventListener("click", () => this.exportDataset());
    appendControlRow(actionsTable.body, "exportCsv", exportBtn);

    const sceneExportBtn = inspectorActionButton("导出场景 JSON");
    sceneExportBtn.style.marginBottom = "0";
    sceneExportBtn.addEventListener("click", () => this.exportSceneState());
    appendControlRow(actionsTable.body, "exportScene", sceneExportBtn);

    const importFileBtn = inspectorActionButton("导入本地文件", { tone: "primary" });
    importFileBtn.addEventListener("click", () => this.fileInput?.click());
    appendControlRow(actionsTable.body, "importFile", importFileBtn);
    const importWsBtn = inspectorActionButton("从工作区导入");
    importWsBtn.addEventListener("click", () => this.openWorkspaceImport());
    appendControlRow(actionsTable.body, "importWorkspace", importWsBtn);
    const deleteBtn = inspectorActionButton("删除当前对象", { tone: "danger" });
    deleteBtn.addEventListener("click", () => {
      const dataset = this.datasetById(this.selectedObjectId || this.currentDataset?.id || "");
      if (dataset) void this.deleteCatalogDataset(dataset);
    });
    appendControlRow(actionsTable.body, "deleteObject", deleteBtn);

    const benchBtn = inspectorActionButton("运行基准测试", { tone: "primary" });
    benchBtn.addEventListener("click", () => this.runBenchmark());
    tabs.panes.addons.appendChild(this.createLabel("性能测试"));
    tabs.panes.addons.appendChild(benchBtn);
    const dispBtn = inspectorActionButton("内存泄漏测试 (10x)", { tone: "danger" });
    dispBtn.addEventListener("click", () => this.runLeakTest());
    tabs.panes.addons.appendChild(dispBtn);
    const restoreBtn = inspectorActionButton("恢复内置示例");
    restoreBtn.addEventListener("click", () => { void this.restoreBuiltinExamples(); });
    tabs.panes.addons.appendChild(this.createLabel("\u76ee\u5f55"));
    tabs.panes.addons.appendChild(restoreBtn);

    const displayTable = createControlTable();
    tabs.panes.addons.appendChild(this.createLabel("\u663e\u793a"));
    tabs.panes.addons.appendChild(displayTable.table);
    appendControlRow(displayTable.body, "axes", createBoolSwitch("vis-show-axes", true, (on) => {
      this.axesHelper.visible = on;
    }));
    appendControlRow(displayTable.body, "floorGrid", createBoolSwitch("vis-show-grid", true, (on) => {
      this.gridHelper.visible = on;
    }));
    appendControlRow(displayTable.body, "wellLabels", createBoolSwitch("vis-show-well-labels", true, (on) => {
      this.wellLabelsVisible = on;
      this.setWellLabelsVisible(on);
    }));
    appendControlRow(displayTable.body, "legend", createBoolSwitch("vis-show-legend", true, (on) => {
      this.legendEl.style.display = on && this.currentProperty ? "block" : "none";
    }));
    appendControlRow(displayTable.body, "histogram", createBoolSwitch("vis-show-histogram", true, (on) => {
      if (this.histogramEl) this.histogramEl.style.display = on && this.currentScalarValues ? "block" : "none";
    }));
    appendControlRow(displayTable.body, "wellMap", createBoolSwitch("vis-show-wellmap", true, (on) => {
      this.wellMapRoot.style.display = on ? "block" : "none";
    }));
    appendControlRow(displayTable.body, "compass", createBoolSwitch("vis-show-compass", true, (on) => {
      this.compassHud.root.style.display = on ? "flex" : "none";
    }));
    const bgInput = document.createElement("input");
    bgInput.type = "color";
    bgInput.id = "vis-bg-color";
    bgInput.value = "#0d1117";
    bgInput.style.cssText = "width:100%;height:24px;padding:0;border:1px solid #30363d;background:#161b22;";
    bgInput.addEventListener("input", () => this.setBackgroundColor(bgInput.value));
    appendControlRow(displayTable.body, "background", bgInput);

    tabs.setBadge("controls", controlsTable.body.childElementCount);
    tabs.setBadge("actions", actionsTable.body.childElementCount);
    tabs.setBadge("addons", tabs.panes.addons.childElementCount);

    const saveBtn = inspectorActionButton("Save", { tone: "primary" });
    saveBtn.style.cssText += "flex:1;margin:0;width:auto;";
    saveBtn.addEventListener("click", () => this.saveScene());
    const resetBtn = inspectorActionButton("Reset");
    resetBtn.style.cssText += "flex:1;margin:0;width:auto;";
    resetBtn.addEventListener("click", () => this.resetInspectorControls());
    const footerHint = document.createElement("div");
    footerHint.style.cssText = "color:#6e7681;font-size:10px;white-space:nowrap;";
    footerHint.textContent = "场景";
    tabs.footer.append(saveBtn, resetBtn, footerHint);
    body.appendChild(tabs.footer);

    sidebar.appendChild(body);
    this.container.appendChild(sidebar);
    return sidebar;
  }

  private buildObjectTree(): HTMLElement {
    const tree = document.createElement("div");
    Object.assign(tree.style, {
      position: "absolute", top: "0", left: "0", bottom: "0",
      width: String(LAYOUT.treeWidth) + "px", background: "rgba(13,17,23,0.96)",
      borderRight: "1px solid #30363d", overflowY: "auto",
      padding: "8px", zIndex: "90", boxSizing: "border-box",
      fontFamily: "-apple-system, sans-serif", color: "#8b949e", fontSize: "12px",
    } as CSSStyleDeclaration);
    tree.className = "oilgas-panel oilgas-object-panel";

    const collapseBtn = document.createElement("button");
    collapseBtn.type = "button";
    collapseBtn.textContent = "<";
    collapseBtn.title = "收起组件树";
    collapseBtn.setAttribute("aria-label", "收起组件树");
    Object.assign(collapseBtn.style, this.iconButtonStyle);
    collapseBtn.style.position = "absolute";
    collapseBtn.style.top = "8px";
    collapseBtn.style.right = "6px";
    collapseBtn.addEventListener("click", () => this.toggleObjectTree(collapseBtn));
    tree.appendChild(collapseBtn);

    const title = document.createElement("div");
    title.style.cssText = "font-weight:600; color:#58a6ff; margin:2px 28px 8px 2px; font-size:13px; letter-spacing:.04em;";
    title.textContent = "COMPONENTS";
    tree.appendChild(title);

    const search = document.createElement("input");
    search.type = "search";
    search.id = "vis-object-search";
    search.placeholder = "查找组件...";
    search.setAttribute("aria-label", "查找组件");
    search.style.cssText = "width:100%;box-sizing:border-box;margin-bottom:8px;padding:6px 8px;background:#161b22;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;font-size:12px;";
    search.addEventListener("input", () => {
      this.treeQuery = search.value;
      this.updateObjectTree();
    });
    tree.appendChild(search);

    const treeActions = document.createElement("div");
    treeActions.style.cssText = "display:flex;gap:6px;margin-bottom:8px;";
    const addTreeBtn = (label: string, title: string, action: () => void) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.title = title;
      btn.style.cssText = "flex:1;padding:4px 6px;background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:5px;cursor:pointer;font-size:11px;";
      btn.addEventListener("click", action);
      treeActions.appendChild(btn);
    };
    addTreeBtn("文件", "导入本地文件", () => this.fileInput?.click());
    addTreeBtn("工作区", "从工作区文件树导入", () => this.openWorkspaceImport());
    addTreeBtn("恢复", "恢复已隐藏的内置示例", () => { void this.restoreBuiltinExamples(); });
    tree.appendChild(treeActions);

    const list = document.createElement("div");
    list.id = "vis-object-list";
    list.innerHTML = '<div style="color:#484f58">加载中...</div>';
    tree.appendChild(list);

    this.container.appendChild(tree);
    return tree;
  }

  private createLabel(text: string): HTMLElement {
    const el = document.createElement("div");
    el.textContent = text;
    el.style.cssText = "margin: 14px 0 5px; padding-top: 8px; border-top: 1px solid rgba(48,54,61,.55); font-size: 11px; letter-spacing: .04em; color: #8b949e;";
    return el;
  }

  private iconButtonStyle: Partial<CSSStyleDeclaration> = {
    width: "24px", height: "24px", padding: "0", background: "#21262d",
    color: "#c9d1d9", border: "1px solid #484f58", borderRadius: "5px",
    cursor: "pointer", fontSize: "16px", lineHeight: "20px",
  };

  private toggleSidebar(button: HTMLButtonElement) {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    const width = this.sidebarCollapsed ? String(LAYOUT.inspectorCollapsed) + "px" : String(LAYOUT.inspectorWidth) + "px";
    this.sidebar.style.width = width;
    const body = this.sidebar.querySelector("#vis-inspector-body") as HTMLElement | null;
    if (body) body.style.display = this.sidebarCollapsed ? "none" : "flex";
    button.style.display = "block";
    button.textContent = this.sidebarCollapsed ? "<" : ">";
    button.title = this.sidebarCollapsed ? "展开属性面板" : "收起属性面板";
    button.setAttribute("aria-label", button.title);
    this.updatePanelOffsets();
  }

  private toggleObjectTree(button: HTMLButtonElement) {
    this.objectTreeCollapsed = !this.objectTreeCollapsed;
    const width = this.objectTreeCollapsed ? String(LAYOUT.treeCollapsed) + "px" : String(LAYOUT.treeWidth) + "px";
    this.objectTree.style.width = width;
    this.objectTree.style.padding = this.objectTreeCollapsed ? "0" : "8px";
    for (const child of Array.from(this.objectTree.children)) {
      if (child !== button) (child as HTMLElement).style.display = this.objectTreeCollapsed ? "none" : "";
    }
    button.style.display = "block";
    button.style.right = this.objectTreeCollapsed ? "5px" : "6px";
    button.textContent = this.objectTreeCollapsed ? ">" : "<";
    button.title = this.objectTreeCollapsed ? "展开组件树" : "收起组件树";
    button.setAttribute("aria-label", button.title);
    this.updatePanelOffsets();
  }

  private updatePanelOffsets() {
    applyChromeOffsets({
      tree: this.objectTree,
      inspector: this.sidebar,
      toolbar: this.toolbarEl,
      tabs: this.container.querySelector<HTMLElement>(".oilgas-view-tabs"),
      info: this.infoEl,
      hud: this.hudEl,
      readout: this.readoutEl,
      wellMap: this.wellMapRoot,
      legend: this.legendEl,
      histogram: this.histogramEl,
      details: this.detailsEl,
      wellLog: this.wellLogEl,
      slicePlayer: this.slicePlayer?.root,
      compass: this.compassHud?.root,
      viewCluster: this.viewClusterEl,
      shortcuts: this.shortcutsEl,
      treeCollapsed: this.objectTreeCollapsed,
      inspectorCollapsed: this.sidebarCollapsed,
    });
  }

  private buildToolbar(): HTMLElement {
    const toolbar = document.createElement("div");
    Object.assign(toolbar.style, {
      position: "absolute", top: "8px", left: "276px", right: "288px", height: "34px",
      display: "flex", alignItems: "center", gap: "6px", padding: "4px 8px",
      background: "rgba(13,17,23,.78)", border: "1px solid #30363d", borderRadius: "7px",
      zIndex: "20", pointerEvents: "none", boxSizing: "border-box",
    } as CSSStyleDeclaration);
    toolbar.className = "oilgas-toolbar";
    const label = document.createElement("span");
    label.textContent = "场景";
    label.style.cssText = "font-size:11px;color:#8b949e;margin-right:4px;";
    toolbar.appendChild(label);
    const addButton = (text: string, title: string, action: () => void) => {
      const btn = document.createElement("button");
      btn.type = "button"; btn.textContent = text; btn.title = title; btn.setAttribute("aria-label", title);
      Object.assign(btn.style, { ...this.iconButtonStyle, width: "auto", padding: "0 8px", fontSize: "11px", pointerEvents: "auto" });
      btn.addEventListener("click", action); toolbar.appendChild(btn);
    };
    addButton("导入", "导入本地油气文件", () => this.fileInput?.click());
    addButton("工作区", "从项目或 Agent 工作区导入", () => this.openWorkspaceImport());
    addButton("适配", "适配当前数据", () => this.fitView());
    addButton("顶视", "顶视 (Alt+T)", () => this.applyNamedView("top"));
    addButton("重置", "重置视图", () => this.resetView());
    addButton("存视角", "保存用户视角", () => this.storeUserView());
    addButton("用视角", "恢复用户视角", () => this.recallUserView());
    addButton("撤销", "撤销上一次筛选", () => this.undoFilter());
    addButton("重做", "重做筛选", () => this.redoFilter());
    addButton("保存", "保存当前场景", () => this.saveScene());
    addButton("恢复", "恢复已保存场景", () => { void this.restoreScene(); });
    addButton("隐藏", "隐藏当前对象", () => { if (this.mesh) this.mesh.visible = false; });
    addButton("显示", "显示当前对象", () => { if (this.mesh) this.mesh.visible = true; });
    addButton("测距", "测量两点之间的三维距离", () => {
      this.measureMode = !this.measureMode;
      this.measurePoints = [];
      this.infoEl.textContent = this.measureMode ? "测距模式：依次点击两个点" : "已退出测距模式";
    });
    addButton("对象", "切换组件树", () => {
      const btn = this.objectTree.querySelector("button") as HTMLButtonElement | null;
      if (btn) this.toggleObjectTree(btn);
    });
    const spacer = document.createElement("span"); spacer.style.flex = "1"; toolbar.appendChild(spacer);
    const hint = document.createElement("span"); hint.textContent = "拖拽旋转 · 滚轮缩放 · 点击拾取 · 悬停读数";
    hint.style.cssText = "font-size:11px;color:#8b949e;white-space:nowrap;"; toolbar.appendChild(hint);
    this.container.appendChild(toolbar);
    return toolbar;
  }

  private fitView() {
    const box = this.worldModelBox();
    if (box) {
      this.frameBox(box);
      return;
    }
    if (!this.geometry) return;
    this.geometry.computeBoundingBox();
    const local = this.geometry.boundingBox;
    if (!local) return;
    this.frameBox(local);
  }

  private worldModelBox(): THREE.Box3 | null {
    const box = new THREE.Box3();
    let any = false;
    if (this.mesh?.visible) {
      box.expandByObject(this.mesh);
      any = true;
    }
    for (const overlay of this.overlayMeshes.values()) {
      if (!overlay.visible) continue;
      box.expandByObject(overlay);
      any = true;
    }
    return any && !box.isEmpty() ? box : null;
  }

  private viewportAspect(): number {
    return Math.max(this.container.clientWidth / Math.max(this.container.clientHeight, 1), 0.2);
  }

  private applyCameraProjection() {
    const aspect = this.viewportAspect();
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
      return;
    }
    applyOrthographicFrustum(
      this.camera,
      Math.max(this.camera.position.distanceTo(this.controls.target), 1),
      aspect,
    );
  }

  private frameBox(box: THREE.Box3, view: NamedView = "iso") {
    const center = box.getCenter(new THREE.Vector3());
    const distance = viewDistanceForBox(box, this.viewportAspect(), this.perspectiveCamera.fov);
    const pose = namedViewPose(view, center, distance);
    this.camera.up.copy(pose.up);
    this.camera.position.copy(pose.position);
    this.controls.target.copy(center);
    this.applyCameraProjection();
    this.controls.update();
  }

  private resetView() {
    this.fitView();
    this.resetInspectorControls();
  }

  private resetInspectorControls() {
    this.resetFilters();
    this.applyOpacity(0.85);
    const wireframe = this.sidebar.querySelector("#vis-wireframe") as HTMLInputElement | null;
    if (wireframe) {
      wireframe.checked = false;
      wireframe.dispatchEvent(new Event("change"));
    }
    const clip = this.sidebar.querySelector("#vis-clip") as HTMLInputElement | null;
    if (clip) {
      clip.checked = false;
      clip.dispatchEvent(new Event("change"));
    }
    const isolate = this.sidebar.querySelector("#vis-isolate-k") as HTMLInputElement | null;
    if (isolate) {
      isolate.checked = false;
      isolate.dispatchEvent(new Event("change"));
    }
    this.currentColormap = "viridis";
    const select = this.sidebar.querySelector("#vis-colormap") as HTMLSelectElement | null;
    if (select) select.value = this.currentColormap;
    void this.reloadPropertyColors();
    this.infoEl.textContent = "已重置显示与过滤";
  }

  private filterStateSnapshot(): string {
    const value = (selector: string) => (this.sidebar.querySelector(selector) as HTMLInputElement | null)?.value || "";
    return JSON.stringify({
      i: value("#vis-filter-i"), j: value("#vis-filter-j"), k: value("#vis-filter-k"),
      min: value("#vis-filter-prop-min"), max: value("#vis-filter-prop-max"),
      exclude: this.filterPropertyExclude,
      bounds: this.filterBounds,
    });
  }

  private restoreFilterSnapshot(snapshot: string) {
    const state = JSON.parse(snapshot) as {
      i?: string; j?: string; k?: string; min?: string; max?: string;
      exclude?: boolean; bounds?: number[] | null;
    };
    const fields: Record<string, string> = {
      "#vis-filter-i": state.i || "", "#vis-filter-j": state.j || "", "#vis-filter-k": state.k || "",
      "#vis-filter-prop-min": state.min || "", "#vis-filter-prop-max": state.max || "",
    };
    for (const [selector, value] of Object.entries(fields)) {
      const input = this.sidebar.querySelector(selector) as HTMLInputElement | null;
      if (input) input.value = value;
    }
    this.filterPropertyExclude = Boolean(state.exclude);
    const exclude = this.sidebar.querySelector("#vis-filter-prop-exclude") as HTMLInputElement | null;
    if (exclude) {
      exclude.checked = this.filterPropertyExclude;
      exclude.dispatchEvent(new Event("ugsci-sync"));
    }
    this.filterBounds = Array.isArray(state.bounds) && state.bounds.length === 6
      ? state.bounds as [number, number, number, number, number, number]
      : null;
  }

  private undoFilter() {
    if (!this.filterUndoStack.length) return;
    this.filterRedoStack.push(this.filterStateSnapshot());
    const snapshot = this.filterUndoStack.pop()!;
    this.restoringScene = true;
    this.restoreFilterSnapshot(snapshot);
    this.lastFilterState = snapshot;
    this.applyFilters();
    this.restoringScene = false;
  }

  private redoFilter() {
    if (!this.filterRedoStack.length) return;
    this.filterUndoStack.push(this.filterStateSnapshot());
    const snapshot = this.filterRedoStack.pop()!;
    this.restoringScene = true;
    this.restoreFilterSnapshot(snapshot);
    this.lastFilterState = snapshot;
    this.applyFilters();
    this.restoringScene = false;
  }

  private saveScene() {
    if (!this.currentDataset) return;
    const scene = {
      datasetId: this.currentDataset.id,
      property: this.currentProperty,
      colormap: this.currentColormap,
      opacity: this.opacity,
      wireframe: this.wireframe,
      timeStep: this.currentTimeStep,
      filters: this.filterStateSnapshot(),
      overlays: Array.from(this.overlayMeshes.entries())
        .filter(([, object]) => object.visible)
        .map(([datasetId]) => datasetId),
      zScale: this.zScale,
      ortho: this.useOrtho,
      camera: {
        position: this.camera.position.toArray(),
        target: this.controls.target.toArray(),
        up: this.camera.up.toArray(),
      },
    };
    localStorage.setItem("ugsci.visualization.scene", JSON.stringify(scene));
    this.infoEl.textContent = "场景已保存";
  }

  private async restoreScene() {
    const raw = localStorage.getItem("ugsci.visualization.scene");
    if (!raw) {
      this.infoEl.textContent = "没有已保存场景";
      return;
    }
    try {
      const scene = JSON.parse(raw);
      this.restoringScene = true;
      if (scene.datasetId) await this.loadDataset(String(scene.datasetId));
      if (scene.property) await this.executeCommand("set-property", { property: scene.property });
      if (scene.colormap) await this.executeCommand("set-colormap", { colormap: scene.colormap });
      if (Number.isFinite(scene.opacity)) await this.executeCommand("set-opacity", { opacity: scene.opacity });
      if (typeof scene.wireframe === "boolean") await this.executeCommand("set-wireframe", { enabled: scene.wireframe });
      if (Number.isInteger(scene.timeStep)) await this.executeCommand("set-timestep", { timeStep: scene.timeStep });
      if (scene.filters) {
        this.restoreFilterSnapshot(scene.filters);
        this.lastFilterState = scene.filters;
        this.applyFilters();
      }
      if (Array.isArray(scene.overlays) && this.manifest) {
        for (const datasetId of scene.overlays) {
          const dataset = this.manifest.datasets.find((item) => item.id === datasetId);
          if (dataset && dataset.id !== this.currentDataset?.id) await this.toggleDatasetVisibility(dataset, true);
        }
      }
      if (Number.isFinite(scene.zScale)) this.setZScale(Number(scene.zScale));
      if (typeof scene.ortho === "boolean") this.setOrthographic(scene.ortho);
      if (Array.isArray(scene.camera?.position) && scene.camera.position.length === 3) this.camera.position.fromArray(scene.camera.position);
      if (Array.isArray(scene.camera?.target) && scene.camera.target.length === 3) this.controls.target.fromArray(scene.camera.target);
      if (Array.isArray(scene.camera?.up) && scene.camera.up.length === 3) this.camera.up.fromArray(scene.camera.up);
      this.controls.update();
      this.infoEl.textContent = "场景已恢复";
    } catch (err) {
      this.showDetails(`场景恢复失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      this.restoringScene = false;
    }
  }

  private exportSceneState() {
    if (!this.currentDataset) return;
    const state = {
      schema: "qwenpaw.oilgas-scene.v1",
      exportedAt: new Date().toISOString(),
      datasetId: this.currentDataset.id,
      property: this.currentProperty,
      colormap: this.currentColormap,
      opacity: this.opacity,
      wireframe: this.wireframe,
      timeStep: this.currentTimeStep,
      filters: JSON.parse(this.filterStateSnapshot()),
      overlays: Array.from(this.overlayMeshes.entries())
        .filter(([, object]) => object.visible)
        .map(([datasetId]) => datasetId),
      zScale: this.zScale,
      ortho: this.useOrtho,
      camera: {
        position: this.camera.position.toArray(),
        target: this.controls.target.toArray(),
        up: this.camera.up.toArray(),
      },
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${this.currentDataset.id}.oilgas-scene.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.infoEl.textContent = "场景 JSON 已导出";
  }

  private selectStyle: Partial<CSSStyleDeclaration> = {
    width: "100%", padding: "6px 8px", background: "#161b22",
    border: "1px solid #30363d", borderRadius: "6px", color: "#c9d1d9",
    fontSize: "13px", marginBottom: "4px", cursor: "pointer",
  };

  private buildHud(): HTMLElement {
    const hud = document.createElement("div");
    Object.assign(hud.style, {
      position: "absolute", top: "88px", right: "288px",
      background: "rgba(22,27,34,0.85)", border: "1px solid #30363d",
      borderRadius: "8px", padding: "8px 12px", fontSize: "11px",
      fontFamily: "monospace", pointerEvents: "none", zIndex: "10", minWidth: "148px",
    });
    for (const label of ["FPS", "Frame", "Draw Calls", "Triangles", "JS Heap"]) {
      const row = document.createElement("div");
      row.style.cssText = "display: flex; justify-content: space-between; gap: 16px; margin: 2px 0;";
      const lbl = document.createElement("span");
      lbl.textContent = label; lbl.style.color = "#8b949e";
      const val = document.createElement("span");
      val.textContent = "—"; val.style.color = "#58a6ff"; val.style.fontWeight = "600";
      val.dataset.metric = label;
      row.appendChild(lbl); row.appendChild(val);
      hud.appendChild(row);
    }
    this.container.appendChild(hud);
    return hud;
  }

  private buildReadout(): HTMLElement {
    const el = createReadoutPanel();
    this.container.appendChild(el);
    return el;
  }

  private buildInfoBar(): HTMLElement {
    const el = document.createElement("div");
    Object.assign(el.style, {
      position: "absolute", bottom: "8px", left: "8px",
      background: "rgba(22,27,34,0.85)", border: "1px solid #30363d",
      borderRadius: "8px", padding: "8px 12px", fontSize: "12px",
      fontFamily: "monospace", color: "#8b949e", pointerEvents: "none",
      maxWidth: "500px", zIndex: "10",
    });
    el.textContent = "加载中...";
    this.container.appendChild(el);
    return el;
  }

  private buildDetailsPanel(): HTMLElement {
    const el = document.createElement("div");
    Object.assign(el.style, {
      position: "absolute", right: "8px", bottom: "8px", width: "270px",
      maxHeight: "260px", overflowY: "auto", display: "none",
      background: "rgba(13,17,23,0.94)", border: "1px solid #30363d",
      borderRadius: "8px", padding: "10px", fontSize: "12px", lineHeight: "1.5",
      color: "#c9d1d9", zIndex: "12", whiteSpace: "pre-wrap",
    } as CSSStyleDeclaration);
    this.container.appendChild(el);
    return el;
  }

  private buildLegend(): HTMLElement {
    const el = document.createElement("div");
    Object.assign(el.style, {
      position: "absolute", right: "8px", bottom: "278px", width: "178px",
      padding: "9px 10px", background: "rgba(13,17,23,.88)", border: "1px solid #30363d",
      borderRadius: "7px", zIndex: "11", color: "#c9d1d9", fontSize: "11px",
      pointerEvents: "auto", cursor: "pointer", boxSizing: "border-box",
    } as CSSStyleDeclaration);
    el.title = "\u70b9\u51fb\u7f16\u8f91\u5c5e\u6027\u8303\u56f4";
    el.addEventListener("click", () => {
      const minInput = this.sidebar.querySelector("#vis-filter-prop-min") as HTMLInputElement | null;
      minInput?.focus();
    });
    const title = document.createElement("div");
    title.dataset.legendTitle = "true";
    title.style.cssText = "display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#c9d1d9;font-weight:600;";
    el.appendChild(title);
    const gradient = document.createElement("div");
    gradient.dataset.legendGradient = "true";
    gradient.style.cssText = "height:8px;border-radius:4px;background:linear-gradient(90deg,#440154,#31688e,#35b779,#fde725);";
    el.appendChild(gradient);
    const range = document.createElement("div");
    range.dataset.legendRange = "true";
    range.style.cssText = "display:flex;justify-content:space-between;margin-top:4px;color:#8b949e;font-family:monospace;";
    el.appendChild(range);
    this.container.appendChild(el);
    this.updateLegend();
    return el;
  }

  private updateLegend() {
    if (!this.legendEl) return;
    const title = this.legendEl.querySelector("[data-legend-title]");
    const range = this.legendEl.querySelector("[data-legend-range]");
    if (title) title.textContent = `${this.currentProperty || "统一颜色"} · ${this.currentColormap}`;
    if (range) range.textContent = `${this.scalarMin.toPrecision(4)}  —  ${this.scalarMax.toPrecision(4)}`;
    const gradient = this.legendEl.querySelector("[data-legend-gradient]") as HTMLElement | null;
    if (gradient) gradient.style.background = colormapCssGradient(this.currentColormap);
    this.legendEl.style.display = this.currentProperty && this.legendVisible() ? "block" : "none";
    this.renderHistogram();
  }

  private legendVisible(): boolean {
    return (this.sidebar.querySelector("#vis-show-legend") as HTMLInputElement | null)?.checked !== false;
  }

  private histogramVisible(): boolean {
    return (this.sidebar.querySelector("#vis-show-histogram") as HTMLInputElement | null)?.checked !== false;
  }

  private buildHistogram(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 72;
    Object.assign(canvas.style, {
      position: "absolute", right: "12px", bottom: "92px", width: "160px", height: "56px",
      background: "rgba(13,17,23,.82)", border: "1px solid #30363d", borderRadius: "6px", zIndex: "12",
    } as CSSStyleDeclaration);
    canvas.title = "\u70b9\u51fb\u8bbe\u6700\u5c0f\u503c\uff0cShift+\u70b9\u51fb\u8bbe\u6700\u5927\u503c\uff0c\u53cc\u51fb\u6e05\u9664";
    canvas.addEventListener("click", (event) => this.onHistogramClick(event));
    canvas.addEventListener("dblclick", () => {
      const minInput = this.sidebar.querySelector("#vis-filter-prop-min") as HTMLInputElement | null;
      const maxInput = this.sidebar.querySelector("#vis-filter-prop-max") as HTMLInputElement | null;
      if (minInput) minInput.value = "";
      if (maxInput) maxInput.value = "";
      this.applyFilters();
    });
    this.container.appendChild(canvas);
    return canvas;
  }

  private buildWellLogPanel(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 360;
    canvas.height = 720;
    Object.assign(canvas.style, {
      position: "absolute", top: "88px", right: "12px", bottom: "16px", width: "280px",
      background: "rgba(13,17,23,.94)", border: "1px solid #30363d", borderRadius: "8px",
      zIndex: "25", display: "none",
    } as CSSStyleDeclaration);
    canvas.title = "测井曲线";
    this.container.appendChild(canvas);
    return canvas;
  }

  private renderHistogram() {
    const canvas = this.histogramEl;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const values = this.currentScalarValues;
    if (!values || values.length < 2) {
      canvas.style.display = "none";
      return;
    }
    canvas.style.display = this.histogramVisible() ? "block" : "none";
    const bins = 24;
    const counts = new Array(bins).fill(0);
    const min = this.scalarMin;
    const max = this.scalarMax;
    const span = max - min || 1;
    for (const value of values) {
      if (!Number.isFinite(value)) continue;
      const slot = Math.min(bins - 1, Math.max(0, Math.floor(((value - min) / span) * bins)));
      counts[slot] += 1;
    }
    const peak = Math.max(...counts, 1);
    for (let index = 0; index < bins; index++) {
      const [r, g, b] = colormap(this.currentColormap, (index + 0.5) / bins);
      ctx.fillStyle = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
      const height = (counts[index] / peak) * (canvas.height - 8);
      ctx.fillRect(index * (canvas.width / bins), canvas.height - height, canvas.width / bins - 1, height);
    }
  }

  private renderWellLog() {
    const canvas = this.wellLogEl;
    if (!canvas || !this.currentDataset) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#58a6ff";
    ctx.font = "14px sans-serif";
    ctx.fillText(this.currentDataset.name, 12, 22);
    const scalars = this.currentDataset.files.scalars || {};
    const names = Object.keys(scalars).slice(0, 4);
    if (!this.currentScalarValues || names.length === 0) {
      ctx.fillStyle = "#8b949e";
      ctx.fillText("当前数据集没有测井曲线", 12, 48);
      return;
    }
    const depths = this.geometry?.getAttribute("position");
    const n = this.currentScalarValues.length;
    const padTop = 40;
    const padBottom = 20;
    const trackHeight = height - padTop - padBottom;
    const trackWidth = (width - 20) / Math.max(names.length, 1);
    ctx.strokeStyle = "#30363d";
    for (let track = 0; track < names.length; track++) {
      const x0 = 10 + track * trackWidth;
      ctx.strokeRect(x0, padTop, trackWidth - 8, trackHeight);
      ctx.fillStyle = "#8b949e";
      ctx.font = "11px sans-serif";
      ctx.fillText(names[track], x0 + 4, padTop - 8);
    }
    const min = this.scalarMin;
    const span = (this.scalarMax - this.scalarMin) || 1;
    ctx.strokeStyle = "#58a6ff";
    ctx.beginPath();
    for (let index = 0; index < n; index++) {
      const t = n <= 1 ? 0 : index / (n - 1);
      const y = padTop + t * trackHeight;
      const x = 14 + ((this.currentScalarValues[index] - min) / span) * (trackWidth - 16);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (depths) {
      ctx.fillStyle = "#8b949e";
      ctx.font = "10px monospace";
      const top = Math.abs(depths.getZ(0) + this.origin[2]);
      const bottom = Math.abs(depths.getZ(Math.max(0, depths.count - 1)) + this.origin[2]);
      ctx.fillText(`${top.toFixed(1)}`, 12, padTop + 10);
      ctx.fillText(`${bottom.toFixed(1)}`, 12, height - 8);
    }
  }

  private applyClipPlane(enabled: boolean, fraction: number) {
    if (!this.geometry?.boundingBox || !this.mesh) return;
    const box = this.geometry.boundingBox;
    const z = box.min.z + (box.max.z - box.min.z) * (1 - Math.min(1, Math.max(0, fraction)));
    this.clipPlane.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, z),
    );
    this.renderer.localClippingEnabled = enabled;
    const material = (this.mesh as THREE.Mesh).material as THREE.MeshPhongMaterial | undefined;
    if (material && "clippingPlanes" in material) {
      material.clippingPlanes = enabled ? [this.clipPlane] : [];
      material.needsUpdate = true;
    }
  }

  private overlaySources(view: string): string[] {
    if (view === "wellbore" || view === "welllog") return ["wellbore", "las", "dlis"];
    if (view === "intersection") return ["intersection", "well-intersection", "slice", "surface"];
    if (view === "network") return ["network", "network-tube"];
    return [];
  }

  private async applyActiveView(view: ReturnType<ViewRouter["getActiveView"]>) {
    viewerStore.setActiveView(view);
    this.infoEl.textContent = `当前视图: ${ViewRouter.VIEW_LABELS[view]}`;
    if (this.wellLogEl) this.wellLogEl.style.display = view === "welllog" ? "block" : "none";
    if (this.wellMapRoot) this.wellMapRoot.style.display = view === "welllog" ? "none" : "block";
    if (!this.manifest) return;
    const sourceOf = (dataset: DatasetInfo) => dataset.source || "";
    const pickFirst = (sources: string[]) => this.manifest!.datasets.find((item) => sources.includes(sourceOf(item)));
    const current = this.currentDataset?.source || "";
    if (view === "reservoir") {
      const grid = this.manifest.datasets.find((item) => !this.overlaySources("wellbore").concat(this.overlaySources("intersection"), this.overlaySources("network"), ["surface"]).includes(sourceOf(item)));
      if (grid && grid.id !== this.currentDataset?.id) await this.loadDataset(grid.id);
    } else if (view === "wellbore") {
      if (!(this.currentDataset && isSpatialWell(this.currentDataset))) {
        const well = this.manifest.datasets.find(isSpatialWell);
        if (well) await this.loadDataset(well.id);
        else this.infoEl.textContent = "没有空间井轨迹。测井曲线请用「测井」页签；LAS 不会画在原点。";
      }
    } else if (view === "intersection") {
      if (!["intersection", "well-intersection", "slice"].includes(current)) {
        const section = pickFirst(["intersection", "well-intersection", "slice"]);
        if (section) await this.loadDataset(section.id);
        else this.infoEl.textContent = "没有剖面。请生成垂直剖面、井剖面或 IJK 切片。";
      }
    } else if (view === "welllog") {
      const log = pickFirst(["las", "dlis"]);
      if (log && log.id !== this.currentDataset?.id) await this.loadDataset(log.id);
      this.renderWellLog();
      if (!log) this.infoEl.textContent = "没有测井曲线。请导入 LAS/DLIS 文件。";
    } else if (view === "network") {
      if (!["network", "network-tube"].includes(current)) {
        const net = pickFirst(["network", "network-tube"]);
        if (net) await this.loadDataset(net.id);
        else this.infoEl.textContent = "没有管网数据。请导入 CSV/JSON 管网。";
      }
    }
  }

  private firstWellDataset(): DatasetInfo | undefined {
    return this.manifest?.datasets.find(isSpatialWell);
  }

  private async createWellSectionFromUI() {
    if (!this.currentDataset) return;
    const well = isSpatialWell(this.currentDataset)
      ? this.currentDataset
      : this.firstWellDataset();
    if (!well) {
      this.showDetails("没有空间井轨迹，无法生成井剖面。仅深度测井不能用来切三维剖面。");
      return;
    }
    const grid = this.manifest?.datasets.find((item) => ["cmg", "egrid", "roff", "eclipse"].includes(item.source || "") || item.grid_dims)
      || this.currentDataset;
    try {
      const response = await fetch(
        `${this.apiBase}/datasets/${encodeURIComponent(grid.id)}/well-sections`,
        {
          method: "POST",
          headers: { ...this.authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            well_dataset_id: well.id,
            offset: 50,
            property: this.currentProperty,
            name: `wellsec_${Date.now()}`,
          }),
        },
      );
      if (!response.ok) {
        this.showDetails(`井剖面生成失败: HTTP ${response.status}`);
        return;
      }
      const result = await response.json();
      this.manifest = await this.fetchJson("/manifest");
      this.updateObjectTree();
      await this.loadDataset(result.id);
      this.viewRouter.switchTo("intersection");
      this.showDetails(`井剖面已生成：${result.name}`);
    } catch (err) {
      this.showDetails(`井剖面生成失败：${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private async createSliceFromUI() {
    if (!this.currentDataset) return;
    const axis = (this.sidebar.querySelector("#vis-slice-axis") as HTMLSelectElement)?.value || "k";
    const index = Number((this.sidebar.querySelector("#vis-slice-index") as HTMLInputElement)?.value || 1);
    try {
      const response = await fetch(
        `${this.apiBase}/datasets/${encodeURIComponent(this.currentDataset.id)}/slices`,
        {
          method: "POST",
          headers: { ...this.authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            axis, index, property: this.currentProperty, name: `slice_${axis}${index}_${Date.now()}`,
          }),
        },
      );
      if (!response.ok) {
        this.showDetails(`切片生成失败: HTTP ${response.status}`);
        return;
      }
      const result = await response.json();
      this.manifest = await this.fetchJson("/manifest");
      this.updateObjectTree();
      await this.loadDataset(result.id);
      this.viewRouter.switchTo("intersection");
      this.showDetails(`切片已生成：${result.name}`);
    } catch (err) {
      this.showDetails(`切片生成失败：${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private showDetails(text: string) {
    this.detailsEl.textContent = text;
    this.detailsEl.style.display = "block";
  }

  private async showDatasetStats() {
    if (!this.currentDataset || !this.currentProperty) {
      this.showDetails("当前数据集没有可统计属性");
      return;
    }
    try {
      const stats = await this.fetchJson(
        `/datasets/${encodeURIComponent(this.currentDataset.id)}/stats?property=${encodeURIComponent(this.currentProperty)}`,
      );
      this.showDetails([
        `属性统计 · ${stats.property}`,
        `样本数: ${Number(stats.count).toLocaleString()}`,
        `最小值: ${Number(stats.min).toPrecision(6)}`,
        `P10: ${Number(stats.p10).toPrecision(6)}`,
        `中位数: ${Number(stats.p50).toPrecision(6)}`,
        `平均值: ${Number(stats.mean).toPrecision(6)}`,
        `P90: ${Number(stats.p90).toPrecision(6)}`,
        `最大值: ${Number(stats.max).toPrecision(6)}`,
      ].join("\n"));
    } catch (err) {
      this.showDetails(`统计失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private async exportDataset() {
    if (!this.currentDataset) return;
    const url = `${this.apiBase}/datasets/${encodeURIComponent(this.currentDataset.id)}/export?format=csv`;
    const response = await fetch(url, { headers: this.authHeaders() });
    if (!response.ok) {
      this.showDetails(`导出失败: HTTP ${response.status}`);
      return;
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${this.currentDataset.id}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    this.showDetails("属性 CSV 已导出");
  }

  private async createIntersectionFromUI() {
    if (!this.currentDataset) return;
    const input = this.sidebar.querySelector("#vis-polyline") as HTMLInputElement;
    const zMin = Number((this.sidebar.querySelector("#vis-section-z-min") as HTMLInputElement)?.value || 0);
    const zMax = Number((this.sidebar.querySelector("#vis-section-z-max") as HTMLInputElement)?.value || 5000);
    const points = (input?.value || "").split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
      const [x, y] = part.split(",").map(Number);
      return [x, y] as [number, number];
    });
    if (points.length < 2 || points.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y)) || !Number.isFinite(zMin) || !Number.isFinite(zMax) || zMax <= zMin) {
      this.showDetails("剖面参数无效：至少需要两个 x,y 点，且 z max > z min");
      return;
    }
    try {
      const response = await fetch(
        `${this.apiBase}/datasets/${encodeURIComponent(this.currentDataset.id)}/intersections`,
        {
          method: "POST", headers: { ...this.authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            polyline_x: points.map(([x]) => x), polyline_y: points.map(([, y]) => y),
            z_min: zMin, z_max: zMax, name: `section_${Date.now()}`,
            property: this.currentProperty,
          }),
        },
      );
      if (!response.ok) {
        this.showDetails(`剖面生成失败: HTTP ${response.status}`);
        return;
      }
      const result = await response.json();
      this.manifest = await this.fetchJson("/manifest");
      this.updateObjectTree();
      this.showDetails(`剖面已生成：${result.name}`);
      await this.loadDataset(result.id);
      this.viewRouter.switchTo("intersection");
    } catch (err) {
      this.showDetails(`剖面生成失败：${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ─── Data loading ──────────────────────────────────────────────────

  private async init() {
    try {
      await this.refreshCatalog();
    } catch (err) {
      this.infoEl.textContent = `加载失败: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  private syncDatasetSelect() {
    const dsSelect = this.sidebar.querySelector("#vis-dataset") as HTMLSelectElement;
    if (!dsSelect || !this.manifest) return;
    const previous = dsSelect.value;
    dsSelect.innerHTML = "";
    for (const ds of this.manifest.datasets) {
      const opt = document.createElement("option");
      opt.value = ds.id;
      opt.textContent = `${ds.name} (${ds.n_cells.toLocaleString()} cells)`;
      dsSelect.appendChild(opt);
    }
    if (this.manifest.datasets.some((item) => item.id === previous)) {
      dsSelect.value = previous;
    }
  }

  private preferredDatasetId(): string | null {
    if (!this.manifest || this.manifest.datasets.length === 0) return null;
    const preferred = this.manifest.datasets.find((item) =>
      isGridDataset(item) && Object.keys(item.files.scalars || {}).length > 0,
    ) || this.manifest.datasets.find(isGridDataset) || this.manifest.datasets.find((item) =>
      !["intersection", "well-intersection"].includes(item.source || "") &&
      !isDepthOnlyWell(item) &&
      Object.keys(item.files.scalars || {}).length > 0,
    ) || this.manifest.datasets[0];
    return preferred.id;
  }

  private async refreshCatalog(preferredId?: string) {
    this.manifest = await this.fetchJson("/manifest");
    this.syncDatasetSelect();
    this.updateObjectTree();
    const datasets = this.manifest?.datasets || [];
    if (datasets.length === 0) {
      this.clearSceneForEmptyCatalog();
      this.infoEl.textContent = "场景为空。可用工具栏「导入」或从工作区选择文件。";
      return;
    }
    const requested = preferredId && datasets.some((item) => item.id === preferredId)
      ? preferredId
      : null;
    if (requested) {
      await this.loadDataset(requested);
      return;
    }
    if (this.currentDataset && datasets.some((item) => item.id === this.currentDataset?.id)) {
      return;
    }
    const next = this.preferredDatasetId();
    if (next) await this.loadDataset(next);
  }

  private clearSceneForEmptyCatalog() {
    this.currentDataset = null;
    this.selectedObjectId = null;
    this.disposeCurrentMesh();
    this.clearOverlays();
    viewerStore.setDataset(null);
    this.updateObjectTree();
  }

  private importDialogHost(): ImportDialogHost {
    return {
      apiBase: this.apiBase,
      authToken: this.authToken,
      container: this.container,
      onStatus: (message) => {
        this.infoEl.textContent = message;
      },
      onImported: async (datasetId) => {
        this.infoEl.textContent = "导入完成，正在加载三维场景";
        await this.refreshCatalog(datasetId);
      },
    };
  }

  private openWorkspaceImport() {
    openWorkspacePicker(this.importDialogHost());
  }

  private async handlePickedFiles(files: File[]) {
    if (this.importBusy) {
      this.infoEl.textContent = "已有导入任务进行中";
      return;
    }
    this.importBusy = true;
    try {
      await importLocalFiles(this.importDialogHost(), files);
    } catch (error) {
      this.infoEl.textContent = error instanceof Error ? error.message : String(error);
    } finally {
      this.importBusy = false;
    }
  }

  private async deleteCatalogDataset(dataset: DatasetInfo) {
    const managed = Boolean(dataset.metadata && dataset.metadata.managed);
    const confirmed = window.confirm(
      managed
        ? `删除「${dataset.name}」及其缓存文件？此操作不可恢复。`
        : `从场景移除「${dataset.name}」？内置示例可在组件树「恢复」或 Addons 中重新显示。`,
    );
    if (!confirmed) return;
    try {
      const response = await fetch(
        `${this.apiBase}/datasets/${encodeURIComponent(dataset.id)}`,
        { method: "DELETE", headers: this.authHeaders() },
      );
      if (!response.ok) throw new Error(`删除失败: HTTP ${response.status}`);
      const result = await response.json();
      this.infoEl.textContent = result.status === "removed"
        ? `已删除 ${dataset.name}`
        : `已从场景移除 ${dataset.name}（示例文件仍保留，可恢复）`;
      if (this.currentDataset?.id === dataset.id) this.currentDataset = null;
      if (this.selectedObjectId === dataset.id) this.selectedObjectId = null;
      const overlay = this.overlayMeshes.get(dataset.id);
      if (overlay) {
        this.disposeObject3D(overlay);
        this.overlayMeshes.delete(dataset.id);
      }
      await this.refreshCatalog();
    } catch (error) {
      this.infoEl.textContent = error instanceof Error ? error.message : String(error);
    }
  }

  private async restoreBuiltinExamples() {
    try {
      const response = await fetch(`${this.apiBase}/catalog/restore-examples`, {
        method: "POST",
        headers: this.authHeaders(),
      });
      if (!response.ok) throw new Error(`恢复失败: HTTP ${response.status}`);
      const result = await response.json();
      await this.refreshCatalog();
      this.infoEl.textContent = result.count
        ? `已恢复 ${result.count} 个内置示例`
        : "没有已隐藏的内置示例";
    } catch (error) {
      this.infoEl.textContent = error instanceof Error ? error.message : String(error);
    }
  }

  private onViewerKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
    if (event.key === "Escape") {
      hideShortcutsOverlay(this.shortcutsEl);
      this.container.querySelectorAll(".oilgas-context-menu").forEach((node) => node.remove());
      return;
    }
    if (event.key === "?" || (event.shiftKey && event.key === "/")) {
      event.preventDefault();
      toggleShortcutsOverlay(this.shortcutsEl);
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      const dataset = this.datasetById(this.selectedObjectId || this.currentDataset?.id || "");
      if (!dataset) return;
      event.preventDefault();
      void this.deleteCatalogDataset(dataset);
      return;
    }
    const key = event.key.toLowerCase();
    if (event.altKey) {
      const named: Record<string, NamedView> = {
        t: "top", b: "bottom", n: "north", s: "south", e: "east", w: "west", i: "iso",
      };
      if (named[key]) {
        event.preventDefault();
        this.applyNamedView(named[key]);
      }
      return;
    }
    if (event.ctrlKey || event.metaKey) return;
    if (key === "f") { event.preventDefault(); this.fitView(); }
    else if (key === "o") { event.preventDefault(); this.setOrthographic(!this.useOrtho); }
    else if (key === "g") {
      event.preventDefault();
      this.gridHelper.visible = !this.gridHelper.visible;
      const input = this.sidebar.querySelector("#vis-show-grid") as HTMLInputElement | null;
      if (input) {
        input.checked = this.gridHelper.visible;
        input.dispatchEvent(new Event("ugsci-sync"));
      }
    } else if (key === "i") {
      event.preventDefault();
      const dataset = this.datasetById(this.selectedObjectId || this.currentDataset?.id || "");
      if (dataset) void this.isolateDataset(dataset);
    } else if (key === "h") {
      event.preventDefault();
      const dataset = this.datasetById(this.selectedObjectId || this.currentDataset?.id || "");
      if (dataset) void this.toggleDatasetVisibility(dataset, false);
    } else if (key === "a") {
      event.preventDefault();
      this.showAllVisible();
    }
  };

  private onCatalogKeyDown = this.onViewerKeyDown;

  private updateObjectTree() {
    const list = this.objectTree.querySelector("#vis-object-list");
    if (!list || !this.manifest) return;
    const visibleIds = this.collectVisibleIds();
    renderComponentTree(list as HTMLElement, this.manifest.datasets, {
      query: this.treeQuery,
      activeId: this.currentDataset?.id || null,
      selectedId: this.selectedObjectId,
      visibleIds,
      collapsedGroups: this.collapsedGroups,
      onToggleGroup: (groupId: ComponentGroupId) => {
        if (this.collapsedGroups.has(groupId)) this.collapsedGroups.delete(groupId);
        else this.collapsedGroups.add(groupId);
        this.updateObjectTree();
      },
      onToggleVisible: (dataset, visible) => {
        void this.toggleDatasetVisibility(dataset, visible);
      },
      onSelect: (dataset) => {
        void this.selectDatasetFromTree(dataset);
      },
      onFocus: (dataset) => {
        void this.focusDataset(dataset);
      },
      onDelete: (dataset) => {
        void this.deleteCatalogDataset(dataset);
      },
      onContextMenu: (dataset, event) => {
        this.openObjectContextMenu(dataset, event.clientX, event.clientY);
      },
    });
  }

  private isLineDataset(dataset: DatasetInfo): boolean {
    return ["network", "network-tube"].includes(dataset.source || "");
  }

  private datasetById(id: string): DatasetInfo | undefined {
    return this.manifest?.datasets.find((dataset) => dataset.id === id);
  }

  private applyNamedView(view: NamedView) {
    const box = this.worldModelBox();
    if (!box) {
      this.infoEl.textContent = "没有可适配的对象";
      return;
    }
    this.frameBox(box, view);
    this.infoEl.textContent = "\u89c6\u89d2: " + view;
  }

  private setZScale(value: number) {
    this.zScale = Math.min(8, Math.max(0.1, value));
    this.modelRoot.scale.set(1, 1, this.zScale);
    const label = this.sidebar.querySelector("#vis-z-scale-value");
    if (label) label.textContent = this.zScale.toFixed(2) + "x";
    const slider = this.sidebar.querySelector("#vis-z-scale") as HTMLInputElement | null;
    if (slider) slider.value = String(Math.round(this.zScale * 100));
  }

  private setOrthographic(enabled: boolean) {
    this.useOrtho = enabled;
    const current = this.camera;
    const next = enabled ? this.orthoCamera : this.perspectiveCamera;
    next.position.copy(current.position);
    next.up.copy(current.up);
    next.lookAt(this.controls.target);
    this.camera = next;
    this.controls.object = next;
    this.applyCameraProjection();
    this.controls.update();
    const input = this.sidebar.querySelector("#vis-ortho") as HTMLInputElement | null;
    if (input && input.checked !== enabled) {
      input.checked = enabled;
      input.dispatchEvent(new Event("ugsci-sync"));
    }
    this.infoEl.textContent = enabled ? "\u6b63\u4ea4\u6295\u5f71" : "\u900f\u89c6\u6295\u5f71";
  }

  private setBackgroundColor(hex: string) {
    const color = new THREE.Color(hex);
    this.scene.background = color;
    const fog = this.scene.fog;
    if (fog instanceof THREE.Fog) fog.color.copy(color);
  }

  private setWellLabelsVisible(visible: boolean) {
    const visit = (object: THREE.Object3D | null) => {
      object?.traverse((node) => {
        if (node.name === "oilgas-well-label") node.visible = visible;
      });
    };
    visit(this.mesh);
    for (const overlay of this.overlayMeshes.values()) visit(overlay);
  }

  private applySliceAxis(axis: "i" | "j" | "k" | null) {
    const i = this.sidebar.querySelector("#vis-filter-i") as HTMLInputElement | null;
    const j = this.sidebar.querySelector("#vis-filter-j") as HTMLInputElement | null;
    const k = this.sidebar.querySelector("#vis-filter-k") as HTMLInputElement | null;
    if (!axis) {
      if (i) i.value = "";
      if (j) j.value = "";
      if (k) k.value = "";
      this.applyFilters();
      return;
    }
    this.applySliceIndex(axis, this.slicePlayer.index());
  }

  private applySliceIndex(axis: "i" | "j" | "k", index: number) {
    const i = this.sidebar.querySelector("#vis-filter-i") as HTMLInputElement | null;
    const j = this.sidebar.querySelector("#vis-filter-j") as HTMLInputElement | null;
    const k = this.sidebar.querySelector("#vis-filter-k") as HTMLInputElement | null;
    if (i) i.value = axis === "i" ? sliceRangeText(index) : "";
    if (j) j.value = axis === "j" ? sliceRangeText(index) : "";
    if (k) k.value = axis === "k" ? sliceRangeText(index) : "";
    this.applyFilters();
  }

  private setSlicePlaying(playing: boolean) {
    if (this.sliceTimer !== null) {
      window.clearInterval(this.sliceTimer);
      this.sliceTimer = null;
    }
    if (!playing) return;
    this.sliceTimer = window.setInterval(() => {
      const axis = this.slicePlayer.axis();
      if (!axis) {
        this.slicePlayer.setPlaying(false);
        this.setSlicePlaying(false);
        return;
      }
      const dims = this.currentDataset?.grid_dims;
      const max = axis === "i" ? dims?.[0] : axis === "j" ? dims?.[1] : dims?.[2];
      const limit = Math.max(1, Number(max) || 1);
      const next = (this.slicePlayer.index() % limit) + 1;
      this.slicePlayer.setIndex(next);
    }, 400);
  }

  private storeUserView() {
    const payload = {
      position: this.camera.position.toArray(),
      target: this.controls.target.toArray(),
      up: this.camera.up.toArray(),
      zScale: this.zScale,
      ortho: this.useOrtho,
    };
    localStorage.setItem(USER_VIEW_KEY, JSON.stringify(payload));
    this.infoEl.textContent = "\u7528\u6237\u89c6\u89d2\u5df2\u4fdd\u5b58";
  }

  private recallUserView() {
    const raw = localStorage.getItem(USER_VIEW_KEY);
    if (!raw) {
      this.infoEl.textContent = "\u6ca1\u6709\u5df2\u4fdd\u5b58\u89c6\u89d2";
      return;
    }
    try {
      const view = JSON.parse(raw);
      if (Number.isFinite(view.zScale)) this.setZScale(Number(view.zScale));
      if (typeof view.ortho === "boolean") this.setOrthographic(view.ortho);
      if (Array.isArray(view.position)) this.camera.position.fromArray(view.position);
      if (Array.isArray(view.target)) this.controls.target.fromArray(view.target);
      if (Array.isArray(view.up)) this.camera.up.fromArray(view.up);
      this.applyCameraProjection();
      this.controls.update();
      this.infoEl.textContent = "\u5df2\u6062\u590d\u7528\u6237\u89c6\u89d2";
    } catch {
      this.infoEl.textContent = "\u89c6\u89d2\u6570\u636e\u65e0\u6548";
    }
  }

  private openObjectContextMenu(dataset: DatasetInfo | null, clientX: number, clientY: number) {
    showContextMenu(this.container, clientX, clientY, objectContextItems(Boolean(dataset)), (id) => {
      void this.handleObjectContext(dataset, id);
    });
  }

  private async handleObjectContext(dataset: DatasetInfo | null, action: string) {
    if (action === "show-all") {
      this.showAllVisible();
      return;
    }
    if (!dataset) return;
    if (action === "focus") await this.focusDataset(dataset);
    else if (action === "isolate") await this.isolateDataset(dataset);
    else if (action === "hide") await this.toggleDatasetVisibility(dataset, false);
    else if (action === "delete") await this.deleteCatalogDataset(dataset);
  }

  private async isolateDataset(dataset: DatasetInfo) {
    if (this.mesh && this.currentDataset) this.mesh.visible = this.currentDataset.id === dataset.id;
    for (const [id, overlay] of this.overlayMeshes) overlay.visible = id === dataset.id;
    if (dataset.id !== this.currentDataset?.id) {
      await this.toggleDatasetVisibility(dataset, true, { quiet: true });
      const overlay = this.overlayMeshes.get(dataset.id);
      if (overlay) overlay.visible = true;
      if (this.mesh) this.mesh.visible = false;
    }
    this.infoEl.textContent = "\u4ec5\u663e\u793a " + dataset.name;
    this.updateObjectTree();
  }

  private showAllVisible() {
    if (this.mesh) this.mesh.visible = true;
    for (const overlay of this.overlayMeshes.values()) overlay.visible = true;
    this.updateObjectTree();
    this.infoEl.textContent = "\u5df2\u663e\u793a\u5168\u90e8\u5df2\u52a0\u8f7d\u5bf9\u8c61";
  }

  private hitToModelPoint(world: THREE.Vector3): THREE.Vector3 {
    return this.modelRoot.worldToLocal(world.clone());
  }

  private onHistogramClick(event: MouseEvent) {
    if (event.detail > 1 || !this.histogramEl) return;
    const span = this.scalarMax - this.scalarMin;
    if (!Number.isFinite(span) || span === 0) return;
    const rect = this.histogramEl.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(rect.width, 1)));
    const value = this.scalarMin + t * span;
    const minInput = this.sidebar.querySelector("#vis-filter-prop-min") as HTMLInputElement | null;
    const maxInput = this.sidebar.querySelector("#vis-filter-prop-max") as HTMLInputElement | null;
    if (event.shiftKey) {
      if (maxInput) maxInput.value = String(value);
    } else if (minInput) {
      minInput.value = String(value);
    }
    this.applyFilters();
  }

  private onCanvasContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    this.canvasNdc(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hit = this.raycaster.intersectObjects(this.pickables(), true)[0];
    const dataset = hit ? this.datasetFromHit(hit.object) : this.datasetById(this.selectedObjectId || this.currentDataset?.id || "") || null;
    this.openObjectContextMenu(dataset, event.clientX, event.clientY);
  };

  private updateCompassHud() {
    this.compassHud.setAzimuth(cameraAzimuthRad(this.camera.position, this.controls.target));
    this.compassHud.setMetersPerPixel(
      metersPerPixel(this.camera, this.controls.target, this.container.clientHeight),
    );
  }

  private collectVisibleIds(): Set<string> {
    const ids = new Set<string>();
    if (this.mesh?.visible && this.currentDataset) ids.add(this.currentDataset.id);
    for (const [id, overlay] of this.overlayMeshes) {
      if (overlay.visible) ids.add(id);
    }
    return ids;
  }

  private selectionTypeFor(dataset: DatasetInfo): DomainSelection["type"] {
    if (isSpatialWell(dataset) || isDepthOnlyWell(dataset)) return "well";
    if (this.isLineDataset(dataset)) return "segment";
    if (isGridDataset(dataset)) return "surface";
    return "surface";
  }

  private tagSceneObject(object: THREE.Object3D, dataset: DatasetInfo) {
    object.userData.datasetId = dataset.id;
    object.userData.kind = this.selectionTypeFor(dataset);
  }

  private applyOpacity(value: number) {
    this.opacity = value;
    const label = this.sidebar.querySelector("#vis-opacity-value");
    if (label) label.textContent = value.toFixed(2);
    const slider = this.sidebar.querySelector("#vis-opacity") as HTMLInputElement | null;
    if (slider) slider.value = String(Math.round(value * 100));
    const selected = this.overlayMeshes.get(this.selectedObjectId || "") || this.mesh;
    this.visitObjectMaterials(selected, (material) => {
      (material as THREE.Material & { opacity: number }).opacity = value;
      material.transparent = value < 0.999;
      material.needsUpdate = true;
    });
  }

  private visitObjectMaterials(
    object: THREE.Object3D | null | undefined,
    callback: (material: THREE.Material) => void,
  ) {
    if (!object) return;
    object.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.material) return;
      if (Array.isArray(mesh.material)) mesh.material.forEach(callback);
      else callback(mesh.material);
    });
  }

  private publishSelection(selection: DomainSelection | null) {
    if (selection?.type === "cell") {
      this.selectedObjectId = this.currentDataset?.id || null;
    } else {
      this.selectedObjectId = selection?.id || null;
    }
    viewerStore.setSelection(selection);
    if (selection && this.onSelectionCallback) {
      this.onSelectionCallback({
        type: selection.type,
        id: selection.id,
        coords: selection.coordinates,
      });
    }
    this.updateInspectorObject();
    this.updateReadoutHud();
    this.highlightSelection();
    this.refreshWellMap();
    this.updateObjectTree();
  }

  private updateInspectorObject() {
    const nameEl = this.sidebar.querySelector("[data-object-name]");
    const metaEl = this.sidebar.querySelector("[data-object-meta]");
    const visible = this.sidebar.querySelector("#vis-inspector-visible") as HTMLInputElement | null;
    const selected = viewerStore.getState().selected;
    const dataset = this.datasetById(this.selectedObjectId || this.currentDataset?.id || "");
    if (!dataset) {
      if (nameEl) nameEl.textContent = "未选中对象";
      if (metaEl) metaEl.textContent = "在组件树或三维视图中点选";
      return;
    }
    if (nameEl) {
      nameEl.textContent = isSpatialWell(dataset) || isDepthOnlyWell(dataset)
        ? wellDisplayName(dataset)
        : dataset.name;
    }
    if (metaEl) {
      const bits = [
        selected?.type === "cell" ? "cell " + selected.id : (dataset.source || "object"),
        dataset.n_cells ? dataset.n_cells.toLocaleString() + " cells" : "",
        selected?.coordinates
          ? "E " + selected.coordinates[0].toFixed(1) + "  N " + selected.coordinates[1].toFixed(1)
          : "",
      ].filter(Boolean);
      metaEl.textContent = bits.join(" · ");
    }
    if (visible) {
      visible.checked = this.collectVisibleIds().has(dataset.id);
      visible.disabled = isDepthOnlyWell(dataset);
      visible.dispatchEvent(new Event("ugsci-sync"));
    }
  }

  private updateReadoutHud() {
    if (!this.readoutEl) return;
    const selected = viewerStore.getState().selected;
    const dataset = this.datasetById(this.selectedObjectId || this.currentDataset?.id || "");
    updateReadout(this.readoutEl, {
      hover: this.hoverCoords,
      selectedLabel: dataset
        ? (isSpatialWell(dataset) || isDepthOnlyWell(dataset) ? wellDisplayName(dataset) : dataset.name)
        : "—",
      selectedMeta: selected?.type === "cell"
        ? "Cell " + selected.id
        : (dataset?.source || ""),
      pickKind: selected?.type || "",
    });
  }

  private highlightSelection() {
    if (this.highlightedOverlayId) {
      const previous = this.objectForId(this.highlightedOverlayId);
      this.setObjectHighlight(previous, false);
      this.highlightedOverlayId = null;
    }
    const selected = viewerStore.getState().selected;
    if (!selected || selected.type === "cell" || !this.selectedObjectId) return;
    const object = this.objectForId(this.selectedObjectId);
    if (!object) return;
    this.setObjectHighlight(object, true);
    this.highlightedOverlayId = this.selectedObjectId;
  }

  private objectForId(id: string): THREE.Object3D | null {
    if (this.overlayMeshes.has(id)) return this.overlayMeshes.get(id) || null;
    if (this.currentDataset?.id === id) return this.mesh;
    return null;
  }

  private setObjectHighlight(object: THREE.Object3D | null, on: boolean) {
    this.visitObjectMaterials(object, (material) => {
      const colored = material as THREE.MeshPhongMaterial;
      if (!colored.color) return;
      if (on) {
        if (colored.userData._baseColor == null) colored.userData._baseColor = colored.color.getHex();
        colored.color.setHex(0xffd166);
        if (colored.emissive) colored.emissive.setHex(0x3a2a00);
      } else if (colored.userData._baseColor != null) {
        colored.color.setHex(colored.userData._baseColor);
        if (colored.emissive) colored.emissive.setHex(0x000000);
      }
    });
  }

  private recordWellPlan(dataset: DatasetInfo, localPositions: Float32Array) {
    const points = uniquePolyline(localPositions);
    if (!points.length) return;
    const origin = this.origin;
    const step = Math.max(1, Math.floor(points.length / 48));
    const path: Array<[number, number]> = [];
    for (let index = 0; index < points.length; index += step) {
      path.push([points[index][0] + origin[0], points[index][1] + origin[1]]);
    }
    const last = points[points.length - 1];
    const lastWorld: [number, number] = [last[0] + origin[0], last[1] + origin[1]];
    if (!path.length || path[path.length - 1][0] !== lastWorld[0] || path[path.length - 1][1] !== lastWorld[1]) {
      path.push(lastWorld);
    }
    const head = points[0];
    this.wellPlanPoints.set(dataset.id, {
      id: dataset.id,
      name: wellDisplayName(dataset),
      x: head[0] + origin[0],
      y: head[1] + origin[1],
      z: head[2] + origin[2],
      path,
    });
    this.refreshWellMap();
  }

  private refreshWellMap() {
    if (!this.wellMapCanvas) return;
    drawWellMap(
      this.wellMapCanvas,
      Array.from(this.wellPlanPoints.values()),
      this.selectedObjectId,
      this.gridMapBounds,
    );
  }

  private updateGridMapBounds() {
    if (!this.geometry) {
      this.gridMapBounds = null;
      return;
    }
    this.geometry.computeBoundingBox();
    const box = this.geometry.boundingBox;
    if (!box) {
      this.gridMapBounds = null;
      return;
    }
    this.gridMapBounds = {
      minX: box.min.x + this.origin[0],
      minY: box.min.y + this.origin[1],
      maxX: box.max.x + this.origin[0],
      maxY: box.max.y + this.origin[1],
    };
    this.refreshWellMap();
  }

  private lastChromeKey = "";

  private syncChromeFromStore() {
    const state = viewerStore.getState();
    const key = [
      state.dataset?.id || "",
      state.activeView,
      state.selected?.type || "",
      state.selected?.id || "",
      state.property?.name || "",
    ].join("|");
    if (key === this.lastChromeKey) return;
    this.lastChromeKey = key;
    this.updateReadoutHud();
    this.updateInspectorObject();
  }

  private async focusDataset(dataset: DatasetInfo) {
    await this.selectDatasetFromTree(dataset);
    const object = this.objectForId(dataset.id);
    if (object) this.frameObject(object);
  }

  private onWellMapClick = (event: MouseEvent) => {
    const points = Array.from(this.wellPlanPoints.values());
    const bounds = unionBounds(points, this.gridMapBounds);
    if (!bounds) return;
    const rect = this.wellMapCanvas.getBoundingClientRect();
    const scaleX = this.wellMapCanvas.width / Math.max(rect.width, 1);
    const scaleY = this.wellMapCanvas.height / Math.max(rect.height, 1);
    const id = hitTestWellMap(
      points,
      bounds,
      this.wellMapCanvas.width,
      this.wellMapCanvas.height,
      (event.clientX - rect.left) * scaleX,
      (event.clientY - rect.top) * scaleY,
    );
    if (!id) return;
    const dataset = this.datasetById(id);
    if (dataset) void this.focusDataset(dataset);
  };

  private makeWellLabel(name: string): CSS2DObject {
    const el = document.createElement("div");
    el.textContent = name;
    el.style.cssText = "color:#f0c14b;font:600 11px/1.2 sans-serif;white-space:nowrap;text-shadow:0 1px 2px #000;pointer-events:none;user-select:none;";
    const obj = new CSS2DObject(el);
    obj.name = "oilgas-well-label";
    obj.visible = this.wellLabelsVisible;
    return obj;
  }

  private buildWellObject(dataset: DatasetInfo, localPositions: Float32Array): THREE.Group | null {
    const tube = buildWellTubeMesh(localPositions);
    if (!tube) return null;
    const group = new THREE.Group();
    group.name = `oilgas-well-${dataset.id}`;
    group.add(tube);
    const head = uniquePolyline(localPositions)[0];
    const label = this.makeWellLabel(wellDisplayName(dataset));
    if (head) label.position.set(head[0], head[1], head[2]);
    group.add(label);
    return group;
  }

  private disposeObject3D(object: THREE.Object3D) {
    object.traverse((node) => {
      const css = node as CSS2DObject;
      if ("element" in node && css.element instanceof HTMLElement) css.element.remove();
      const renderable = node as THREE.Object3D & {
        geometry?: THREE.BufferGeometry;
        material?: THREE.Material | THREE.Material[];
      };
      renderable.geometry?.dispose();
      if (Array.isArray(renderable.material)) renderable.material.forEach((material) => material.dispose());
      else renderable.material?.dispose();
    });
    object.parent?.remove(object);
  }

  private visitMaterials(callback: (material: THREE.Material) => void) {
    this.mesh?.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.material) return;
      if (Array.isArray(mesh.material)) mesh.material.forEach(callback);
      else callback(mesh.material);
    });
  }

  private frameObject(object: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(object);
    if (!box.isEmpty()) this.frameBox(box);
  }

  private async selectDatasetFromTree(dataset: DatasetInfo) {
    if (isDepthOnlyWell(dataset)) {
      this.viewRouter.switchTo("welllog");
      await this.loadDataset(dataset.id);
      this.publishSelection({ type: "well", id: dataset.id });
      return;
    }
    if (isSpatialWell(dataset) && this.currentDataset && isGridDataset(this.currentDataset)) {
      await this.toggleDatasetVisibility(dataset, true, { quiet: true });
      const overlay = this.overlayMeshes.get(dataset.id);
      if (overlay) this.frameObject(overlay);
      this.infoEl.textContent = `井 ${wellDisplayName(dataset)}`;
      this.showDetails(`${dataset.name}\n场图叠加（管子）`);
      this.publishSelection({ type: "well", id: dataset.id });
      return;
    }
    await this.loadDataset(dataset.id);
    this.publishSelection({ type: this.selectionTypeFor(dataset), id: dataset.id });
  }

  private lineRenderIndices(dataset: DatasetInfo, indices: Uint32Array, vertexCount: number): Uint32Array {
    if (dataset.source === "network" && indices.length % 3 === 0) {
      const pairs = new Uint32Array((indices.length / 3) * 2);
      for (let source = 0, target = 0; source < indices.length; source += 3, target += 2) {
        pairs[target] = indices[source];
        pairs[target + 1] = indices[source + 1];
      }
      return pairs;
    }
    // Well/LAS/DLIS trajectories are continuous polylines. Converter indices
    // may contain triangle-compatible degenerates, which create backtracking
    // artifacts when handed directly to THREE.Line.
    return Uint32Array.from({ length: vertexCount }, (_, index) => index);
  }

  private clearOverlays() {
    for (const overlay of this.overlayMeshes.values()) {
      this.disposeObject3D(overlay);
    }
    this.overlayMeshes.clear();
    this.overlayLoading.clear();
    this.wellPlanPoints.clear();
    this.highlightedOverlayId = null;
    for (const item of Array.from(this.objectTree.querySelectorAll<HTMLElement>("[data-dataset-id]"))) {
      const checkbox = item.querySelector<HTMLInputElement>('input[type="checkbox"]');
      if (checkbox) checkbox.checked = item.dataset.datasetId === this.currentDataset?.id;
    }
  }

  private setTreeVisibility(datasetId: string, visible: boolean) {
    const item = Array.from(this.objectTree.querySelectorAll<HTMLElement>("[data-dataset-id]"))
      .find((candidate) => candidate.dataset.datasetId === datasetId);
    const checkbox = item?.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (checkbox) checkbox.checked = visible;
  }

  private async toggleDatasetVisibility(
    dataset: DatasetInfo,
    visible: boolean,
    options?: { quiet?: boolean },
  ) {
    if (isDepthOnlyWell(dataset)) {
      this.setTreeVisibility(dataset.id, false);
      if (!options?.quiet) {
        this.showDetails(`${dataset.name} 是仅深度测井，不在三维场图显示。请打开「测井」页签。`);
      }
      return;
    }
    if (dataset.id === this.currentDataset?.id) {
      if (this.mesh) this.mesh.visible = visible;
      this.setTreeVisibility(dataset.id, visible);
      return;
    }
    const existing = this.overlayMeshes.get(dataset.id);
    if (existing) {
      existing.visible = visible;
      this.setTreeVisibility(dataset.id, visible);
      return;
    }
    if (!visible || this.overlayLoading.has(dataset.id)) return;
    this.overlayLoading.add(dataset.id);
    try {
      const [posBuf, idxBuf] = await Promise.all([
        this.fetchBinary(dataset.files.positions),
        this.fetchBinary(dataset.files.indices),
      ]);
      const positions = new Float32Array(posBuf);
      const indices = new Uint32Array(idxBuf);
      if (positions.length < 6 || positions.length % 3 !== 0 || indices.length < 2) {
        throw new Error("几何缓冲区为空或格式无效");
      }
      const hexCells = isHexCornerMesh(positions.length / 3, dataset.n_cells);
      if (hexCells) maybeRemapHexPositions(positions, dataset.n_cells);
      const origin = this.origin;
      const hexCorners = hexCells
        ? extractHexCorners(positions, dataset.n_cells)
        : null;
      const sourcePositions = hexCorners || positions;
      const localPositions = new Float32Array(sourcePositions.length);
      for (let index = 0; index < sourcePositions.length; index += 3) {
        localPositions[index] = sourcePositions[index] - origin[0];
        localPositions[index + 1] = sourcePositions[index + 1] - origin[1];
        localPositions[index + 2] = sourcePositions[index + 2] - origin[2];
      }
      let overlay: THREE.Object3D;
      if (isSpatialWell(dataset)) {
        const wellObject = this.buildWellObject(dataset, localPositions);
        if (!wellObject) throw new Error("井轨迹点数不足，无法生成管子");
        overlay = wellObject;
      } else if (hexCorners) {
        const fan = tessellateHexOpmFan(localPositions, dataset.n_cells);
        const fillGeometry = new THREE.BufferGeometry();
        fillGeometry.setAttribute("position", new THREE.BufferAttribute(fan.positions, 3));
        fillGeometry.setAttribute("normal", new THREE.BufferAttribute(fan.normals, 3));
        fillGeometry.setIndex(new THREE.BufferAttribute(fan.indices, 1));
        const fillMaterial = new THREE.MeshPhongMaterial({
          color: 0x8b949e,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
        });
        fillMaterial.forceSinglePass = true;
        const fill = new THREE.Mesh(fillGeometry, fillMaterial);
        const edgeGeometry = new THREE.BufferGeometry();
        edgeGeometry.setAttribute("position", new THREE.BufferAttribute(localPositions, 3));
        edgeGeometry.setIndex(
          new THREE.BufferAttribute(
            buildHexEdgeIndex(Array.from({ length: dataset.n_cells }, (_, cell) => cell)),
            1,
          ),
        );
        const edges = new THREE.LineSegments(
          edgeGeometry,
          new THREE.LineBasicMaterial({ color: 0xd0d7de, transparent: true, opacity: 0.7 }),
        );
        overlay = new THREE.Group();
        overlay.add(fill);
        overlay.add(edges);
      } else {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(localPositions, 3));
        const lineOverlay = this.isLineDataset(dataset);
        const renderIndices = lineOverlay
          ? this.lineRenderIndices(dataset, indices, localPositions.length / 3)
          : indices;
        geometry.setIndex(new THREE.BufferAttribute(renderIndices, 1));
        if (!lineOverlay) geometry.computeVertexNormals();
        const material = lineOverlay
          ? new THREE.LineBasicMaterial({ color: dataset.source === "network" || dataset.source === "network-tube" ? 0xffb86c : 0xff6b9d, transparent: true, opacity: 0.95 })
          : new THREE.MeshPhongMaterial({ color: 0x8b949e, transparent: true, opacity: 0.45, side: THREE.DoubleSide, wireframe: true });
        overlay = lineOverlay
          ? (dataset.source === "network" || dataset.source === "network-tube"
            ? new THREE.LineSegments(geometry, material as THREE.LineBasicMaterial)
            : new THREE.Line(geometry, material as THREE.LineBasicMaterial))
          : new THREE.Mesh(geometry, material as THREE.MeshPhongMaterial);
      }
      overlay.name = `oilgas-overlay-${dataset.id}`;
      overlay.visible = visible;
      this.tagSceneObject(overlay, dataset);
      if (isSpatialWell(dataset)) this.recordWellPlan(dataset, localPositions);
      this.modelRoot.add(overlay);
      this.overlayMeshes.set(dataset.id, overlay);
      this.setTreeVisibility(dataset.id, visible);
      if (!options?.quiet) {
        this.showDetails(`已加入场景：${dataset.name}\n对象类型：${dataset.source || "unknown"}`);
      }
    } catch (error) {
      this.showDetails(`对象加载失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.overlayLoading.delete(dataset.id);
    }
  }

  private async loadDataset(datasetId: string) {
    if (!this.manifest) return;
    const ds = this.manifest.datasets.find((d) => d.id === datasetId);
    if (!ds) return;
    this.currentDataset = ds;
    viewerStore.setDataset(ds);
    viewerStore.setLoading({ stage: "loading-dataset", progress: 0.1, error: null });
    this.clearOverlays();
    // Filters are dataset-specific.  Clear them on a manual or Agent-driven
    // dataset switch so stale I/J/K/property values cannot appear active
    // while the newly loaded mesh is actually unfiltered.
    this.resetFilters();
    this.detailsEl.style.display = "none";
    const datasetSelect = this.sidebar.querySelector("#vis-dataset") as HTMLSelectElement;
    if (datasetSelect) datasetSelect.value = datasetId;
    for (const item of Array.from(this.objectTree.querySelectorAll<HTMLElement>("[data-dataset-id]"))) {
      const selected = item.dataset.datasetId === datasetId;
      item.dataset.selected = String(selected);
      const visibility = item.querySelector<HTMLInputElement>('input[type="checkbox"]');
      if (visibility) visibility.checked = selected;
      item.style.color = selected ? "#e6edf3" : "#8b949e";
      item.style.background = selected ? "rgba(31,111,235,.24)" : "transparent";
      item.style.boxShadow = selected ? "inset 2px 0 #58a6ff" : "none";
    }

    // Only expose properties that actually exist for this dataset.  Keeping
    // unavailable properties selected made Three.js enable vertex colors
    // without a color buffer, rendering otherwise valid grids nearly black.
    const propSelect = this.sidebar.querySelector("#vis-property") as HTMLSelectElement;
    const propertyNames = new Set(Object.keys(ds.files.scalars || {}));
    for (const step of ds.time_steps || []) {
      Object.keys(step.scalars || {}).forEach((name) => propertyNames.add(name));
    }
    if (propSelect) {
      propSelect.innerHTML = "";
      if (propertyNames.size === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "无属性（统一颜色）";
        propSelect.appendChild(opt);
        propSelect.disabled = true;
        this.currentProperty = "";
      } else {
        propSelect.disabled = false;
        for (const name of propertyNames) {
          const opt = document.createElement("option");
          opt.value = name;
          opt.textContent = name;
          propSelect.appendChild(opt);
        }
        if (!propertyNames.has(this.currentProperty)) {
          this.currentProperty = propertyNames.values().next().value || "";
        }
        propSelect.value = this.currentProperty;
      }
    }

    // Update time step selector
    const tsSelect = this.sidebar.querySelector("#vis-timestep") as HTMLSelectElement;
    if (tsSelect) {
      tsSelect.innerHTML = '<option value="0">静态</option>';
      if (ds.time_steps) {
        for (const ts of ds.time_steps) {
          const opt = document.createElement("option");
          opt.value = String(ts.index + 1);
          opt.textContent = `Step ${ts.index} (${ts.step_number})`;
          tsSelect.appendChild(opt);
        }
      }
    }
    this.currentTimeStep = 0;

    this.infoEl.textContent = `正在加载 ${ds.name}...`;

    // Abort any in-flight fetches
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();
    const generation = ++this.loadGeneration;
    this.datasetLoading = true;
    const loadSignal = this.abortController.signal;

    let posBuf: ArrayBuffer;
    let idxBuf: ArrayBuffer;
    let cellIdBuf: ArrayBuffer;
    try {
      [posBuf, idxBuf, cellIdBuf] = await Promise.all([
        this.fetchBinary(ds.files.positions, loadSignal),
        this.fetchBinary(ds.files.indices, loadSignal),
        this.fetchBinary(ds.files.cell_ids, loadSignal),
      ]);
    } catch (err) {
      if (generation === this.loadGeneration) {
        this.datasetLoading = false;
        viewerStore.setLoading({ stage: "failed", progress: 0, error: err instanceof Error ? err.message : String(err) });
        this.infoEl.textContent = `加载失败：${err instanceof Error ? err.message : String(err)}`;
      }
      return;
    }
    if (generation !== this.loadGeneration) return;

    const positions = new Float32Array(posBuf);
    const indices = new Uint32Array(idxBuf);
    const nextCellIds = new Uint32Array(cellIdBuf);
    if (positions.length < 3 || positions.length % 3 !== 0 || indices.length === 0 || nextCellIds.length === 0) {
      this.datasetLoading = false;
      this.infoEl.textContent = "加载失败：数据集几何缓冲区为空或格式无效";
      return;
    }
    maybeRemapHexPositions(positions, nextCellIds.length);
    const hexCorners = isHexCornerMesh(positions.length / 3, nextCellIds.length);
    this.isHexMesh = hexCorners || isHexCellMesh(positions.length / 3, nextCellIds.length);
    const hexCornerSource = hexCorners
      ? extractHexCorners(positions, nextCellIds.length)
      : null;

    // Coordinate origin rebase
    const originSource = hexCornerSource || positions;
    let cx = 0, cy = 0, cz = 0;
    const nVerts = originSource.length / 3;
    for (let i = 0; i < originSource.length; i += 3) {
      if (!Number.isFinite(originSource[i]) || !Number.isFinite(originSource[i + 1]) || !Number.isFinite(originSource[i + 2])) {
        this.datasetLoading = false;
        this.infoEl.textContent = "加载失败：坐标数据包含非有限值";
        return;
      }
      cx += originSource[i]; cy += originSource[i + 1]; cz += originSource[i + 2];
    }
    cx /= nVerts; cy /= nVerts; cz /= nVerts;
    const depthOnly = isDepthOnlyWell(ds);
    if (depthOnly) {
      cx = 0;
      cy = 0;
      cz = 0;
    }

    const localPositions = new Float32Array(originSource.length);
    for (let i = 0; i < originSource.length; i += 3) {
      localPositions[i] = originSource[i] - cx;
      localPositions[i + 1] = originSource[i + 1] - cy;
      localPositions[i + 2] = originSource[i + 2] - cz;
    }

    const isLineDataset = this.isLineDataset(ds);
    let fillPositions: Float32Array<ArrayBufferLike> = localPositions;
    let fillIndices: Uint32Array<ArrayBufferLike> = indices;
    let fillNormals: Float32Array<ArrayBufferLike> | null = null;
    const hexCornerBuffer = hexCornerSource ? localPositions : null;
    if (hexCornerSource) {
      const fan = tessellateHexOpmFan(localPositions, nextCellIds.length);
      fillPositions = fan.positions;
      fillIndices = fan.indices;
      fillNormals = fan.normals;
    }

    const nextGeometry = new THREE.BufferGeometry();
    nextGeometry.setAttribute("position", new THREE.BufferAttribute(fillPositions, 3));
    const renderIndices = isLineDataset
      ? this.lineRenderIndices(ds, fillIndices, fillPositions.length / 3)
      : fillIndices;
    nextGeometry.setIndex(new THREE.BufferAttribute(renderIndices, 1));
    if (fillNormals) {
      nextGeometry.setAttribute("normal", new THREE.BufferAttribute(fillNormals, 3));
    }
    nextGeometry.computeBoundingBox();
    nextGeometry.computeBoundingSphere();
    if (!isLineDataset && !fillNormals) nextGeometry.computeVertexNormals();

    let hasVertexColors = false;
    try {
      const colorResult = await this.applyPropertyColors(nextGeometry, ds, fillIndices, generation);
      if (colorResult === null) {
        if (generation !== this.loadGeneration) {
          nextGeometry.dispose();
          return;
        }
        // A newer property-color request superseded this one, but the
        // dataset itself is still current. Commit the geometry; the newer
        // request will populate colors on the active mesh.
        hasVertexColors = false;
      } else {
        hasVertexColors = colorResult;
      }
    } catch (err) {
      if (generation === this.loadGeneration) {
        this.showDetails(`属性加载失败：${err instanceof Error ? err.message : String(err)}`);
      }
    }
    if (generation !== this.loadGeneration) {
      nextGeometry.dispose();
      return;
    }

    this.disposeCurrentMesh();
    this.cellIds = nextCellIds;
    this.baseIndices = fillIndices;
    this.hexCornerPositions = hexCornerBuffer;
    this.isHexMesh = Boolean(hexCornerBuffer);
    this.cellCenters = null;
    this.visibleCellOffsets = Array.from({ length: nextCellIds.length }, (_, index) => index);
    this.origin = [cx, cy, cz];
    this.geometry = nextGeometry;
    this.datasetLoading = false;
    viewerStore.setLoading({ stage: "ready", progress: 1, error: null });
    viewerStore.setProperty({
      name: this.currentProperty,
      displayName: this.currentProperty,
      range: [this.scalarMin, this.scalarMax],
    });
    viewerStore.setTimeStep(this.currentTimeStep);

    if (depthOnly) {
      this.mesh = null;
    } else if (isSpatialWell(ds)) {
      const wellObject = this.buildWellObject(ds, localPositions);
      this.mesh = wellObject;
      if (wellObject) this.modelRoot.add(wellObject);
    } else if (isLineDataset) {
      const material = new THREE.LineBasicMaterial({
        vertexColors: hasVertexColors,
        color: hasVertexColors ? 0xffffff : 0x58a6ff,
        transparent: true,
        opacity: this.opacity,
      });
      this.mesh = new THREE.LineSegments(this.geometry, material);
      this.modelRoot.add(this.mesh);
    } else {
      const material = new THREE.MeshPhongMaterial({
        vertexColors: hasVertexColors,
        side: THREE.DoubleSide, transparent: true,
        opacity: this.opacity, wireframe: this.isHexMesh ? false : this.wireframe,
        clippingPlanes: [],
      });
      // Three.js renders transparent DoubleSide materials in two passes by
      // default. Closed reservoir cells need only one pass here.
      material.forceSinglePass = true;
      if (!hasVertexColors) material.color = new THREE.Color(0x4488ff);
      this.mesh = new THREE.Mesh(this.geometry, material);
      this.attachHexEdges(nextCellIds.length);
      this.modelRoot.add(this.mesh);
    }

    if (this.mesh) this.tagSceneObject(this.mesh, ds);
    if (isSpatialWell(ds) && !depthOnly) this.recordWellPlan(ds, localPositions);
    this.updateGridMapBounds();

    const bbox = this.geometry.boundingSphere!;
    const radius = Math.max(bbox.radius, 1);
    if (!depthOnly) {
      const near = Math.max(radius / 10_000, 0.1);
      const far = Math.max(radius * 20, 20_000);
      this.perspectiveCamera.near = near;
      this.perspectiveCamera.far = far;
      this.orthoCamera.near = near;
      this.orthoCamera.far = far;
      this.applyCameraProjection();
      const bg = this.scene.background instanceof THREE.Color ? this.scene.background.clone() : new THREE.Color(0x0d1117);
      this.scene.fog = new THREE.Fog(bg, radius * 4, radius * 10);
      if (this.mesh && isSpatialWell(ds)) this.frameObject(this.mesh);
      else if (this.geometry.boundingBox) this.frameBox(this.geometry.boundingBox);
      this.controls.minDistance = radius * 0.01;
      this.controls.maxDistance = radius * 20;
      this.controls.update();
    }
    this.slicePlayer.setDims(ds.grid_dims);
    this.setWellLabelsVisible(this.wellLabelsVisible);

    this.infoEl.textContent = depthOnly
      ? `${ds.name} — 仅深度测井，不在三维场图显示`
      : `${ds.name} — ${ds.n_cells.toLocaleString()} cells | 原点: (${cx.toFixed(0)}, ${cy.toFixed(0)}, ${cz.toFixed(0)})`;
    const kSlider = this.sidebar.querySelector("#vis-k-layer") as HTMLInputElement | null;
    if (kSlider && ds.grid_dims?.[2]) {
      kSlider.max = String(ds.grid_dims[2]);
      kSlider.value = kSlider.value || "1";
    }
    const sliceIndex = this.sidebar.querySelector("#vis-slice-index") as HTMLInputElement | null;
    if (sliceIndex && ds.grid_dims?.[2]) sliceIndex.max = String(ds.grid_dims[2]);
    if (isGridDataset(ds)) {
      await this.attachSpatialWellOverlays(generation);
    }
    this.updateObjectTree();
    this.updateInspectorObject();
    this.updateReadoutHud();
    this.refreshWellMap();
    if (generation === this.loadGeneration) {
      this.publishSelection({ type: this.selectionTypeFor(ds), id: ds.id });
    }
    if (this.viewRouter.getActiveView() === "welllog") this.renderWellLog();
  }

  private async attachSpatialWellOverlays(generation: number) {
    if (!this.manifest) return;
    const wells = this.manifest.datasets.filter(isSpatialWell);
    for (const well of wells) {
      if (generation !== this.loadGeneration) return;
      if (well.id === this.currentDataset?.id) continue;
      await this.toggleDatasetVisibility(well, true, { quiet: true });
    }
    if (wells.length && generation === this.loadGeneration) {
      this.infoEl.textContent = `${this.infoEl.textContent} · 已叠加 ${wells.length} 口井`;
    }
  }

  private resetFilters() {
    for (const id of [
      "#vis-filter-i", "#vis-filter-j", "#vis-filter-k",
      "#vis-filter-prop-min", "#vis-filter-prop-max",
    ]) {
      const input = this.sidebar.querySelector(id) as HTMLInputElement | null;
      if (input) input.value = "";
    }
    this.filterI = [0, Infinity];
    this.filterJ = [0, Infinity];
    this.filterK = [0, Infinity];
    this.filterPropertyRange = [-Infinity, Infinity];
    this.filterPropertyExclude = false;
    const exclude = this.sidebar.querySelector("#vis-filter-prop-exclude") as HTMLInputElement | null;
    if (exclude) {
      exclude.checked = false;
      exclude.dispatchEvent(new Event("ugsci-sync"));
    }
    this.filterBounds = null;
    this.filterUndoStack = [];
    this.filterRedoStack = [];
    this.lastFilterState = this.filterStateSnapshot();
  }

  private async applyPropertyColors(
    geometry: THREE.BufferGeometry | null,
    dataset: DatasetInfo | null,
    indices: Uint32Array,
    generation = this.loadGeneration,
    requestId = ++this.colorRequest,
  ): Promise<boolean | null> {
    if (!geometry || !dataset) return false;
    geometry.deleteAttribute("color");
    this.currentScalarValues = null;
    this.scalarMin = 0;
    this.scalarMax = 1;

    const property = this.currentProperty;
    const timeStep = this.currentTimeStep;
    const colormapName = this.currentColormap;

    // Determine property file: static or time-step
    let propFile: string | undefined;
    const ts = timeStep;
    if (ts > 0 && dataset.time_steps) {
      const stepInfo = dataset.time_steps.find(s => s.index === ts - 1);
      if (stepInfo) {
        propFile = stepInfo.scalars[property];
      }
    }
    if (!propFile) {
      propFile = dataset.files.scalars[property];
    }
    if (!propFile) {
      this.updateLegend();
      return false;
    }

    const propBuf = await this.fetchBinary(propFile, this.abortController?.signal);
    if (generation !== this.loadGeneration || requestId !== this.colorRequest) return null;
    const isFloat = propFile.endsWith(".f32");
    const retainedScalars = propBuf.slice(0);
    this.currentScalarValues = isFloat
      ? new Float32Array(retainedScalars)
      : new Uint32Array(retainedScalars);

    const vertexCount = geometry.getAttribute("position").count;
    if (["las", "dlis", "network", "wellbore"].includes(dataset.source || "") &&
        this.currentScalarValues.length === vertexCount) {
      let minimum = Infinity;
      let maximum = -Infinity;
      for (const value of this.currentScalarValues) {
        minimum = Math.min(minimum, value);
        maximum = Math.max(maximum, value);
      }
      this.scalarMin = minimum;
      this.scalarMax = maximum;
      viewerStore.setProperty({ name: property, displayName: property, range: [minimum, maximum] });
      const range = maximum - minimum || 1;
      const colors = new Float32Array(vertexCount * 3);
      for (let index = 0; index < vertexCount; index++) {
        const [r, g, b] = colormap(
          colormapName,
          (this.currentScalarValues[index] - minimum) / range,
        );
        colors[index * 3] = r;
        colors[index * 3 + 1] = g;
        colors[index * 3 + 2] = b;
      }
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      this.updateLegend();
      return true;
    }

    // Try Worker for color computation
    if (this.workerManager.isAvailable()) {
      const result = await this.workerManager.computeColors(
        propBuf.slice(0), indices.slice().buffer, colormapName,
        geometry.getAttribute("position").count, isFloat,
      );
      if (result) {
        if (generation !== this.loadGeneration || requestId !== this.colorRequest) return null;
        this.scalarMin = result.smin;
        this.scalarMax = result.smax;
        viewerStore.setProperty({ name: property, displayName: property, range: [result.smin, result.smax] });
        geometry.setAttribute("color", new THREE.BufferAttribute(result.colors, 3));
        this.updateLegend();
        return true;
      }
    }

    // Fallback: main thread computation
    const scalars = isFloat ? new Float32Array(propBuf) : new Uint32Array(propBuf);
    let smin = Infinity, smax = -Infinity;
    for (let i = 0; i < scalars.length; i++) {
      const v = scalars[i];
      if (v < smin) smin = v;
      if (v > smax) smax = v;
    }
    const srange = smax - smin || 1;
    this.scalarMin = smin;
    this.scalarMax = smax;
    viewerStore.setProperty({ name: property, displayName: property, range: [smin, smax] });

    if (generation !== this.loadGeneration || requestId !== this.colorRequest) return null;
    const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
    const nVerts = positions.count;
    const colors = new Float32Array(nVerts * 3);
    const vCount = new Float32Array(nVerts);
    const ipc = indices.length / scalars.length;

    for (let c = 0; c < scalars.length; c++) {
      const t = (scalars[c] - smin) / srange;
      const [r, g, b] = colormap(colormapName, t);
      const start = c * ipc;
      for (let k = 0; k < ipc; k++) {
        const vi = indices[start + k];
        if (vi < nVerts) {
          colors[vi * 3] += r; colors[vi * 3 + 1] += g; colors[vi * 3 + 2] += b;
          vCount[vi]++;
        }
      }
    }
    for (let i = 0; i < nVerts; i++) {
      const cnt = vCount[i] || 1;
      colors[i * 3] /= cnt; colors[i * 3 + 1] /= cnt; colors[i * 3 + 2] /= cnt;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.updateLegend();
    return true;
  }

  private async reloadPropertyColors() {
    if (this.datasetLoading || !this.mesh || !this.currentDataset || !this.geometry) return;
    // Re-color against the unfiltered topology.  The visible index buffer may
    // contain only a subset of cells after I/J/K or property filtering, which
    // would otherwise make the cell-to-vertex ratio incorrect.
    const indices = this.baseIndices || (this.geometry.getIndex() as THREE.BufferAttribute).array as Uint32Array;
    let hasVertexColors = false;
    try {
      const colorResult = await this.applyPropertyColors(this.geometry, this.currentDataset, indices);
      if (colorResult === null) return;
      hasVertexColors = colorResult;
    } catch (err) {
      this.showDetails(`属性加载失败：${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    this.visitMaterials((material) => {
      const mat = material as THREE.MeshPhongMaterial | THREE.LineBasicMaterial;
      if (!("vertexColors" in mat)) return;
      mat.vertexColors = hasVertexColors;
      if (!hasVertexColors && "color" in mat) mat.color.set(0x4488ff);
      mat.needsUpdate = true;
    });
    this.applyFilters();
  }

  // ─── Filters ───────────────────────────────────────────────────────

  private getCellCenters(indicesPerCell: number): Float32Array | null {
    if (this.cellCenters) return this.cellCenters;
    if (!this.geometry || !this.baseIndices || !this.cellIds || !Number.isInteger(indicesPerCell) || indicesPerCell <= 0) {
      return null;
    }
    const position = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const centers = new Float32Array(this.cellIds.length * 3);
    for (let offset = 0; offset < this.cellIds.length; offset++) {
      const start = offset * indicesPerCell;
      let count = 0;
      let cx = 0;
      let cy = 0;
      let cz = 0;
      for (let index = start; index < start + indicesPerCell; index++) {
        const vertex = this.baseIndices[index];
        if (vertex >= position.count) continue;
        cx += position.getX(vertex);
        cy += position.getY(vertex);
        cz += position.getZ(vertex);
        count++;
      }
      if (count) {
        centers[offset * 3] = cx / count + this.origin[0];
        centers[offset * 3 + 1] = cy / count + this.origin[1];
        centers[offset * 3 + 2] = cz / count + this.origin[2];
      }
    }
    this.cellCenters = centers;
    return centers;
  }

  private applyFilters() {
    if (this.datasetLoading || !this.geometry || !this.currentDataset || !this.cellIds || !this.baseIndices) return;
    const nextFilterState = this.filterStateSnapshot();
    if (!this.restoringScene && this.lastFilterState && nextFilterState !== this.lastFilterState) {
      this.filterUndoStack.push(this.lastFilterState);
      if (this.filterUndoStack.length > 50) this.filterUndoStack.shift();
      this.filterRedoStack = [];
    }
    this.lastFilterState = nextFilterState;
    const iVal = (this.sidebar.querySelector("#vis-filter-i") as HTMLInputElement)?.value;
    const jVal = (this.sidebar.querySelector("#vis-filter-j") as HTMLInputElement)?.value;
    const kVal = (this.sidebar.querySelector("#vis-filter-k") as HTMLInputElement)?.value;
    const minVal = (this.sidebar.querySelector("#vis-filter-prop-min") as HTMLInputElement)?.value;
    const maxVal = (this.sidebar.querySelector("#vis-filter-prop-max") as HTMLInputElement)?.value;

    // Parse I/J/K ranges (e.g., "1:10" means 1 to 10)
    this.filterI = this.parseRange(iVal);
    this.filterJ = this.parseRange(jVal);
    this.filterK = this.parseRange(kVal);
    this.filterPropertyRange = [
      minVal ? parseFloat(minVal) : -Infinity,
      maxVal ? parseFloat(maxVal) : Infinity,
    ];
    viewerStore.setFilters([
      { type: "ijk", enabled: true, values: [iVal || "", jVal || "", kVal || ""] },
      {
        type: "property-range",
        enabled: Boolean(minVal || maxVal),
        min: this.filterPropertyRange[0],
        max: this.filterPropertyRange[1],
      },
    ]);
    if (this.filterPropertyRange[0] > this.filterPropertyRange[1]) {
      this.infoEl.textContent = "属性范围无效：最小值不能大于最大值";
      return;
    }

    const dimensions = this.currentDataset.grid_dims;
    const indicesPerCell = this.cellIds.length
      ? this.baseIndices.length / this.cellIds.length
      : 0;
    if (!Number.isInteger(indicesPerCell) || indicesPerCell <= 0) {
      this.infoEl.textContent = "当前数据结构不支持单元过滤";
      return;
    }
    const centers = this.filterBounds ? this.getCellCenters(indicesPerCell) : null;

    const visible: number[] = [];
    const filteredIndices: number[] = [];
    for (let offset = 0; offset < this.cellIds.length; offset++) {
      const cellId = this.cellIds[offset];
      let passesIJK = true;
      if (dimensions?.length === 3) {
        const [nI, nJ] = dimensions;
        const i = (cellId % nI) + 1;
        const j = (Math.floor(cellId / nI) % nJ) + 1;
        const k = Math.floor(cellId / (nI * nJ)) + 1;
        passesIJK =
          i >= this.filterI[0] && i <= this.filterI[1] &&
          j >= this.filterJ[0] && j <= this.filterJ[1] &&
          k >= this.filterK[0] && k <= this.filterK[1];
      }
      const scalar = this.currentScalarValues?.[offset];
      const passesProperty = scalar === undefined || (
        scalar >= this.filterPropertyRange[0] &&
        scalar <= this.filterPropertyRange[1]
      ) !== this.filterPropertyExclude;
      let passesBounds = true;
      if (this.filterBounds && centers) {
        const cx = centers[offset * 3];
        const cy = centers[offset * 3 + 1];
        const cz = centers[offset * 3 + 2];
        const [xmin, xmax, ymin, ymax, zmin, zmax] = this.filterBounds;
        passesBounds = cx >= xmin && cx <= xmax && cy >= ymin && cy <= ymax && cz >= zmin && cz <= zmax;
      }
      if (!passesIJK || !passesProperty || !passesBounds) continue;
      visible.push(offset);
      const start = offset * indicesPerCell;
      for (let index = start; index < start + indicesPerCell; index++) {
        filteredIndices.push(this.baseIndices[index]);
      }
    }
    this.visibleCellOffsets = visible;
    this.geometry.setIndex(filteredIndices);
    this.geometry.index!.needsUpdate = true;
    this.updateHexEdges();
    this.infoEl.textContent = `过滤结果: ${visible.length.toLocaleString()} / ${this.cellIds.length.toLocaleString()} cells`;
  }

  private parseRange(val: string | undefined): [number, number] {
    if (!val || val.trim() === "") return [0, Infinity];
    const parts = val.split(":");
    if (parts.length === 2) {
      const parsedStart = Number.parseInt(parts[0], 10);
      const parsedEnd = Number.parseInt(parts[1], 10);
      return [
        Math.min(Number.isFinite(parsedStart) ? parsedStart : 0, Number.isFinite(parsedEnd) ? parsedEnd : Infinity),
        Math.max(Number.isFinite(parsedStart) ? parsedStart : 0, Number.isFinite(parsedEnd) ? parsedEnd : Infinity),
      ];
    }
    const n = parseInt(parts[0]);
    return isNaN(n) ? [0, Infinity] : [n, n];
  }

  // ─── Benchmark & Screenshot ─────────────────────────────────────────

  private async runBenchmark() {
    this.infoEl.textContent = "运行基准测试中... (5秒)";
    const times: number[] = [];
    const start = performance.now();
    let previous = 0;
    const measure = () => {
      const now = performance.now();
      if (previous > 0) times.push(now - previous);
      previous = now;
      if (now - start < 5000) {
        requestAnimationFrame(measure);
      } else {
        times.sort((a, b) => a - b);
        const p50 = times[Math.floor(times.length * 0.5)] || 0;
        const p95 = times[Math.floor(times.length * 0.95)] || 0;
        const average = times.length
          ? times.reduce((a, b) => a + b, 0) / times.length
          : Infinity;
        const fps = Number.isFinite(average) ? 1000 / average : 0;
        const heap = (performance as any).memory?.usedJSHeapSize;
        const heapMB = heap ? `${(heap / 1024 / 1024).toFixed(0)} MB` : "N/A";
        this.infoEl.textContent = `基准: P50=${p50.toFixed(1)}ms P95=${p95.toFixed(1)}ms FPS=${fps.toFixed(0)} Heap=${heapMB}`;

        // Save to backend
        fetch(`${this.apiBase}/benchmarks`, {
          method: "POST",
          headers: { ...this.authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            datasetId: this.currentDataset?.id || "unknown",
            p50, p95, p99: times[Math.floor(times.length * 0.99)] || 0,
            fps, drawCalls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles,
            jsHeapMB: heap ? heap / 1024 / 1024 : 0,
            duration: 5000,
          }),
        }).catch(() => {});
      }
    };
    requestAnimationFrame(measure);
  }

  private async runLeakTest() {
    this.infoEl.textContent = "内存泄漏测试中... (10次加载/卸载)";
    const before = (performance as any).memory?.usedJSHeapSize || 0;
    const beforeGpu = this.renderer.info.memory.geometries;
    for (let i = 0; i < 10; i++) {
      this.disposeCurrentMesh();
      if (this.currentDataset) {
        await this.loadDataset(this.currentDataset.id);
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    // Chromium does not expose an explicit GC trigger in normal builds. Give
    // detached ArrayBuffers/render lists time to be reclaimed and use the
    // lowest post-run sample, avoiding a false leak report from a pending GC.
    this.renderer.renderLists.dispose();
    const samples: number[] = [];
    for (let sample = 0; sample < 4; sample++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      samples.push((performance as any).memory?.usedJSHeapSize || 0);
    }
    const after = samples.filter(Boolean).length ? Math.min(...samples.filter(Boolean)) : 0;
    const delta = (after - before) / 1024 / 1024;
    const gpuDelta = this.renderer.info.memory.geometries - beforeGpu;
    this.infoEl.textContent = `泄漏测试: retained ${delta.toFixed(1)} MiB · GPU geometry ${gpuDelta >= 0 ? "+" : ""}${gpuDelta} (阈值 ≤100 MiB / +1)`;
  }

  private captureScreenshot() {
    this.renderer.render(this.scene, this.camera);
    const dataURL = this.renderer.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `oilgas-screenshot-${Date.now()}.png`;
    // Blob URLs are handled consistently by Chromium download surfaces,
    // unlike large data: URLs which may be opened instead of downloaded.
    const binary = atob(dataURL.split(",", 2)[1]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    const objectUrl = URL.createObjectURL(new Blob([bytes], { type: "image/png" }));
    link.href = objectUrl;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    this.infoEl.textContent = "截图已保存";
  }

  // ─── Render loop ───────────────────────────────────────────────────

  private startLoop() {
    const animate = (time: number) => {
      this.animationId = requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
      if (this.lastFrameTime > 0) {
        const dt = time - this.lastFrameTime;
        this.frameTimes.push(dt);
        if (this.frameTimes.length > 60) this.frameTimes.shift();
      }
      this.lastFrameTime = time;
      if (++this.fpsInterval >= 30) {
        this.fpsInterval = 0;
        this.updateHud();
        this.updateCompassHud();
      }
    };
    animate(0);
  }

  private updateHud() {
    const info = this.renderer.info;
    const times = this.frameTimes;
    const setMetric = (label: string, value: string) => {
      const el = this.hudEl.querySelector(`[data-metric="${label}"]`);
      if (el) el.textContent = value;
    };
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      setMetric("FPS", (1000 / avg).toFixed(0));
      setMetric("Frame", avg.toFixed(1) + "ms");
    }
    setMetric("Draw Calls", String(info.render.calls));
    setMetric("Triangles", info.render.triangles.toLocaleString());
    const heap = (performance as any).memory?.usedJSHeapSize;
    if (heap) setMetric("JS Heap", (heap / 1024 / 1024).toFixed(0) + " MB");
    viewerStore.setMetrics({
      fps: times.length > 0 ? 1000 / (times.reduce((a, b) => a + b, 0) / times.length) : 0,
      frameTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      jsHeapMB: heap ? heap / 1024 / 1024 : 0,
    });
  }

  // ─── Picking with cross-view selection sync ─────────────────────────

  private canvasNdc(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;
  }

  private pickables(): THREE.Object3D[] {
    const targets: THREE.Object3D[] = [];
    if (this.mesh?.visible) targets.push(this.mesh);
    for (const overlay of this.overlayMeshes.values()) {
      if (overlay.visible) targets.push(overlay);
    }
    return targets;
  }

  private datasetFromHit(object: THREE.Object3D): DatasetInfo | null {
    let node: THREE.Object3D | null = object;
    while (node) {
      const id = node.userData?.datasetId as string | undefined;
      if (id) return this.datasetById(id) || null;
      node = node.parent;
    }
    return this.currentDataset;
  }

  private onCanvasPointerMove = (event: PointerEvent) => {
    if (this.datasetLoading) return;
    this.canvasNdc(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hit = this.raycaster.intersectObjects(this.pickables(), true)[0];
    if (!hit) {
      if (this.hoverCoords) {
        this.hoverCoords = null;
        this.updateReadoutHud();
      }
      return;
    }
    const local = this.hitToModelPoint(hit.point);
    this.hoverCoords = [
      local.x + this.origin[0],
      local.y + this.origin[1],
      local.z + this.origin[2],
    ];
    this.updateReadoutHud();
  };

  private onCanvasPointerLeave = () => {
    this.hoverCoords = null;
    this.updateReadoutHud();
  };

  private onCanvasDblClick = (event: MouseEvent) => {
    this.canvasNdc(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hit = this.raycaster.intersectObjects(this.pickables(), true)[0];
    if (!hit) return;
    const dataset = this.datasetFromHit(hit.object);
    if (dataset) void this.focusDataset(dataset);
  };

  private onCanvasClick = async (event: MouseEvent) => {
    if (this.datasetLoading) return;
    this.canvasNdc(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hit = this.raycaster.intersectObjects(this.pickables(), true)[0];
    if (!hit) return;
    const dataset = this.datasetFromHit(hit.object);
    const local = this.hitToModelPoint(hit.point);
    const realX = local.x + this.origin[0];
    const realY = local.y + this.origin[1];
    const realZ = local.z + this.origin[2];
    this.hoverCoords = [realX, realY, realZ];

    if (this.measureMode) {
      this.measurePoints.push(local.clone());
      if (this.measurePoints.length === 2) {
        const distance = this.measurePoints[0].distanceTo(this.measurePoints[1]);
        this.infoEl.textContent = `测距结果: ${distance.toFixed(3)} | 再点击可重新测量`;
        this.measurePoints = [];
      } else {
        this.infoEl.textContent = "已选择第一个点，请选择第二个点";
      }
      this.updateReadoutHud();
      return;
    }

    if (dataset && (isSpatialWell(dataset) || this.isLineDataset(dataset) || dataset.id !== this.currentDataset?.id)) {
      this.infoEl.textContent = `${dataset.name} | 真实坐标: (${realX.toFixed(0)}, ${realY.toFixed(0)}, ${realZ.toFixed(0)})`;
      this.publishSelection({
        type: this.selectionTypeFor(dataset),
        id: dataset.id,
        coordinates: [realX, realY, realZ],
      });
      return;
    }

    if (!this.mesh || !this.geometry) return;
    const primitiveIndex = hit.faceIndex ?? hit.index ?? 0;
    const primitivesPerCell = Math.max(
      1,
      (this.geometry.getIndex()?.count || 0) / Math.max(this.visibleCellOffsets.length, 1) /
        (this.mesh instanceof THREE.Mesh ? 3 : 1),
    );
    const visibleOffset = Math.floor(primitiveIndex / primitivesPerCell);
    const cellOffset = this.visibleCellOffsets[visibleOffset] ?? visibleOffset;
    const cellId = this.cellIds?.[cellOffset] ?? cellOffset;
    this.infoEl.textContent = `Cell ID: ${cellId} | 真实坐标: (${realX.toFixed(0)}, ${realY.toFixed(0)}, ${realZ.toFixed(0)})`;
    if (this.currentDataset) {
      try {
        const details = await this.fetchJson(
          `/datasets/${encodeURIComponent(this.currentDataset.id)}/cells/${cellId}`,
        );
        this.showDetails([
          `Cell ${details.cell_id}`,
          details.ijk ? `I/J/K: ${details.ijk.join(" / ")}` : "I/J/K: —",
          details.center ? `中心: ${details.center.map((v: number) => Number(v).toFixed(2)).join(", ")}` : "中心: —",
          ...Object.entries(details.properties || {}).map(([name, value]) => `${name}: ${Number(value).toPrecision(6)}`),
        ].join("\n"));
      } catch {
        // Picking remains useful even if the detail request is unavailable.
      }
    }

    this.publishSelection({
      type: "cell",
      id: String(cellId),
      coordinates: [realX, realY, realZ],
    });
  };

  setOnSelection(cb: (sel: { type: string; id: string; coords?: [number, number, number] }) => void) {
    this.onSelectionCallback = cb;
  }

  // ─── External commands (for Command Bridge) ─────────────────────────

  private focusCell(objectId: string): boolean {
    if (!this.geometry || !this.cellIds) return false;
    const requested = Number(objectId);
    if (!Number.isInteger(requested)) return false;
    const cellOffset = this.cellIds.indexOf(requested);
    if (cellOffset < 0) return false;
    const positions = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const corners = this.hexCornerPositions;
    if (corners && corners.length >= (cellOffset + 1) * 24) {
      const center = new THREE.Vector3();
      const first = cellOffset * 24;
      for (let index = 0; index < 8; index++) {
        center.x += corners[first + index * 3];
        center.y += corners[first + index * 3 + 1];
        center.z += corners[first + index * 3 + 2];
      }
      center.multiplyScalar(1 / 8);
      const radius = Math.max(this.geometry.boundingSphere?.radius || 1, 1);
      this.controls.target.copy(center);
      this.camera.position.copy(center).addScalar(radius * 0.08);
      this.controls.update();
      this.infoEl.textContent = `已聚焦 Cell ID: ${requested}`;
      return true;
    }
    const vertsPerCell = this.cellIds.length ? Math.floor(positions.count / this.cellIds.length) : 0;
    const firstVertex = cellOffset * Math.min(8, Math.max(1, vertsPerCell));
    if (firstVertex + 7 >= positions.count) return false;
    const center = new THREE.Vector3();
    for (let index = firstVertex; index < firstVertex + 8; index++) {
      center.x += positions.getX(index);
      center.y += positions.getY(index);
      center.z += positions.getZ(index);
    }
    center.multiplyScalar(1 / 8);
    const radius = Math.max(this.geometry.boundingSphere?.radius || 1, 1);
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScalar(radius * 0.08);
    this.controls.update();
    this.infoEl.textContent = `已聚焦 Cell ID: ${requested}`;
    return true;
  }

  private async focusDatasetObject(objectType: "well" | "segment", objectId: string): Promise<boolean> {
    if (!this.manifest) return false;
    const needle = objectId.trim().toLowerCase();
    const sources = objectType === "well"
      ? new Set(["wellbore", "las", "dlis"])
      : new Set(["network", "network-tube"]);
    const candidates = this.manifest.datasets.filter((dataset) => {
      if (!sources.has(dataset.source || "")) return false;
      if (!needle) return true;
      const wellName = typeof dataset.metadata?.well_name === "string" ? dataset.metadata.well_name : "";
      return [dataset.id, dataset.name, wellName].some((value) => value.toLowerCase() === needle);
    });
    if (candidates.length > 1) return false;
    const dataset = candidates[0];
    if (!dataset) return false;

    if (objectType === "well" && isDepthOnlyWell(dataset)) {
      this.viewRouter.switchTo("welllog");
      if (dataset.id !== this.currentDataset?.id) await this.loadDataset(dataset.id);
      this.infoEl.textContent = `已打开测井: ${wellDisplayName(dataset)}`;
      return true;
    }

    if (objectType === "well" && isSpatialWell(dataset) && this.currentDataset && isGridDataset(this.currentDataset)) {
      await this.toggleDatasetVisibility(dataset, true, { quiet: true });
      const overlay = this.overlayMeshes.get(dataset.id);
      if (!overlay) return false;
      this.frameObject(overlay);
      this.infoEl.textContent = `已聚焦井: ${wellDisplayName(dataset)}`;
      this.publishSelection({ type: "well", id: dataset.id });
      return true;
    }

    if (dataset.id !== this.currentDataset?.id) {
      await this.loadDataset(dataset.id);
    }
    if (objectType === "well" && this.mesh && isSpatialWell(this.currentDataset || dataset)) {
      this.frameObject(this.mesh);
      this.infoEl.textContent = `已聚焦井: ${objectId}`;
      return true;
    }
    if (!this.currentDataset || !sources.has(this.currentDataset.source || "") || !this.geometry || !this.cellIds || !this.baseIndices) return false;

    const positions = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const points = new Set<number>();
    const requested = Number(objectId);
    if (!Number.isFinite(requested) && dataset) {
      for (let index = 0; index < positions.count; index++) points.add(index);
    } else {
      const perCell = this.baseIndices.length / this.cellIds.length;
      if (!Number.isInteger(perCell) || !Number.isFinite(requested)) return false;
      for (let offset = 0; offset < this.cellIds.length; offset++) {
        if (this.cellIds[offset] !== requested) continue;
        const start = offset * perCell;
        for (let index = start; index < start + perCell; index++) {
          const vertex = this.baseIndices[index];
          if (vertex < positions.count) points.add(vertex);
        }
      }
    }
    if (points.size === 0) return false;
    const center = new THREE.Vector3();
    for (const vertex of points) {
      center.x += positions.getX(vertex);
      center.y += positions.getY(vertex);
      center.z += positions.getZ(vertex);
    }
    center.multiplyScalar(1 / points.size);
    const radius = Math.max(this.geometry.boundingSphere?.radius || 1, 1);
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScalar(radius * 0.08);
    this.controls.update();
    this.infoEl.textContent = `已聚焦 ${objectType === "well" ? "井" : "管段"}: ${objectId}`;
    return true;
  }

  async executeCommand(command: string, args: Record<string, any>): Promise<any> {
    switch (command) {
      case "open":
        if (args.datasetId) {
          if (!this.manifest?.datasets.some((dataset) => dataset.id === args.datasetId)) {
            throw new Error(`数据集不存在: ${args.datasetId}`);
          }
          await this.loadDataset(args.datasetId);
        }
        break;
      case "set-property":
        if (args.datasetId && args.datasetId !== this.currentDataset?.id) {
          await this.loadDataset(args.datasetId);
        }
        if (args.property) {
          const propSelect = this.sidebar.querySelector("#vis-property") as HTMLSelectElement;
          const exists = propSelect
            ? Array.from(propSelect.options).some((option) => option.value === args.property)
            : false;
          if (!exists) {
            this.infoEl.textContent = `属性不存在: ${args.property}`;
            throw new Error(`属性不存在: ${args.property}`);
          }
          this.currentProperty = args.property;
          propSelect.value = args.property;
          await this.reloadPropertyColors();
        }
        break;
      case "set-timestep":
        if (args.timeStep !== undefined) {
          this.currentTimeStep = args.timeStep;
          const tsSelect = this.sidebar.querySelector("#vis-timestep") as HTMLSelectElement;
          const value = String(args.timeStep);
          if (!tsSelect || !Array.from(tsSelect.options).some((option) => option.value === value)) {
            this.infoEl.textContent = `时间步不存在: ${args.timeStep}`;
            throw new Error(`时间步不存在: ${args.timeStep}`);
          }
          tsSelect.value = value;
          await this.reloadPropertyColors();
        }
        break;
      case "set-colormap": {
        const colormapSelect = this.sidebar.querySelector("#vis-colormap") as HTMLSelectElement | null;
        const name = String(args.colormap || "");
        if (!colormapSelect || !Array.from(colormapSelect.options).some((option) => option.value === name)) {
          this.infoEl.textContent = `色图不存在: ${name}`;
          throw new Error(`色图不存在: ${name}`);
        }
        this.currentColormap = name;
        colormapSelect.value = name;
        await this.reloadPropertyColors();
        break;
      }
      case "set-opacity": {
        const opacity = Number(args.opacity);
        if (!Number.isFinite(opacity)) break;
        this.applyOpacity(Math.max(0.1, Math.min(1, opacity > 1 ? opacity / 100 : opacity)));
        break;
      }
      case "set-wireframe": {
        this.wireframe = Boolean(args.enabled);
        this.applyWireframeMode();
        break;
      }
      case "set-view":
        if (ViewRouter.VIEWS.includes(String(args.view || "reservoir") as any)) {
          this.viewRouter.switchTo(String(args.view || "reservoir") as any);
        } else {
          throw new Error(`视图不存在: ${String(args.view || "")}`);
        }
        break;
      case "set-filter": {
        if (args.datasetId && args.datasetId !== this.currentDataset?.id) {
          await this.loadDataset(args.datasetId);
        }
        const propSelect = this.sidebar.querySelector("#vis-property") as HTMLSelectElement;
        if (args.property && propSelect && Array.from(propSelect.options).some((option) => option.value === args.property)) {
          this.currentProperty = args.property;
          propSelect.value = args.property;
          await this.reloadPropertyColors();
        }
        const values: Record<string, string | undefined> = {
          "#vis-filter-i": args.i, "#vis-filter-j": args.j, "#vis-filter-k": args.k,
          "#vis-filter-prop-min": args.propertyMin == null ? "" : String(args.propertyMin),
          "#vis-filter-prop-max": args.propertyMax == null ? "" : String(args.propertyMax),
        };
        for (const [selector, value] of Object.entries(values)) {
          const input = this.sidebar.querySelector(selector) as HTMLInputElement;
          if (input && value !== undefined) input.value = value;
        }
        this.filterBounds = Array.isArray(args.bounds) && args.bounds.length === 6 ? args.bounds as [number, number, number, number, number, number] : null;
        this.applyFilters();
        break;
      }
      case "show-report":
        this.showDetails([
          args.title || "油气可视化分析报告",
          `数据集: ${args.dataset || args.dataset_id || "—"}`,
          `属性: ${args.property || "—"}`,
          ...Object.entries(args.stats || {}).map(([name, value]) => `${name}: ${value == null ? "—" : Number(value).toPrecision(6)}`),
        ].join("\n"));
        break;
      case "focus":
        let focused = false;
        if (args.objectType === "cell") {
          focused = this.focusCell(String(args.objectId));
        } else if (args.objectType === "well" || args.objectType === "segment") {
          focused = await this.focusDatasetObject(args.objectType, String(args.objectId));
        }
        if (!focused) {
          this.infoEl.textContent = `无法聚焦 ${args.objectType || "object"}: ${args.objectId || ""}`;
          throw new Error(`无法聚焦 ${args.objectType || "object"}: ${args.objectId || ""}`);
        }
        break;
      case "create-intersection": {
        const datasetId = args.datasetId || this.currentDataset?.id;
        if (!datasetId) break;
        const response = await fetch(
          `${this.apiBase}/datasets/${encodeURIComponent(datasetId)}/intersections`,
          {
            method: "POST",
            headers: { ...this.authHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({
              polyline_x: args.polyline_x,
              polyline_y: args.polyline_y,
              z_min: args.z_min,
              z_max: args.z_max,
              name: args.name,
              property: args.property || this.currentProperty,
            }),
          },
        );
        if (!response.ok) {
          this.infoEl.textContent = `剖面生成失败: HTTP ${response.status}`;
          throw new Error(`剖面生成失败: HTTP ${response.status}`);
        }
        const result = await response.json();
        this.manifest = await this.fetchJson("/manifest");
        this.updateObjectTree();
        this.infoEl.textContent = `剖面已生成: ${result.name || args.name || "section"}`;
        if (result.id) await this.loadDataset(result.id);
        this.viewRouter.switchTo("intersection");
        break;
      }
      case "create-well-section": {
        const datasetId = args.datasetId || this.currentDataset?.id;
        if (!datasetId) break;
        const response = await fetch(
          `${this.apiBase}/datasets/${encodeURIComponent(datasetId)}/well-sections`,
          {
            method: "POST",
            headers: { ...this.authHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({
              well_dataset_id: args.wellDatasetId,
              offset: args.offset ?? 50,
              name: args.name,
              property: args.property || this.currentProperty,
            }),
          },
        );
        if (!response.ok) throw new Error(`井剖面生成失败: HTTP ${response.status}`);
        const wellResult = await response.json();
        this.manifest = await this.fetchJson("/manifest");
        this.updateObjectTree();
        if (wellResult.id) await this.loadDataset(wellResult.id);
        this.viewRouter.switchTo("intersection");
        break;
      }
      case "create-slice": {
        const datasetId = args.datasetId || this.currentDataset?.id;
        if (!datasetId) break;
        const response = await fetch(
          `${this.apiBase}/datasets/${encodeURIComponent(datasetId)}/slices`,
          {
            method: "POST",
            headers: { ...this.authHeaders(), "Content-Type": "application/json" },
            body: JSON.stringify({
              axis: args.axis || "k",
              index: args.index,
              name: args.name,
              property: args.property || this.currentProperty,
            }),
          },
        );
        if (!response.ok) throw new Error(`切片生成失败: HTTP ${response.status}`);
        const sliceResult = await response.json();
        this.manifest = await this.fetchJson("/manifest");
        this.updateObjectTree();
        if (sliceResult.id) await this.loadDataset(sliceResult.id);
        this.viewRouter.switchTo("intersection");
        break;
      }
      case "capture":
        return this.captureScreenshot();
      case "benchmark":
        return this.runBenchmark();
      default:
        throw new Error(`未知命令: ${command}`);
    }
    return { ok: true, command, datasetId: this.currentDataset?.id || null };
  }

  private onResize = () => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w <= 0 || h <= 0) return;
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
    this.applyCameraProjection();
    this.updatePanelOffsets();
  };

  private applyWireframeMode() {
    if (this.hexEdgeLines) {
      this.hexEdgeLines.visible = this.wireframe;
      this.visitMaterials((material) => {
        if (material instanceof THREE.MeshPhongMaterial) {
          material.wireframe = false;
          material.needsUpdate = true;
        }
      });
      return;
    }
    this.visitMaterials((material) => {
      if (material instanceof THREE.MeshPhongMaterial) {
        material.wireframe = this.wireframe;
        material.needsUpdate = true;
      }
    });
  }

  private attachHexEdges(cellCount: number) {
    this.disposeHexEdges();
    const corners = this.hexCornerPositions;
    if (!corners || corners.length !== cellCount * 24) {
      this.isHexMesh = false;
      return;
    }
    this.isHexMesh = true;
    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute("position", new THREE.BufferAttribute(corners, 3));
    const offsets = this.visibleCellOffsets.length
      ? this.visibleCellOffsets
      : Array.from({ length: cellCount }, (_, cell) => cell);
    edgeGeometry.setIndex(new THREE.BufferAttribute(buildHexEdgeIndex(offsets), 1));
    this.hexEdgeLines = new THREE.LineSegments(
      edgeGeometry,
      new THREE.LineBasicMaterial({ color: 0xd0d7de, transparent: true, opacity: 0.85 }),
    );
    this.hexEdgeLines.name = "oilgas-hex-edges";
    this.hexEdgeLines.visible = this.wireframe;
    if (this.mesh) this.mesh.add(this.hexEdgeLines);
    else this.modelRoot.add(this.hexEdgeLines);
  }

  private updateHexEdges() {
    if (!this.hexEdgeLines) return;
    this.hexEdgeLines.geometry.setIndex(
      new THREE.BufferAttribute(buildHexEdgeIndex(this.visibleCellOffsets), 1),
    );
  }

  private disposeHexEdges() {
    if (!this.hexEdgeLines) return;
    this.hexEdgeLines.parent?.remove(this.hexEdgeLines);
    this.hexEdgeLines.geometry.dispose();
    const material = this.hexEdgeLines.material;
    if (Array.isArray(material)) material.forEach((item) => item.dispose());
    else material.dispose();
    this.hexEdgeLines = null;
  }

  // ─── Dispose ──────────────────────────────────────────────────────

  private disposeSceneResources() {
    this.scene.traverse((object) => {
      const renderable = object as THREE.Object3D & {
        geometry?: THREE.BufferGeometry;
        material?: THREE.Material | THREE.Material[];
      };
      renderable.geometry?.dispose();
      if (Array.isArray(renderable.material)) {
        renderable.material.forEach((material) => material.dispose());
      } else {
        renderable.material?.dispose();
      }
    });
  }

  private disposeCurrentMesh() {
    this.disposeHexEdges();
    const mesh = this.mesh;
    const geometry = this.geometry;
    if (mesh) this.disposeObject3D(mesh);
    const meshGeometry = mesh instanceof THREE.Mesh || mesh instanceof THREE.Line || mesh instanceof THREE.LineSegments
      ? mesh.geometry
      : null;
    if (geometry && geometry !== meshGeometry) geometry.dispose();
    this.mesh = null;
    this.geometry = null;
    this.cellIds = null;
    this.baseIndices = null;
    this.currentScalarValues = null;
    this.cellCenters = null;
    this.visibleCellOffsets = [];
    this.isHexMesh = false;
    this.hexCornerPositions = null;
    this.renderer.renderLists.dispose();
  }

  dispose() {
    this.loadGeneration++;
    this.commandBridge.dispose();
    if (this.timestepTimer !== null) {
      window.clearInterval(this.timestepTimer);
      this.timestepTimer = null;
    }
    if (this.sliceTimer !== null) {
      window.clearInterval(this.sliceTimer);
      this.sliceTimer = null;
    }
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.abortController) this.abortController.abort();
    this.renderer.domElement.removeEventListener("click", this.onCanvasClick);
    this.renderer.domElement.removeEventListener("pointermove", this.onCanvasPointerMove);
    this.renderer.domElement.removeEventListener("pointerleave", this.onCanvasPointerLeave);
    this.renderer.domElement.removeEventListener("dblclick", this.onCanvasDblClick);
    this.renderer.domElement.removeEventListener("contextmenu", this.onCanvasContextMenu);
    this.wellMapCanvas?.removeEventListener("click", this.onWellMapClick);
    this.container.removeEventListener("keydown", this.onViewerKeyDown);
    this.dropUnbind?.();
    this.dropUnbind = null;
    this.storeUnsubscribe?.();
    window.removeEventListener("resize", this.onResize);
    this.workerManager.dispose();
    this.disposeCurrentMesh();
    this.clearOverlays();
    this.disposeSceneResources();
    this.controls.dispose();
    this.renderer.dispose();
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    console.info("[oilgas-vis] Viewer disposed");
  }

  update(options: Partial<ViewerMountOptions>) {
    if (options.authToken !== undefined) this.authToken = options.authToken;
    if (options.apiBase) this.apiBase = options.apiBase;
    this.commandBridge.update(options);
  }
}

// ─── Engine registration and runtime API ────────────────────────────────────

/**
 * Register the concrete Three.js implementation behind the engine contract.
 * The registration happens once when the lazy runtime bundle is evaluated;
 * callers no longer need to reach through window.OilGasViewerRuntime to create
 * an engine.
 */
registerEngineFactory("three-reservoir", (options) => {
  const viewer = new ThreeViewerEngine(options.container, {
    apiBase: options.apiBase,
    authToken: options.authToken,
  });
  const command = (name: string, args: Record<string, unknown>) =>
    viewer.executeCommand(name, args);
  return {
    loadDataset: async (datasetId) => { await command("open", { datasetId }); },
    setProperty: (name) => { void command("set-property", { property: name }); },
    setColorMap: (name) => { void command("set-colormap", { colormap: name }); },
    setOpacity: (value) => { void command("set-opacity", { opacity: value }); },
    setWireframe: (enabled) => { void command("set-wireframe", { enabled }); },
    setView: (view) => { void command("set-view", { view }); },
    focusObject: (objectType, id) => { void command("focus", { objectType, objectId: id }); },
    captureScreenshot: () => { void command("capture", {}); return null; },
    runBenchmark: async () => {
      const result = await command("benchmark", {});
      return (result as any) || {
        datasetId: "unknown", p50: 0, p95: 0, p99: 0, fps: 0,
        drawCalls: 0, triangles: 0, jsHeapMB: 0, duration: 5000,
      };
    },
    executeCommand: command,
    update: (next) => viewer.update(next),
    dispose: () => viewer.dispose(),
  };
});

const OilGasViewerRuntime = {
  version: "0.3.6",
  mount(element: HTMLElement, options: ViewerMountOptions): ViewerHandle {
    return mountViewer(element, options);
  },
};

(window as any).OilGasViewerRuntime = OilGasViewerRuntime;
export default OilGasViewerRuntime;
