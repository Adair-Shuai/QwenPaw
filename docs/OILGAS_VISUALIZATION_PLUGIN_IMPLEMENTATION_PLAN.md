# QwenPaw 油气三维可视化插件：完整实施方案

> 历史文档：可视化能力已在 2026-08-10 完整迁入 UGSci，独立
> `oilgas-visualization` 插件不再作为当前架构或发布单元。当前实现位于
> `plugins/bundle/ugsci/visualization`、`ugsci/file_artifacts` 和
> `ugsci/ui/src/visualization`。

> 文档状态：可执行设计稿
> 编写日期：2026-08-09
> 目标读者：负责实现、测试、集成和性能验证的开发 Agent
> 首版交付形态：独立、可安装、可卸载的 QwenPaw 插件
> 建议插件 ID：`oilgas-visualization`
> 建议页面路由：`/oilgas-visualization`

> 架构审查结论（2026-08-09）：**Conditional Go**。独立插件、统一数据协议和分阶段性能门总体合理，但必须先通过第 2.2 节的可打包性门槛，并落实 Workspace 延迟注册、内容哈希产物、完整 dist 校验和 Viewer Command Bridge。任何一项 P0 门槛失败都不得继续业务功能开发。

---

## 1. 最终目标

在 QwenPaw 中新增一个面向油气数据的专业可视化工作区，首版作为独立插件运行，验证功能、兼容性、打包体积、内存和渲染性能；验证合格后，再通过轻量桥接方式并入 UGSci 的菜单、工作流和 Agent 工具体系。

首版必须做到：

1. 不修改 QwenPaw 核心业务代码即可安装和卸载；按照当前插件管理行为，前端变更在页面 reload 后完全生效，不承诺无刷新热启停。
2. 正常启动 QwenPaw 时不加载 Three.js、Webviz Viewer、videx-3d 等重型依赖。
3. 用户进入油气可视化页面或打开受支持文件时，才加载三维运行时。
4. 统一管理三维网格、井、层面、剖面、测井和管网数据。
5. 使用同一套领域数据协议隔离文件解析器和渲染引擎，以便替换具体开源库。
6. 内置可重复运行的性能基准，所有技术选择用真实数据和指标决定。
7. 首版与 UGSci 零源码耦合；后续集成只增加桥接代码，不复制核心实现。

### 1.1 首版明确不做

- 不复制或部署完整的 `equinor/webviz` 前后端平台。
- 不在首版实现专业储层建模编辑器。
- 不在首版修改 EGRID/ROFF 原始网格拓扑。
- 不在首版承诺支持所有地震体格式。
- 不把 Webviz、videx-3d 和 vtk.js 强行混入同一个 WebGL Canvas。
- 不允许为每个网格单元创建一个 React 组件或 Three.js Mesh。
- 不通过巨型 JSON 传输网格几何和动态属性。

---

## 2. 已确认的 QwenPaw 集成基础

本方案直接复用仓库现有能力：

| QwenPaw 能力 | 位置 | 本插件用途 |
| --- | --- | --- |
| 插件 manifest | `src/qwenpaw/plugins/architecture.py` | 声明前后端入口和版本约束 |
| 前端插件动态加载 | `console/src/plugins/usePluginLoader.ts` | 加载轻量 bootstrap |
| 页面和菜单注册 | `window.QwenPaw.route/menu` | 独立工作区页面 |
| 宿主 React/Ant Design | `window.QwenPaw.host` | bootstrap 和外壳 UI |
| FastAPI router 注册 | `PluginAPI.register_http_router()` | 数据集、任务和二进制资源 API |
| Workspace Renderer SDK | `window.QwenPaw.workspace` | 让 LAS/EGRID 等文件在工作区打开 |
| Renderer Registry | `console/src/components/Workspace/store/rendererRegistry.ts` | 按 MIME/扩展名匹配专业渲染器 |
| Workspace Artifact | `console/src/components/Workspace/types/index.ts` | 文件、工具调用和页面之间传递数据 |
| 独立插件 UI 构建 | `plugins/bundle/ugsci/ui` | 可参考的插件构建和注册方式 |

### 2.1 必须规避的现有加载限制

QwenPaw 当前会在启动时获取所有带 `frontend_entry` 的插件，并执行入口模块。入口通过“fetch 文本 -> Blob URL -> `import()`”运行。

因此：

- 插件 `ui/dist/index.js` 必须是轻量 bootstrap，目标体积小于 150 KiB，硬上限 300 KiB。
- bootstrap 不得静态 import Three.js、R3F、Webviz、videx、vtk.js。
- 重型 viewer 必须构建为第二个独立产物，在页面真正挂载时再 fetch。
- 不应依赖 Blob 模块中的相对动态 import；其基准 URL 是 `blob:`，相对 chunk 容易失效。

建议使用“双运行时”结构：

```text
QwenPaw host React
  └─ 轻量 OilGasPluginPage 外壳
       └─ <div ref={mountPoint} />
            └─ 按需加载 viewer-runtime.js
                 └─ viewer runtime 自己的 React root
                      └─ Webviz / videx / vtk / charts
```

重型 viewer runtime 以单文件 IIFE 或单文件自包含 ESM 构建，并公开：

```ts
interface OilGasViewerRuntime {
  mount(element: HTMLElement, options: ViewerMountOptions): ViewerHandle;
  version: string;
}

interface ViewerHandle {
  update(options: Partial<ViewerMountOptions>): void;
  dispose(): Promise<void> | void;
}
```

首选 IIFE：它可以把 viewer 使用的 React/ReactDOM 以及三维依赖封装在自己的 React root 中，避免与宿主 React hooks 混用。代价是多打包约 100–150 KiB React 运行时，但换来最稳定的插件边界。

bootstrap 本身不得写 `import React from "react"`，应像 UGSci 一样从 `window.QwenPaw.host.React` 获取宿主 React。viewer runtime 则不得把 React 组件返回给宿主 root，只公开 DOM mount API，跨边界只传递普通对象、ID、URL 和回调。

建议的 lazy loader 流程：优先加载同源、内容哈希命名的经典 IIFE 脚本。不要默认先把 10–20 MiB runtime 读成字符串再转 Blob，这会增加加载时间和峰值内存。只有直接 `<script src>` 在目标 WebView 失败时才使用 Blob 回退。

```ts
let runtimePromise: Promise<OilGasViewerRuntime> | null = null;

function loadViewerRuntime(): Promise<OilGasViewerRuntime> {
  if (runtimePromise) return runtimePromise;
  runtimePromise = (async () => {
    const host = window.QwenPaw.host;
    const url = host.getApiUrl(
      "frontend_plugin/oilgas-visualization/files/ui/dist/" +
        "viewer-runtime-<CONTENT_HASH>.js",
    );
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.dataset.plugin = "oilgas-visualization";
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Viewer runtime execution failed"));
      document.head.appendChild(script);
    });
    return window.OilGasViewerRuntime;
  })();
  return runtimePromise;
}
```

生产实现还必须处理：加载超时、失败后清空 `runtimePromise` 以允许 retry、CSS 的按需加载、页面卸载时取消尚未完成的请求，以及插件升级后的缓存失效。`<CONTENT_HASH>` 必须由构建生成并写入 bootstrap，因此 runtime/CSS 改变也会改变 `index.js` 的 frontend revision。

### 2.2 P0 可行性门：业务开发前必须通过

在创建完整后端和 UI 之前，先做一个最小兼容性 spike：

| 门槛 | 验证内容 | 失败处理 |
| --- | --- | --- |
| P0-A：包可构建 | Webviz、videx 分别能被目标 Vite 配置构建 | 该引擎 No-Go，切换 adapter 候选 |
| P0-B：Tauri 可执行 | IIFE、CSS、shader、字体可在 macOS/Windows WebView 加载 | 修正插件本地产物，不先改 QwenPaw core |
| P0-C：Worker 可执行 | `blob:` Worker 和本地后端 Worker 各跑一次 echo/transfer test | 实测失败才提最小 CSP 修改 |
| P0-D：资源 URL | 上游包内部 `import.meta.url`、Worker、WASM、相对图片不丢失 | 改为显式 asset URL/inline worker；不能修则淘汰引擎 |
| P0-E：React 隔离 | 独立 React root 无 duplicate React/hook 错误 | 调整打包，禁止跨 root 传 React 节点 |
| P0-F：资源释放 | mount/dispose 10 次不累积 Canvas/Worker/listener | 不通过不得接入真实数据 |

当前 Tauri CSP 的 `script-src` 已允许 `blob:` 和 `http://127.0.0.1:*`。CSP 标准在未声明 `worker-src` 时会依次回退到 `child-src`、`script-src`、`default-src`，所以不预先修改 QwenPaw CSP；但必须用真实 Tauri WebView 测试，而不是只在 Chrome Dev Server 测试。如果具体 WebView 仍阻断 Worker，才提交最小、独立的 `worker-src` 上游改动及回归测试。

### 2.3 Workspace SDK 注册竞态

`window.QwenPaw.workspace` 当前由宿主通过异步 import 安装，可能晚于插件 bootstrap。不得只做一次 `if (QP.workspace)` 检查。bootstrap 必须实现幂等等待：

```ts
async function waitForWorkspaceSdk(timeoutMs = 10_000) {
  const started = performance.now();
  while (!window.QwenPaw.workspace) {
    if (performance.now() - started > timeoutMs) return null;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return window.QwenPaw.workspace;
}
```

路由和菜单立即注册；Workspace Renderer 在 SDK ready 后注册。所有 `Disposable` 必须保存在 bootstrap registry 中，防止热重试导致重复注册。当前插件管理器在卸载成功后会 reload 页面，因此首版不新增宿主级热卸载协议。

---

## 3. 技术选型和职责分工

### 3.1 候选选型与决策门

| 层 | 技术 | 职责 |
| --- | --- | --- |
| 插件宿主 | QwenPaw Plugin API | 生命周期、菜单、路由、后端、Workspace 注册 |
| UI 框架 | React + TypeScript | 页面、工具栏、状态和面板 |
| 轻量状态 | Zustand | viewer 内部场景和选择状态 |
| 储层视图 | `@webviz/subsurface-viewer` | 首选 PoC；只有通过 P0 和 Phase 1 benchmark 后才成为正式依赖 |
| 精细井筒视图 | `@equinor/videx-3d` | 首选 PoC；通过 P0 和 Phase 3 benchmark 后正式采用 |
| 剖面 | `@equinor/esv-intersection` | 井剖面、井间相关剖面 |
| 测井 | `@equinor/videx-wellog` | 多轨测井、MD/TVD、交互缩放和读取 |
| 三维扩展 | Three.js + R3F | 管线、设施、流向、定制场景图层 |
| 体数据候选 | vtk.js | 第二阶段任意切片、体渲染、等值面 |
| 二维管网 | React Flow 或 Cytoscape.js | 生产网络拓扑 |
| 数据读取 | xtgeo、resdata/opm.io、lasio、dlisio | 专业文件读取 |
| 列式数据 | NumPy + Arrow IPC | 属性、轨迹、测井、网络数据传输 |
| 后端 API | FastAPI | 导入任务、manifest、资源流和缓存 |
| 后台执行 | asyncio + 线程/进程池 | 文件解析和几何预处理不阻塞 API |

### 3.2 必须保留 Adapter 层

不得让页面业务代码直接依赖某个三维库的数据类型。定义下列接口：

```ts
interface SceneEngine {
  readonly id: "webviz" | "videx" | "vtk" | "three";
  mount(container: HTMLElement, context: SceneContext): Promise<void>;
  loadDataset(dataset: DatasetManifest): Promise<void>;
  setVisibleObjects(ids: string[]): void;
  setProperty(property: PropertySelection): Promise<void>;
  setTimeStep(index: number): Promise<void>;
  setSelection(selection: DomainSelection | null): void;
  focus(target: CameraTarget): void;
  resize(width: number, height: number, dpr: number): void;
  getMetrics(): RendererMetrics;
  dispose(): Promise<void> | void;
}
```

实现：

- `WebvizReservoirEngine`
- `VidexWellboreEngine`
- `ThreeNetworkEngine`
- 后续 `VtkVolumeEngine`

### 3.3 多引擎如何“融合”

首版在数据和交互层融合，不在渲染上下文层硬融合：

```text
统一 DatasetManifest / SelectionStore / TimeStore / ColorMapStore
          │
          ├─ 储层 3D 标签页：WebvizReservoirEngine
          ├─ 精细井筒标签页：VidexWellboreEngine
          ├─ 剖面标签页：ESV Intersection
          ├─ 测井标签页：Videx Wellog
          └─ 管网标签页：Three 3D + React Flow 2D
```

这些视图共享：

- 当前数据集；
- 当前井、网格单元、管线和层位选择；
- 当前属性和时间步；
- 颜色表；
- 深度基准与坐标系；
- 可见性状态；
- 统一命令和撤销栈（涉及 UI 操作时）。

当用户在储层视图选择一口井，井筒、剖面和测井视图同步切换到该井。首版不要求不同三维引擎之间实时同步相机矩阵。

---

## 4. 插件目录结构

```text
plugins/bundle/oilgas-visualization/
├── plugin.json
├── plugin.py
├── README.md
├── LICENSES/
│   └── THIRD_PARTY_NOTICES.md
├── backend/
│   ├── __init__.py
│   ├── api.py
│   ├── models.py
│   ├── settings.py
│   ├── security.py
│   ├── jobs/
│   │   ├── manager.py
│   │   ├── models.py
│   │   └── progress.py
│   ├── readers/
│   │   ├── base.py
│   │   ├── synthetic.py
│   │   ├── eclipse.py
│   │   ├── roff.py
│   │   ├── las.py
│   │   ├── dlis.py
│   │   └── tabular_network.py
│   ├── converters/
│   │   ├── grid_surface.py
│   │   ├── wellbore.py
│   │   ├── surface.py
│   │   ├── intersection.py
│   │   └── network.py
│   ├── cache/
│   │   ├── layout.py
│   │   ├── manifest_store.py
│   │   └── resource_store.py
├── contracts/
│   ├── dataset-manifest.schema.json
│   ├── import-request.schema.json
│   └── examples/
├── ui/
│   ├── package.json
│   ├── vite.bootstrap.config.ts
│   ├── vite.viewer.config.ts
│   ├── src/
│   │   ├── bootstrap/
│   │   │   ├── index.ts
│   │   │   ├── PluginPage.ts
│   │   │   ├── WorkspaceRenderer.ts
│   │   │   └── viewerLoader.ts
│   │   └── viewer/
│   │       ├── index.tsx
│   │       ├── mount.tsx
│   │       ├── app/
│   │       ├── api/
│   │       ├── contracts/
│   │       ├── engines/
│   │       ├── panels/
│   │       ├── stores/
│   │       ├── workers/
│   │       ├── benchmark/
│   │       └── tests/
│   └── dist/
│       ├── index.js                 # 轻量 bootstrap
│       ├── viewer-runtime-<hash>.js  # 用户进入页面后才加载
│       └── viewer-runtime-<hash>.css
└── skills/
    └── oilgas-visualization/
        └── SKILL.md
```

测试和大 fixture 放在插件目录之外，避免桌面打包脚本递归携带：

```text
tests/plugins/oilgas_visualization/
├── backend/
├── frontend/
└── fixtures/
```

Phase 0/1 的所有 runtime 产物必须直接位于 `ui/dist/` 顶层，不创建嵌套 `assets/`。原因是桌面正式打包会递归收集插件，但当前开发同步脚本只同步入口文件的同级文件。关闭 source map；不得把 benchmark 原始数据、真实模型、测试源和缓存放进插件运行目录。

### 4.1 manifest 草案

```json
{
  "id": "oilgas-visualization",
  "name": "Oil & Gas Visualization",
  "version": "0.1.0",
  "type": "general",
  "description": "油气三维网格、井、剖面、测井和管网可视化工作区",
  "entry": {
    "frontend": "ui/dist/index.js",
    "backend": "plugin.py"
  },
  "dependencies": [],
  "qwenpaw_version": {
    "min": "2.0.0",
    "max": "2.1.0"
  },
  "meta": {
    "category": "domain-visualization",
    "features": [
      "reservoir-grid",
      "wellbore-3d",
      "intersection",
      "well-log",
      "flow-network",
      "benchmark"
    ]
  }
}
```

---

## 5. 统一领域数据协议

### 5.1 设计原则

1. manifest 使用 JSON，只保存元数据和资源描述。
2. 大数组使用 little-endian TypedArray 二进制或 Arrow IPC。
3. 网格几何和属性分离；切换属性不得重新发送几何。
4. 动态属性按时间步分块，不一次载入全部时间步。
5. 所有资源带内容哈希、字节数、dtype 和 shape。
6. 原始文件不可直接暴露任意本地路径给浏览器。
7. 显式声明 CRS、Z 正方向、单位和深度基准。
8. 需要 Range 的资源按 chunk 分文件压缩；不得对一个巨大资源整体 zstd 后再宣称可随机 Range 读取。

### 5.2 DatasetManifest 草案

```ts
interface DatasetManifest {
  schemaVersion: "1.0";
  datasetId: string;
  name: string;
  source: {
    kind: "synthetic" | "eclipse" | "roff" | "las" | "dlis" | "csv";
    displayName: string;
    fingerprint: string;
  };
  coordinateSystem: {
    crs?: string;
    axisOrder: ["x", "y", "z"];
    zPositive: "up" | "down";
    horizontalUnit: "m" | "ft";
    verticalUnit: "m" | "ft";
    origin?: [number, number, number];
  };
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
  timeAxis?: {
    kind: "date" | "elapsed" | "index";
    values: Array<string | number>;
    unit?: string;
  };
  objects: DomainObject[];
  resources: ResourceDescriptor[];
  statistics: {
    cellCount?: number;
    activeCellCount?: number;
    wellCount?: number;
    segmentCount?: number;
    triangleCount?: number;
  };
  warnings: DatasetWarning[];
}
```

### 5.3 ResourceDescriptor

```ts
interface ResourceDescriptor {
  id: string;
  role:
    | "positions"
    | "indices"
    | "cell-ids"
    | "ijk"
    | "property"
    | "well-trajectory"
    | "surface"
    | "network"
    | "well-log"
    | "intersection";
  url: string;
  mediaType: "application/octet-stream" | "application/vnd.apache.arrow.stream";
  encoding: "raw" | "arrow";
  compression?: "none" | "zstd";
  dtype?: "float32" | "float64" | "uint32" | "int32" | "uint8";
  shape?: number[];
  byteOrder?: "little";
  byteLength: number;
  sha256: string;
  objectId?: string;
  propertyName?: string;
  timeStep?: number;
  chunk?: { index: number; count: number };
}
```

### 5.4 网格几何表示

首版不得为每个单元输出完整独立六面体。预处理器至少支持两种表示：

1. `boundary-surface`：只输出当前可见集合的外表面，用于默认浏览。
2. `cell-faces-chunked`：按空间块保存可筛选单元面，用于 I/J/K、区域和属性过滤。

每个顶点或三角形必须能映射回原始 cell ID；cell ID 再映射到 I/J/K、ACTNUM 和属性索引。

推荐资源：

```text
grid/main/chunk-000/positions.f32
grid/main/chunk-000/indices.u32
grid/main/chunk-000/cell_ids.u32
grid/main/ijk.i32
properties/PORO/static.f32
properties/PRESSURE/timestep-000.f32
properties/PRESSURE/timestep-001.f32
```

### 5.5 坐标精度

油田 UTM 坐标通常数值较大，直接存入 GPU float32 容易出现抖动。必须：

- manifest 保留全局 double 精度原点；
- GPU positions 保存 `worldPosition - origin` 的 float32 局部坐标；
- UI 显示时重新加回原点；
- 所有引擎使用相同 origin；
- 不允许各视图自行猜测 Z 正方向或单位。

---

## 6. 后端设计

### 6.1 API 前缀

插件通过：

```python
api.register_http_router(
    build_router(...),
    prefix="/oilgas-vis",
    tags=["oilgas-visualization"],
)
```

最终接口位于 `/api/oilgas-vis/*`。

### 6.2 API 列表

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/health` | 插件、依赖和渲染数据协议版本 |
| GET | `/capabilities` | 当前环境支持哪些解析器/格式 |
| POST | `/imports` | 创建导入和预处理任务 |
| GET | `/imports/{job_id}` | 查询任务状态和阶段耗时 |
| GET | `/imports/{job_id}/events` | SSE 进度 |
| POST | `/imports/{job_id}/cancel` | 取消任务 |
| GET | `/datasets` | 缓存数据集列表 |
| GET | `/datasets/{dataset_id}/manifest` | 获取 manifest |
| GET | `/datasets/{dataset_id}/resources/{resource_id}` | 二进制资源，支持 Range |
| DELETE | `/datasets/{dataset_id}/cache` | 仅删除可重建缓存，必须显式调用 |
| POST | `/datasets/{dataset_id}/intersections` | 异步生成剖面 |
| GET | `/benchmarks` | 历史基准结果 |
| POST | `/benchmarks` | 保存一次基准 |

### 6.3 导入请求

```json
{
  "source": {
    "workspacePath": "models/FIELD.EGRID",
    "companionFiles": [
      "models/FIELD.INIT",
      "models/FIELD.UNRST"
    ]
  },
  "options": {
    "representation": "boundary-surface",
    "properties": ["PORO", "PERMX", "PRESSURE", "SWAT"],
    "timeSteps": "manifest-only",
    "chunkTargetTriangles": 500000,
    "coordinateOrigin": "auto"
  }
}
```

### 6.4 任务阶段

后端必须记录每一阶段耗时：

```text
queued
→ validating
→ reading-source
→ normalizing-coordinates
→ extracting-geometry
→ writing-properties
→ building-indexes
→ writing-manifest
→ completed / failed / cancelled
```

任务返回值中必须包括：

- 每阶段开始、结束和耗时；
- 峰值 RSS；
- 输入和输出字节数；
- 单元、三角形、井和时间步数量；
- warning 和 error code；
- 缓存是否命中。

### 6.5 缓存

建议缓存路径：

```text
<QwenPaw runtime>/cache/oilgas-visualization/
└── datasets/<fingerprint>/
    ├── manifest.json
    ├── resources/
    ├── benchmark.json
    └── import-meta.json
```

fingerprint 至少包括：

- 源文件大小和修改时间；
- 源文件抽样或完整 SHA-256；
- converter 版本；
- schema 版本；
- 导入选项。

缓存文件必须原子写入：先写临时目录，完成后 rename。失败或取消不得留下可被误识别为完整的数据集。

### 6.6 文件安全

- 只允许读取 QwenPaw 当前 workspace/project scope 下的文件。
- 所有路径必须 resolve 后再次检查是否仍在允许根目录内。
- 拒绝 `..`、符号链接逃逸和任意绝对路径。
- 浏览器只看到 dataset/resource ID，不看到真实绝对路径。
- 资源接口只允许 GET/HEAD，设置正确 MIME、ETag、Content-Length 和 Range。
- 压缩包导入必须限制文件数、总展开大小和压缩比，防止 zip bomb。

### 6.7 可选依赖策略

基础插件安装不强制包含全部原生解析器：

```python
capabilities = {
    "synthetic": True,
    "las": has_module("lasio"),
    "dlis": has_module("dlisio"),
    "roff": has_module("xtgeo"),
    "eclipse": has_module("xtgeo") or has_module("resdata"),
    "arrow": has_module("pyarrow"),
}
```

第一阶段只要求 synthetic reader 无条件可用。真实文件 reader 缺失时，UI 显示准确的依赖提示，不得让整个插件加载失败。

---

## 7. 前端设计

### 7.1 页面布局

```text
┌──────────────────────────────────────────────────────────────────┐
│ 数据集  导入  视图模式  属性  时间步  基准测试  设置             │
├──────────────┬───────────────────────────────────────┬───────────┤
│ 对象树       │                                       │ 属性面板  │
│ ├ 网格       │             当前视图                  │ 选择信息  │
│ ├ 层面       │  Reservoir / Wellbore / Intersection │ 过滤器    │
│ ├ 井         │  Well Log / Network / Benchmark      │ 颜色表    │
│ └ 管网       │                                       │           │
├──────────────┴───────────────────────────────────────┴───────────┤
│ 状态：FPS | 帧时间 | 内存 | 三角形 | Draw Calls | 当前任务      │
└──────────────────────────────────────────────────────────────────┘
```

### 7.2 首版视图

#### A. Reservoir 3D

- Webviz Subsurface Viewer adapter；
- 网格、层面和简化井轨迹；
- 静态/动态属性颜色映射；
- 属性范围、区域、I/J/K 过滤；
- 单元和井拾取；
- 时间步切换；
- 显示边界、坐标轴和比例尺；
- 截图和视图状态导出。

#### B. Wellbore 3D

- videx-3d adapter；
- 井轨迹；
- 套管、鞋、完井工具、射孔和层段；
- 标签、高亮、距离测量；
- 从 Reservoir 视图接收井选择。

#### C. Intersection

- ESV Intersection；
- 单井/多井剖面；
- MD/TVD 选择；
- 层位和曲线叠加；
- 与当前井选择联动。

#### D. Well Log

- Videx Wellog；
- 多轨道、线性/对数、MD/TVD；
- 曲线模板；
- 当前深度光标与剖面联动。

#### E. Network

- 3D 空间视图：Three.js/R3F；
- 2D 拓扑视图：React Flow 或 Cytoscape；
- 节点/边共享 selection；
- 属性支持压力、温度、流量、管径、相态和状态；
- 箭头或 shader 动画默认关闭，用户启用后才运行。

#### F. Benchmark

- 固定相机轨迹；
- 加载、帧率、内存和泄漏测试；
- 导出 JSON/CSV；
- 对比不同 engine/数据表示/Worker 设置。

### 7.3 全局状态

```ts
interface ViewerState {
  dataset: DatasetManifest | null;
  activeView: "reservoir" | "wellbore" | "intersection" | "welllog" | "network" | "benchmark";
  selected: DomainSelection | null;
  visibleObjectIds: Set<string>;
  property: PropertySelection | null;
  timeStep: number;
  filters: DomainFilter[];
  colorMap: ColorMapConfig;
  loading: LoadingState;
  metrics: RendererMetrics;
}
```

所有 adapter 只通过 store actions 和事件总线交互，不直接互相调用组件实例。

### 7.4 Worker

Worker 负责：

- 二进制下载和解码；
- Arrow 读取；
- typed array 重排；
- 属性 min/max/histogram；
- 空间索引；
- 可见 cell/filter mask；
- 大型管线几何生成。

主线程只负责：

- React UI；
- 场景提交；
- 用户输入；
- 小规模状态更新。

### 7.5 资源生命周期

每个引擎 `dispose()` 必须：

- 终止 Worker；
- abort 进行中的 fetch；
- dispose geometry/material/texture/render target；
- 解除 ResizeObserver、键盘、指针和 store 订阅；
- 清空大 TypedArray 引用；
- 释放 WebGL context（引擎支持时）；
- 从独立 React root `unmount()`。

---

## 8. Workspace 文件集成

bootstrap 在 `window.QwenPaw.workspace` 存在时注册渲染器：

```ts
const supported = [
  "egrid", "grid", "init", "unrst", "roff",
  "las", "dlis", "vtk", "vtu", "vti"
];

window.QwenPaw.workspace.registerRenderer({
  id: "oilgas-visualization",
  name: "Oil & Gas Visualization",
  component: OilGasWorkspaceRenderer,
  extensions: supported,
  mimeTypes: [
    "application/x-eclipse-grid",
    "application/x-roff",
    "application/x-las",
    "application/x-dlis",
    "application/vnd.vtk"
  ],
  priority: 200,
  description: "油气三维网格、井、剖面和测井可视化"
});
```

Workspace Renderer 本身仍然轻量。它在挂载后：

1. 检查 `artifact.workspacePath`；
2. 调用 import API；
3. 显示解析进度；
4. 按需加载 viewer runtime；
5. 将 dataset ID 传给 viewer；
6. 关闭时 dispose。

如果右侧 Workspace Panel 太窄，渲染器应提供“在完整工作区打开”按钮，跳转独立页面并携带 dataset ID。

调用导入 API 时必须透传 Artifact 的作用域：`agentId`、`chatId`、`projectDirOverride` 和 `workspaceRoot`。后端使用 QwenPaw 现有 request agent/project resolution 语义解析工作目录，不得把前端传来的绝对路径当作可信路径。

---

## 9. 性能基准方案

### 9.1 数据矩阵

| 数据集 | 规模 | 用途 |
| --- | ---: | --- |
| Synthetic-S | 100k cells | CI 和开发机快速测试 |
| Synthetic-M | 500k cells | 首版主要性能门槛 |
| Synthetic-L | 1M cells | 高负载验收 |
| Faulted-M | 500k cells | 真实断层/非活动单元 |
| Dynamic-M | 500k cells × 50 steps | 时间步和缓存 |
| Wells-M | 500 wells × 1k points | 井轨迹 |
| Wells-L | 2k wells × 5k points | 压力测试 |
| Network-M | 10k segments | 管网 |
| Network-L | 100k segments | 压力测试 |

### 9.2 必测阶段

```text
import source
→ normalize
→ extract geometry
→ write cache
→ fetch manifest
→ fetch geometry
→ decode
→ create renderer objects
→ GPU upload
→ first frame
→ interactive
```

### 9.3 指标

| 指标 | 获取方式 |
| --- | --- |
| 冷/热启动首帧 | `performance.mark/measure` |
| 可交互时间 | 固定交互探针 |
| P50/P95/P99 帧时间 | `requestAnimationFrame` |
| FPS | 帧时间换算，不能只显示瞬时值 |
| Main-thread long tasks | `PerformanceObserver` |
| JS heap | `performance.memory`（支持时） |
| 进程 RSS | 后端 psutil + Tauri/系统采样 |
| GPU 对象/三角形/draw calls | Three renderer info 或对应引擎统计 |
| 网络/IPC 字节 | Resource timing + 后端日志 |
| 后端峰值 RSS | psutil/memray |
| 泄漏 | 开关数据集 10 次后的 retained memory |

### 9.4 固定交互脚本

```text
等待首帧
→ 静止 2 秒
→ 固定路径旋转 360°
→ 缩放至井区
→ 拾取 20 个单元
→ 切换 3 个静态属性
→ 连续切换 10 个时间步
→ 应用/取消属性范围过滤
→ 打开剖面
→ 切换井筒视图
→ 关闭数据集
```

每个场景：冷启动 1 次、热身 1 次、正式运行 5 次；报告中保存中位数和 P95，并记录机器 CPU、GPU、RAM、系统、WebView 和插件版本。

### 9.5 首版验收线

测试基准机器建议至少包含：

- Apple Silicon 16 GB；
- Windows 集显 16 GB；
- Windows 独显 32 GB。

| 指标 | 必须达到 |
| --- | ---: |
| Synthetic-S 首帧 | ≤ 3 s |
| Synthetic-M 首帧 | ≤ 8 s |
| Synthetic-L 首帧 | ≤ 15 s |
| Synthetic-M 相机 P50 FPS | ≥ 30 |
| Synthetic-M P95 帧时间 | ≤ 50 ms |
| 属性切换 | ≤ 1 s |
| 已缓存时间步切换 | ≤ 500 ms |
| cell/well 拾取 | ≤ 200 ms |
| Synthetic-M 总额外 RSS | ≤ 1 GiB |
| 连续打开关闭 10 次 retained 增长 | ≤ 100 MiB |
| 插件 bootstrap | ≤ 300 KiB，目标 ≤ 150 KiB |
| QwenPaw 未进入插件页面时额外 heap | ≤ 5 MiB |
| 未进入插件页面时加载 viewer runtime | 必须为 0 次 |

如果 500k cells 不达标，不进入 UGSci 集成阶段。

---

## 10. 打包和依赖策略

### 10.1 两个前端产物

```text
ui/dist/index.js
  - 只依赖宿主 React/AntD
  - 注册路由、菜单和 Workspace Renderer
  - 提供 lazy viewer loader

ui/dist/viewer-runtime-<content-hash>.js
  - 自带独立 React root
  - 包含 Three/R3F 和已启用的 viewer adapters
  - 进入页面后才下载和执行
```

如果单个 viewer runtime 超过 25 MiB，再拆为多个“绝对 URL + 自包含运行时”：

```text
viewer-core-<hash>.js
engine-webviz-<hash>.js
engine-videx-<hash>.js
engine-vtk-<hash>.js
```

但不得使用依赖相对 URL 的普通 Vite chunk；需要由 bootstrap 明确构造插件静态资源绝对 URL并加载。

构建必须额外执行 `verify:dist`：确认 bootstrap、所有被 bootstrap 引用的 runtime/CSS/Worker 文件均存在，且 bootstrap 中没有未解析的相对 chunk。CI 对 bootstrap 300 KiB 和插件发布包预算做硬失败，不只在文档中记录。

插件静态文件接口目前可以读取插件目录内的文件，因此插件目录不得包含密钥、真实用户数据、导入缓存或私有 fixture。所有 dataset cache 必须位于插件目录之外的 QwenPaw runtime/cache。修改宿主静态路由白名单属于可选的独立安全加固，不作为 PoC 的前置核心改动。

### 10.2 版本锁定

PoC 必须使用精确版本或 lockfile，不使用浮动 `latest`。初始建议：

```json
{
  "@equinor/videx-3d": "2.0.0",
  "three": "^0.179.0",
  "@react-three/fiber": "^8.0.0",
  "@react-three/drei": "^9.0.0",
  "comlink": "^4.4.0"
}
```

Webviz、ESV 和 Wellog 版本在 Agent 开始实现时再次读取 npm 官方元数据，选择同一天最新稳定版并写死 lockfile。任何升级都必须重跑 benchmark。

### 10.3 许可证

- `videx-3d`：MIT。
- `webviz-subsurface-components`：MPL-2.0。
- vtk.js：BSD-3-Clause。
- 每次构建生成 `THIRD_PARTY_NOTICES.md`。
- MPL 包通过 adapter 使用；不要直接复制或修改其源码。
- 如果必须修改 MPL 文件，单独保存 patch/fork，并满足文件级源码提供义务。

---

## 11. 测试策略

### 11.1 后端单元测试

- manifest schema validation；
- 路径逃逸和符号链接拒绝；
- reader capability detection；
- synthetic reader 的确定性；
- 坐标 origin 和 Z 方向；
- geometry/cell ID/IJK 映射；
- 缓存命中与失效；
- 任务取消和失败清理；
- Range response；
- 资源哈希和长度。

### 11.2 前端单元测试

- bootstrap 不加载 viewer；
- 页面挂载一次只加载一次 runtime；
- runtime 加载失败的可恢复错误；
- adapter 生命周期；
- selection/time/property store；
- 二进制 dtype/shape 校验；
- dispose 后订阅和 Worker 清理；
- Workspace Renderer 扩展名匹配。

### 11.3 集成测试

- 安装/启用/禁用/卸载插件；
- 页面路由和菜单；
- synthetic dataset 导入到首帧；
- Workspace 打开支持文件；
- 后端重启后的缓存复用；
- Agent/workspace 切换时不串数据；
- 取消导入；
- 模型关闭后内存回落。

### 11.4 视觉回归

固定相机、数据和颜色表截图：

- 储层网格；
- 断层边界；
- 井轨迹；
- 井筒结构；
- 剖面；
- 测井；
- 2D/3D 管网；
- light/dark theme。

视觉回归只能发现外观变化，不能替代 cell ID、属性值和坐标正确性测试。

---

## 12. 分阶段实施计划

### Phase 0：契约与骨架

交付：

- 插件目录、manifest、后端注册；
- bootstrap 页面和菜单；
- viewer runtime lazy loader；
- synthetic manifest schema；
- `/health` 和 `/capabilities`；
- 证明 QwenPaw 启动时没有加载 viewer runtime。
- 完成第 2.2 节 P0-A 至 P0-F 兼容性 spike。

验收：

- 插件可安装/卸载；
- 页面能打开空工作区；
- bootstrap 小于 300 KiB；
- 网络面板中进入页面前没有 `viewer-runtime.js` 请求。
- Webviz/videx 的 build、Worker、资源 URL 和 React root 兼容性分别有原始测试记录。

### Phase 1：Synthetic Grid + Webviz PoC

交付：

- 100k/500k/1M synthetic corner-point-like grid generator；
- 二进制资源接口；
- Webviz adapter；
- 属性着色、时间步、拾取、基础过滤；
- 首版 benchmark 面板。

决策门：

- 500k cells 达到首版性能验收；
- 确认 Webviz Viewer 能满足目标网格数据形态；
- 若不能，记录缺口，启动 Three/vtk 备选 spike，而不是在 UI 中打补丁掩盖。

### Phase 2：真实网格导入

交付：

- xtgeo/resdata capability；
- EGRID + INIT，随后 UNRST；
- ROFF；
- ACTNUM、IJK、静态/动态属性；
- 断层数据集验证；
- 磁盘缓存。

验收：

- 至少两个真实或公开油藏模型；
- cell ID/IJK/属性与参考工具一致；
- 第二次打开缓存明显快于第一次；
- 解析依赖缺失时插件仍可启动。

### Phase 3：井、剖面和测井

交付：

- videx-3d 井筒 adapter；
- ESV Intersection；
- Videx Wellog；
- LAS reader；
- 可选 DLIS reader；
- 跨视图 well/depth selection。

验收：

- 从储层视图点井，其他三个视图同步；
- MD/TVD 和单位明确；
- 500 口井场景达到 ≥30 FPS；
- 关闭视图后资源释放。

### Phase 4：管网

交付：

- CSV/Arrow 管网 schema；
- Three.js 3D 线路；
- React Flow/Cytoscape 2D 拓扑；
- 压力、流量、温度、管径着色；
- 2D/3D 选择联动。

验收：

- 10k segments 流畅交互；
- 100k segments 给出压力测试结果；
- 关闭动画时无持续高 CPU/GPU；
- 不为每条管线创建独立 React 节点。

### Phase 5：Workspace 与 Agent 工具

交付：

- 注册专业 Workspace Renderer；
- “完整工作区打开”；
- Agent 工具：导入、打开、聚焦、切属性、切时间步、截图；
- 工具返回 dataset/artifact ID，不返回大数组。
- Viewer Command Bridge：把结构化工具结果送到已挂载 Viewer，或保存为待处理命令。

建议工具：

```text
import_subsurface_dataset
open_oilgas_visualization
set_visualization_property
set_visualization_timestep
focus_visualization_object
create_intersection
capture_visualization
run_visualization_benchmark
```

#### Viewer Command Bridge

后端 Agent 工具无法直接调用浏览器中的 Viewer。首版使用结构化工具结果闭环：

```ts
interface OilGasCommandResult {
  kind: "oilgas.viewer-command";
  commandId: string;
  datasetId?: string;
  command:
    | "open"
    | "focus"
    | "set-property"
    | "set-timestep"
    | "create-intersection"
    | "capture"
    | "benchmark";
  args: Record<string, unknown>;
}
```

插件 bootstrap 注册对应 ToolCard renderer。renderer 收到结果后调用 bootstrap 的 `ViewerCommandBus`；若 Viewer 未挂载，则把命令放入有界 pending queue，并打开独立页面/Artifact。Viewer mount 后按 `commandId` 去重消费。命令总线只传小型结构化命令，不传几何和属性数组。

### Phase 6：性能、打包与发布候选

交付：

- 三平台 benchmark；
- 包体积报告；
- 内存泄漏报告；
- 许可证清单；
- 用户 README；
- 故障排查；
- 回滚/卸载验证。

只有 Phase 6 全部通过，才允许进入 UGSci 集成。

### Phase 7：UGSci 融合

推荐保留 `oilgas-visualization` 为独立插件，UGSci 只增加 bridge：

```text
UGSci
  ├─ 菜单入口 -> oilgas-visualization route
  ├─ Expert/Skill 推荐 -> oilgas visualization skill
  ├─ Agent tools -> 调用独立插件已注册工具
  └─ Simulation result -> 打开 dataset/artifact
```

禁止：

- 把 viewer 源码复制进 `plugins/bundle/ugsci/ui`；
- 让 UGSci import Webviz/Three/videx；
- 把 `/oilgas-vis` API 改成 UGSci 私有实现；
- 形成双份缓存和双份数据协议。

如果将来必须单包发布，可以在打包层把两个插件放入同一 bundle，但源码和运行时边界仍保持独立。

---

## 13. 可直接分派给 Agent 的工作包

### Agent A：插件骨架与按需运行时

负责文件：

- `plugin.json`
- `plugin.py`
- `ui/src/bootstrap/**`
- 两个 Vite config

任务：

1. 注册独立路由和菜单。
2. 注册 Workspace Renderer 的空壳。
3. 构建轻量 bootstrap。
4. 构建按需 viewer runtime。
5. 实现 mount/update/dispose。
6. 测试进入页面前不下载 viewer。
7. 处理 Workspace SDK 延迟注册。
8. 使用内容哈希 runtime/CSS，完成 `verify:dist`。
9. 完成 P0-A 至 P0-F 兼容性 spike。

完成条件：Phase 0 前端验收全部通过。

### Agent B：数据契约、任务和缓存

负责文件：

- `contracts/**`
- `backend/models.py`
- `backend/jobs/**`
- `backend/cache/**`
- `backend/api.py`

任务：

1. 实现 schema 和 Pydantic model。
2. 实现 import job、SSE、cancel。
3. 实现安全路径解析。
4. 实现 manifest/resource/Range API。
5. 实现原子缓存。

完成条件：后端契约和安全测试全部通过。

### Agent C：Synthetic Grid 与 Webviz Adapter

负责文件：

- `backend/readers/synthetic.py`
- `backend/converters/grid_surface.py`
- `ui/src/viewer/engines/webviz/**`
- grid benchmark fixtures

任务：

1. 生成三个规模的确定性网格。
2. 输出 positions/indices/cell IDs/IJK/properties。
3. 接入 Webviz Viewer。
4. 实现属性、时间步、拾取和过滤。
5. 输出性能报告。

完成条件：Phase 1 决策门通过或形成可复现的不通过结论。

### Agent D：真实文件解析

依赖：Agent B、C 的 schema 和 converter 接口稳定。

负责文件：

- `backend/readers/eclipse.py`
- `backend/readers/roff.py`
- 对应测试 fixtures

任务：

1. capability detection。
2. EGRID/INIT/UNRST/ROFF 读取。
3. 映射到统一协议。
4. 与参考工具做数值验证。
5. 控制峰值内存。

完成条件：Phase 2 验收通过。

### Agent E：井、剖面和测井

负责文件：

- `backend/readers/las.py`
- `backend/readers/dlis.py`
- `backend/converters/wellbore.py`
- `backend/converters/intersection.py`
- `ui/src/viewer/engines/videx/**`
- `ui/src/viewer/panels/intersection/**`
- `ui/src/viewer/panels/welllog/**`

完成条件：Phase 3 验收通过。

### Agent F：管网

负责文件：

- `backend/readers/tabular_network.py`
- `backend/converters/network.py`
- `ui/src/viewer/engines/network/**`

完成条件：Phase 4 验收通过。

### Agent G：Benchmark、泄漏与发布

负责文件：

- `ui/src/viewer/benchmark/**`
- benchmark scripts/config/results
- 打包和许可证报告

任务：

1. 固定相机脚本。
2. 前后端性能埋点。
3. 三平台采样。
4. 内存泄漏测试。
5. 包体积和第三方许可证。

完成条件：Phase 6 验收通过。

### 多 Agent 协作规则

- Agent B 先冻结 schema 1.0，其他 Agent 才开始数据 adapter。
- Agent C 在合并 Webviz 结论前，不启动大规模 UI 功能开发。
- 每个 Agent 只修改自己负责的目录；公共接口通过单独 PR/提交协调。
- 所有 benchmark 必须提交原始 JSON，不只提交截图或文字结论。
- 新增依赖必须说明许可证、体积和是否进入 bootstrap。
- 任何大数组 JSON API 都应在 code review 中直接拒绝。

---

## 14. Definition of Done

首版独立插件完成必须同时满足：

- [ ] 插件可安装和卸载；reload 后前端注册状态正确。
- [ ] 安装/卸载后的前端状态按当前宿主行为通过 reload 生效，不宣称无刷新热启停。
- [ ] 独立页面可运行，不依赖 UGSci。
- [ ] QwenPaw 普通启动不加载 viewer runtime。
- [ ] P0-A 至 P0-F 全部通过。
- [ ] bootstrap ≤300 KiB。
- [ ] synthetic 100k/500k/1M 网格可运行。
- [ ] 至少两个真实网格通过数值核验。
- [ ] 网格属性、时间步、过滤和拾取可用。
- [ ] 精细井筒、剖面和测井视图可联动。
- [ ] 2D/3D 管网至少支持 10k segments。
- [ ] Workspace Renderer 能打开受支持文件。
- [ ] Agent 工具只传 ID/命令，不传大数据。
- [ ] 500k cells 满足性能门槛。
- [ ] 连续打开关闭 10 次无明显泄漏。
- [ ] 三平台构建和 smoke test 通过。
- [ ] 第三方许可证和 NOTICE 完整。
- [ ] README、故障排查和 benchmark 报告完整。
- [ ] UGSci 融合只需 bridge，不需复制实现。

---

## 15. 风险登记表

| 风险 | 影响 | 预防/降级 |
| --- | --- | --- |
| Webviz Viewer 数据接口不适配目标角点网格 | 高 | Phase 1 先做决策门；保留 Three/vtk adapter |
| 多个渲染库增加包体积 | 中 | viewer 按需加载；引擎按需拆分 |
| Blob 插件入口无法相对加载 chunk | 高 | bootstrap + 绝对 URL 自包含 runtime |
| Workspace SDK 异步安装导致漏注册 | 高 | bootstrap 幂等 wait + 保存 Disposable |
| runtime/CSS 改了但 entry revision 未变 | 高 | 内容哈希文件名写回 bootstrap |
| 上游库内部 Worker/import.meta.url 失效 | 高 | P0 打包性 spike；显式 URL/inline worker；失败则淘汰 adapter |
| 宿主 React 与 viewer React 冲突 | 高 | viewer 使用独立 React root，不跨 root 传 React 组件 |
| 大 UTM 坐标 float32 抖动 | 高 | 局部原点、CPU double/GPU float32 |
| JSON 导致内存和 IPC 爆炸 | 高 | schema 强制 binary/Arrow |
| xtgeo/resdata 使安装包膨胀 | 中 | 可选专业数据运行时 |
| MPL 合规遗漏 | 中 | adapter、NOTICE、禁止无记录修改上游文件 |
| WebGL context/Worker 泄漏 | 高 | 统一 dispose contract + 10 次循环测试 |
| 100 万单元低端 GPU 不达标 | 中 | boundary surface、分块、LOD、按需属性 |
| 不同 Z 方向/单位造成错误解释 | 高 | manifest 强制 zPositive/unit，导入时不可缺省 |
| Workspace 右栏太窄 | 低 | 提供完整页面跳转 |
| 后端 Agent 工具无法控制浏览器 Viewer | 高 | ToolCard + ViewerCommandBus + pending queue |
| 测试/fixture 被递归打进桌面安装包 | 中 | 测试移到根 `tests/`；关闭 source map；插件包体积 CI |

---

## 16. 推荐的第一笔实现工作

第一轮只执行 Phase 0 和 Phase 1，不同时开工完整业务功能。

第一轮最终演示应只有：

1. 安装插件后出现“油气可视化”菜单。
2. 进入页面才下载 viewer runtime。
3. 可选择 100k、500k、1M synthetic 数据。
4. Webviz Viewer 显示网格并切换两项属性和十个时间步。
5. 能选择单元并看到 cell ID/IJK/value。
6. Benchmark 面板输出首帧、P50/P95 FPS、内存、三角形和 draw calls。
7. 一键导出 benchmark JSON。
8. 关闭页面后 Worker/几何/Canvas 被释放。

这一轮通过后，才值得投入真实 EGRID/ROFF、井筒、剖面、测井和管网开发。

---

## 17. 上游参考

- Webviz 平台：https://github.com/equinor/webviz
- Webviz Subsurface Components：https://github.com/equinor/webviz-subsurface-components
- Subsurface Viewer npm：https://www.npmjs.com/package/@webviz/subsurface-viewer
- videx-3d：https://github.com/equinor/videx-3d
- ESV Intersection：https://www.npmjs.com/package/@equinor/esv-intersection
- Videx Wellog：https://equinor.github.io/videx-wellog/
- vtk.js：https://kitware.github.io/vtk-js/docs/
- ResInsight：https://resinsight.org/

---

## 18. 可复制给首轮实现 Agent 的任务提示

```text
请严格按照 docs/OILGAS_VISUALIZATION_PLUGIN_IMPLEMENTATION_PLAN.md 实现
Phase 0 和 Phase 1，不要提前实现真实 EGRID/ROFF、井筒、测井、剖面、管网或
UGSci 集成。

目标：创建 plugins/bundle/oilgas-visualization 独立插件，完成轻量 bootstrap、
按需 viewer runtime、synthetic 100k/500k/1M 数据、Webviz reservoir adapter 和
benchmark 页面。

开始 Phase 0 业务骨架前，先完成第 2.2 节 P0-A 至 P0-F。任何一项不通过都要
停止并提交 No-Go 证据，不得绕过门槛继续堆 UI。

必须先阅读并复用：
- src/qwenpaw/plugins/architecture.py
- src/qwenpaw/plugins/api.py 的 register_http_router
- console/src/plugins/usePluginLoader.ts
- console/src/plugins/hostExternals.ts
- console/src/components/Workspace/workspaceSdk.ts
- plugins/bundle/ugsci/ui/src/index.ts
- plugins/bundle/ugsci/plugin.py

硬性约束：
1. 不修改 UGSci。
2. 不把重型依赖静态 import 到 ui/dist/index.js。
3. bootstrap 目标 ≤150 KiB、硬上限 300 KiB。
4. 进入插件页面前不能请求或执行 viewer-runtime；runtime/CSS 使用内容哈希文件名。
5. viewer 使用独立 React root，只通过 mount/update/dispose 与宿主交互。
6. 大数组使用 binary/TypedArray/Arrow，禁止 JSON。
7. 禁止每 cell 一个 React 组件或 Three Mesh。
8. 必须实现 dispose 和 10 次打开关闭泄漏测试。
9. 所有新依赖写明版本、许可证和打包位置。
10. Webviz 是否合格必须由 benchmark 决定，不能预设结论。
11. Workspace SDK 必须等待 ready 后幂等注册，不能只检查一次。
12. 所有 dist 产物保持顶层、关闭 source map，并由 verify:dist 校验。
13. 不承诺无刷新热启停，安装/卸载后的前端状态按当前宿主 reload 行为验收。

在写代码前先输出：
- 拟修改文件清单；
- 实际确认的 Webviz npm API 和版本；
- synthetic 数据协议；
- 两个 Vite 产物的加载设计；
- 测试和 benchmark 计划。

完成后提交：
- 可运行源码；
- 测试结果；
- bootstrap/viewer 包体积；
- 100k/500k/1M benchmark 原始 JSON；
- 已知问题和 Phase 1 是否通过的明确结论。
```

---

## 19. 独立架构审查记录

### 19.1 审查结论

原稿不能未经 spike 直接进入完整实现；本次修订后为 **Conditional Go**：

- 功能性：统一协议和多视图联动可行，但必须增加 Viewer Command Bridge。
- 性能：二进制、Worker、分块和按需加载方向正确，但只能由 Phase 1 benchmark 证明。
- 改动范围：默认路径保持新增插件目录，不修改 QwenPaw/UGSci 核心。
- 兼容性：通过 P0-A 至 P0-F 先验证包、WebView、Worker、React 和资源 URL。
- 升级维护：使用 adapter、schemaVersion、converterVersion、内容哈希和完整 dist 校验。
- 上游合并：测试移到根目录，UGSci 只做 bridge，核心修改仅在实测证明必要时单独提交。

### 19.2 已采纳问题

| 审查问题 | 处理 |
| --- | --- |
| Workspace SDK 异步挂载竞态 | 新增第 2.3 节幂等等待 |
| viewer/CSS 更新不改变 entry revision | 改为内容哈希文件名并写回 bootstrap |
| 开发同步脚本不递归复制 assets | Phase 0/1 产物全部放 dist 顶层并增加 verify:dist |
| Agent 工具无法直接控制已挂载 Viewer | 新增 ToolCard + ViewerCommandBus |
| 插件目录 tests/fixtures 被桌面递归打包 | 移到根 `tests/plugins/`，关闭 source map |
| bootstrap 体积门槛没有 CI 约束 | 增加构建硬失败 |
| 公共静态路由可能读取插件内其他文件 | 禁止插件目录存放秘密/真实数据/缓存；安全加固独立处理 |

### 19.3 经复核后调整的问题

审查曾把“缺少显式 `worker-src`”判定为必然阻断。根据 CSP 规范，`worker-src` 缺失时会回退到 `child-src`、`script-src`、`default-src`；当前 Tauri `script-src` 已允许 `blob:` 和本地后端。因此不预先修改上游 CSP，而是提升为 P0-C 实机测试：只有目标 WebView 实际失败时才做最小 CSP 修改。这能避免为了理论风险增加上游合并冲突。
