/** Lightweight, cross-platform PDF renderer backed by a shared PDF.js worker. */
import React, { useCallback, useMemo } from "react";
import { Button, Space, Tooltip } from "antd";
import { DownloadOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { buildWorkspaceScopeHeaders } from "../../../api/authHeaders";
import { workspaceApi as workspaceFileApi } from "../../../api/modules/workspace";
import type { RendererContext } from "../types";
import LightweightPdfViewer from "./LightweightPdfViewer";

const PdfRenderer: React.FC<RendererContext> = ({ artifact, workspace }) => {
  const { t } = useTranslation();
  const usesUnifiedWorkspaceScope = Boolean(
    artifact.workspaceRoot || artifact.chatId || artifact.projectDirOverride,
  );
  const baseUrl = artifact.workspacePath
    ? usesUnifiedWorkspaceScope && artifact.binaryUrl
      ? artifact.binaryUrl
      : workspaceFileApi.getBinaryFileUrl(artifact.workspacePath)
    : artifact.binaryUrl ?? "";
  const isWorkspaceUrl =
    baseUrl.includes("/workspace/binary-files/") ||
    baseUrl.includes("/workspace/file-download");
  const requestHeaders = useMemo(
    () =>
      isWorkspaceUrl
        ? buildWorkspaceScopeHeaders({
            agentId: artifact.agentId,
            chatId: artifact.chatId,
            projectDirOverride: artifact.projectDirOverride,
          })
        : undefined,
    [
      artifact.agentId,
      artifact.chatId,
      artifact.projectDirOverride,
      isWorkspaceUrl,
    ],
  );
  const handleDownload = useCallback(() => {
    workspace.download?.(artifact);
  }, [workspace, artifact]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 36,
          padding: "4px 8px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fff",
          color: "#666",
          flexShrink: 0,
        }}
      >
        <span
          title={artifact.title}
          style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 12,
            color: "#666",
          }}
        >
          PDF · {artifact.title}
        </span>
        <Space size={2} style={{ flexShrink: 0 }}>
          <Tooltip title={t("workspace.download", "下载")}>
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

      {baseUrl ? (
        <LightweightPdfViewer
          url={baseUrl}
          headers={requestHeaders}
          fileSize={artifact.size}
          theme="light"
        />
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            color: "#666",
            background: "#f5f5f5",
          }}
        >
          <span>{t("workspace.noFileUrl", "未提供文件 URL")}</span>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            {t("workspace.download", "下载")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PdfRenderer;
