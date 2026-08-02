/** ImageRenderer — 图片查看器，支持缩放、旋转和全屏 */
import React, { useState } from "react";
import { Button, Space, Tooltip } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuthenticatedWorkspaceBlob } from "../../../hooks/useAuthenticatedWorkspaceBlob";
import type { RendererContext } from "../types";
import BinaryPreviewFeedback from "./BinaryPreviewFeedback";

const ImageRenderer: React.FC<RendererContext> = ({
  artifact,
  theme,
  workspace,
}) => {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const resource = useAuthenticatedWorkspaceBlob(
    artifact.workspacePath ?? null,
    artifact.agentId,
  );
  const handleDownload = () => workspace.download?.(artifact);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: theme === "dark" ? "#1e1e1e" : "#fafafa",
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
        <span style={{ fontSize: 12, color: "#999" }}>
          {Math.round(zoom * 100)}%
        </span>
        <Space size={2}>
          <Tooltip title={t("workspace.zoomIn")}>
            <Button
              size="small"
              type="text"
              icon={<ZoomInOutlined />}
              onClick={() => setZoom((z) => Math.min(z + 0.25, 5))}
            />
          </Tooltip>
          <Tooltip title={t("workspace.zoomOut")}>
            <Button
              size="small"
              type="text"
              icon={<ZoomOutOutlined />}
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.1))}
            />
          </Tooltip>
          <Tooltip title={t("workspace.rotateLeft")}>
            <Button
              size="small"
              type="text"
              icon={<RotateLeftOutlined />}
              onClick={() => setRotation((r) => r - 90)}
            />
          </Tooltip>
          <Tooltip title={t("workspace.rotateRight")}>
            <Button
              size="small"
              type="text"
              icon={<RotateRightOutlined />}
              onClick={() => setRotation((r) => r + 90)}
            />
          </Tooltip>
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
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        {resource.status === "ready" && resource.url ? (
          <img
            src={resource.url}
            alt={artifact.title}
            style={{
              maxWidth: "100%",
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s",
            }}
          />
        ) : (
          <BinaryPreviewFeedback
            resource={resource}
            theme={theme}
            onDownload={handleDownload}
            loadingLabel={t("workspace.loading", "正在加载文件")}
            retryLabel={t("workspace.retry", "重试")}
            downloadLabel={t("workspace.download", "下载")}
            onRevealInFileManager={() =>
              workspace.revealInFileManager?.(artifact)
            }
            canRevealInFileManager={!!artifact.workspacePath}
            revealLabel={t("workspace.revealInFileManager", "在文件夹中打开")}
          />
        )}
      </div>
    </div>
  );
};

export default ImageRenderer;
