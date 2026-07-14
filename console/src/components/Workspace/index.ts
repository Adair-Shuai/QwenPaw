/**
 * Workspace Component — 工作区面板
 *
 * 统一的 Artifact 管理和渲染面板，支持多标签页、多格式渲染器。
 *
 * 公开 API：
 * - WorkspacePanel: 主面板组件（挂载到 chat.rightPanel Slot）
 * - workspaceSdk: 插件 SDK（注册渲染器、打开 Artifact）
 * - useWorkspaceStore: 状态管理 Hook
 * - rendererRegistry: 渲染器注册中心
 * - openArtifactFromToolCall: 从工具调用结果创建 Artifact
 * - streamArtifactUpdate: 流式更新 Artifact 内容
 * - 类型定义: types/
 */
export { default as WorkspacePanel } from "./WorkspacePanel";
export { useWorkspaceStore } from "./store/workspaceStore";
export { DEFAULT_PANEL_WIDTH, MIN_PANEL_WIDTH, MAX_PANEL_WIDTH } from "./store/workspaceStore";
export { rendererRegistry, MimeTypes } from "./store/rendererRegistry";
export { registerBuiltinRenderers, unregisterBuiltinRenderers } from "./store/builtinRenderers";
export {
  createWorkspaceNamespace,
  openArtifactFromToolCall,
  streamArtifactUpdate,
} from "./workspaceSdk";
export type {
  QwenPawWorkspaceNamespace,
} from "./workspaceSdk";
export type {
  WorkspaceArtifact,
  WorkspaceState,
  WorkspaceTab,
  RendererRegistration,
  RendererContext,
  RendererComponent,
  WorkspaceApi,
  ArtifactSource,
  WorkspaceViewMode,
  TabMenuItem,
} from "./types";
