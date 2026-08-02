/**
 * MediaRenderer — 视频/音频渲染器
 *
 * 使用原生 <video> / <audio> 标签渲染媒体文件。
 * 支持 MP4, WebM, MOV, MP3, WAV, FLAC, AAC, OGG 等。
 */
import React, { useEffect, useState } from "react";
import { Button, Space, Tooltip } from "antd";
import { DownloadOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { buildAuthenticatedMediaUrl } from "../../../api/authHeaders";
import { workspaceApi as workspaceFileApi } from "../../../api/modules/workspace";
import type { AuthenticatedWorkspaceBlobResource } from "../../../hooks/useAuthenticatedWorkspaceBlob";
import type { RendererContext } from "../types";
import BinaryPreviewFeedback from "./BinaryPreviewFeedback";

const MediaRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<Error | null>(null);
  const baseUrl = artifact.workspacePath
    ? workspaceFileApi.getBinaryFileUrl(artifact.workspacePath)
    : artifact.binaryUrl ?? "";
  const isWorkspaceUrl = baseUrl.includes("/workspace/binary-files/");
  const url = isWorkspaceUrl
    ? buildAuthenticatedMediaUrl(baseUrl, artifact.agentId)
    : baseUrl;

  useEffect(() => {
    setError(null);
    setStatus(url ? "loading" : "error");
    setLoadAttempt(0);
  }, [url]);
  const isVideo =
    artifact.mimeType?.startsWith("video/") ||
    ["mp4", "webm", "avi", "mov", "mkv", "wmv", "flv"].includes(
      artifact.extension || "",
    );

  const bgColor = theme === "dark" ? "#1e1e1e" : "#000";
  const retry = () => {
    setError(null);
    setStatus("loading");
    setLoadAttempt((value) => value + 1);
  };
  const resource: AuthenticatedWorkspaceBlobResource = {
    status: url ? status : "error",
    url: status === "ready" ? url : null,
    error: url ? error : new Error("Workspace media URL is unavailable"),
    retry,
  };
  const handleDownload = () => workspace.download?.(artifact);
  const handleLoadError = () => {
    setError(new Error(t("workspace.mediaLoadFailed", "媒体加载失败")));
    setStatus("error");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: bgColor,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px",
          borderBottom: `1px solid ${theme === "dark" ? "#333" : "#f0f0f0"}`,
          flexShrink: 0,
        }}
      >
        <span
          style={{ fontSize: 11, color: "#999", textTransform: "uppercase" }}
        >
          {isVideo ? "Video" : "Audio"} · {artifact.extension}
        </span>
        <Space size={2}>
          <Tooltip title={t("workspace.download")}>
            <Button
              size="small"
              type="text"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            />
          </Tooltip>
          <Tooltip title={t("workspace.revealInFileManager", "在文件夹中打开")}>
            <Button
              size="small"
              type="text"
              icon={<FolderOpenOutlined />}
              onClick={() => workspace.revealInFileManager?.(artifact)}
              disabled={!artifact.workspacePath}
            />
          </Tooltip>
        </Space>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: 8,
          position: "relative",
        }}
      >
        {url && status !== "error" ? (
          isVideo ? (
            <video
              key={`${url}:${loadAttempt}`}
              src={url}
              controls
              preload="metadata"
              onCanPlay={() => setStatus("ready")}
              onError={handleLoadError}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: 4,
                visibility: status === "ready" ? "visible" : "hidden",
              }}
            />
          ) : (
            <audio
              key={`${url}:${loadAttempt}`}
              src={url}
              controls
              preload="metadata"
              onCanPlay={() => setStatus("ready")}
              onError={handleLoadError}
              style={{
                width: "100%",
                visibility: status === "ready" ? "visible" : "hidden",
              }}
            />
          )
        ) : null}
        {status !== "ready" ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <BinaryPreviewFeedback
              resource={resource}
              theme={theme}
              onDownload={handleDownload}
              loadingLabel={t("workspace.loadingMedia", "正在加载媒体")}
              retryLabel={t("workspace.retry", "重试")}
              downloadLabel={t("workspace.download", "下载")}
              onRevealInFileManager={() =>
                workspace.revealInFileManager?.(artifact)
              }
              canRevealInFileManager={!!artifact.workspacePath}
              revealLabel={t("workspace.revealInFileManager", "在文件夹中打开")}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MediaRenderer;
