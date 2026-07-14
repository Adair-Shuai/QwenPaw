# 工作区 (Workspace) 面板架构设计

## 一、设计目标

1. **多标签页**：同时打开多个 Artifact 文件，自由切换
2. **统一架构**：一套接口，支持所有文件格式
3. **专业渲染器**：每种格式使用最适合的渲染引擎
4. **流式更新**：AI 生成内容时实时同步显示
5. **可扩展**：插件可注册新渲染器（测井曲线、三维网格等）

## 二、整体架构

```
┌──────────────────────────────────────────────────────────────┐
│                        Chat Page                             │
│                                                              │
│  ┌────────────────────────┐    ┌─────────────────────────┐  │
│  │                        │    │     Workspace Panel     │  │
│  │   Chat Messages        │    │  ┌───┬───┬───┬───────┐  │  │
│  │                        │    │  │ 1 │ 2 │ 3 │   4   │  │  │  ← 标签页栏
│  │   ┌──────────────┐     │    │  ├───┴───┴───┴───────┤  │  │
│  │   │ ToolCard:    │     │    │  │                   │  │  │
│  │   │ generate_doc │─────┼────┼─→│  Active Renderer  │  │  │  ← 渲染器区域
│  │   └──────────────┘     │    │  │  (Markdown/PDF/   │  │  │
│  │                        │    │  │   Code/Office/...)│  │  │
│  │                        │    │  │                   │  │  │
│  └────────────────────────┘    │  └───────────────────┘  │  │
│                                └─────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## 三、分层架构

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer                          │
│  WorkspacePanel (标签页 + 工具栏 + 拖拽分隔)          │
├─────────────────────────────────────────────────────┤
│                  Renderer Layer                      │
│  ┌──────────┬──────────┬──────────┬───────────┐    │
│  │Markdown  │ Code     │ PDF      │ Office    │ ...│
│  │(TipTap)  │(Monaco)  │(react-pdf)│(Backend) │    │
│  └──────────┴──────────┴──────────┴───────────┘    │
├─────────────────────────────────────────────────────┤
│                 Registry Layer                       │
│  RendererRegistry (MIME/extension/source 匹配)       │
│  WorkspaceStore (标签页状态 + Artifact 存储)          │
├─────────────────────────────────────────────────────┤
│                   SDK Layer                          │
│  window.QwenPaw.workspace (插件 API)                 │
│  openArtifactFromToolCall (工具调用集成)              │
│  streamArtifactUpdate (流式更新)                      │
├─────────────────────────────────────────────────────┤
│                  Integration Layer                   │
│  <Slot name="chat.rightPanel" kind="fill" />         │
│  chat.toolRender (工具卡片 → 工作区联动)              │
└─────────────────────────────────────────────────────┘
```

## 四、核心数据模型

### 4.1 WorkspaceArtifact

所有可渲染内容的统一抽象：

```typescript
interface WorkspaceArtifact {
  id: string; // 全局唯一 ID
  title: string; // 标签页标题
  source: "tool_call" | "file_upload" | "link" | "generated";
  mimeType: string; // MIME 类型（渲染器匹配主键）
  extension?: string; // 文件扩展名（备用匹配）

  // 内容载体（三选一）
  textContent?: string; // 文本内容（markdown/html/code/json）
  binaryUrl?: string; // 二进制 URL（图片/PDF/视频/Office）
  jsonContent?: unknown; // 结构化 JSON（图表配置/测井数据）

  isStreaming?: boolean; // 是否正在流式更新
  streamProgress?: number; // 流式进度 0-1

  sessionId?: string; // 关联会话
  messageId?: string; // 关联消息
  toolName?: string; // 关联工具
  meta?: Record<string, unknown>; // 渲染器特定属性
}
```

### 4.2 渲染器匹配优先级

```
1. MIME type 精确匹配 (priority 最高的胜出)
   ↓ 未匹配
2. Extension 匹配
   ↓ 未匹配
3. Source 类型匹配
   ↓ 未匹配
4. Fallback 渲染器 (id="fallback")
```

## 五、渲染器矩阵

| 渲染器 ID        | 格式           | 底层引擎                    | 来源     | 流式   | 可编辑 |
| ---------------- | -------------- | --------------------------- | -------- | ------ | ------ |
| `markdown`       | Markdown       | TipTap Static Renderer      | 内置     | ✅     | ✅     |
| `html`           | HTML/SVG       | iframe srcdoc 沙箱          | 内置     | ✅     | ❌     |
| `code`           | 代码文件       | Monaco Editor               | 内置     | ✅     | ✅     |
| `json`           | JSON           | Monaco (JSON mode)          | 内置     | ✅     | ✅     |
| `mermaid`        | Mermaid 图表   | mermaid.js                  | 内置     | ✅     | ❌     |
| `pdf`            | PDF            | react-pdf (pdfjs-dist)      | 内置     | ❌     | ❌     |
| `office-doc`     | DOCX/XLSX/PPTX | 后端转换 → HTML             | 内置     | ❌     | ❌     |
| `image`          | 图片           | Ant Design Image            | 内置     | ❌     | ❌     |
| `sandpack-react` | React 代码     | @codesandbox/sandpack-react | 内置     | ❌     | ❌     |
| `fallback`       | 未知类型       | 文件信息 + 下载             | 内置     | ❌     | ❌     |
| ~~`well-log`~~   | LAS/DLIS       | ~~自定义~~                  | ~~插件~~ | ~~❌~~ | ~~❌~~ |
| ~~`mesh-3d`~~    | OBJ/STL/VTK    | ~~three.js~~                | ~~插件~~ | ~~❌~~ | ~~❌~~ |

## 六、流式更新机制

融合 LibreChat 的流式更新 + TipTap 的增量渲染：

```
AI 流式输出
    │
    ▼
streamArtifactUpdate(id, fullContent, isDone)
    │
    ▼
workspaceStore.updateArtifact(id, { textContent, isStreaming })
    │
    ├──→ MarkdownRenderer: TipTap 静态渲染重新执行（React diff 最小化更新）
    ├──→ CodeRenderer: Monaco model.applyEdits() 增量追加（无闪烁）
    └──→ HtmlRenderer: iframe srcdoc 刷新（浏览器增量重绘）
```

### TipTap 静态渲染流式策略

```typescript
// 每次内容更新时，renderToReactElement 重新执行
// React 的 reconciliation 会最小化 DOM 操作
// 对于追加式内容（新内容 = 旧内容 + 新增），性能良好

const output = useMemo(() => {
  return renderToReactElement({
    content: parseMarkdown(artifact.textContent), // markdown → JSON
    extensions: [StarterKit, Markdown],
  });
}, [artifact.textContent]);
```

### Monaco Editor 流式策略（参考 LibreChat）

```typescript
// 检测追加式更新，只插入新增部分
if (newContent.startsWith(prev) && prev.length > 0) {
  const appended = newContent.slice(prev.length);
  model.applyEdits([
    {
      range: {
        /* end of document */
      },
      text: appended,
    },
  ]);
}
```

## 七、插件扩展接口

### 7.1 注册自定义渲染器

```typescript
// 插件代码：注册测井曲线渲染器
window.QwenPaw.workspace.registerRenderer({
  id: "well-log-las",
  name: "Well Log (LAS)",
  component: WellLogRenderer, // React.FC<RendererContext>
  mimeTypes: ["application/x-las"],
  extensions: ["las", "dlis"],
  priority: 100,
  description: "测井曲线渲染器，支持多轨道曲线显示",
});
```

### 7.2 打开 Artifact

```typescript
// 插件代码：从工具调用结果打开 Artifact
window.QwenPaw.workspace.openArtifact({
  id: "log-001",
  title: "Well-A_log.las",
  source: "tool_call",
  mimeType: "application/x-las",
  extension: "las",
  textContent: lasFileContent,
  sessionId: currentSessionId,
  messageId: currentMessageId,
  toolName: "read_well_log",
});
```

### 7.3 流式更新

```typescript
// AI 流式生成时持续更新
window.QwenPaw.workspace.updateArtifact(artifactId, {
  textContent: accumulatedContent,
  isStreaming: true,
});
// 完成后
window.QwenPaw.workspace.updateArtifact(artifactId, {
  isStreaming: false,
});
```

## 八、集成方式

### 8.1 挂载到 Chat 页面

```tsx
// console/src/pages/Chat/index.tsx
import { WorkspacePanel } from "../../components/Workspace";

// 在 chatPageRoot 的末尾，替换原有的 Slot
<WorkspacePanel />;
```

或通过 Slot 系统（插件方式）：

```tsx
// 宿主代码：注册 WorkspacePanel 到 chat.rightPanel
slotRegistry.fill("host", "chat.rightPanel", () => <WorkspacePanel />);
```

### 8.2 与 ToolCard 联动

```tsx
// 在 ToolCard 中添加"在工作区打开"按钮
import { openArtifactFromToolCall } from "../../components/Workspace";

const handleOpenInWorkspace = () => {
  openArtifactFromToolCall({
    toolName: content.name,
    result: content.result,
    sessionId,
    messageId,
    title: "Generated Document",
    mimeType: "text/markdown",
    content: content.result as string,
  });
};
```

### 8.3 挂载 SDK 到 window

```typescript
// console/src/plugins/hostSdk/install.ts
import { createWorkspaceNamespace } from "../../components/Workspace/workspaceSdk";

window.QwenPaw.workspace = createWorkspaceNamespace();
```

## 九、文件结构

```
console/src/components/Workspace/
├── index.ts                         # 公开 API
├── WorkspacePanel.tsx               # 主面板组件（标签页 + 渲染器区域）
├── workspaceSdk.ts                  # 插件 SDK 接口
├── types/
│   └── index.ts                     # 所有类型定义
├── store/
│   ├── workspaceStore.ts            # Zustand 状态管理（标签页 + Artifact）
│   ├── rendererRegistry.ts          # 渲染器注册中心（MIME/extension 匹配）
│   └── builtinRenderers.ts          # 内置渲染器注册
├── renderers/
│   ├── MarkdownRenderer.tsx         # TipTap 驱动的 Markdown 渲染
│   ├── HtmlRenderer.tsx             # iframe 沙箱 HTML 渲染
│   ├── CodeRenderer.tsx             # Monaco Editor 代码渲染
│   ├── JsonRenderer.tsx             # JSON 树形查看
│   ├── ImageRenderer.tsx            # 图片查看器
│   ├── PdfRenderer.tsx              # react-pdf PDF 渲染
│   ├── OfficeDocRenderer.tsx        # Office 文档（后端转换）
│   ├── SandpackRenderer.tsx         # Sandpack 代码执行预览
│   ├── MermaidRenderer.tsx          # Mermaid 图表渲染
│   └── FallbackRenderer.tsx         # 兜底渲染器
└── ARCHITECTURE.md                  # 本文档
```

## 十、未来扩展路线

### 第二阶段：科学数据渲染器

| 渲染器     | 格式             | 计划使用的库                                                       | 说明               |
| ---------- | ---------------- | ------------------------------------------------------------------ | ------------------ |
| `well-log` | LAS/DLIS         | [wellioviz](https://github.com/JustinGOSSES/wellioviz) 或自定义 D3 | 测井曲线多轨道显示 |
| `mesh-3d`  | OBJ/STL/VTK/GLTF | three.js + @react-three/fiber                                      | 三维网格/模型渲染  |
| `seismic`  | SEGY             | [segyjs](https://github.com/seg/segyjs)                            | 地震数据剖面       |
| `netcdf`   | NetCDF/CDF       | netcdfjs                                                           | 多维科学数据数组   |
| `hdf5`     | HDF5             | h5wasm                                                             | HDF5 科学数据格式  |

### 第三阶段：协作编辑

- 基于 TipTap + Yjs 的实时协作编辑
- 多用户同时编辑同一 Artifact
- 版本历史和差异对比

### 第四阶段：AI 集成

- 使用 TipTap AI Toolkit 让 AI 直接编辑 Artifact 内容
- AI 辅助校对和格式优化
- 从 Artifact 内容触发新的 AI 任务
