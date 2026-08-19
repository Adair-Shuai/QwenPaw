import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { buildWorkspaceScopeHeaders } from "../../api/authHeaders";
import { useTheme } from "../../contexts/ThemeContext";
import {
  openArtifactPreview,
  UPDATE_FILE_PREVIEW_EVENT,
} from "../../features/files-workspace/openFilePreview";
import { revealWorkspacePath } from "../../features/files-workspace/workspaceReveal";
import {
  DownloadCancelledError,
  downloadFileFromUrl,
} from "../../utils/downloadFileFromUrl";
import { registerBuiltinRenderers } from "./store/builtinRenderers";
import { rendererRegistry } from "./store/rendererRegistry";
import type { RendererContext, WorkspaceApi, WorkspaceArtifact } from "./types";

registerBuiltinRenderers();

const subscribeRendererRegistry = (listener: () => void) =>
  rendererRegistry.subscribe(listener);
const getRendererRegistrySnapshot = () => rendererRegistry.getSnapshot();

export interface ArtifactPreviewProps {
  artifact: WorkspaceArtifact;
  readOnly?: boolean;
  onArtifactChange?: (artifact: WorkspaceArtifact) => void;
  onClose?: () => void;
  onOpenArtifact?: (artifact: WorkspaceArtifact) => void;
  onFullscreen?: (artifact: WorkspaceArtifact) => void;
  hostControls?: boolean;
}

function artifactRequestHeaders(
  artifact: WorkspaceArtifact,
): Record<string, string> | undefined {
  if (
    !artifact.workspacePath &&
    !artifact.chatId &&
    !artifact.projectDirOverride
  ) {
    return undefined;
  }
  return buildWorkspaceScopeHeaders({
    agentId: artifact.agentId,
    chatId: artifact.chatId,
    projectDirOverride: artifact.projectDirOverride,
  });
}

const ArtifactPreview: React.FC<ArtifactPreviewProps> = ({
  artifact: artifactProp,
  readOnly = true,
  onArtifactChange,
  onClose,
  onOpenArtifact,
  onFullscreen,
  hostControls = false,
}) => {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const [artifact, setArtifact] = useState(artifactProp);

  useEffect(() => setArtifact(artifactProp), [artifactProp]);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          id: string;
          patch: Partial<WorkspaceArtifact>;
        }>
      ).detail;
      if (detail?.id !== artifact.id) return;
      setArtifact((current) => ({ ...current, ...detail.patch }));
    };
    window.addEventListener(UPDATE_FILE_PREVIEW_EVENT, handleUpdate);
    return () =>
      window.removeEventListener(UPDATE_FILE_PREVIEW_EVENT, handleUpdate);
  }, [artifact.id]);

  useSyncExternalStore(
    subscribeRendererRegistry,
    getRendererRegistrySnapshot,
    getRendererRegistrySnapshot,
  );
  const rendererMatch = rendererRegistry.match(artifact);

  const updateArtifact = useCallback(
    (id: string, patch: Partial<WorkspaceArtifact>) => {
      if (id !== artifact.id) return;
      setArtifact((current) => {
        const next = { ...current, ...patch, updatedAt: Date.now() };
        onArtifactChange?.(next);
        return next;
      });
    },
    [artifact.id, onArtifactChange],
  );

  const download = useCallback(
    async (target: WorkspaceArtifact) => {
      if (target.binaryUrl) {
        try {
          await downloadFileFromUrl(target.binaryUrl, target.title, {
            headers: artifactRequestHeaders(target),
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
        return;
      }
      if (target.textContent === undefined) return;
      const blob = new Blob([target.textContent], { type: target.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = target.title;
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        anchor.remove();
      }, 0);
    },
    [t],
  );

  const workspace = useMemo<WorkspaceApi>(
    () => ({
      updateArtifact,
      closeTab: () => onClose?.(),
      openArtifact: (target) =>
        onOpenArtifact ? onOpenArtifact(target) : openArtifactPreview(target),
      download,
      fullscreen: (target) => onFullscreen?.(target),
      revealInFileManager: (target) => {
        if (!target.workspacePath) return;
        void revealWorkspacePath({
          path: target.workspacePath,
          root: target.workspaceRoot ?? "project",
          chatId: target.chatId,
          projectDirOverride: target.projectDirOverride,
        }).catch((error) => {
          console.warn("[ArtifactPreview] reveal failed:", error);
          message.error(t("workspace.revealFailed", "无法在文件管理器中打开"));
        });
      },
    }),
    [download, onClose, onFullscreen, onOpenArtifact, t, updateArtifact],
  );

  const context = useMemo<RendererContext>(
    () => ({
      artifact,
      readOnly,
      theme: isDark ? "dark" : "light",
      locale: i18n.language,
      workspace,
      hostControls,
    }),
    [artifact, hostControls, i18n.language, isDark, readOnly, workspace],
  );
  const RendererComponent = rendererMatch?.renderer.component;

  if (!RendererComponent) {
    return (
      <div
        style={{
          height: "100%",
          display: "grid",
          placeItems: "center",
          color: "var(--ant-color-text-tertiary)",
        }}
      >
        {t("workspace.noRenderer", "没有可用的预览器")}
      </div>
    );
  }

  return (
    <div style={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
      <RendererComponent {...context} />
    </div>
  );
};

export default ArtifactPreview;
