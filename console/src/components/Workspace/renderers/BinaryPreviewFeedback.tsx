import React from "react";
import { Button, Spin } from "antd";
import {
  DownloadOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { AuthenticatedWorkspaceBlobResource } from "../../../hooks/useAuthenticatedWorkspaceBlob";

interface BinaryPreviewFeedbackProps {
  resource: AuthenticatedWorkspaceBlobResource;
  theme: "light" | "dark";
  onDownload: () => void;
  loadingLabel: string;
  retryLabel: string;
  downloadLabel: string;
  /** 在文件管理器中定位回调 */
  onRevealInFileManager?: () => void;
  /** 是否可在文件管理器中定位 */
  canRevealInFileManager?: boolean;
  revealLabel?: string;
}

const BinaryPreviewFeedback: React.FC<BinaryPreviewFeedbackProps> = ({
  resource,
  theme,
  onDownload,
  loadingLabel,
  retryLabel,
  downloadLabel,
  onRevealInFileManager,
  canRevealInFileManager,
  revealLabel,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      minHeight: 160,
      gap: 12,
      padding: 24,
      color: theme === "dark" ? "#ccc" : "#666",
      textAlign: "center",
    }}
  >
    {resource.status === "loading" ? (
      <>
        <Spin />
        <span>{loadingLabel}</span>
      </>
    ) : (
      <>
        <span>
          {resource.error?.message || "Workspace file is unavailable"}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={resource.retry}>
            {retryLabel}
          </Button>
          <Button icon={<DownloadOutlined />} onClick={onDownload}>
            {downloadLabel}
          </Button>
          {canRevealInFileManager && onRevealInFileManager && (
            <Button
              icon={<FolderOpenOutlined />}
              onClick={onRevealInFileManager}
            >
              {revealLabel || "在文件夹中打开"}
            </Button>
          )}
        </div>
      </>
    )}
  </div>
);

export default BinaryPreviewFeedback;
