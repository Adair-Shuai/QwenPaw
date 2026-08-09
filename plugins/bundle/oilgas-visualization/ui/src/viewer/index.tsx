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

// ─── Colormaps ─────────────────────────────────────────────────────────────

const colormaps: Record<string, number[][]> = {
  viridis: [[0.267,0.005,0.329],[0.282,0.140,0.457],[0.254,0.265,0.530],[0.207,0.372,0.553],[0.164,0.471,0.558],[0.138,0.567,0.550],[0.135,0.659,0.518],[0.157,0.745,0.467],[0.215,0.813,0.398],[0.350,0.851,0.333],[0.536,0.851,0.261],[0.737,0.813,0.185],[0.921,0.737,0.089],[0.993,0.906,0.144]],
  plasma: [[0.051,0.028,0.528],[0.184,0.039,0.606],[0.310,0.020,0.653],[0.431,0.004,0.678],[0.550,0.020,0.682],[0.665,0.058,0.662],[0.773,0.137,0.616],[0.867,0.249,0.541],[0.937,0.379,0.448],[0.980,0.516,0.345],[0.993,0.651,0.250],[0.969,0.772,0.169],[0.921,0.873,0.102],[0.886,0.961,0.090]],
  turbo: [[0.189,0.000,0.381],[0.340,0.060,0.590],[0.470,0.080,0.870],[0.530,0.220,0.930],[0.550,0.340,0.970],[0.560,0.450,0.960],[0.570,0.550,0.940],[0.590,0.650,0.900],[0.620,0.730,0.830],[0.680,0.800,0.740],[0.770,0.860,0.620],[0.870,0.910,0.480],[0.980,0.950,0.330],[0.990,0.980,0.150]],
  gray: [[0.1,0.1,0.1],[0.3,0.3,0.3],[0.5,0.5,0.5],[0.7,0.7,0.7],[0.9,0.9,0.9]],
};

function colormap(name: string, t: number): [number, number, number] {
  const cm = colormaps[name] || colormaps.viridis;
  const idx = Math.max(0, Math.min(cm.length - 1, Math.floor(t * (cm.length - 1))));
  const next = Math.min(cm.length - 1, idx + 1);
  const frac = t * (cm.length - 1) - idx;
  return [cm[idx][0]+(cm[next][0]-cm[idx][0])*frac, cm[idx][1]+(cm[next][1]-cm[idx][1])*frac, cm[idx][2]+(cm[next][2]-cm[idx][2])*frac];
}

// ─── Types ────────────────────────────────────────────────────────────────

interface DatasetInfo {
  id: string; name: string; n_vertices: number; n_cells: number; n_indices: number;
  grid_dims?: number[]; source?: string;
  files: { positions: string; indices: string; cell_ids: string; scalars: Record<string, string>; };
  time_steps?: { index: number; step_number: number; scalars: Record<string, string>; }[];
  metadata?: Record<string, unknown>;
}
interface DatasetManifest { version: number; datasets: DatasetInfo[]; }
interface ViewerMountOptions { apiBase: string; authToken?: string; }
interface ViewerHandle { update(options: Partial<ViewerMountOptions>): void; dispose(): void; }

// ─── Worker Manager ─────────────────────────────────────────────────────────

class WorkerManager {
  private worker: Worker | null = null;
  private workerUrl: string | null = null;
  private pending: Map<string, (data: any) => void> = new Map();
  private pendingColors: Map<string, (data: any) => void> = new Map();
  private msgId = 0;

  constructor() {
    try {
      // Inline worker from blob URL (self-contained, no separate file fetch)
      const workerCode = `
        const colormaps = ${JSON.stringify(colormaps)};
        function colormap(name, t) {
          const cm = colormaps[name] || colormaps.viridis;
          const idx = Math.max(0, Math.min(cm.length-1, Math.floor(t*(cm.length-1))));
          const next = Math.min(cm.length-1, idx+1);
          const frac = t*(cm.length-1)-idx;
          return [cm[idx][0]+(cm[next][0]-cm[idx][0])*frac, cm[idx][1]+(cm[next][1]-cm[idx][1])*frac, cm[idx][2]+(cm[next][2]-cm[idx][2])*frac];
        }
        self.onmessage = async function(e) {
          const msg = e.data;
          if (msg.type === "decode") {
            try {
              const resp = await fetch(msg.url, { headers: msg.authToken ? {Authorization:"Bearer "+msg.authToken} : {} });
              if (!resp.ok) { self.postMessage({type:"error",id:msg.id,error:"HTTP "+resp.status}); return; }
              const buf = await resp.arrayBuffer();
              self.postMessage({type:"decoded",id:msg.id,buffer:buf}, [buf]);
            } catch(err) { self.postMessage({type:"error",id:msg.id,error:String(err)}); }
          } else if (msg.type === "compute-colors") {
            const scalars = msg.isFloat ? new Float32Array(msg.scalars) : new Uint32Array(msg.scalars);
            const indices = new Uint32Array(msg.indices);
            let smin=Infinity, smax=-Infinity;
            for (let i=0; i<scalars.length; i++) { if(scalars[i]<smin)smin=scalars[i]; if(scalars[i]>smax)smax=scalars[i]; }
            const srange = smax-smin || 1;
            const nVerts = msg.nVerts;
            const colors = new Float32Array(nVerts*3);
            const vCount = new Float32Array(nVerts);
            const ipc = indices.length / scalars.length;
            for (let c=0; c<scalars.length; c++) {
              const t = (scalars[c]-smin)/srange;
              const [r,g,b] = colormap(msg.colormap, t);
              const start = c*ipc;
              for (let k=0; k<ipc; k++) { const vi=indices[start+k]; if(vi<nVerts){colors[vi*3]+=r;colors[vi*3+1]+=g;colors[vi*3+2]+=b;vCount[vi]++;} }
            }
            for (let i=0; i<nVerts; i++) { const c=vCount[i]||1; colors[i*3]/=c; colors[i*3+1]/=c; colors[i*3+2]/=c; }
            self.postMessage({type:"colors",id:msg.id,colors,smin,smax}, [colors.buffer]);
          }
        };
      `;
      const blob = new Blob([workerCode], { type: "application/javascript" });
      this.workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(this.workerUrl);
      this.worker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === "decoded") {
          const resolve = this.pending.get(msg.id);
          if (resolve) { resolve(new Float32Array(msg.buffer)); this.pending.delete(msg.id); }
        } else if (msg.type === "colors") {
          const resolve = this.pendingColors.get(msg.id);
          if (resolve) { resolve({colors: msg.colors, smin: msg.smin, smax: msg.smax}); this.pendingColors.delete(msg.id); }
        } else if (msg.type === "error") {
          const resolve = this.pending.get(msg.id) || this.pendingColors.get(msg.id);
          if (resolve) { resolve(null); this.pending.delete(msg.id); this.pendingColors.delete(msg.id); }
        }
      };
    } catch (err) {
      console.warn("[oilgas-vis] Worker creation failed, falling back to main thread", err);
    }
  }

  isAvailable(): boolean { return this.worker !== null; }

  decode(url: string, authToken?: string): Promise<Float32Array | null> {
    if (!this.worker) return Promise.resolve(null);
    return new Promise((resolve) => {
      const id = `decode-${this.msgId++}`;
      this.pending.set(id, resolve);
      this.worker!.postMessage({ type: "decode", id, url, authToken });
    });
  }

  computeColors(
    scalars: ArrayBuffer, indices: ArrayBuffer, colormap: string,
    nVerts: number, isFloat: boolean,
  ): Promise<{ colors: Float32Array; smin: number; smax: number } | null> {
    if (!this.worker) return Promise.resolve(null);
    return new Promise((resolve) => {
      const id = `colors-${this.msgId++}`;
      this.pendingColors.set(id, resolve);
      this.worker!.postMessage(
        { type: "compute-colors", id, scalars, indices, colormap, nVerts, isFloat },
        [scalars, indices],
      );
    });
  }

  dispose() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl);
      this.workerUrl = null;
    }
    this.pending.clear();
    this.pendingColors.clear();
  }
}

// ─── Viewer Engine ──────────────────────────────────────────────────────────

class ThreeViewerEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private mesh: THREE.Mesh | THREE.Line | THREE.LineSegments | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private cellIds: Uint32Array | null = null;
  private baseIndices: Uint32Array | null = null;
  private visibleCellOffsets: number[] = [];
  private currentScalarValues: Float32Array | Uint32Array | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private container: HTMLElement;
  private animationId: number | null = null;
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private fpsInterval = 0;
  private abortController: AbortController | null = null;
  private loadGeneration = 0;
  private commandTimer: number | null = null;

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

    const w = container.clientWidth;
    const h = container.clientHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    this.toolbarEl = this.buildToolbar();

    this.startLoop();
    this.init();
    this.startCommandPolling();
  }

  // ─── Auth helpers ──────────────────────────────────────────────────
  private authHeaders(): Record<string, string> {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }

  private async fetchJson(path: string): Promise<any> {
    const resp = await fetch(`${this.apiBase}${path}`, { headers: this.authHeaders() });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  private async fetchBinary(filename: string): Promise<ArrayBuffer> {
    // Try Worker first, fall back to main thread
    const url = `${this.apiBase}/resource/${filename}`;
    if (this.workerManager.isAvailable()) {
      const result = await this.workerManager.decode(url, this.authToken);
      if (result) return result.buffer;
    }
    const resp = await fetch(url, { headers: this.authHeaders() });
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
      this.reloadPropertyColors();
    });
    sidebar.appendChild(tsSelect);

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
    if (!this.geometry?.boundingSphere) return;
    const bbox = this.geometry.boundingSphere;
    const radius = Math.max(bbox.radius, 1);
    this.controls.target.copy(bbox.center);
    this.camera.position.set(bbox.center.x + radius * 1.5, bbox.center.y + radius * 1.5, bbox.center.z + radius * 1.5);
    this.controls.update();
  }

  private resetView() {
    this.fitView();
    this.currentColormap = "viridis";
    const select = this.sidebar.querySelector("#vis-colormap") as HTMLSelectElement | null;
    if (select) select.value = this.currentColormap;
    void this.reloadPropertyColors();
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
    const response = await fetch(
      `${this.apiBase}/datasets/${encodeURIComponent(this.currentDataset.id)}/intersections`,
      {
        method: "POST", headers: { ...this.authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          polyline_x: points.map(([x]) => x), polyline_y: points.map(([, y]) => y),
          z_min: zMin, z_max: zMax, name: `section_${Date.now()}`,
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
        item.textContent = dataset.name;
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
    appendGroup("📋 网格", datasets.filter((item) => !["las", "dlis", "network", "network-tube", "wellbore", "surface", "intersection", "well-intersection"].includes(item.source || "")));
    appendGroup("🛢 井", datasets.filter((item) => ["las", "dlis", "wellbore"].includes(item.source || "")));
    appendGroup("📐 层面/剖面", datasets.filter((item) => ["surface", "intersection", "well-intersection"].includes(item.source || "")));
    appendGroup("🔗 管网", datasets.filter((item) => ["network", "network-tube"].includes(item.source || "")));
  }

  private async loadDataset(datasetId: string) {
    if (!this.manifest) return;
    const ds = this.manifest.datasets.find((d) => d.id === datasetId);
    if (!ds) return;
    this.currentDataset = ds;
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

    const [posBuf, idxBuf, cellIdBuf] = await Promise.all([
      this.fetchBinary(ds.files.positions),
      this.fetchBinary(ds.files.indices),
      this.fetchBinary(ds.files.cell_ids),
    ]);
    if (generation !== this.loadGeneration) return;

    const positions = new Float32Array(posBuf);
    const indices = new Uint32Array(idxBuf);
    this.cellIds = new Uint32Array(cellIdBuf);
    this.baseIndices = indices;
    this.visibleCellOffsets = Array.from({ length: this.cellIds.length }, (_, index) => index);

    // Coordinate origin rebase
    let cx = 0, cy = 0, cz = 0;
    const nVerts = positions.length / 3;
    for (let i = 0; i < positions.length; i += 3) {
      cx += positions[i]; cy += positions[i + 1]; cz += positions[i + 2];
    }
    cx /= nVerts; cy /= nVerts; cz /= nVerts;
    this.origin = [cx, cy, cz];

    const localPositions = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += 3) {
      localPositions[i] = positions[i] - cx;
      localPositions[i + 1] = positions[i + 1] - cy;
      localPositions[i + 2] = positions[i + 2] - cz;
    }

    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(localPositions, 3));
    this.geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    this.geometry.computeBoundingSphere();
    const isLineDataset = ["las", "dlis", "network", "wellbore"].includes(ds.source || "");
    if (!isLineDataset) this.geometry.computeVertexNormals();

    const hasVertexColors = await this.applyPropertyColors(indices);
    if (generation !== this.loadGeneration) return;

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
    this.controls.target.copy(bbox.center);
    this.camera.position.set(
      bbox.center.x + radius * 1.5,
      bbox.center.y + radius * 1.5,
      bbox.center.z + radius * 1.5,
    );
    this.controls.minDistance = radius * 0.01;
    this.controls.maxDistance = radius * 20;
    this.controls.update();

    this.infoEl.textContent = `${ds.name} — ${ds.n_cells.toLocaleString()} cells | 原点: (${cx.toFixed(0)}, ${cy.toFixed(0)}, ${cz.toFixed(0)})`;
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
  }

  private async applyPropertyColors(indices: Uint32Array): Promise<boolean> {
    if (!this.geometry || !this.currentDataset) return false;
    this.geometry.deleteAttribute("color");
    this.currentScalarValues = null;
    this.scalarMin = 0;
    this.scalarMax = 1;

    // Determine property file: static or time-step
    let propFile: string | undefined;
    const ts = this.currentTimeStep;
    if (ts > 0 && this.currentDataset.time_steps) {
      const stepInfo = this.currentDataset.time_steps.find(s => s.index === ts - 1);
      if (stepInfo) {
        propFile = stepInfo.scalars[this.currentProperty];
      }
    }
    if (!propFile) {
      propFile = this.currentDataset.files.scalars[this.currentProperty];
    }
    if (!propFile) {
      this.updateLegend();
      return false;
    }

    const propBuf = await this.fetchBinary(propFile);
    const isFloat = propFile.endsWith(".f32");
    const retainedScalars = propBuf.slice(0);
    this.currentScalarValues = isFloat
      ? new Float32Array(retainedScalars)
      : new Uint32Array(retainedScalars);

    const vertexCount = this.geometry.getAttribute("position").count;
    if (["las", "dlis", "network", "wellbore"].includes(this.currentDataset.source || "") &&
        this.currentScalarValues.length === vertexCount) {
      let minimum = Infinity;
      let maximum = -Infinity;
      for (const value of this.currentScalarValues) {
        minimum = Math.min(minimum, value);
        maximum = Math.max(maximum, value);
      }
      this.scalarMin = minimum;
      this.scalarMax = maximum;
      const range = maximum - minimum || 1;
      const colors = new Float32Array(vertexCount * 3);
      for (let index = 0; index < vertexCount; index++) {
        const [r, g, b] = colormap(
          this.currentColormap,
          (this.currentScalarValues[index] - minimum) / range,
        );
        colors[index * 3] = r;
        colors[index * 3 + 1] = g;
        colors[index * 3 + 2] = b;
      }
      this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      this.updateLegend();
      return true;
    }

    // Try Worker for color computation
    if (this.workerManager.isAvailable()) {
      const result = await this.workerManager.computeColors(
        propBuf, indices.slice().buffer, this.currentColormap,
        this.geometry.getAttribute("position").count, isFloat,
      );
      if (result) {
        this.scalarMin = result.smin;
        this.scalarMax = result.smax;
        this.geometry.setAttribute("color", new THREE.BufferAttribute(result.colors, 3));
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

    const positions = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const nVerts = positions.count;
    const colors = new Float32Array(nVerts * 3);
    const vCount = new Float32Array(nVerts);
    const ipc = indices.length / scalars.length;

    for (let c = 0; c < scalars.length; c++) {
      const t = (scalars[c] - smin) / srange;
      const [r, g, b] = colormap(this.currentColormap, t);
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
    this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.updateLegend();
    return true;
  }

  private async reloadPropertyColors() {
    if (!this.mesh || !this.currentDataset || !this.geometry) return;
    const indices = this.geometry.getIndex() as THREE.BufferAttribute;
    const hasVertexColors = await this.applyPropertyColors(indices.array as Uint32Array);
    const mat = this.mesh.material as THREE.MeshPhongMaterial | THREE.LineBasicMaterial;
    mat.vertexColors = hasVertexColors;
    if (!hasVertexColors) mat.color.set(0x4488ff);
    mat.needsUpdate = true;
    this.applyFilters();
  }

  // ─── Filters ───────────────────────────────────────────────────────

  private applyFilters() {
    if (!this.geometry || !this.currentDataset || !this.cellIds || !this.baseIndices) return;
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
      if (this.filterBounds && this.geometry) {
        const position = this.geometry.getAttribute("position") as THREE.BufferAttribute;
        const start = offset * indicesPerCell;
        const vertexSet = new Set<number>();
        for (let index = start; index < start + indicesPerCell; index++) vertexSet.add(this.baseIndices[index]);
        let count = 0; let cx = 0; let cy = 0; let cz = 0;
        for (const vertex of vertexSet) {
          if (vertex >= position.count) continue;
          cx += position.getX(vertex) + this.origin[0];
          cy += position.getY(vertex) + this.origin[1];
          cz += position.getZ(vertex) + this.origin[2];
          count++;
        }
        if (count) {
          cx /= count; cy /= count; cz /= count;
          const [xmin, xmax, ymin, ymax, zmin, zmax] = this.filterBounds;
          passesBounds = cx >= xmin && cx <= xmax && cy >= ymin && cy <= ymax && cz >= zmin && cz <= zmax;
        }
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
    for (let i = 0; i < 10; i++) {
      if (this.mesh) {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        (this.mesh.material as THREE.Material).dispose();
        this.mesh = null;
      }
      if (this.currentDataset) {
        await this.loadDataset(this.currentDataset.id);
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    const after = (performance as any).memory?.usedJSHeapSize || 0;
    const delta = (after - before) / 1024 / 1024;
    this.infoEl.textContent = `泄漏测试: retained ${delta.toFixed(1)} MiB (阈值 ≤100 MiB)`;
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
  }

  // ─── Picking with cross-view selection sync ─────────────────────────

  private onCanvasClick = async (event: MouseEvent) => {
    if (!this.mesh) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.mesh);
    if (intersects.length > 0) {
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
    }
  };

  setOnSelection(cb: (sel: { type: string; id: string; coords?: [number, number, number] }) => void) {
    this.onSelectionCallback = cb;
  }

  // ─── External commands (for Command Bridge) ─────────────────────────

  private startCommandPolling() {
    const poll = async () => {
      try {
        const payload = await this.fetchJson(`/commands?viewerId=${encodeURIComponent(this.viewerId)}`);
        for (const item of payload.commands || []) {
          await this.executeCommand(item.command, item.args || {});
        }
      } catch (err) {
        // A transient backend restart should not take down the WebGL viewer.
        console.debug("[oilgas-vis] Command polling unavailable:", err);
      }
    };
    void poll();
    this.commandTimer = window.setInterval(poll, 750);
  }

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

  async executeCommand(command: string, args: Record<string, any>): Promise<any> {
    switch (command) {
      case "open":
        if (args.datasetId) await this.loadDataset(args.datasetId);
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
            break;
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
            break;
          }
          tsSelect.value = value;
          await this.reloadPropertyColors();
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
        if (args.objectType !== "cell" || !this.focusCell(String(args.objectId))) {
          this.infoEl.textContent = `无法聚焦 ${args.objectType || "object"}: ${args.objectId || ""}`;
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
            }),
          },
        );
        if (!response.ok) {
          this.infoEl.textContent = `剖面生成失败: HTTP ${response.status}`;
          break;
        }
        const result = await response.json();
        this.infoEl.textContent = `剖面已生成: ${result.name || args.name || "section"}`;
        break;
      }
      case "capture":
        return this.captureScreenshot();
      case "benchmark":
        return this.runBenchmark();
      default:
        console.warn("[oilgas-vis] Unknown command:", command);
    }
  }

  private onResize = () => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.updatePanelOffsets();
  };

  // ─── Dispose ──────────────────────────────────────────────────────

  dispose() {
    this.loadGeneration++;
    if (this.commandTimer !== null) {
      window.clearInterval(this.commandTimer);
      this.commandTimer = null;
    }
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.abortController) this.abortController.abort();
    this.renderer.domElement.removeEventListener("click", this.onCanvasClick);
    window.removeEventListener("resize", this.onResize);
    this.workerManager.dispose();
    if (this.mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
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
  }
}

// ─── Runtime API ─────────────────────────────────────────────────────────────

const OilGasViewerRuntime = {
  version: "0.2.0",
  mount(element: HTMLElement, options: ViewerMountOptions): ViewerHandle {
    const engine = new ThreeViewerEngine(element, options);
    return {
      update: (opts) => engine.update(opts),
      executeCommand: (command, args) => engine.executeCommand(command, args),
      dispose: () => engine.dispose(),
    };
  },
};

(window as any).OilGasViewerRuntime = OilGasViewerRuntime;
export default OilGasViewerRuntime;
