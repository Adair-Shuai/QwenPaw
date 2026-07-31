/**
 * workspaceSdk — 工作区面板的插件 SDK 接口
 *
 * 插件通过 window.QwenPaw.workspace 注册自定义渲染器和操作
 *
 * 使用示例（插件代码）：
 *
 * ```ts
 * // 注册测井曲线渲染器
 * window.QwenPaw.workspace.registerRenderer({
 *   id: "well-log-las",
 *   name: "Well Log (LAS)",
 *   component: WellLogRenderer,
 *   mimeTypes: ["application/x-las"],
 *   extensions: ["las", "dlis"],
 *   priority: 100,
 * });
 *
 * // 打开一个 Artifact
 * window.QwenPaw.workspace.openArtifact({
 *   id: "log-001",
 *   title: "Well-A_log.las",
 *   source: "tool_call",
 *   mimeType: "application/x-las",
 *   extension: "las",
 *   textContent: lasFileContent,
 * });
 * ```
 */
import type { Disposable } from "../../plugins/registry/types";
import { rendererRegistry } from "./store/rendererRegistry";
import {
  buildWorkspaceSessionKey,
  useWorkspaceStore,
} from "./store/workspaceStore";
import type { RendererRegistration, WorkspaceArtifact } from "./types";
import { useAgentStore } from "../../stores/agentStore";

// ─────────────────────────────────────────────────────────────────────────────
// SDK 接口定义
// ─────────────────────────────────────────────────────────────────────────────

export interface QwenPawWorkspaceNamespace {
  /**
   * 注册自定义渲染器
   * @returns Disposable，调用 dispose() 注销
   */
  registerRenderer: (renderer: RendererRegistration) => Disposable;

  /**
   * 批量注册渲染器
   */
  registerRenderers: (renderers: RendererRegistration[]) => Disposable;

  /**
   * 打开一个 Artifact 到工作区
   */
  openArtifact: (artifact: WorkspaceArtifact) => void;

  /**
   * 关闭指定标签页
   */
  closeTab: (artifactId: string) => void;

  /**
   * 更新 Artifact 内容（用于流式更新）
   */
  updateArtifact: (id: string, patch: Partial<WorkspaceArtifact>) => void;

  /**
   * 获取当前激活的 Artifact
   */
  getActiveArtifact: () => WorkspaceArtifact | undefined;

  /**
   * 打开/关闭工作区面板
   */
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;

  /**
   * 检查指定 MIME type 是否有渲染器
   */
  hasRenderer: (mimeType: string, extension?: string) => boolean;

  /**
   * 获取所有已注册的渲染器信息
   */
  listRenderers: () => Array<{
    id: string;
    name: string;
    mimeTypes?: string[];
    extensions?: string[];
    description?: string;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SDK 工厂函数
// ─────────────────────────────────────────────────────────────────────────────

export function createWorkspaceNamespace(): QwenPawWorkspaceNamespace {
  return {
    registerRenderer: (renderer) => rendererRegistry.register(renderer),

    registerRenderers: (renderers) => rendererRegistry.registerAll(renderers),

    openArtifact: (artifact) => {
      useWorkspaceStore.getState().openArtifact(artifact);
    },

    closeTab: (artifactId) => {
      useWorkspaceStore.getState().closeTab(artifactId);
    },

    updateArtifact: (id, patch) => {
      useWorkspaceStore.getState().updateArtifact(id, patch);
    },

    getActiveArtifact: () => {
      return useWorkspaceStore.getState().getActiveArtifact();
    },

    togglePanel: () => {
      useWorkspaceStore.getState().togglePanel();
    },

    setPanelOpen: (open) => {
      useWorkspaceStore.getState().setPanelOpen(open);
    },

    hasRenderer: (mimeType, extension) => {
      return rendererRegistry.supports(mimeType, extension);
    },

    listRenderers: () => {
      return rendererRegistry.getAll().map((r) => ({
        id: r.id,
        name: r.name,
        mimeTypes: r.mimeTypes,
        extensions: r.extensions,
        description: r.description,
      }));
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 工具函数：从工具调用结果创建 Artifact
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 从 AI 工具调用结果创建 Artifact 并打开到工作区
 *
 * 使用场景：
 * AI 调用工具生成了一个文件/内容 → 自动在右侧工作区面板打开
 */
export function openArtifactFromToolCall(params: {
  toolName: string;
  result: unknown;
  sessionId: string;
  messageId: string;
  title?: string;
  mimeType?: string;
  extension?: string;
  content?: string;
  url?: string;
}): string {
  const agentId = useAgentStore.getState().selectedAgent;
  const workspaceSessionId = buildWorkspaceSessionKey(
    agentId,
    params.sessionId,
  );
  const id = `artifact-${workspaceSessionId}-${params.messageId}-${params.toolName}`;
  const artifact: WorkspaceArtifact = {
    id,
    title: params.title ?? `${params.toolName} output`,
    source: "tool_call",
    mimeType: params.mimeType ?? "text/plain",
    extension: params.extension,
    textContent: params.content,
    binaryUrl: params.url,
    sessionId: workspaceSessionId,
    agentId,
    messageId: params.messageId,
    toolName: params.toolName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isStreaming: false,
  };

  useWorkspaceStore.getState().openArtifact(artifact);
  return id;
}

/**
 * 流式更新 Artifact 内容
 *
 * 用于 AI 流式生成内容时实时更新工作区面板
 */
export function streamArtifactUpdate(
  artifactId: string,
  fullContent: string,
  isDone: boolean,
) {
  const store = useWorkspaceStore.getState();
  store.updateArtifact(artifactId, {
    textContent: fullContent,
    isStreaming: !isDone,
    streamProgress: isDone ? 1 : undefined,
  });
}
