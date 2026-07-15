/**
 * MediaRenderer — 视频/音频渲染器
 *
 * 使用原生 <video> / <audio> 标签渲染媒体文件。
 * 支持 MP4, WebM, MOV, MP3, WAV, FLAC, AAC, OGG 等。
 */
import React from "react";
import { Button, Space, Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { RendererContext } from "../types";

const MediaRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const url = artifact.binaryUrl ?? "";
  const isVideo = artifact.mimeType?.startsWith("video/") ||
    ["mp4", "webm", "avi", "mov", "mkv", "wmv", "flv"].includes(
      artifact.extension || "",
    );

  const bgColor = theme === "dark" ? "#1e1e1e" : "#000";

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
              onClick={() => workspace.download?.(artifact)}
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
        }}
      >
        {url ? (
          isVideo ? (
            <video
              src={url}
              controls
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: 4,
              }}
            />
          ) : (
            <audio src={url} controls style={{ width: "100%" }} />
          )
        ) : (
          <span style={{ color: "#999" }}>No media URL available</span>
        )}
      </div>
    </div>
  );
};

export default MediaRenderer;
