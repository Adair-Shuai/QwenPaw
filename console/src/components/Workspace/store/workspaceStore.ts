/**
 * workspaceStore — 工作区面板的标签页状态管理
 *
 * 设计灵感：
 * - QwenPaw 现有的 codingTabsStore（按 agent 隔离标签页）
 * - VS Code 的标签页模型（支持拖拽排序、固定、关闭其他）
 * - 浏览器标签页（最近关闭恢复）
 *
 * 核心能力：
 * 1. 多标签页管理（打开/关闭/切换/固定/重命名）
 * 2. Artifact 内容存储 + 流式更新
 * 3. 面板尺寸/全屏状态持久化
 * 4. 按 session 隔离（切换会话时保留各自的标签页）
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkspaceArtifact, WorkspaceState, WorkspaceTab } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// 默认值
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PANEL_WIDTH = 480;
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 800;

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

interface WorkspaceStoreState extends WorkspaceState {
  /** Artifact 内容存储（id → artifact） */
  artifacts: Record<string, WorkspaceArtifact>;
  /** 按 session 隔离的标签页（sessionId → artifactId[]） */
  tabsBySession: Record<string, string[]>;
  /** 当前 session */
  currentSessionId: string;

  // ── 扩展 Actions ──
  setSession: (sessionId: string) => void;
  getArtifact: (id: string) => WorkspaceArtifact | undefined;
  getActiveArtifact: () => WorkspaceArtifact | undefined;
  closeOtherTabs: (artifactId: string) => void;
  pinTab: (artifactId: string) => void;
  unpinTab: (artifactId: string) => void;
  renameTab: (artifactId: string, title: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  persist(
    (set, get) => ({
      // ── State ──
      artifacts: {},
      tabsBySession: {},
      currentSessionId: "default",
      tabs: [],
      activeTabId: null,
      panelOpen: false,
      panelWidth: DEFAULT_PANEL_WIDTH,
      isFullscreen: false,

      // ── Actions ──

      setSession: (sessionId) =>
        set((state) => {
          const tabIds = state.tabsBySession[sessionId] ?? [];
          const tabs = tabIds
            .map((id) => state.artifacts[id])
            .filter(Boolean)
            .map((a) => toTab(a));
          return {
            currentSessionId: sessionId,
            tabs,
            activeTabId: tabs[0]?.artifactId ?? null,
          };
        }),

      openArtifact: (artifact) =>
        set((state) => {
          // 存储 artifact
          const artifacts = {
            ...state.artifacts,
            [artifact.id]: artifact,
          };

          // 添加到当前 session 的标签页列表
          const sessionTabs = state.tabsBySession[state.currentSessionId] ?? [];
          if (!sessionTabs.includes(artifact.id)) {
            sessionTabs.push(artifact.id);
          }

          const tabs = sessionTabs
            .map((id) => artifacts[id])
            .filter(Boolean)
            .map((a) => toTab(a));

          return {
            artifacts,
            tabsBySession: {
              ...state.tabsBySession,
              [state.currentSessionId]: sessionTabs,
            },
            tabs,
            activeTabId: artifact.id,
            panelOpen: true,
          };
        }),

      closeTab: (artifactId) =>
        set((state) => {
          const sessionTabs = (
            state.tabsBySession[state.currentSessionId] ?? []
          ).filter((id) => id !== artifactId);

          const tabs = sessionTabs
            .map((id) => state.artifacts[id])
            .filter(Boolean)
            .map((a) => toTab(a));

          // 如果关闭的是当前激活的标签页，切换到最近的标签页
          let activeTabId = state.activeTabId;
          if (state.activeTabId === artifactId) {
            activeTabId = tabs[tabs.length - 1]?.artifactId ?? null;
          }

          // 面板自动收起当没有标签页
          const panelOpen = tabs.length > 0 ? state.panelOpen : false;

          return {
            tabsBySession: {
              ...state.tabsBySession,
              [state.currentSessionId]: sessionTabs,
            },
            tabs,
            activeTabId,
            panelOpen,
          };
        }),

      closeOtherTabs: (artifactId) =>
        set((state) => {
          const sessionTabs = state.tabsBySession[state.currentSessionId] ?? [];
          const kept = sessionTabs.filter((id) => id === artifactId);
          const tabs = kept
            .map((id) => state.artifacts[id])
            .filter(Boolean)
            .map((a) => toTab(a));

          return {
            tabsBySession: {
              ...state.tabsBySession,
              [state.currentSessionId]: kept,
            },
            tabs,
            activeTabId: artifactId,
          };
        }),

      closeAllTabs: () =>
        set((state) => ({
          tabsBySession: {
            ...state.tabsBySession,
            [state.currentSessionId]: [],
          },
          tabs: [],
          activeTabId: null,
          panelOpen: false,
        })),

      setActiveTab: (artifactId) => set({ activeTabId: artifactId }),

      updateArtifact: (id, patch) =>
        set((state) => {
          const existing = state.artifacts[id];
          if (!existing) return state;

          const updated = {
            ...existing,
            ...patch,
            updatedAt: Date.now(),
          };

          const artifacts = { ...state.artifacts, [id]: updated };

          // 同步标签页标题
          const tabs = state.tabs.map((t) =>
            t.artifactId === id
              ? {
                  ...t,
                  title: patch.title ?? t.title,
                  icon: patch.icon ?? t.icon,
                  dirty: patch.isStreaming ? t.dirty : true,
                }
              : t,
          );

          return { artifacts, tabs };
        }),

      togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
      setPanelOpen: (open) => set({ panelOpen: open }),
      setPanelWidth: (width) =>
        set({
          panelWidth: Math.max(
            MIN_PANEL_WIDTH,
            Math.min(MAX_PANEL_WIDTH, width),
          ),
        }),
      toggleFullscreen: () =>
        set((state) => ({ isFullscreen: !state.isFullscreen })),

      pinTab: (artifactId) =>
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.artifactId === artifactId ? { ...t, pinned: true } : t,
          ),
        })),

      unpinTab: (artifactId) =>
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.artifactId === artifactId ? { ...t, pinned: false } : t,
          ),
        })),

      renameTab: (artifactId, title) =>
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.artifactId === artifactId ? { ...t, title } : t,
          ),
        })),

      reorderTabs: (fromIndex, toIndex) =>
        set((state) => {
          const tabs = [...state.tabs];
          const [moved] = tabs.splice(fromIndex, 1);
          tabs.splice(toIndex, 0, moved);
          return { tabs };
        }),

      getArtifact: (id) => get().artifacts[id],

      getActiveArtifact: () => {
        const { activeTabId, artifacts } = get();
        if (!activeTabId) return undefined;
        return artifacts[activeTabId];
      },
    }),
    {
      name: "qwenpaw-workspace",
      // 只持久化尺寸和 session 映射，不持久化 artifact 内容（太大）
      partialize: (state) => ({
        panelWidth: state.panelWidth,
        tabsBySession: state.tabsBySession,
      }),
    },
  ),
);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toTab(artifact: WorkspaceArtifact): WorkspaceTab {
  return {
    artifactId: artifact.id,
    title: artifact.title,
    icon: artifact.icon,
    loading: artifact.isStreaming,
    openedAt: artifact.createdAt ?? Date.now(),
  };
}

export { DEFAULT_PANEL_WIDTH, MIN_PANEL_WIDTH, MAX_PANEL_WIDTH };
