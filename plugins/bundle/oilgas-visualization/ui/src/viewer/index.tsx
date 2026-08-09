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
      this.worker = new Worker(URL.createObjectURL(blob));
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
  private mesh: THREE.Mesh | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private container: HTMLElement;
  private animationId: number | null = null;
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private fpsInterval = 0;
  private abortController: AbortController | null = null;

  private manifest: DatasetManifest | null = null;
  private currentDataset: DatasetInfo | null = null;
  private currentProperty = "porosity";
  private currentColormap = "viridis";
  private wireframe = false;
  private opacity = 0.85;
  private currentTimeStep = 0;
  private apiBase: string;
  private authToken: string | undefined;
  private origin: [number, number, number] = [0, 0, 0];

  // Filters
  private filterI: [number, number] = [0, Infinity];
  private filterJ: [number, number] = [0, Infinity];
  private filterK: [number, number] = [0, Infinity];
  private filterPropertyRange: [number, number] = [-Infinity, Infinity];

  // Worker
  private workerManager = new WorkerManager();

  // UI
  private sidebar: HTMLElement;
  private hudEl: HTMLElement;
  private infoEl: HTMLElement;
  private objectTree: HTMLElement;

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

    this.startLoop();
    this.init();
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
      width: "280px", background: "rgba(13,17,23,0.92)",
      borderRight: "1px solid #30363d", overflowY: "auto",
      padding: "12px", boxSizing: "border-box", zIndex: "100",
      fontFamily: "-apple-system, sans-serif", color: "#c9d1d9", fontSize: "13px",
    } as CSSStyleDeclaration);

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
    dsSelect.addEventListener("change", () => this.loadDataset(dsSelect.value));
    sidebar.appendChild(dsSelect);

    // Property
    sidebar.appendChild(this.createLabel("属性"));
    const propSelect = document.createElement("select");
    Object.assign(propSelect.style, this.selectStyle);
    propSelect.id = "vis-property";
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
      if (this.mesh) (this.mesh.material as any).opacity = this.opacity;
    });
    sidebar.appendChild(opacitySlider);

    // Wireframe
    sidebar.appendChild(this.createLabel("显示模式"));
    const wfCheck = document.createElement("input");
    wfCheck.type = "checkbox"; wfCheck.id = "vis-wireframe"; wfCheck.style.marginRight = "6px";
    wfCheck.addEventListener("change", () => {
      this.wireframe = wfCheck.checked;
      if (this.mesh) (this.mesh.material as THREE.MeshPhongMaterial).wireframe = this.wireframe;
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
    minInput.addEventListener("change", () => this.applyFilters());
    const maxInput = document.createElement("input");
    maxInput.type = "number"; maxInput.placeholder = "max"; maxInput.step = "0.01";
    maxInput.id = "vis-filter-prop-max";
    Object.assign(maxInput.style, this.selectStyle);
    maxInput.addEventListener("change", () => this.applyFilters());
    propRangeDiv.appendChild(minInput); propRangeDiv.appendChild(maxInput);
    sidebar.appendChild(propRangeDiv);

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

    this.container.appendChild(sidebar);
    return sidebar;
  }

  private buildObjectTree(): HTMLElement {
    const tree = document.createElement("div");
    Object.assign(tree.style, {
      position: "absolute", top: "0", left: "280px", bottom: "0",
      width: "200px", background: "rgba(13,17,23,0.88)",
      borderRight: "1px solid #30363d", overflowY: "auto",
      padding: "8px", zIndex: "90",
      fontFamily: "-apple-system, sans-serif", color: "#8b949e", fontSize: "12px",
    } as CSSStyleDeclaration);

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
    el.style.cssText = "margin: 12px 0 4px; font-size: 12px; color: #8b949e; text-transform: uppercase;";
    return el;
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
          await this.loadDataset(this.manifest.datasets[0].id);
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

    // Build tree: datasets → grid/well/surface/network
    const gridGroup = document.createElement("div");
    gridGroup.style.cssText = "margin-bottom: 8px;";
    const gridHeader = document.createElement("div");
    gridHeader.textContent = "📋 网格";
    gridHeader.style.cssText = "font-weight: 600; color: #c9d1d9; margin-bottom: 4px;";
    gridGroup.appendChild(gridHeader);

    for (const ds of this.manifest.datasets) {
      const item = document.createElement("div");
      item.textContent = `  ${ds.name}`;
      item.style.cssText = "padding: 2px 0 2px 16px; cursor: pointer; color: #8b949e;";
      item.addEventListener("click", () => this.loadDataset(ds.id));
      item.addEventListener("mouseenter", () => { item.style.color = "#58a6ff"; });
      item.addEventListener("mouseleave", () => { item.style.color = "#8b949e"; });
      gridGroup.appendChild(item);
    }
    list.appendChild(gridGroup);

    // Wells placeholder
    const wellGroup = document.createElement("div");
    wellGroup.style.cssText = "margin-bottom: 8px;";
    wellGroup.innerHTML = '<div style="font-weight:600;color:#c9d1d9;margin-bottom:4px;">🛢 井</div><div style="padding-left:16px;color:#484f58;">无井数据</div>';
    list.appendChild(wellGroup);

    // Surfaces placeholder
    const surfGroup = document.createElement("div");
    surfGroup.style.cssText = "margin-bottom: 8px;";
    surfGroup.innerHTML = '<div style="font-weight:600;color:#c9d1d9;margin-bottom:4px;">📐 层面</div><div style="padding-left:16px;color:#484f58;">无层面数据</div>';
    list.appendChild(surfGroup);

    // Network placeholder
    const netGroup = document.createElement("div");
    netGroup.innerHTML = '<div style="font-weight:600;color:#c9d1d9;margin-bottom:4px;">🔗 管网</div><div style="padding-left:16px;color:#484f58;">无管网数据</div>';
    list.appendChild(netGroup);
  }

  private async loadDataset(datasetId: string) {
    if (!this.manifest) return;
    const ds = this.manifest.datasets.find((d) => d.id === datasetId);
    if (!ds) return;
    this.currentDataset = ds;

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

    const [posBuf, idxBuf] = await Promise.all([
      this.fetchBinary(ds.files.positions),
      this.fetchBinary(ds.files.indices),
    ]);

    const positions = new Float32Array(posBuf);
    const indices = new Uint32Array(idxBuf);

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
    this.geometry.computeVertexNormals();

    await this.applyPropertyColors(indices);

    const material = new THREE.MeshPhongMaterial({
      vertexColors: this.geometry.getAttribute("color") !== null,
      side: THREE.DoubleSide, transparent: true,
      opacity: this.opacity, wireframe: this.wireframe,
    });
    if (this.geometry.getAttribute("color") === null) {
      material.color = new THREE.Color(0x4488ff);
    }

    this.mesh = new THREE.Mesh(this.geometry, material);
    this.scene.add(this.mesh);

    const bbox = this.geometry.boundingSphere!;
    this.controls.target.copy(bbox.center);
    this.camera.position.set(
      bbox.center.x + bbox.radius * 1.5,
      bbox.center.y + bbox.radius * 1.5,
      bbox.center.z + bbox.radius * 1.5,
    );
    this.controls.update();

    this.infoEl.textContent = `${ds.name} — ${ds.n_cells.toLocaleString()} cells | 原点: (${cx.toFixed(0)}, ${cy.toFixed(0)}, ${cz.toFixed(0)})`;
  }

  private async applyPropertyColors(indices: Uint32Array) {
    if (!this.geometry || !this.currentDataset) return;

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
    if (!propFile) return;

    const propBuf = await this.fetchBinary(propFile);
    const isFloat = propFile.endsWith(".f32");

    // Try Worker for color computation
    if (this.workerManager.isAvailable()) {
      const result = await this.workerManager.computeColors(
        propBuf, indices.buffer, this.currentColormap,
        this.geometry.getAttribute("position").count, isFloat,
      );
      if (result) {
        this.geometry.setAttribute("color", new THREE.BufferAttribute(result.colors, 3));
        return;
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
  }

  private async reloadPropertyColors() {
    if (!this.mesh || !this.currentDataset || !this.geometry) return;
    const indices = this.geometry.getIndex() as THREE.BufferAttribute;
    await this.applyPropertyColors(indices.array as Uint32Array);
    const mat = this.mesh.material as THREE.MeshPhongMaterial;
    mat.vertexColors = true;
    mat.needsUpdate = true;
  }

  // ─── Filters ───────────────────────────────────────────────────────

  private applyFilters() {
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

    // For now, filters are informational — full implementation would
    // rebuild the index buffer with only matching cells.
    this.infoEl.textContent = `过滤: I=${this.filterI[0]}:${this.filterI[1]} J=${this.filterJ[0]}:${this.filterJ[1]} K=${this.filterK[0]}:${this.filterK[1]} Prop=[${this.filterPropertyRange[0]}, ${this.filterPropertyRange[1]}]`;
  }

  private parseRange(val: string | undefined): [number, number] {
    if (!val || val.trim() === "") return [0, Infinity];
    const parts = val.split(":");
    if (parts.length === 2) {
      return [parseInt(parts[0]) || 0, parseInt(parts[1]) || Infinity];
    }
    const n = parseInt(parts[0]);
    return isNaN(n) ? [0, Infinity] : [n, n];
  }

  // ─── Benchmark & Screenshot ─────────────────────────────────────────

  private async runBenchmark() {
    this.infoEl.textContent = "运行基准测试中... (5秒)";
    const times: number[] = [];
    const start = performance.now();
    let count = 0;
    const measure = () => {
      const now = performance.now();
      if (this.lastFrameTime > 0) times.push(now - this.lastFrameTime);
      this.lastFrameTime = now;
      count++;
      if (now - start < 5000) {
        requestAnimationFrame(measure);
      } else {
        times.sort((a, b) => a - b);
        const p50 = times[Math.floor(times.length * 0.5)] || 0;
        const p95 = times[Math.floor(times.length * 0.95)] || 0;
        const fps = 1000 / (times.reduce((a, b) => a + b, 0) / times.length);
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
    this.lastFrameTime = 0;
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
    link.href = dataURL;
    link.click();
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

  private onCanvasClick = (event: MouseEvent) => {
    if (!this.mesh) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.mesh);
    if (intersects.length > 0) {
      const face = intersects[0].face!;
      const triIdx = Math.floor(face.a / 12);
      const pt = intersects[0].point;
      const realX = pt.x + this.origin[0];
      const realY = pt.y + this.origin[1];
      const realZ = pt.z + this.origin[2];
      this.infoEl.textContent = `Cell ID: ${triIdx} | 真实坐标: (${realX.toFixed(0)}, ${realY.toFixed(0)}, ${realZ.toFixed(0)})`;

      // Cross-view selection sync
      if (this.onSelectionCallback) {
        this.onSelectionCallback({
          type: "cell", id: String(triIdx),
          coords: [realX, realY, realZ],
        });
      }
    }
  };

  setOnSelection(cb: (sel: { type: string; id: string; coords?: [number, number, number] }) => void) {
    this.onSelectionCallback = cb;
  }

  // ─── External commands (for Command Bridge) ─────────────────────────

  async executeCommand(command: string, args: Record<string, any>): Promise<any> {
    switch (command) {
      case "open":
        if (args.datasetId) await this.loadDataset(args.datasetId);
        break;
      case "set-property":
        if (args.property) {
          this.currentProperty = args.property;
          const propSelect = this.sidebar.querySelector("#vis-property") as HTMLSelectElement;
          if (propSelect) propSelect.value = args.property;
          await this.reloadPropertyColors();
        }
        break;
      case "set-timestep":
        if (args.timeStep !== undefined) {
          this.currentTimeStep = args.timeStep;
          const tsSelect = this.sidebar.querySelector("#vis-timestep") as HTMLSelectElement;
          if (tsSelect) tsSelect.value = String(args.timeStep);
          await this.reloadPropertyColors();
        }
        break;
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
  };

  // ─── Dispose ──────────────────────────────────────────────────────

  dispose() {
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
      dispose: () => engine.dispose(),
    };
  },
};

(window as any).OilGasViewerRuntime = OilGasViewerRuntime;
export default OilGasViewerRuntime;
