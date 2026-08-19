/**
 * Oil & Gas Visualization — Viewer Runtime (IIFE entry).
 *
 * Features:
 * - Three.js WebGL rendering with OrbitControls
 * - Web Worker for binary data decoding and color computation
 * - Dataset switching, property coloring, cell picking
 * - Colormap, opacity, wireframe controls
 * - I/J/K, region, property-range filters
 * - Object tree (grid/well/surface/network)
 * - Time step switching (UNRST dynamic properties)
 * - Cross-view selection sync via store
 * - Coordinate origin rebase
 * - FPS/frame/draw calls/heap HUD
 * - Benchmark and leak test
 * - Authenticated API calls
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewRouter } from "./app/view-router";
import { mountViewer } from "./mount";
import { registerEngineFactory } from "./engines/registry";
import { viewerStore } from "./stores/viewerState";
import { sampleColormap as colormap } from "./rendering/colormaps";
import { WorkerManager } from "./workers/workerManager";
import { ViewerCommandBridge } from "./commands/commandBridge";
import type {
  DatasetInfo,
  DatasetManifest,
  ViewerHandle,
  ViewerMountOptions,
} from "./contracts/types";

// ─── Viewer Engine ──────────────────────────────────────────────────────────

class ThreeViewerEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private mesh: THREE.Mesh | THREE.Line | THREE.LineSegments | null = null;
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
  private filterBounds: [number, number, number, number, number, number] | null = null;
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

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d1117);
    this.scene.fog = new THREE.Fog(0x0d1117, 2000, 8000);

    this.camera = new THREE.PerspectiveCamera(50, w / h, 1, 20000);
    this.camera.position.set(3000, 3000, 3000);

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
    this.scene.add(new THREE.GridHelper(5000, 50, 0x30363d, 0x21262d));
    this.scene.add(new THREE.AxesHelper(2000));

    this.renderer.domElement.addEventListener("click", this.onCanvasClick);
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
    this.viewRouter = new ViewRouter(this.container, (view) => {
      void this.applyActiveView(view);
    });
    const viewTabs = this.viewRouter.createTabs();
    viewTabs.className = "oilgas-view-tabs";
    Object.assign(viewTabs.style, { top: "48px", left: "440px", right: "8px", overflowX: "auto" });
    this.container.appendChild(viewTabs);

    this.commandBridge = new ViewerCommandBridge({
      apiBase: this.apiBase,
      authToken: this.authToken,
      viewerId: this.viewerId,
      execute: (command, args) => this.executeCommand(command, args),
      onCommandError: (message) => {
        this.infoEl.textContent = `Agent 命令失败: ${message}`;
      },
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
      position: "absolute", top: "0", left: "0", bottom: "0",
      width: "252px", background: "rgba(13,17,23,0.96)",
      borderRight: "1px solid #30363d", overflowY: "auto",
      padding: "12px", boxSizing: "border-box", zIndex: "100",
      fontFamily: "-apple-system, sans-serif", color: "#c9d1d9", fontSize: "13px",
    } as CSSStyleDeclaration);
    sidebar.className = "oilgas-panel oilgas-control-panel";

    const collapseBtn = document.createElement("button");
    collapseBtn.type = "button";
    collapseBtn.textContent = "‹";
    collapseBtn.title = "收起控制面板";
    collapseBtn.setAttribute("aria-label", "收起控制面板");
    Object.assign(collapseBtn.style, this.iconButtonStyle);
    collapseBtn.style.position = "absolute";
    collapseBtn.style.top = "8px";
    collapseBtn.style.right = "6px";
    collapseBtn.addEventListener("click", () => this.toggleSidebar(collapseBtn));
    sidebar.appendChild(collapseBtn);

    const title = document.createElement("div");
    Object.assign(title.style, {
      fontSize: "15px", fontWeight: "600", marginBottom: "12px",
      color: "#58a6ff", borderBottom: "1px solid #30363d", paddingBottom: "8px",
    });
    title.textContent = "油气三维可视化";
    sidebar.appendChild(title);

    // Dataset
    sidebar.appendChild(this.createLabel("数据集"));
    const dsSelect = document.createElement("select");
    Object.assign(dsSelect.style, this.selectStyle);
    dsSelect.id = "vis-dataset";
    dsSelect.setAttribute("aria-label", "数据集");
    dsSelect.addEventListener("change", () => this.loadDataset(dsSelect.value));
    sidebar.appendChild(dsSelect);

    // Property
    sidebar.appendChild(this.createLabel("属性"));
    const propSelect = document.createElement("select");
    Object.assign(propSelect.style, this.selectStyle);
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
    sidebar.appendChild(propSelect);

    // Time step
    sidebar.appendChild(this.createLabel("时间步"));
    const tsSelect = document.createElement("select");
    Object.assign(tsSelect.style, this.selectStyle);
    tsSelect.id = "vis-timestep";
    tsSelect.setAttribute("aria-label", "时间步");
    tsSelect.innerHTML = '<option value="0">静态</option>';
    tsSelect.addEventListener("change", () => {
      this.currentTimeStep = parseInt(tsSelect.value);
      viewerStore.setTimeStep(this.currentTimeStep);
      this.reloadPropertyColors();
    });
    sidebar.appendChild(tsSelect);

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.textContent = "播放时间步";
    playBtn.title = "播放/暂停动态结果时间步";
    Object.assign(playBtn.style, {
      width: "100%", padding: "6px", background: "#21262d", color: "#c9d1d9",
      border: "1px solid #484f58", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginBottom: "8px",
    });
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
    sidebar.appendChild(playBtn);

    // Colormap
    sidebar.appendChild(this.createLabel("色图"));
    const cmSelect = document.createElement("select");
    Object.assign(cmSelect.style, this.selectStyle);
    cmSelect.id = "vis-colormap";
    cmSelect.setAttribute("aria-label", "色图");
    for (const cm of ["viridis", "plasma", "turbo", "gray"]) {
      const opt = document.createElement("option");
      opt.value = cm; opt.textContent = cm;
      cmSelect.appendChild(opt);
    }
    cmSelect.addEventListener("change", () => {
      this.currentColormap = cmSelect.value;
      viewerStore.setColorMap({ name: this.currentColormap });
      this.reloadPropertyColors();
    });
    sidebar.appendChild(cmSelect);

    // Opacity
    sidebar.appendChild(this.createLabel("透明度"));
    const opacitySlider = document.createElement("input");
    opacitySlider.type = "range"; opacitySlider.min = "10"; opacitySlider.max = "100"; opacitySlider.value = "85";
    Object.assign(opacitySlider.style, { width: "100%", marginBottom: "12px" });
    opacitySlider.addEventListener("input", () => {
      this.opacity = parseInt(opacitySlider.value) / 100;
      if (this.mesh) {
        (this.mesh.material as any).opacity = this.opacity;
        (this.mesh.material as any).needsUpdate = true;
      }
    });
    sidebar.appendChild(opacitySlider);

    // Wireframe
    sidebar.appendChild(this.createLabel("显示模式"));
    const wfCheck = document.createElement("input");
    wfCheck.type = "checkbox"; wfCheck.id = "vis-wireframe"; wfCheck.style.marginRight = "6px";
    wfCheck.addEventListener("change", () => {
      this.wireframe = wfCheck.checked;
      if (this.mesh?.material instanceof THREE.MeshPhongMaterial) {
        this.mesh.material.wireframe = this.wireframe;
      }
    });
    const wfLabel = document.createElement("label");
    wfLabel.style.display = "block"; wfLabel.style.marginBottom = "12px";
    wfLabel.appendChild(wfCheck); wfLabel.appendChild(document.createTextNode("线框模式"));
    sidebar.appendChild(wfLabel);

    // IJK Filters
    sidebar.appendChild(this.createLabel("I/J/K 过滤"));
    const filterDiv = document.createElement("div");
    filterDiv.style.cssText = "display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin-bottom: 12px;";
    for (const axis of ["I", "J", "K"]) {
      const input = document.createElement("input");
      input.type = "text"; input.placeholder = axis;
      input.id = `vis-filter-${axis.toLowerCase()}`;
      input.style.cssText = "width:100%; padding:4px; background:#161b22; border:1px solid #30363d; border-radius:4px; color:#c9d1d9; font-size:11px; text-align:center;";
      input.addEventListener("input", () => this.applyFilters());
      input.addEventListener("change", () => this.applyFilters());
      filterDiv.appendChild(input);
    }
    sidebar.appendChild(filterDiv);

    // Property range filter
    sidebar.appendChild(this.createLabel("属性范围过滤"));
    const propRangeDiv = document.createElement("div");
    propRangeDiv.style.cssText = "display: flex; gap: 4px; margin-bottom: 12px;";
    const minInput = document.createElement("input");
    minInput.type = "number"; minInput.placeholder = "min"; minInput.step = "0.01";
    minInput.id = "vis-filter-prop-min";
    Object.assign(minInput.style, this.selectStyle);
    minInput.addEventListener("input", () => this.applyFilters());
    minInput.addEventListener("change", () => this.applyFilters());
    const maxInput = document.createElement("input");
    maxInput.type = "number"; maxInput.placeholder = "max"; maxInput.step = "0.01";
    maxInput.id = "vis-filter-prop-max";
    Object.assign(maxInput.style, this.selectStyle);
    maxInput.addEventListener("input", () => this.applyFilters());
    maxInput.addEventListener("change", () => this.applyFilters());
    propRangeDiv.appendChild(minInput); propRangeDiv.appendChild(maxInput);
    sidebar.appendChild(propRangeDiv);

    // Section / slice creation
    sidebar.appendChild(this.createLabel("剖面/切片"));
    const polylineInput = document.createElement("input");
    polylineInput.type = "text";
    polylineInput.placeholder = "x,y; x,y; ...";
    polylineInput.id = "vis-polyline";
    Object.assign(polylineInput.style, this.selectStyle);
    sidebar.appendChild(polylineInput);
    const zRangeDiv = document.createElement("div");
    zRangeDiv.style.cssText = "display:flex;gap:4px;margin-bottom:6px;";
    const zMinInput = document.createElement("input");
    zMinInput.type = "number"; zMinInput.placeholder = "z min"; zMinInput.value = "0";
    zMinInput.id = "vis-section-z-min";
    Object.assign(zMinInput.style, this.selectStyle);
    const zMaxInput = document.createElement("input");
    zMaxInput.type = "number"; zMaxInput.placeholder = "z max"; zMaxInput.value = "5000";
    zMaxInput.id = "vis-section-z-max";
    Object.assign(zMaxInput.style, this.selectStyle);
    zRangeDiv.appendChild(zMinInput); zRangeDiv.appendChild(zMaxInput);
    sidebar.appendChild(zRangeDiv);
    const sectionBtn = document.createElement("button");
    sectionBtn.textContent = "生成垂直剖面";
    Object.assign(sectionBtn.style, {
      width: "100%", padding: "7px", background: "#30363d", color: "#c9d1d9",
      border: "1px solid #484f58", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginBottom: "8px",
    });
    sectionBtn.addEventListener("click", () => this.createIntersectionFromUI());
    sidebar.appendChild(sectionBtn);

    const wellSecBtn = document.createElement("button");
    wellSecBtn.textContent = "沿井生成剖面";
    Object.assign(wellSecBtn.style, {
      width: "100%", padding: "7px", background: "#30363d", color: "#c9d1d9",
      border: "1px solid #484f58", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginBottom: "8px",
    });
    wellSecBtn.addEventListener("click", () => { void this.createWellSectionFromUI(); });
    sidebar.appendChild(wellSecBtn);

    sidebar.appendChild(this.createLabel("IJK 切片 / 后处理"));
    const sliceRow = document.createElement("div");
    sliceRow.style.cssText = "display:flex;gap:4px;margin-bottom:6px;";
    const axisSelect = document.createElement("select");
    axisSelect.id = "vis-slice-axis";
    Object.assign(axisSelect.style, this.selectStyle);
    for (const axis of ["k", "i", "j"]) {
      const opt = document.createElement("option");
      opt.value = axis;
      opt.textContent = axis.toUpperCase();
      axisSelect.appendChild(opt);
    }
    const sliceIndex = document.createElement("input");
    sliceIndex.type = "number"; sliceIndex.min = "1"; sliceIndex.value = "1";
    sliceIndex.id = "vis-slice-index";
    Object.assign(sliceIndex.style, this.selectStyle);
    sliceRow.appendChild(axisSelect);
    sliceRow.appendChild(sliceIndex);
    sidebar.appendChild(sliceRow);
    const sliceBtn = document.createElement("button");
    sliceBtn.textContent = "提取切片";
    Object.assign(sliceBtn.style, {
      width: "100%", padding: "7px", background: "#30363d", color: "#c9d1d9",
      border: "1px solid #484f58", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginBottom: "8px",
    });
    sliceBtn.addEventListener("click", () => { void this.createSliceFromUI(); });
    sidebar.appendChild(sliceBtn);

    const isolateK = document.createElement("input");
    isolateK.type = "range"; isolateK.min = "1"; isolateK.max = "1"; isolateK.value = "1";
    isolateK.id = "vis-k-layer";
    Object.assign(isolateK.style, { width: "100%", marginBottom: "4px" });
    isolateK.addEventListener("input", () => {
      const kFilter = this.sidebar.querySelector("#vis-filter-k") as HTMLInputElement | null;
      const isolate = (this.sidebar.querySelector("#vis-isolate-k") as HTMLInputElement | null)?.checked;
      if (kFilter && isolate) {
        kFilter.value = `${isolateK.value}:${isolateK.value}`;
        this.applyFilters();
      }
    });
    sidebar.appendChild(isolateK);
    const isolateLabel = document.createElement("label");
    isolateLabel.style.display = "block"; isolateLabel.style.marginBottom = "8px"; isolateLabel.style.fontSize = "12px";
    const isolateCheck = document.createElement("input");
    isolateCheck.type = "checkbox"; isolateCheck.id = "vis-isolate-k"; isolateCheck.style.marginRight = "6px";
    isolateCheck.addEventListener("change", () => {
      const kFilter = this.sidebar.querySelector("#vis-filter-k") as HTMLInputElement | null;
      if (!kFilter) return;
      kFilter.value = isolateCheck.checked ? `${isolateK.value}:${isolateK.value}` : "";
      this.applyFilters();
    });
    isolateLabel.appendChild(isolateCheck);
    isolateLabel.appendChild(document.createTextNode("只显示当前 K 层"));
    sidebar.appendChild(isolateLabel);

    const clipCheck = document.createElement("input");
    clipCheck.type = "checkbox"; clipCheck.id = "vis-clip"; clipCheck.style.marginRight = "6px";
    const clipLabel = document.createElement("label");
    clipLabel.style.display = "block"; clipLabel.style.marginBottom = "4px"; clipLabel.style.fontSize = "12px";
    clipLabel.appendChild(clipCheck);
    clipLabel.appendChild(document.createTextNode("深度裁剪平面"));
    sidebar.appendChild(clipLabel);
    const clipSlider = document.createElement("input");
    clipSlider.type = "range"; clipSlider.min = "0"; clipSlider.max = "100"; clipSlider.value = "50";
    clipSlider.id = "vis-clip-depth";
    Object.assign(clipSlider.style, { width: "100%", marginBottom: "12px" });
    const applyClip = () => this.applyClipPlane(clipCheck.checked, Number(clipSlider.value) / 100);
    clipCheck.addEventListener("change", applyClip);
    clipSlider.addEventListener("input", applyClip);
    sidebar.appendChild(clipSlider);

    // Benchmark buttons
    sidebar.appendChild(this.createLabel("性能测试"));
    const benchBtn = document.createElement("button");
    benchBtn.textContent = "运行基准测试";
    Object.assign(benchBtn.style, {
      width: "100%", padding: "8px", background: "#238636", color: "#fff",
      border: "1px solid #2ea043", borderRadius: "6px", cursor: "pointer", fontSize: "13px", marginBottom: "8px",
    });
    benchBtn.addEventListener("click", () => this.runBenchmark());
    sidebar.appendChild(benchBtn);

    const dispBtn = document.createElement("button");
    dispBtn.textContent = "内存泄漏测试 (10x)";
    Object.assign(dispBtn.style, {
      width: "100%", padding: "8px", background: "#da3633", color: "#fff",
      border: "1px solid #f85149", borderRadius: "6px", cursor: "pointer", fontSize: "13px",
    });
    dispBtn.addEventListener("click", () => this.runLeakTest());
    sidebar.appendChild(dispBtn);

    // Screenshot
    sidebar.appendChild(this.createLabel("导出"));
    const ssBtn = document.createElement("button");
    ssBtn.textContent = "截图";
    Object.assign(ssBtn.style, {
      width: "100%", padding: "8px", background: "#1f6feb", color: "#fff",
      border: "1px solid #388bfd", borderRadius: "6px", cursor: "pointer", fontSize: "13px", marginBottom: "8px",
    });
    ssBtn.addEventListener("click", () => this.captureScreenshot());
    sidebar.appendChild(ssBtn);

    const statsBtn = document.createElement("button");
    statsBtn.textContent = "属性统计";
    Object.assign(statsBtn.style, {
      width: "100%", padding: "8px", background: "#30363d", color: "#c9d1d9",
      border: "1px solid #484f58", borderRadius: "6px", cursor: "pointer", fontSize: "13px", marginBottom: "8px",
    });
    statsBtn.addEventListener("click", () => this.showDatasetStats());
    sidebar.appendChild(statsBtn);

    const exportBtn = document.createElement("button");
    exportBtn.textContent = "导出属性 CSV";
    Object.assign(exportBtn.style, {
      width: "100%", padding: "8px", background: "#30363d", color: "#c9d1d9",
      border: "1px solid #484f58", borderRadius: "6px", cursor: "pointer", fontSize: "13px",
    });
    exportBtn.addEventListener("click", () => this.exportDataset());
    sidebar.appendChild(exportBtn);

    const sceneExportBtn = document.createElement("button");
    sceneExportBtn.textContent = "导出场景 JSON";
    Object.assign(sceneExportBtn.style, {
      width: "100%", padding: "8px", background: "#30363d", color: "#c9d1d9",
      border: "1px solid #484f58", borderRadius: "6px", cursor: "pointer", fontSize: "13px", marginTop: "8px",
    });
    sceneExportBtn.addEventListener("click", () => this.exportSceneState());
    sidebar.appendChild(sceneExportBtn);

    this.container.appendChild(sidebar);
    return sidebar;
  }

  private buildObjectTree(): HTMLElement {
    const tree = document.createElement("div");
    Object.assign(tree.style, {
      position: "absolute", top: "0", left: "280px", bottom: "0",
      width: "176px", background: "rgba(13,17,23,0.92)",
      borderRight: "1px solid #30363d", overflowY: "auto",
      padding: "8px", zIndex: "90", boxSizing: "border-box",
      fontFamily: "-apple-system, sans-serif", color: "#8b949e", fontSize: "12px",
    } as CSSStyleDeclaration);
    tree.className = "oilgas-panel oilgas-object-panel";

    const collapseBtn = document.createElement("button");
    collapseBtn.type = "button";
    collapseBtn.textContent = "‹";
    collapseBtn.title = "收起对象树";
    collapseBtn.setAttribute("aria-label", "收起对象树");
    Object.assign(collapseBtn.style, this.iconButtonStyle);
    collapseBtn.style.position = "absolute";
    collapseBtn.style.top = "8px";
    collapseBtn.style.right = "6px";
    collapseBtn.addEventListener("click", () => this.toggleObjectTree(collapseBtn));
    tree.appendChild(collapseBtn);

    const title = document.createElement("div");
    title.style.cssText = "font-weight:600; color:#58a6ff; margin-bottom:8px; font-size:13px;";
    title.textContent = "对象树";
    tree.appendChild(title);

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
    const width = this.sidebarCollapsed ? "42px" : "252px";
    this.sidebar.style.width = width;
    for (const child of Array.from(this.sidebar.children)) {
      if (child !== button) (child as HTMLElement).style.display = this.sidebarCollapsed ? "none" : "";
    }
    button.style.display = "block";
    button.textContent = this.sidebarCollapsed ? "›" : "‹";
    button.title = this.sidebarCollapsed ? "展开控制面板" : "收起控制面板";
    button.setAttribute("aria-label", button.title);
    this.updatePanelOffsets();
  }

  private toggleObjectTree(button: HTMLButtonElement) {
    this.objectTreeCollapsed = !this.objectTreeCollapsed;
    const width = this.objectTreeCollapsed ? "34px" : "176px";
    this.objectTree.style.width = width;
    this.objectTree.style.padding = this.objectTreeCollapsed ? "0" : "8px";
    for (const child of Array.from(this.objectTree.children)) {
      if (child !== button) (child as HTMLElement).style.display = this.objectTreeCollapsed ? "none" : "";
    }
    button.style.display = this.objectTreeCollapsed ? "block" : "block";
    button.style.right = this.objectTreeCollapsed ? "5px" : "6px";
    button.textContent = this.objectTreeCollapsed ? "›" : "‹";
    button.title = this.objectTreeCollapsed ? "展开对象树" : "收起对象树";
    button.setAttribute("aria-label", button.title);
    this.updatePanelOffsets();
  }

  private updatePanelOffsets() {
    const sidebarWidth = this.sidebarCollapsed ? 42 : 252;
    const treeWidth = this.objectTreeCollapsed ? 34 : 176;
    this.objectTree.style.left = `${sidebarWidth}px`;
    this.toolbarEl?.style.setProperty("left", `${sidebarWidth + treeWidth + 12}px`);
    this.container.querySelector<HTMLElement>(".oilgas-view-tabs")?.style.setProperty("left", `${sidebarWidth + treeWidth + 12}px`);
    this.infoEl.style.left = `${sidebarWidth + 8}px`;
  }

  private buildToolbar(): HTMLElement {
    const toolbar = document.createElement("div");
    Object.assign(toolbar.style, {
      position: "absolute", top: "8px", left: "440px", right: "8px", height: "34px",
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
    addButton("适配", "适配当前数据", () => this.fitView());
    addButton("重置", "重置视图", () => this.resetView());
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
    addButton("对象", "切换对象树", () => {
      const btn = this.objectTree.querySelector("button") as HTMLButtonElement | null;
      if (btn) this.toggleObjectTree(btn);
    });
    const spacer = document.createElement("span"); spacer.style.flex = "1"; toolbar.appendChild(spacer);
    const hint = document.createElement("span"); hint.textContent = "拖拽旋转 · 滚轮缩放 · 点击拾取";
    hint.style.cssText = "font-size:11px;color:#8b949e;white-space:nowrap;"; toolbar.appendChild(hint);
    this.container.appendChild(toolbar);
    return toolbar;
  }

  private fitView() {
    if (!this.geometry) return;
    this.geometry.computeBoundingBox();
    const box = this.geometry.boundingBox;
    if (!box) return;
    this.frameBox(box);
  }

  private frameBox(box: THREE.Box3) {
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const direction = new THREE.Vector3(1, 1, 0.8).normalize();
    const verticalFov = THREE.MathUtils.degToRad(this.camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * this.camera.aspect);
    const distanceForWidth = (size.x + size.y) * 0.5 / Math.tan(horizontalFov / 2);
    const distanceForHeight = (size.z + 0.45 * (size.x + size.y)) * 0.5
      / Math.tan(verticalFov / 2);
    const distance = Math.max(distanceForWidth, distanceForHeight, 1) * 1.15;
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.controls.update();
  }

  private resetView() {
    this.fitView();
    this.currentColormap = "viridis";
    const select = this.sidebar.querySelector("#vis-colormap") as HTMLSelectElement | null;
    if (select) select.value = this.currentColormap;
    void this.reloadPropertyColors();
  }

  private filterStateSnapshot(): string {
    const value = (selector: string) => (this.sidebar.querySelector(selector) as HTMLInputElement | null)?.value || "";
    return JSON.stringify({
      i: value("#vis-filter-i"), j: value("#vis-filter-j"), k: value("#vis-filter-k"),
      min: value("#vis-filter-prop-min"), max: value("#vis-filter-prop-max"),
      bounds: this.filterBounds,
    });
  }

  private restoreFilterSnapshot(snapshot: string) {
    const state = JSON.parse(snapshot) as { i?: string; j?: string; k?: string; min?: string; max?: string; bounds?: number[] | null };
    const fields: Record<string, string> = {
      "#vis-filter-i": state.i || "", "#vis-filter-j": state.j || "", "#vis-filter-k": state.k || "",
      "#vis-filter-prop-min": state.min || "", "#vis-filter-prop-max": state.max || "",
    };
    for (const [selector, value] of Object.entries(fields)) {
      const input = this.sidebar.querySelector(selector) as HTMLInputElement | null;
      if (input) input.value = value;
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
      camera: {
        position: this.camera.position.toArray(),
        target: this.controls.target.toArray(),
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
      if (Array.isArray(scene.camera?.position) && scene.camera.position.length === 3) this.camera.position.fromArray(scene.camera.position);
      if (Array.isArray(scene.camera?.target) && scene.camera.target.length === 3) this.controls.target.fromArray(scene.camera.target);
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
      camera: { position: this.camera.position.toArray(), target: this.controls.target.toArray() },
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
      position: "absolute", top: "8px", right: "8px",
      background: "rgba(22,27,34,0.85)", border: "1px solid #30363d",
      borderRadius: "8px", padding: "10px 14px", fontSize: "12px",
      fontFamily: "monospace", pointerEvents: "none", zIndex: "10", minWidth: "160px",
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
      pointerEvents: "none", boxSizing: "border-box",
    } as CSSStyleDeclaration);
    const title = document.createElement("div");
    title.dataset.legendTitle = "true";
    title.style.cssText = "display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#c9d1d9;font-weight:600;";
    el.appendChild(title);
    const gradient = document.createElement("div");
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
    this.legendEl.style.display = this.currentProperty ? "block" : "none";
    this.renderHistogram();
  }

  private buildHistogram(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 72;
    Object.assign(canvas.style, {
      position: "absolute", right: "12px", bottom: "92px", width: "160px", height: "56px",
      background: "rgba(13,17,23,.82)", border: "1px solid #30363d", borderRadius: "6px", zIndex: "12",
    } as CSSStyleDeclaration);
    canvas.title = "属性直方图";
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
    canvas.style.display = "block";
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
    const material = this.mesh.material as THREE.MeshPhongMaterial;
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
    if (!this.manifest) return;
    const sourceOf = (dataset: DatasetInfo) => dataset.source || "";
    const pickFirst = (sources: string[]) => this.manifest!.datasets.find((item) => sources.includes(sourceOf(item)));
    const current = this.currentDataset?.source || "";
    if (view === "reservoir") {
      const grid = this.manifest.datasets.find((item) => !this.overlaySources("wellbore").concat(this.overlaySources("intersection"), this.overlaySources("network"), ["surface"]).includes(sourceOf(item)));
      if (grid && grid.id !== this.currentDataset?.id) await this.loadDataset(grid.id);
    } else if (view === "wellbore") {
      if (!["wellbore", "las", "dlis"].includes(current)) {
        const well = pickFirst(["wellbore", "las", "dlis"]);
        if (well) await this.loadDataset(well.id);
        else this.infoEl.textContent = "没有井轨迹。导入 LAS 或含 WELL/PERF 的 CMG 模型。";
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
    return this.manifest?.datasets.find((item) => ["wellbore", "las", "dlis"].includes(item.source || ""));
  }

  private async createWellSectionFromUI() {
    if (!this.currentDataset) return;
    const well = this.currentDataset.source === "wellbore" || this.currentDataset.source === "las"
      ? this.currentDataset
      : this.firstWellDataset();
    if (!well) {
      this.showDetails("没有可用井轨迹，无法生成井剖面");
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
      this.manifest = await this.fetchJson("/manifest");
      const dsSelect = this.sidebar.querySelector("#vis-dataset") as HTMLSelectElement;
      if (dsSelect && this.manifest) {
        dsSelect.innerHTML = "";
        for (const ds of this.manifest.datasets) {
          const opt = document.createElement("option");
          opt.value = ds.id;
          opt.textContent = `${ds.name} (${ds.n_cells.toLocaleString()} cells)`;
          dsSelect.appendChild(opt);
        }
        this.updateObjectTree();
        if (this.manifest.datasets.length > 0) {
          const preferred = this.manifest.datasets.find((item) =>
            !["intersection", "well-intersection"].includes(item.source || "") &&
            Object.keys(item.files.scalars || {}).length > 0,
          ) || this.manifest.datasets.find((item) =>
            !["intersection", "well-intersection"].includes(item.source || ""),
          ) || this.manifest.datasets[0];
          await this.loadDataset(preferred.id);
        }
      }
    } catch (err) {
      this.infoEl.textContent = `加载失败: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  private updateObjectTree() {
    const list = this.objectTree.querySelector("#vis-object-list");
    if (!list || !this.manifest) return;
    list.innerHTML = "";

    const appendGroup = (title: string, datasets: DatasetInfo[]) => {
      const group = document.createElement("div");
      group.style.cssText = "margin-bottom: 8px;";
      const header = document.createElement("div");
      header.textContent = title;
      header.style.cssText = "font-weight:600;color:#c9d1d9;margin-bottom:4px;";
      group.appendChild(header);
      if (datasets.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = "暂无数据";
        empty.style.cssText = "padding-left:16px;color:#484f58;";
        group.appendChild(empty);
      }
      for (const dataset of datasets) {
        const item = document.createElement("div");
        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = dataset.id === this.currentDataset?.id || this.overlayMeshes.has(dataset.id);
        check.title = `显示/隐藏 ${dataset.name}`;
        check.setAttribute("aria-label", `显示/隐藏 ${dataset.name}`);
        check.style.marginRight = "5px";
        check.addEventListener("click", (event) => event.stopPropagation());
        check.addEventListener("change", () => { void this.toggleDatasetVisibility(dataset, check.checked); });
        item.appendChild(check);
        item.appendChild(document.createTextNode(dataset.name));
        item.dataset.datasetId = dataset.id;
        item.title = `${dataset.name} · ${dataset.n_cells.toLocaleString()} cells`;
        item.style.cssText = "padding:4px 6px 4px 14px;margin:1px 0;border-radius:4px;cursor:pointer;color:#8b949e;line-height:1.35;";
        item.addEventListener("click", () => this.loadDataset(dataset.id));
        item.addEventListener("mouseenter", () => { if (item.dataset.selected !== "true") item.style.color = "#58a6ff"; });
        item.addEventListener("mouseleave", () => { if (item.dataset.selected !== "true") item.style.color = "#8b949e"; });
        group.appendChild(item);
      }
      list.appendChild(group);
    };
    const datasets = this.manifest.datasets;
    appendGroup("📋 网格", datasets.filter((item) => !["las", "dlis", "network", "network-tube", "wellbore", "surface", "intersection", "well-intersection", "slice"].includes(item.source || "")));
    appendGroup("🛢 井", datasets.filter((item) => ["las", "dlis", "wellbore"].includes(item.source || "")));
    appendGroup("📐 层面/剖面", datasets.filter((item) => ["surface", "intersection", "well-intersection", "slice"].includes(item.source || "")));
    appendGroup("🔗 管网", datasets.filter((item) => ["network", "network-tube"].includes(item.source || "")));
  }

  private isLineDataset(dataset: DatasetInfo): boolean {
    return ["las", "dlis", "network", "wellbore"].includes(dataset.source || "");
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
      this.scene.remove(overlay);
      const renderable = overlay as THREE.Object3D & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
      renderable.geometry?.dispose();
      if (Array.isArray(renderable.material)) renderable.material.forEach((material) => material.dispose());
      else renderable.material?.dispose();
    }
    this.overlayMeshes.clear();
    this.overlayLoading.clear();
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

  private async toggleDatasetVisibility(dataset: DatasetInfo, visible: boolean) {
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
      const origin = this.origin;
      const localPositions = new Float32Array(positions.length);
      for (let index = 0; index < positions.length; index += 3) {
        localPositions[index] = positions[index] - origin[0];
        localPositions[index + 1] = positions[index + 1] - origin[1];
        localPositions[index + 2] = positions[index + 2] - origin[2];
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(localPositions, 3));
      const renderIndices = this.isLineDataset(dataset)
        ? this.lineRenderIndices(dataset, indices, localPositions.length / 3)
        : indices;
      geometry.setIndex(new THREE.BufferAttribute(renderIndices, 1));
      if (!this.isLineDataset(dataset)) geometry.computeVertexNormals();
      const material = this.isLineDataset(dataset)
        ? new THREE.LineBasicMaterial({ color: dataset.source === "network" || dataset.source === "network-tube" ? 0xffb86c : 0xff6b9d, transparent: true, opacity: 0.95 })
        : new THREE.MeshPhongMaterial({ color: 0x8b949e, transparent: true, opacity: 0.45, side: THREE.DoubleSide, wireframe: true });
      const overlay = this.isLineDataset(dataset)
        ? (dataset.source === "network" || dataset.source === "network-tube"
          ? new THREE.LineSegments(geometry, material as THREE.LineBasicMaterial)
          : new THREE.Line(geometry, material as THREE.LineBasicMaterial))
        : new THREE.Mesh(geometry, material as THREE.MeshPhongMaterial);
      overlay.name = `oilgas-overlay-${dataset.id}`;
      overlay.visible = visible;
      this.scene.add(overlay);
      this.overlayMeshes.set(dataset.id, overlay);
      this.setTreeVisibility(dataset.id, visible);
      this.showDetails(`已加入场景：${dataset.name}\n对象类型：${dataset.source || "unknown"}`);
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

    // Coordinate origin rebase
    let cx = 0, cy = 0, cz = 0;
    const nVerts = positions.length / 3;
    for (let i = 0; i < positions.length; i += 3) {
      if (!Number.isFinite(positions[i]) || !Number.isFinite(positions[i + 1]) || !Number.isFinite(positions[i + 2])) {
        this.datasetLoading = false;
        this.infoEl.textContent = "加载失败：坐标数据包含非有限值";
        return;
      }
      cx += positions[i]; cy += positions[i + 1]; cz += positions[i + 2];
    }
    cx /= nVerts; cy /= nVerts; cz /= nVerts;

    const localPositions = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += 3) {
      localPositions[i] = positions[i] - cx;
      localPositions[i + 1] = positions[i + 1] - cy;
      localPositions[i + 2] = positions[i + 2] - cz;
    }

    const isLineDataset = this.isLineDataset(ds);
    const nextGeometry = new THREE.BufferGeometry();
    nextGeometry.setAttribute("position", new THREE.BufferAttribute(localPositions, 3));
    const renderIndices = isLineDataset
      ? this.lineRenderIndices(ds, indices, localPositions.length / 3)
      : indices;
    nextGeometry.setIndex(new THREE.BufferAttribute(renderIndices, 1));
    nextGeometry.computeBoundingBox();
    nextGeometry.computeBoundingSphere();
    if (!isLineDataset) nextGeometry.computeVertexNormals();

    let hasVertexColors = false;
    try {
      const colorResult = await this.applyPropertyColors(nextGeometry, ds, indices, generation);
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
    this.baseIndices = indices;
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

    if (isLineDataset) {
      const material = new THREE.LineBasicMaterial({
        vertexColors: hasVertexColors,
        color: hasVertexColors ? 0xffffff : 0x58a6ff,
        transparent: true,
        opacity: this.opacity,
      });
      this.mesh = ["network", "wellbore"].includes(ds.source || "")
        ? new THREE.LineSegments(this.geometry, material)
        : new THREE.Line(this.geometry, material);
    } else {
      const material = new THREE.MeshPhongMaterial({
        vertexColors: hasVertexColors,
        side: THREE.DoubleSide, transparent: true,
        opacity: this.opacity, wireframe: this.wireframe,
        clippingPlanes: [],
      });
      // Three.js renders transparent DoubleSide materials in two passes by
      // default. Closed reservoir cells need only one pass here.
      material.forceSinglePass = true;
      if (!hasVertexColors) material.color = new THREE.Color(0x4488ff);
      this.mesh = new THREE.Mesh(this.geometry, material);
    }
    this.scene.add(this.mesh);

    const bbox = this.geometry.boundingSphere!;
    const radius = Math.max(bbox.radius, 1);
    this.camera.near = Math.max(radius / 10_000, 0.1);
    this.camera.far = Math.max(radius * 20, 20_000);
    this.camera.updateProjectionMatrix();
    this.scene.fog = new THREE.Fog(0x0d1117, radius * 4, radius * 10);
    if (this.geometry.boundingBox) this.frameBox(this.geometry.boundingBox);
    this.controls.minDistance = radius * 0.01;
    this.controls.maxDistance = radius * 20;
    this.controls.update();

    this.infoEl.textContent = `${ds.name} — ${ds.n_cells.toLocaleString()} cells | 原点: (${cx.toFixed(0)}, ${cy.toFixed(0)}, ${cz.toFixed(0)})`;
    const kSlider = this.sidebar.querySelector("#vis-k-layer") as HTMLInputElement | null;
    if (kSlider && ds.grid_dims?.[2]) {
      kSlider.max = String(ds.grid_dims[2]);
      kSlider.value = kSlider.value || "1";
    }
    const sliceIndex = this.sidebar.querySelector("#vis-slice-index") as HTMLInputElement | null;
    if (sliceIndex && ds.grid_dims?.[2]) sliceIndex.max = String(ds.grid_dims[2]);
    if (this.viewRouter.getActiveView() === "welllog") this.renderWellLog();
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
    const mat = this.mesh.material as THREE.MeshPhongMaterial | THREE.LineBasicMaterial;
    mat.vertexColors = hasVertexColors;
    if (!hasVertexColors) mat.color.set(0x4488ff);
    mat.needsUpdate = true;
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
      );
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
      if (this.lastFrameTime > 0) {
        const dt = time - this.lastFrameTime;
        this.frameTimes.push(dt);
        if (this.frameTimes.length > 60) this.frameTimes.shift();
      }
      this.lastFrameTime = time;
      if (++this.fpsInterval >= 30) { this.fpsInterval = 0; this.updateHud(); }
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

  private onCanvasClick = async (event: MouseEvent) => {
    if (this.datasetLoading || !this.mesh || !this.geometry) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.mesh);
    if (intersects.length > 0) {
      if (this.measureMode) {
        this.measurePoints.push(intersects[0].point.clone());
        if (this.measurePoints.length === 2) {
          const distance = this.measurePoints[0].distanceTo(this.measurePoints[1]);
          this.infoEl.textContent = `测距结果: ${distance.toFixed(3)} | 再点击可重新测量`;
          this.measurePoints = [];
        } else {
          this.infoEl.textContent = "已选择第一个点，请选择第二个点";
        }
        return;
      }
      const primitiveIndex = intersects[0].faceIndex ?? intersects[0].index ?? 0;
      const primitivesPerCell = Math.max(
        1,
        (this.geometry.getIndex()?.count || 0) / Math.max(this.visibleCellOffsets.length, 1) /
          (this.mesh instanceof THREE.Mesh ? 3 : 1),
      );
      const visibleOffset = Math.floor(primitiveIndex / primitivesPerCell);
      const cellOffset = this.visibleCellOffsets[visibleOffset] ?? visibleOffset;
      const cellId = this.cellIds?.[cellOffset] ?? cellOffset;
      const pt = intersects[0].point;
      const realX = pt.x + this.origin[0];
      const realY = pt.y + this.origin[1];
      const realZ = pt.z + this.origin[2];
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

      // Cross-view selection sync
      if (this.onSelectionCallback) {
        this.onSelectionCallback({
          type: "cell", id: String(cellId),
          coords: [realX, realY, realZ],
        });
      }
      viewerStore.setSelection({
        type: "cell", id: String(cellId),
        coordinates: [realX, realY, realZ],
      });
    }
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
    const firstVertex = cellOffset * 8;
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
      return [dataset.id, dataset.name].some((value) => value.toLowerCase() === needle);
    });
    if (candidates.length > 1) return false;
    const dataset = candidates[0];
    if (dataset && dataset.id !== this.currentDataset?.id) {
      await this.loadDataset(dataset.id);
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
        this.opacity = Math.max(0.1, Math.min(1, opacity > 1 ? opacity / 100 : opacity));
        if (this.mesh) {
          const material = this.mesh.material as THREE.Material & { opacity: number; needsUpdate: boolean };
          material.opacity = this.opacity;
          material.needsUpdate = true;
        }
        break;
      }
      case "set-wireframe": {
        this.wireframe = Boolean(args.enabled);
        if (this.mesh?.material instanceof THREE.MeshPhongMaterial) {
          this.mesh.material.wireframe = this.wireframe;
          this.mesh.material.needsUpdate = true;
        }
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
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.updatePanelOffsets();
  };

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
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      const material = this.mesh.material;
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material.dispose();
    }
    this.mesh = null;
    this.geometry = null;
    this.cellIds = null;
    this.baseIndices = null;
    this.currentScalarValues = null;
    this.cellCenters = null;
    this.visibleCellOffsets = [];
    this.renderer.renderLists.dispose();
  }

  dispose() {
    this.loadGeneration++;
    this.commandBridge.dispose();
    if (this.timestepTimer !== null) {
      window.clearInterval(this.timestepTimer);
      this.timestepTimer = null;
    }
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.abortController) this.abortController.abort();
    this.renderer.domElement.removeEventListener("click", this.onCanvasClick);
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
  version: "0.3.0",
  mount(element: HTMLElement, options: ViewerMountOptions): ViewerHandle {
    return mountViewer(element, options);
  },
};

(window as any).OilGasViewerRuntime = OilGasViewerRuntime;
export default OilGasViewerRuntime;
