/**
 * Workspace Types — 工作区面板的统一类型定义
 *
 * 设计理念：
 * - 统一的 Artifact 数据模型，所有格式归结为 WorkspaceArtifact
 * - 渲染器注册制，通过 mimeType / extension 匹配
 * - 流式更新支持，渲染器可选择实现流式接口
 * - 插件可扩展，通过 workspace registry 注册新渲染器
 */
import type React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Artifact 数据模型
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Artifact 来源类型：
 * - tool_call: AI 工具调用产出（如生成文档、绘图、写代码）
 * - file_upload: 用户上传的文件
 * - link: 外部链接引用
 * - generated: AI 流式生成的内容
 */
export type ArtifactSource = "tool_call" | "file_upload" | "link" | "generated";

/**
 * 工作区 Artifact — 所有可渲染内容的统一抽象
 *
 * 一个 Artifact 可以是：
 * - 一段 Markdown 文本（AI 流式生成）
 * - 一个 HTML/SVG 文件
 * - 一张图片
 * - 一份 DOCX/PDF 文档（经后端转换）
 * - 一段 React 代码（可执行预览）
 * - 一个测井曲线文件（LAS/DLIS）
 * - 一个三维网格文件（OBJ/STL/VTK）
 */
export interface WorkspaceArtifact {
  /** 全局唯一 ID，用于标签页管理 */
  id: string;
  /** 显示标题（标签页标题） */
  title: string;
  /** 来源类型 */
  source: ArtifactSource;
  /** MIME 类型，用于匹配渲染器（如 "text/markdown", "application/pdf"） */
  mimeType: string;
  /** 文件扩展名（备用匹配，如 "md", "pdf", "las"） */
  extension?: string;
  /** 图标（Ant Design icon 或 emoji） */
  icon?: React.ReactNode;

  // ── 内容载体（三选一）──
  /** 文本内容（markdown、html、code、json 等） */
  textContent?: string;
  /** 二进制 URL（图片、PDF、视频、Office 文档等） */
  binaryUrl?: string;
  /** 结构化 JSON 数据（图表配置、测井数据等） */
  jsonContent?: unknown;

  // ── 流式状态 ──
  /** 是否正在流式更新中 */
  isStreaming?: boolean;
  /** 流式更新的进度（0-1） */
  streamProgress?: number;

  // ── 元数据 ──
  /** 关联的会话 ID */
  sessionId?: string;
  /** 关联的消息 ID */
  messageId?: string;
  /** 关联的工具调用名 */
  toolName?: string;
  /** 文件大小（字节） */
  size?: number;
  /** 创建时间戳 */
  createdAt?: number;
  /** 最后更新时间戳 */
  updatedAt?: number;
  /** Workspace-relative source path, used to resolve local Markdown resources. */
  workspacePath?: string;
  /** Agent that owns the workspace file, retained across Agent switches. */
  agentId?: string;
  /** Coding project root that owns the workspace file. */
  projectRoot?: string | null;
  /** Backend file root used by the unified files workspace. */
  workspaceRoot?: "project" | "workspace" | `project:${string}`;
  /** Persisted backend chat id used to resolve a session project directory. */
  chatId?: string;
  /** Pending project directory for a not-yet-persisted chat session. */
  projectDirOverride?: string;

  /** 渲染器特定的额外属性
   *
   * 常用 meta 字段：
   * - textSample: string —— 文件前 8KB 的文本采样，用于 MIME 嗅探
   *                       （当 mimeType 为 octet-stream 时，渲染器注册中心
   *                        会用它 + 扩展名解析真实 MIME）
   * - paperOutline: PaperOutlineNode[] —— PDF 论文大纲（论文模式用）
   * - sourceFormat: string —— 原始格式（如经过转换的 HTML 对应的源格式）
   */
  meta?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 渲染器接口
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染器上下文 — 传递给渲染器的运行时信息
 */
export interface RendererContext {
  /** 当前 Artifact */
  artifact: WorkspaceArtifact;
  /** 是否只读模式 */
  readOnly: boolean;
  /** 当前主题 */
  theme: "light" | "dark";
  /** 当前语言 */
  locale: string;
  /** 工作区操作 API */
  workspace: WorkspaceApi;
  /** Host owns the shared file toolbar; renderer should omit duplicate chrome. */
  hostControls?: boolean;
}

/**
 * 工作区 API — 渲染器可调用的工作区方法
 */
export interface WorkspaceApi {
  /** 更新当前 Artifact 内容 */
  updateArtifact: (id: string, patch: Partial<WorkspaceArtifact>) => void;
  /** 关闭当前标签页 */
  closeTab: (id: string) => void;
  /** 打开新 Artifact */
  openArtifact: (artifact: WorkspaceArtifact) => void;
  /** 下载 Artifact */
  download: (artifact: WorkspaceArtifact) => void;
  /** 全屏查看 */
  fullscreen: (artifact: WorkspaceArtifact) => void;
  /** 在系统文件管理器中定位文件 */
  revealInFileManager?: (artifact: WorkspaceArtifact) => void;
}

/**
 * 渲染器组件接口
 *
 * 每个渲染器是一个 React 组件，接收 RendererContext 作为 props
 */
export type RendererComponent = React.FC<RendererContext>;

/**
 * 流式渲染器接口（可选实现）
 *
 * 实现此接口的渲染器可以接收增量内容更新，
 * 而不是每次完整替换（类似 LibreChat 的 model.applyEdits 模式）
 */
export interface StreamableRenderer {
  /**
   * 处理流式增量内容
   * @param currentContent 当前完整内容
   * @param previousContent 上一次的内容
   * @param artifact Artifact 元信息
   * @returns 需要更新的 state patch
   */
  onStreamChunk?: (
    currentContent: string,
    previousContent: string,
    artifact: WorkspaceArtifact,
  ) => void;
}

/**
 * 渲染器注册信息
 */
export interface RendererRegistration {
  /** 渲染器唯一 ID */
  id: string;
  /** 显示名称 */
  name: string;
  /** 渲染器组件 */
  component: RendererComponent;
  /** MIME 类型匹配列表（如 ["text/markdown", "text/x-markdown"]） */
  mimeTypes?: string[];
  /** 文件扩展名匹配列表（如 ["md", "markdown"]） */
  extensions?: string[];
  /** 来源类型限制（如只用于 tool_call） */
  sources?: ArtifactSource[];
  /** 优先级（数值越大优先级越高，默认 0） */
  priority?: number;
  /** 是否支持编辑 */
  editable?: boolean;
  /** 是否支持流式更新 */
  streamable?: boolean;
  /** 缩略图/图标 */
  icon?: React.ReactNode;
  /** 渲染器描述 */
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 标签页管理
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 工作区标签页状态
 */
export interface WorkspaceTab {
  /** Artifact ID */
  artifactId: string;
  /** 标签页标题（可能被用户重命名） */
  title: string;
  /** 标签页图标 */
  icon?: React.ReactNode;
  /** 是否正在加载中 */
  loading?: boolean;
  /** 是否有未保存更改 */
  dirty?: boolean;
  /** 是否固定（不可关闭） */
  pinned?: boolean;
  /** 标签页颜色标记 */
  color?: string;
  /** 打开时间 */
  openedAt: number;
}

/**
 * 工作区面板状态
 */
export interface WorkspaceState {
  /** 所有打开的标签页 */
  tabs: WorkspaceTab[];
  /** 当前激活的标签页 ID（artifactId） */
  activeTabId: string | null;
  /** 面板是否展开 */
  panelOpen: boolean;
  /** 面板宽度（像素） */
  panelWidth: number;
  /** 面板是否全屏 */
  isFullscreen: boolean;

  // ── Actions ──
  openArtifact: (artifact: WorkspaceArtifact) => void;
  closeTab: (artifactId: string) => void;
  closeOtherTabs: (artifactId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (artifactId: string) => void;
  updateArtifact: (id: string, patch: Partial<WorkspaceArtifact>) => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  setPanelWidth: (width: number) => void;
  toggleFullscreen: () => void;
  pinTab: (artifactId: string) => void;
  unpinTab: (artifactId: string) => void;
  renameTab: (artifactId: string, title: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// 渲染器匹配
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 渲染器匹配结果
 */
export interface RendererMatch {
  renderer: RendererRegistration;
  /** 匹配方式 */
  matchedBy: "mimeType" | "extension" | "source" | "fallback";
}

// ─────────────────────────────────────────────────────────────────────────────
// 面板模式
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 工作区面板的视图模式
 * - split: 分屏模式（左侧聊天 + 右侧工作区）
 * - float: 浮动模式（工作区覆盖在聊天上方）
 * - fullscreen: 全屏模式（工作区占满整个区域）
 */
export type WorkspaceViewMode = "split" | "float" | "fullscreen";

/**
 * 标签页上下文菜单项
 */
export interface TabMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}
