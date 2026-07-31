/**
 * WorkspacePanel — 工作区面板主组件
 *
 * 架构设计：
 *
 * ┌─────────────────────────────────────────────────────┐
 * │                  Chat Area                          │
 * │                                                     │
 * │                                  ┌────────────────┐ │
 * │                                  │  Workspace     │ │
 * │                                  │  Panel         │ │
 * │                                  │                │ │
 * │                                  │ ┌─┬─┬─┬──────┐ │ │
 * │                                  │ │1│2│3│  4   │ │ │  ← 标签页
 * │                                  │ ├─┴─┴─┴──────┤ │ │
 * │                                  │ │            │ │ │
 * │                                  │ │  Renderer  │ │ │  ← 渲染器区域
 * │                                  │ │  (TipTap /  │ │ │
 * │                                  │ │   Monaco /  │ │ │
 * │                                  │ │   PDF / ...)│ │ │
 * │                                  │ │            │ │ │
 * │                                  │ └────────────┘ │ │
 * │                                  └────────────────┘ │
 * └─────────────────────────────────────────────────────┘
 *
 * 通过 <Slot name="chat.rightPanel" kind="fill" /> 集成到 Chat 页面
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Button,
  Dropdown,
  Tooltip,
  Space,
  ConfigProvider,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  CloseOutlined,
  CloseCircleOutlined,
  PushpinOutlined,
  PushpinFilled,
  CompressOutlined,
  ExpandOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "./store/workspaceStore";
import { rendererRegistry } from "./store/rendererRegistry";
import { registerBuiltinRenderers } from "./store/builtinRenderers";
import { useTheme } from "../../contexts/ThemeContext";
import type { WorkspaceArtifact, RendererContext, WorkspaceApi } from "./types";
import { buildAuthHeaders } from "../../api/authHeaders";
import {
  DownloadCancelledError,
  downloadFileFromUrl,
} from "../../utils/downloadFileFromUrl";

// 确保内置渲染器只注册一次
let renderersRegistered = false;
function ensureRenderers() {
  if (!renderersRegistered) {
    registerBuiltinRenderers();
    renderersRegistered = true;
  }
}

const subscribeRendererRegistry = (listener: () => void) =>
  rendererRegistry.subscribe(listener);
const getRendererRegistrySnapshot = () => rendererRegistry.getSnapshot();

const WorkspacePanel: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "light";
  const locale = "zh-CN"; // 从 i18n 获取

  // 注册内置渲染器
  useEffect(() => {
    ensureRenderers();
  }, []);

  const {
    tabs,
    activeTabId,
    panelOpen,
    panelWidth,
    isFullscreen,
    setActiveTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    setPanelOpen,
    setPanelWidth,
    toggleFullscreen,
    pinTab,
    unpinTab,
    getArtifact,
    updateArtifact,
    openArtifact,
  } = useWorkspaceStore();

  const [resizing, setResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── 拖拽调整面板宽度 ──
  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const newWidth = rect.right - e.clientX;
      setPanelWidth(newWidth);
    };
    const handleMouseUp = () => setResizing(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizing, setPanelWidth]);

  // ── 构建工作区 API ──
  const workspaceApi: WorkspaceApi = useMemo(
    () => ({
      updateArtifact,
      closeTab,
      openArtifact,
      download: async (artifact: WorkspaceArtifact) => {
        if (artifact.binaryUrl) {
          try {
            await downloadFileFromUrl(artifact.binaryUrl, artifact.title, {
              headers: buildAuthHeaders(artifact.agentId),
              errorMessage: t("workspace.downloadFailed", "文件下载失败"),
              preferResponseFilename: true,
            });
          } catch (error) {
            if (!(error instanceof DownloadCancelledError)) {
              message.error(
                error instanceof Error
                  ? error.message
                  : t("workspace.downloadFailed", "文件下载失败"),
              );
            }
          }
        } else if (artifact.textContent) {
          const blob = new Blob([artifact.textContent], {
            type: artifact.mimeType,
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = artifact.title;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            URL.revokeObjectURL(url);
            a.remove();
          }, 0);
        }
      },
      fullscreen: () => toggleFullscreen(),
    }),
    [updateArtifact, closeTab, openArtifact, toggleFullscreen, t],
  );

  // ── 获取当前激活的 Artifact ──
  const activeArtifact = activeTabId ? getArtifact(activeTabId) : undefined;
  const rendererRegistryVersion = useSyncExternalStore(
    subscribeRendererRegistry,
    getRendererRegistrySnapshot,
    getRendererRegistrySnapshot,
  );

  // ── 匹配渲染器 ──
  const rendererMatch = useMemo(() => {
    if (!activeArtifact) return null;
    return rendererRegistry.match(activeArtifact);
  }, [activeArtifact, rendererRegistryVersion]);

  // ── 构建渲染器上下文 ──
  const rendererContext: RendererContext | null = useMemo(() => {
    if (!activeArtifact) return null;
    return {
      artifact: activeArtifact,
      readOnly: true,
      theme,
      locale,
      workspace: workspaceApi,
    };
  }, [activeArtifact, theme, locale, workspaceApi]);

  // ── 标签页右键菜单 ──
  const tabContextMenu = useCallback(
    (artifactId: string, isPinned: boolean): MenuProps["items"] => [
      {
        key: "close",
        label: t("workspace.closeTab"),
        icon: <CloseOutlined />,
        onClick: () => closeTab(artifactId),
      },
      {
        key: "closeOthers",
        label: t("workspace.closeOthers"),
        icon: <CloseCircleOutlined />,
        onClick: () => closeOtherTabs(artifactId),
      },
      { type: "divider" },
      {
        key: "pin",
        label: isPinned ? t("workspace.unpin") : t("workspace.pin"),
        icon: isPinned ? <PushpinFilled /> : <PushpinOutlined />,
        onClick: () => (isPinned ? unpinTab(artifactId) : pinTab(artifactId)),
      },
      {
        key: "closeAll",
        label: t("workspace.closeAll"),
        danger: true,
        onClick: () => closeAllTabs(),
      },
    ],
    [t, closeTab, closeOtherTabs, closeAllTabs, pinTab, unpinTab],
  );

  // ── 面板关闭时不渲染 ──
  if (!panelOpen) return null;

  const RendererComponent = rendererMatch?.renderer.component;

  return (
    <ConfigProvider
      theme={{
        token: { colorBgContainer: theme === "dark" ? "#1e1e1e" : "#fff" },
      }}
    >
      <div
        ref={panelRef}
        className="workspace-panel"
        style={{
          width: isFullscreen ? "100%" : panelWidth,
          flexShrink: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderLeft: `1px solid ${theme === "dark" ? "#333" : "#e8e8e8"}`,
          background: theme === "dark" ? "#1e1e1e" : "#fff",
          position: isFullscreen ? "absolute" : "relative",
          right: isFullscreen ? 0 : "auto",
          top: isFullscreen ? 0 : "auto",
          bottom: isFullscreen ? 0 : "auto",
          zIndex: isFullscreen ? 1000 : "auto",
          transition: resizing ? "none" : "width 0.2s ease",
        }}
      >
        {/* ── 标签页栏 ── */}
        <div
          className="workspace-tab-bar"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 4px",
            borderBottom: `1px solid ${theme === "dark" ? "#333" : "#f0f0f0"}`,
            flexShrink: 0,
            height: 36,
            gap: 1,
          }}
        >
          {/* 标签页列表 */}
          <div
            className="workspace-tabs-scroll"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              overflowX: "auto",
              gap: 1,
              height: "100%",
            }}
          >
            {tabs.map((tab) => {
              const isActive = tab.artifactId === activeTabId;
              const artifact = getArtifact(tab.artifactId);
              return (
                <Dropdown
                  key={tab.artifactId}
                  menu={{
                    items: tabContextMenu(tab.artifactId, tab.pinned ?? false),
                  }}
                  trigger={["contextMenu"]}
                >
                  <div
                    onClick={() => setActiveTab(tab.artifactId)}
                    onAuxClick={(e) => {
                      // 中键关闭标签页
                      if (e.button === 1) closeTab(tab.artifactId);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      height: 28,
                      borderRadius: 6,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontSize: 12,
                      flexShrink: 0,
                      maxWidth: 180,
                      background: isActive
                        ? theme === "dark"
                          ? "#2a2a2a"
                          : "#f0f5ff"
                        : "transparent",
                      color: isActive
                        ? theme === "dark"
                          ? "#fff"
                          : "#1677ff"
                        : theme === "dark"
                        ? "#aaa"
                        : "#666",
                      border: isActive
                        ? `1px solid ${
                            theme === "dark" ? "#1677ff" : "#91caff"
                          }`
                        : "1px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.pinned && (
                      <PushpinFilled
                        style={{ fontSize: 10, color: "#faad14" }}
                      />
                    )}
                    {tab.loading && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#52c41a",
                          animation: "pulse 1s infinite",
                        }}
                      />
                    )}
                    <span
                      style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {artifact?.icon} {tab.title}
                    </span>
                    {!tab.pinned && (
                      <CloseOutlined
                        style={{ fontSize: 10, marginLeft: 2, opacity: 0.5 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.artifactId);
                        }}
                      />
                    )}
                  </div>
                </Dropdown>
              );
            })}
          </div>

          {/* 工具栏按钮 */}
          <Space size={0} style={{ flexShrink: 0, paddingLeft: 4 }}>
            <Tooltip
              title={
                isFullscreen
                  ? t("workspace.exitFullscreen")
                  : t("workspace.fullscreen")
              }
            >
              <Button
                size="small"
                type="text"
                icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                onClick={toggleFullscreen}
              />
            </Tooltip>
            <Tooltip title={t("workspace.closePanel")}>
              <Button
                size="small"
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setPanelOpen(false)}
              />
            </Tooltip>
          </Space>
        </div>

        {/* ── 渲染器区域 ── */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {tabs.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: theme === "dark" ? "#666" : "#999",
                gap: 8,
                padding: 24,
                textAlign: "center",
              }}
            >
              <FileTextOutlined style={{ fontSize: 32, opacity: 0.4 }} />
              <span style={{ fontSize: 13 }}>
                {t(
                  "workspace.emptyHint",
                  "AI 生成的文件和内容将在此处显示。点击工具卡片中的“在工作区打开”按钮即可预览。",
                )}
              </span>
            </div>
          ) : rendererContext && RendererComponent ? (
            <RendererComponent {...rendererContext} />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#999",
              }}
            >
              {t("workspace.noRenderer")}
            </div>
          )}
        </div>

        {/* ── 拖拽分隔条 ── */}
        {!isFullscreen && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setResizing(true);
            }}
            style={{
              position: "absolute",
              left: -3,
              top: 0,
              bottom: 0,
              width: 6,
              cursor: "col-resize",
              zIndex: 10,
            }}
          />
        )}
      </div>
    </ConfigProvider>
  );
};

export default WorkspacePanel;
